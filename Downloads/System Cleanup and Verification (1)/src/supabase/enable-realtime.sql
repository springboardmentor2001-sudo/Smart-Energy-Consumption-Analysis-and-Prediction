-- =====================================================
-- ENABLE REALTIME REPLICATION FOR ALL TABLES
-- Run this in your Supabase SQL Editor
-- =====================================================

-- This script enables real-time subscriptions for all tables
-- in the ResQLink database

-- Enable realtime for emergencies table (CRITICAL for the app)
ALTER PUBLICATION supabase_realtime ADD TABLE public.emergencies;

-- Enable realtime for users table (for ambulance location updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;

-- Enable realtime for hospital_capacity table (optional)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'hospital_capacity'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.hospital_capacity;
    END IF;
END $$;

-- Enable realtime for ambulance_fleet table (optional)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'ambulance_fleet'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.ambulance_fleet;
    END IF;
END $$;

-- Enable realtime for notifications table (optional)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'notifications'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
    END IF;
END $$;

-- Verify which tables have realtime enabled
SELECT 
    schemaname,
    tablename
FROM 
    pg_publication_tables
WHERE 
    pubname = 'supabase_realtime'
    AND schemaname = 'public'
ORDER BY 
    tablename;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
DO $$ 
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ REALTIME REPLICATION ENABLED!';
    RAISE NOTICE '═══════════════════════════════════════════════════';
    RAISE NOTICE 'The following tables now support real-time subscriptions:';
    RAISE NOTICE '  ✓ public.emergencies (CRITICAL)';
    RAISE NOTICE '  ✓ public.users (for location updates)';
    RAISE NOTICE '  ✓ public.hospital_capacity (if exists)';
    RAISE NOTICE '  ✓ public.ambulance_fleet (if exists)';
    RAISE NOTICE '  ✓ public.notifications (if exists)';
    RAISE NOTICE '';
    RAISE NOTICE '📡 Your ResQLink app will now receive instant updates!';
    RAISE NOTICE '═══════════════════════════════════════════════════';
    RAISE NOTICE '';
END $$;
