-- =====================================================
-- FIX RLS POLICIES - Run this to fix the signup error
-- =====================================================

-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;

-- Re-create user policies with correct permissions
CREATE POLICY "Users can insert their own profile"
    ON public.users FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view their own profile"
    ON public.users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.users FOR UPDATE
    USING (auth.uid() = id);

-- Add missing INSERT policies for other tables

-- Hospital Capacity - Hospitals can insert their own capacity data
DROP POLICY IF EXISTS "Hospitals can insert their own capacity" ON public.hospital_capacity;
CREATE POLICY "Hospitals can insert their own capacity"
    ON public.hospital_capacity FOR INSERT
    WITH CHECK (hospital_id = auth.uid());

-- Ambulance Fleet - Ambulances can insert their own fleet data
DROP POLICY IF EXISTS "Ambulances can insert their own fleet data" ON public.ambulance_fleet;
CREATE POLICY "Ambulances can insert their own fleet data"
    ON public.ambulance_fleet FOR INSERT
    WITH CHECK (ambulance_id = auth.uid());

-- Notifications - System can insert notifications for users
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
CREATE POLICY "System can insert notifications"
    ON public.notifications FOR INSERT
    WITH CHECK (true); -- Allow all inserts (notifications are created by system/other users)

-- Push Subscriptions - Users can subscribe to push notifications
DROP POLICY IF EXISTS "Users can insert their own push subscriptions" ON public.push_subscriptions;
CREATE POLICY "Users can insert their own push subscriptions"
    ON public.push_subscriptions FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Payments - System can insert payments
DROP POLICY IF EXISTS "System can insert payments" ON public.payments;
CREATE POLICY "System can insert payments"
    ON public.payments FOR INSERT
    WITH CHECK (true); -- Allow system to create payment records

-- Emergency Analytics - System can insert analytics
DROP POLICY IF EXISTS "System can insert analytics" ON public.emergency_analytics;
CREATE POLICY "System can insert analytics"
    ON public.emergency_analytics FOR INSERT
    WITH CHECK (true); -- Created by triggers

-- Success message
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ RLS POLICIES FIXED SUCCESSFULLY!';
    RAISE NOTICE '';
    RAISE NOTICE 'Users can now:';
    RAISE NOTICE '  ✓ Sign up and create profiles';
    RAISE NOTICE '  ✓ Create emergencies';
    RAISE NOTICE '  ✓ Receive notifications';
    RAISE NOTICE '  ✓ Subscribe to push notifications';
    RAISE NOTICE '';
END $$;
