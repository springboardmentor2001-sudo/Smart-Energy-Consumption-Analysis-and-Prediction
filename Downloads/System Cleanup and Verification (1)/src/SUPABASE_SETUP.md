# 🚀 ResQLink Supabase Setup Guide

This guide will help you set up the complete Supabase database for ResQLink with real-time functionality.

## ✅ Prerequisites

- Supabase project created at: https://slwuctsdhqwdjwmyxsjn.supabase.co
- Supabase credentials already connected via Figma Make

## 📋 Database Setup Instructions

### Step 1: Open SQL Editor

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/slwuctsdhqwdjwmyxsjn
2. Click on **SQL Editor** in the left sidebar
3. Click **+ New query**

### Step 2: Run the Schema

Copy the ENTIRE contents of `/supabase/schema.sql` and paste it into the SQL editor, then click **Run**.

This will create:
- ✅ All database tables (users, emergencies, notifications, payments, etc.)
- ✅ PostGIS extension for geospatial queries
- ✅ Row Level Security (RLS) policies
- ✅ Database triggers for auto-updates
- ✅ Real-time publication enabled

### Step 3: Verify Tables Created

After running the schema, verify these tables exist:
1. Go to **Table Editor** in the left sidebar
2. You should see:
   - ✅ `users`
   - ✅ `emergencies`
   - ✅ `hospital_capacity`
   - ✅ `ambulance_fleet`
   - ✅ `payments`
   - ✅ `notifications`
   - ✅ `emergency_analytics`
   - ✅ `push_subscriptions`

### Step 4: Enable Realtime

1. Go to **Database** → **Realtime** in left sidebar
2. Make sure these tables have Realtime enabled:
   - ☑️ `emergencies`
   - ☑️ `users`
   - ☑️ `notifications`
   - ☑️ `hospital_capacity`

### Step 5: Configure Authentication

1. Go to **Authentication** → **Settings**
2. Under **Email Auth**:
   - ☑️ Enable Email provider
   - ☑️ **Disable** "Confirm email" (for development)
3. Under **Site URL**:
   - Set to your app URL or `http://localhost:3000`

---

## 🎯 How It Works Now

### Real-Time Sync

**Before (LocalStorage):**
- ❌ Only worked in same browser
- ❌ No cross-tab communication
- ❌ No notifications

**After (Supabase Realtime):**
- ✅ Works across different browsers
- ✅ Works on different devices
- ✅ Instant real-time updates
- ✅ Database persistence

### Example Workflow

1. **Patient creates emergency** → Database INSERT
2. **Realtime broadcasts** to all connected ambulances
3. **Ambulance dashboard updates instantly** 
4. **Ambulance accepts** → Database UPDATE
5. **Patient sees update in real-time**

---

## 🧪 Testing Real-Time

### Test 1: Different Browsers

1. **Browser 1 (Chrome):** Login as Patient
   - Create an emergency

2. **Browser 2 (Firefox):** Login as Ambulance
   - Should see emergency appear **instantly**!

### Test 2: Different Devices

1. **Phone:** Login as Patient, create emergency
2. **Computer:** Login as Ambulance
   - Emergency appears in real-time!

---

## 🔍 Debugging

### Check Real-Time Status

In the browser console, you'll see:
```
✅ Real-time subscription active for table: emergencies
   Role: ambulance
   User ID: abc-123...
```

### If Real-Time Doesn't Work

1. **Check Supabase Dashboard:**
   - Go to **Database** → **Realtime**
   - Ensure `emergencies` table is enabled

2. **Check Browser Console:**
   - Look for connection errors
   - Should see "SUBSCRIBED" status

3. **Check RLS Policies:**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'emergencies';
   ```

---

## 📊 Database Schema Overview

### `users` Table
- Stores patient, hospital, and ambulance profiles
- Extends Supabase auth.users
- Includes geolocation fields

### `emergencies` Table
- Main emergency request table
- Tracks full workflow from request to completion
- Real-time enabled for instant updates

### `notifications` Table
- Stores in-app notifications
- Linked to emergencies and users

---

## 🔒 Security (RLS Policies)

Row Level Security ensures:
- **Patients** can only see their own emergencies
- **Ambulances** can see pending emergencies + their assigned ones
- **Hospitals** can see all active emergencies
- Users can only update their own profiles

---

## 🎉 You're All Set!

Once the schema is applied, the app will automatically:
- ✅ Create user profiles on signup
- ✅ Sync emergencies in real-time
- ✅ Update all connected dashboards instantly
- ✅ Track locations and status changes

**No more localStorage limitations!** 🚀
