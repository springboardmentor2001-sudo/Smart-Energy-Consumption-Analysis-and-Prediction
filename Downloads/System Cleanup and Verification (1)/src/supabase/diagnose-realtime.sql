-- =====================================================
-- REAL-TIME DIAGNOSTIC SCRIPT
-- Run this to check if real-time is properly configured
-- =====================================================

DO $$ 
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔍 REAL-TIME DIAGNOSTIC REPORT';
    RAISE NOTICE '═══════════════════════════════════════════════════';
    RAISE NOTICE '';
END $$;

-- Check 1: Verify supabase_realtime publication exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        RAISE NOTICE '✅ Publication "supabase_realtime" exists';
    ELSE
        RAISE NOTICE '❌ Publication "supabase_realtime" NOT found!';
        RAISE NOTICE '   ACTION: Contact Supabase support - this should exist by default';
    END IF;
    RAISE NOTICE '';
END $$;

-- Check 2: List all tables in the publication
DO $$ 
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public';
    
    RAISE NOTICE '📋 Tables with real-time enabled: %', table_count;
END $$;

SELECT 
    '  ✓ ' || schemaname || '.' || tablename as "Realtime Enabled Tables"
FROM 
    pg_publication_tables
WHERE 
    pubname = 'supabase_realtime'
    AND schemaname = 'public'
ORDER BY 
    tablename;

-- Check 3: Verify RLS is enabled on tables
DO $$ 
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔐 Row Level Security (RLS) Status:';
END $$;

SELECT 
    CASE 
        WHEN relrowsecurity THEN '  ✅ RLS Enabled: ' || relname
        ELSE '  ⚠️  RLS Disabled: ' || relname
    END as "RLS Status"
FROM 
    pg_class
WHERE 
    relnamespace = 'public'::regnamespace
    AND relkind = 'r'
    AND relname IN ('users', 'emergencies', 'hospital_capacity', 'ambulance_fleet', 'notifications')
ORDER BY 
    relname;

-- Check 4: Count policies on each table
DO $$ 
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '📜 RLS Policies Count:';
END $$;

SELECT 
    '  ' || tablename || ': ' || COUNT(*) || ' policies' as "Policy Count"
FROM 
    pg_policies
WHERE 
    schemaname = 'public'
    AND tablename IN ('users', 'emergencies', 'hospital_capacity', 'ambulance_fleet', 'notifications')
GROUP BY 
    tablename
ORDER BY 
    tablename;

-- Check 5: List critical table structures
DO $$ 
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '📊 Critical Tables Check:';
END $$;

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') 
        THEN '  ✅ Table exists: users'
        ELSE '  ❌ Table missing: users'
    END as "Users Table";

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'emergencies') 
        THEN '  ✅ Table exists: emergencies'
        ELSE '  ❌ Table missing: emergencies'
    END as "Emergencies Table";

-- Check 6: Verify table columns
DO $$ 
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔧 Emergencies Table Structure:';
END $$;

SELECT 
    '  - ' || column_name || ' (' || data_type || ')' as "Emergency Columns"
FROM 
    information_schema.columns
WHERE 
    table_schema = 'public'
    AND table_name = 'emergencies'
ORDER BY 
    ordinal_position;

-- Final recommendations
DO $$ 
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '═══════════════════════════════════════════════════';
    RAISE NOTICE '📋 NEXT STEPS:';
    RAISE NOTICE '';
    RAISE NOTICE 'If you see "❌ Table missing" errors above:';
    RAISE NOTICE '  → Run the schema creation script first';
    RAISE NOTICE '';
    RAISE NOTICE 'If tables exist but real-time shows 0 tables:';
    RAISE NOTICE '  → Run: /supabase/enable-realtime.sql';
    RAISE NOTICE '';
    RAISE NOTICE 'If RLS is disabled:';
    RAISE NOTICE '  → Run: /supabase/fixed-rls-no-auth-schema.sql';
    RAISE NOTICE '';
    RAISE NOTICE '═══════════════════════════════════════════════════';
    RAISE NOTICE '';
END $$;
