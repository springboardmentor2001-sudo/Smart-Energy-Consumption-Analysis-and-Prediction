-- =====================================================
-- FIX INFINITE RECURSION IN RLS POLICIES
-- =====================================================

-- Drop all existing policies that cause recursion
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.users;
DROP POLICY IF EXISTS "Enable read access for users to own profile" ON public.users;
DROP POLICY IF EXISTS "Enable update for users based on id" ON public.users;
DROP POLICY IF EXISTS "Enable read for hospitals" ON public.users;
DROP POLICY IF EXISTS "Enable read for ambulances" ON public.users;
DROP POLICY IF EXISTS "Enable insert for anon during signup" ON public.users;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Hospitals can view all users" ON public.users;
DROP POLICY IF EXISTS "Ambulances can view hospitals and patients" ON public.users;

-- =====================================================
-- NEW POLICIES WITHOUT RECURSION
-- =====================================================

-- Create a function to get user role from JWT token (no recursion!)
CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS TEXT AS $$
  SELECT COALESCE(
    auth.jwt() -> 'user_metadata' ->> 'role',
    'patient'
  )::TEXT;
$$ LANGUAGE SQL STABLE;

-- Allow anon users to insert during signup (CRITICAL for signup!)
CREATE POLICY "anon_insert_policy"
    ON public.users FOR INSERT
    TO anon
    WITH CHECK (true);

-- Allow authenticated users to insert their own profile
CREATE POLICY "authenticated_insert_policy"
    ON public.users FOR INSERT
    TO authenticated
    WITH CHECK (id = auth.uid());

-- Users can view their own profile
CREATE POLICY "own_profile_select"
    ON public.users FOR SELECT
    TO authenticated
    USING (id = auth.uid());

-- Users can update their own profile
CREATE POLICY "own_profile_update"
    ON public.users FOR UPDATE
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- Hospitals can view all users (using JWT role, no recursion!)
CREATE POLICY "hospital_select_all"
    ON public.users FOR SELECT
    TO authenticated
    USING (auth.user_role() = 'hospital');

-- Ambulances can view all users (using JWT role, no recursion!)
CREATE POLICY "ambulance_select_all"
    ON public.users FOR SELECT
    TO authenticated
    USING (auth.user_role() = 'ambulance');

-- Patients can view hospitals and ambulances
CREATE POLICY "patient_select_providers"
    ON public.users FOR SELECT
    TO authenticated
    USING (
        auth.user_role() = 'patient' AND 
        role IN ('hospital', 'ambulance')
    );

-- =====================================================
-- UPDATE OTHER TABLE POLICIES TO USE JWT ROLE
-- =====================================================

-- Drop and recreate emergency policies without recursion
DROP POLICY IF EXISTS "Hospitals can view all emergencies" ON public.emergencies;
DROP POLICY IF EXISTS "Hospitals can update emergencies" ON public.emergencies;
DROP POLICY IF EXISTS "Ambulances can view assigned emergencies" ON public.emergencies;

CREATE POLICY "hospital_view_emergencies"
    ON public.emergencies FOR SELECT
    TO authenticated
    USING (auth.user_role() = 'hospital');

CREATE POLICY "hospital_update_emergencies"
    ON public.emergencies FOR UPDATE
    TO authenticated
    USING (auth.user_role() = 'hospital');

CREATE POLICY "ambulance_view_emergencies"
    ON public.emergencies FOR SELECT
    TO authenticated
    USING (
        auth.user_role() = 'ambulance' AND
        (ambulance_id = auth.uid() OR status = 'pending')
    );

-- Drop and recreate hospital capacity policies
DROP POLICY IF EXISTS "Hospitals can update their own capacity" ON public.hospital_capacity;
DROP POLICY IF EXISTS "Hospitals can insert their own capacity" ON public.hospital_capacity;

CREATE POLICY "hospital_manage_capacity"
    ON public.hospital_capacity FOR ALL
    TO authenticated
    USING (
        hospital_id = auth.uid() AND 
        auth.user_role() = 'hospital'
    );

-- Drop and recreate ambulance fleet policies
DROP POLICY IF EXISTS "Hospitals can view all ambulance fleet data" ON public.ambulance_fleet;

CREATE POLICY "hospital_view_fleet"
    ON public.ambulance_fleet FOR SELECT
    TO authenticated
    USING (auth.user_role() = 'hospital');

-- Success message
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '═══════════════════════════════════════════════════════';
    RAISE NOTICE '✅ INFINITE RECURSION FIXED!';
    RAISE NOTICE '═══════════════════════════════════════════════════════';
    RAISE NOTICE '';
    RAISE NOTICE 'Fixed by:';
    RAISE NOTICE '  ✅ Using JWT token role instead of querying users table';
    RAISE NOTICE '  ✅ Removed all recursive policy checks';
    RAISE NOTICE '  ✅ Simplified policy structure';
    RAISE NOTICE '';
    RAISE NOTICE 'The app should now work without recursion errors!';
    RAISE NOTICE '';
    RAISE NOTICE '═══════════════════════════════════════════════════════';
END $$;
