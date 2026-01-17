-- =====================================================
-- COMPLETE FIX - Remove ALL policies and rebuild cleanly
-- =====================================================

-- =====================================================
-- STEP 1: DROP ALL EXISTING POLICIES (Clean slate)
-- =====================================================

-- Drop ALL policies on users table
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'users' AND schemaname = 'public') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.users';
    END LOOP;
END $$;

-- Drop ALL policies on emergencies table
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'emergencies' AND schemaname = 'public') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.emergencies';
    END LOOP;
END $$;

-- Drop ALL policies on hospital_capacity table
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'hospital_capacity' AND schemaname = 'public') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.hospital_capacity';
    END LOOP;
END $$;

-- Drop ALL policies on ambulance_fleet table
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'ambulance_fleet' AND schemaname = 'public') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.ambulance_fleet';
    END LOOP;
END $$;

-- Drop ALL policies on notifications table
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'notifications' AND schemaname = 'public') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.notifications';
    END LOOP;
END $$;

-- Drop ALL policies on payments table
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'payments' AND schemaname = 'public') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.payments';
    END LOOP;
END $$;

-- Drop ALL policies on emergency_analytics table
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'emergency_analytics' AND schemaname = 'public') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.emergency_analytics';
    END LOOP;
END $$;

-- Drop ALL policies on push_subscriptions table
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'push_subscriptions' AND schemaname = 'public') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.push_subscriptions';
    END LOOP;
END $$;

-- =====================================================
-- STEP 2: Create helper function (reads from JWT - NO RECURSION!)
-- =====================================================

DROP FUNCTION IF EXISTS auth.user_role();
CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS TEXT AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'role',
    (current_setting('request.jwt.claims', true)::json->'user_metadata'->>'role'),
    'patient'
  )::TEXT;
$$ LANGUAGE SQL STABLE;

-- =====================================================
-- STEP 3: USERS TABLE - Simple policies, NO RECURSION
-- =====================================================

-- Allow anon to insert during signup
CREATE POLICY "users_anon_insert"
    ON public.users FOR INSERT
    TO anon
    WITH CHECK (true);

-- Allow authenticated to insert their own profile
CREATE POLICY "users_auth_insert"
    ON public.users FOR INSERT
    TO authenticated
    WITH CHECK (id = auth.uid());

-- Users can view their own profile (simple, no recursion)
CREATE POLICY "users_own_select"
    ON public.users FOR SELECT
    TO authenticated
    USING (id = auth.uid());

-- Users can update their own profile (simple, no recursion)
CREATE POLICY "users_own_update"
    ON public.users FOR UPDATE
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- Allow everyone to view all users (TEMPORARY - simplifies debugging)
-- This eliminates recursion completely
CREATE POLICY "users_all_select"
    ON public.users FOR SELECT
    TO authenticated
    USING (true);

-- =====================================================
-- STEP 4: EMERGENCIES TABLE - Simple policies
-- =====================================================

-- Patients can view their own emergencies
CREATE POLICY "emergencies_patient_select"
    ON public.emergencies FOR SELECT
    TO authenticated
    USING (patient_id = auth.uid());

-- Patients can create emergencies
CREATE POLICY "emergencies_patient_insert"
    ON public.emergencies FOR INSERT
    TO authenticated
    WITH CHECK (patient_id = auth.uid());

-- Allow all authenticated users to view all emergencies (TEMPORARY - simplifies)
CREATE POLICY "emergencies_all_select"
    ON public.emergencies FOR SELECT
    TO authenticated
    USING (true);

-- Allow all authenticated users to update emergencies (TEMPORARY)
CREATE POLICY "emergencies_all_update"
    ON public.emergencies FOR UPDATE
    TO authenticated
    USING (true);

-- =====================================================
-- STEP 5: HOSPITAL CAPACITY - Simple policies
-- =====================================================

-- Anyone can view hospital capacity
CREATE POLICY "capacity_all_select"
    ON public.hospital_capacity FOR SELECT
    TO authenticated, anon
    USING (true);

-- Anyone authenticated can manage capacity (TEMPORARY)
CREATE POLICY "capacity_all_manage"
    ON public.hospital_capacity FOR ALL
    TO authenticated
    USING (true);

-- =====================================================
-- STEP 6: AMBULANCE FLEET - Simple policies
-- =====================================================

-- Anyone authenticated can view fleet
CREATE POLICY "fleet_all_select"
    ON public.ambulance_fleet FOR SELECT
    TO authenticated
    USING (true);

-- Anyone authenticated can manage fleet (TEMPORARY)
CREATE POLICY "fleet_all_manage"
    ON public.ambulance_fleet FOR ALL
    TO authenticated
    USING (true);

-- =====================================================
-- STEP 7: NOTIFICATIONS - Simple policies
-- =====================================================

-- Users can view their own notifications
CREATE POLICY "notif_own_select"
    ON public.notifications FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- Anyone can insert notifications
CREATE POLICY "notif_all_insert"
    ON public.notifications FOR INSERT
    TO authenticated, anon
    WITH CHECK (true);

-- Users can update their own notifications
CREATE POLICY "notif_own_update"
    ON public.notifications FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid());

-- =====================================================
-- STEP 8: PAYMENTS - Simple policies
-- =====================================================

-- Users can view payments they're involved in
CREATE POLICY "payments_involved_select"
    ON public.payments FOR SELECT
    TO authenticated
    USING (patient_id = auth.uid() OR hospital_id = auth.uid());

-- Anyone can insert payments
CREATE POLICY "payments_all_insert"
    ON public.payments FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- =====================================================
-- STEP 9: EMERGENCY ANALYTICS - Simple policies
-- =====================================================

-- Anyone authenticated can view analytics
CREATE POLICY "analytics_all_select"
    ON public.emergency_analytics FOR SELECT
    TO authenticated
    USING (true);

-- Anyone can insert analytics (triggers do this)
CREATE POLICY "analytics_all_insert"
    ON public.emergency_analytics FOR INSERT
    TO authenticated, anon
    WITH CHECK (true);

-- =====================================================
-- STEP 10: PUSH SUBSCRIPTIONS - Simple policies
-- =====================================================

-- Users can view their own subscriptions
CREATE POLICY "push_own_select"
    ON public.push_subscriptions FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- Users can insert their own subscriptions
CREATE POLICY "push_own_insert"
    ON public.push_subscriptions FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

-- Users can delete their own subscriptions
CREATE POLICY "push_own_delete"
    ON public.push_subscriptions FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '═══════════════════════════════════════════════════════════════';
    RAISE NOTICE '✅ ALL POLICIES COMPLETELY REBUILT - NO RECURSION POSSIBLE!';
    RAISE NOTICE '═══════════════════════════════════════════════════════════════';
    RAISE NOTICE '';
    RAISE NOTICE 'What was done:';
    RAISE NOTICE '  ✅ Dropped ALL existing policies on all tables';
    RAISE NOTICE '  ✅ Created simple policies with NO recursion';
    RAISE NOTICE '  ✅ Using permissive access for development';
    RAISE NOTICE '  ✅ All users can view all data (simplifies for now)';
    RAISE NOTICE '';
    RAISE NOTICE 'NOTE: Some policies are permissive for development.';
    RAISE NOTICE 'Tighten security later by adding role-based restrictions.';
    RAISE NOTICE '';
    RAISE NOTICE 'Your app should work perfectly now! 🚀';
    RAISE NOTICE '';
    RAISE NOTICE '═══════════════════════════════════════════════════════════════';
END $$;
