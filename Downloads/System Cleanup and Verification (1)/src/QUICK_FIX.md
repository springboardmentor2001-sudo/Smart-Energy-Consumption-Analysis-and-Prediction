# 🚨 QUICK FIX - RLS Policy Error

## Problem
Getting error: `new row violates row-level security policy for table "users"`

## ✅ SOLUTION (Choose ONE option)

---

### **OPTION 1: Quick Fix (If schema already applied)**

Go to Supabase SQL Editor and run **ONLY** this file:
- `/supabase/fix-rls-policies.sql`

This will fix all missing INSERT policies without recreating the database.

**Steps:**
1. Go to: https://supabase.com/dashboard/project/slwuctsdhqwdjwmyxsjn/sql
2. Click **"+ New query"**
3. Copy **ALL contents** from `/supabase/fix-rls-policies.sql`
4. Paste and click **RUN**
5. You should see: ✅ RLS POLICIES FIXED SUCCESSFULLY!

---

### **OPTION 2: Fresh Start (Recommended if tables are empty)**

**⚠️ WARNING: This will DELETE ALL data!**

1. Go to: https://supabase.com/dashboard/project/slwuctsdhqwdjwmyxsjn/sql

2. First, **delete everything**:
```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```

3. Then copy **ALL contents** from `/supabase/schema.sql` and run it

---

## 🧪 Test After Fix

1. **Clear browser cache** (or use Incognito)
2. Try to **sign up** as a new patient
3. You should be able to create an account successfully! ✅

---

## What Was Fixed?

Added missing INSERT policies for:
- ✅ Users table (profile creation)
- ✅ Hospital capacity table
- ✅ Ambulance fleet table
- ✅ Notifications table
- ✅ Payments table
- ✅ Push subscriptions table
- ✅ Emergency analytics table

---

## Still Having Issues?

Check the browser console for errors and let me know what you see!
