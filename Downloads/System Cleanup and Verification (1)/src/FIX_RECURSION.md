# 🔧 FIX INFINITE RECURSION ERROR

## The Problem
```
Error: infinite recursion detected in policy for relation "users"
```

This happens because the RLS policies were querying the same `users` table they were protecting, creating an infinite loop:

```sql
-- ❌ BAD: This creates recursion!
CREATE POLICY "hospitals_view_all" ON users
USING (
    EXISTS (
        SELECT 1 FROM users  -- ← Queries same table!
        WHERE id = auth.uid() AND role = 'hospital'
    )
);
```

## ✅ THE SOLUTION

**Run this file in Supabase SQL Editor:**
👉 **`/supabase/fix-recursion.sql`**

### How It Fixes It:

Instead of querying the `users` table, it reads the role directly from the **JWT token** (no database query needed!):

```sql
-- ✅ GOOD: Uses JWT, no recursion!
CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS TEXT AS $$
  SELECT COALESCE(
    auth.jwt() -> 'user_metadata' ->> 'role',
    'patient'
  )::TEXT;
$$ LANGUAGE SQL STABLE;

CREATE POLICY "hospital_select_all"
    ON public.users FOR SELECT
    USING (auth.user_role() = 'hospital');  -- ← No recursion!
```

---

## 📋 Steps to Fix:

1. **Open Supabase SQL Editor:**
   https://supabase.com/dashboard/project/slwuctsdhqwdjwmyxsjn/sql/new

2. **Copy ENTIRE contents** of `/supabase/fix-recursion.sql`

3. **Paste and click RUN** ▶️

4. **You should see:**
   ```
   ✅ INFINITE RECURSION FIXED!
   ```

5. **Refresh your app** - Should work now! 🎉

---

## What Was Fixed:

- ✅ Created `auth.user_role()` function to read role from JWT
- ✅ Replaced all recursive policy checks
- ✅ Updated users, emergencies, hospital_capacity, ambulance_fleet policies
- ✅ No more database recursion!

---

## Alternative: Fresh Start

If you want to start completely fresh (⚠️ **DELETES ALL DATA**):

1. Drop and recreate schema:
```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```

2. Run the complete updated schema from `/supabase/schema.sql`

---

The recursion error should be completely fixed now! 🚀
