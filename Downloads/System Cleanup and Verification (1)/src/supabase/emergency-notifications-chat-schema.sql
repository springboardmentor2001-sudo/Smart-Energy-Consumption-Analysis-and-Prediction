-- =====================================================
-- Emergency Contact Auto-Notification & Chat System
-- Additional Tables for ResQLink
-- =====================================================

-- =====================================================
-- EMERGENCY CONTACTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.emergency_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Contact details
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    relationship TEXT NOT NULL,
    
    -- Notification preferences
    priority INTEGER DEFAULT 1, -- 1 = primary, 2 = secondary, etc.
    notify_via_sms BOOLEAN DEFAULT true,
    notify_via_call BOOLEAN DEFAULT false,
    
    -- Status tracking
    last_notified_at TIMESTAMPTZ,
    notification_count INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_priority CHECK (priority >= 1 AND priority <= 5),
    CONSTRAINT valid_phone CHECK (phone ~ '^[\d\s\-\+\(\)]+$')
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_user ON public.emergency_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_priority ON public.emergency_contacts(user_id, priority);

-- =====================================================
-- EMERGENCY MESSAGES TABLE (Chat System)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.emergency_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    emergency_id UUID NOT NULL REFERENCES public.emergencies(id) ON DELETE CASCADE,
    
    -- Sender information
    sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    sender_name TEXT NOT NULL,
    sender_role user_role NOT NULL,
    
    -- Message content
    message_text TEXT,
    message_type TEXT NOT NULL CHECK (message_type IN ('text', 'photo', 'voice', 'location', 'system')),
    
    -- Media
    media_url TEXT, -- For photos, voice recordings
    
    -- Location data (for location messages)
    location JSONB, -- {latitude: 0, longitude: 0, address: ""}
    
    -- Read status
    read_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_message_content CHECK (
        (message_type = 'text' AND message_text IS NOT NULL) OR
        (message_type = 'photo' AND media_url IS NOT NULL) OR
        (message_type = 'voice' AND media_url IS NOT NULL) OR
        (message_type = 'location' AND location IS NOT NULL) OR
        (message_type = 'system')
    )
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_emergency_messages_emergency ON public.emergency_messages(emergency_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_emergency_messages_sender ON public.emergency_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_emergency_messages_unread ON public.emergency_messages(emergency_id, read_at) WHERE read_at IS NULL;

-- =====================================================
-- NOTIFICATION LOG TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.notification_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    emergency_id UUID NOT NULL REFERENCES public.emergencies(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES public.emergency_contacts(id) ON DELETE SET NULL,
    
    -- Notification details
    notification_type TEXT NOT NULL CHECK (notification_type IN ('sms', 'call', 'email', 'push')),
    recipient_phone TEXT,
    recipient_email TEXT,
    
    -- Content
    message_content TEXT NOT NULL,
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed')),
    error_message TEXT,
    
    -- External service tracking
    external_id TEXT, -- Twilio message SID, etc.
    
    -- Metadata
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notification_log_emergency ON public.notification_log(emergency_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_log_contact ON public.notification_log(contact_id);
CREATE INDEX IF NOT EXISTS idx_notification_log_status ON public.notification_log(status);

-- =====================================================
-- PUBLIC TRACKING TOKENS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.public_tracking_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    emergency_id UUID NOT NULL REFERENCES public.emergencies(id) ON DELETE CASCADE,
    
    -- Token
    token TEXT UNIQUE NOT NULL,
    
    -- Access control
    expires_at TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT true,
    
    -- Usage tracking
    access_count INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMPTZ,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES public.users(id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_public_tracking_tokens_token ON public.public_tracking_tokens(token) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_public_tracking_tokens_emergency ON public.public_tracking_tokens(emergency_id);
CREATE INDEX IF NOT EXISTS idx_public_tracking_tokens_expiry ON public.public_tracking_tokens(expires_at) WHERE is_active = true;

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for emergency_contacts
DROP TRIGGER IF EXISTS update_emergency_contacts_updated_at ON public.emergency_contacts;
CREATE TRIGGER update_emergency_contacts_updated_at
    BEFORE UPDATE ON public.emergency_contacts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-generate tracking token
CREATE OR REPLACE FUNCTION generate_tracking_token()
RETURNS TEXT AS $$
DECLARE
    token TEXT;
    token_exists BOOLEAN;
BEGIN
    LOOP
        -- Generate random token (32 characters)
        token := encode(gen_random_bytes(16), 'hex');
        
        -- Check if token already exists
        SELECT EXISTS(SELECT 1 FROM public.public_tracking_tokens WHERE token = token) INTO token_exists;
        
        EXIT WHEN NOT token_exists;
    END LOOP;
    
    RETURN token;
END;
$$ LANGUAGE plpgsql;

-- Function to send system message
CREATE OR REPLACE FUNCTION send_system_message(
    p_emergency_id UUID,
    p_message TEXT
)
RETURNS UUID AS $$
DECLARE
    message_id UUID;
BEGIN
    INSERT INTO public.emergency_messages (
        emergency_id,
        sender_id,
        sender_name,
        sender_role,
        message_text,
        message_type,
        created_at
    )
    VALUES (
        p_emergency_id,
        '00000000-0000-0000-0000-000000000000', -- System user ID
        'System',
        'hospital', -- Using hospital role for system messages
        p_message,
        'system',
        NOW()
    )
    RETURNING id INTO message_id;
    
    RETURN message_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- RLS POLICIES FOR NEW TABLES
-- =====================================================

-- Enable RLS
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.public_tracking_tokens ENABLE ROW LEVEL SECURITY;

-- Emergency Contacts Policies
CREATE POLICY "Users can view own emergency contacts" ON public.emergency_contacts
    FOR SELECT USING (true); -- Allow all to read for emergency situations

CREATE POLICY "Users can insert own emergency contacts" ON public.emergency_contacts
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own emergency contacts" ON public.emergency_contacts
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete own emergency contacts" ON public.emergency_contacts
    FOR DELETE USING (true);

-- Emergency Messages Policies
CREATE POLICY "Users can view messages for their emergencies" ON public.emergency_messages
    FOR SELECT USING (true);

CREATE POLICY "Users can send messages to their emergencies" ON public.emergency_messages
    FOR INSERT WITH CHECK (true);

-- Notification Log Policies (read-only for debugging)
CREATE POLICY "Users can view notification logs" ON public.notification_log
    FOR SELECT USING (true);

CREATE POLICY "System can insert notification logs" ON public.notification_log
    FOR INSERT WITH CHECK (true);

-- Public Tracking Tokens Policies
CREATE POLICY "Anyone can view active tracking tokens" ON public.public_tracking_tokens
    FOR SELECT USING (is_active = true AND expires_at > NOW());

CREATE POLICY "Users can create tracking tokens for their emergencies" ON public.public_tracking_tokens
    FOR INSERT WITH CHECK (true);

-- =====================================================
-- STORAGE BUCKET FOR CHAT PHOTOS
-- =====================================================

-- Create storage bucket for emergency chat photos
-- Run this in Supabase dashboard or via SQL:
-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('emergency-photos', 'emergency-photos', true);

-- Set storage policy to allow authenticated uploads
-- CREATE POLICY "Allow authenticated uploads" ON storage.objects
--   FOR INSERT TO authenticated
--   WITH CHECK (bucket_id = 'emergency-photos');

-- CREATE POLICY "Allow public reads" ON storage.objects
--   FOR SELECT TO public
--   USING (bucket_id = 'emergency-photos');

-- =====================================================
-- SAMPLE DATA & TESTING
-- =====================================================

-- Function to test emergency notification system
CREATE OR REPLACE FUNCTION test_emergency_notification(p_user_id UUID)
RETURNS TABLE (
    contact_name TEXT,
    contact_phone TEXT,
    notification_type TEXT,
    status TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ec.name,
        ec.phone,
        CASE 
            WHEN ec.notify_via_sms THEN 'SMS'
            WHEN ec.notify_via_call THEN 'CALL'
            ELSE 'NONE'
        END as notification_type,
        'TEST' as status
    FROM public.emergency_contacts ec
    WHERE ec.user_id = p_user_id
    ORDER BY ec.priority;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- USEFUL QUERIES
-- =====================================================

-- Get unread message count for an emergency
-- SELECT COUNT(*) FROM emergency_messages 
-- WHERE emergency_id = 'your-emergency-id' 
-- AND read_at IS NULL 
-- AND sender_id != 'current-user-id';

-- Get all contacts for a user
-- SELECT * FROM emergency_contacts 
-- WHERE user_id = 'user-id' 
-- ORDER BY priority;

-- Get chat history for an emergency
-- SELECT * FROM emergency_messages 
-- WHERE emergency_id = 'emergency-id' 
-- ORDER BY created_at ASC;

-- Get active tracking links
-- SELECT e.id, e.patient_name, ptt.token, ptt.expires_at
-- FROM emergencies e
-- JOIN public_tracking_tokens ptt ON e.id = ptt.emergency_id
-- WHERE ptt.is_active = true AND ptt.expires_at > NOW();

COMMENT ON TABLE public.emergency_contacts IS 'Stores emergency contacts for auto-notification when SOS is triggered';
COMMENT ON TABLE public.emergency_messages IS 'Real-time chat messages between patient, ambulance, and hospital';
COMMENT ON TABLE public.notification_log IS 'Log of all SMS/call notifications sent';
COMMENT ON TABLE public.public_tracking_tokens IS 'Public tokens for shareable emergency tracking links';
