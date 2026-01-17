# 🔧 Supabase Connection Setup Fix

## ⚠️ Current Issue: Wrong API Key Type

Your app is using a **publishable key** (`sb_publishable_...`) instead of an **anon key**, which is causing the "Failed to fetch" errors.

---

## 🚀 Quick Fix (5 minutes)

### Step 1: Get Your Anon Key

1. Go to **Supabase Dashboard**: https://supabase.com/dashboard
2. Select your project: **slwuctsdhqwdjwmyxsjn**
3. Click **Settings** (gear icon) in left sidebar
4. Click **API** section
5. Find **"anon" key** (NOT publishable key)
   - It's labeled: **Project API keys → anon → public**
   - Looks like: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (very long)

### Step 2: Update Your App

Edit the file: `/utils/supabase/info.tsx`

**Replace:**
```typescript
export const publicAnonKey = "sb_publishable_cMDmXHj3zncV-23w4aIgCw_9baqQgvm"
```

**With:**
```typescript
export const publicAnonKey = "YOUR_ANON_KEY_HERE"
```

Replace `YOUR_ANON_KEY_HERE` with the actual anon key from Step 1.

### Step 3: Refresh Browser

Press **Ctrl+Shift+R** (Windows) or **Cmd+Shift+R** (Mac) to hard refresh.

---

## ✅ After Fix

You should see:
```
✅ Supabase client initialized
   URL: https://slwuctsdhqwdjwmyxsjn.supabase.co
   Real-time enabled: true
```

And **no more "Failed to fetch" errors**!

---

## 🆘 If Still Having Issues

### Option 1: Test Supabase Connection

Open browser console and run:
```javascript
// Test if Supabase is accessible
fetch('https://slwuctsdhqwdjwmyxsjn.supabase.co/rest/v1/')
  .then(r => r.json())
  .then(d => console.log('✅ Supabase reachable:', d))
  .catch(e => console.error('❌ Cannot reach Supabase:', e));
```

### Option 2: Check Supabase Project Status

1. Go to Supabase Dashboard
2. Check if project is **active** (not paused)
3. Free tier projects pause after 7 days of inactivity
4. Click **"Resume Project"** if paused

### Option 3: Verify Network

1. Check your internet connection
2. Try accessing: https://slwuctsdhqwdjwmyxsjn.supabase.co
3. Should show Supabase API documentation page

---

## 📋 Common Mistakes

### ❌ Wrong: Using Publishable Key
```typescript
export const publicAnonKey = "sb_publishable_cMDmXHj3zncV-23w4aIgCw_9baqQgvm"
```

### ✅ Correct: Using Anon Key
```typescript
export const publicAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsd3VjdHNkaHF3ZGp3bXl4c2puIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODAwMDAwMDAsImV4cCI6MTk5NTU3NjAwMH0.AbCdEfGhIjKlMnOpQrStUvWxYz1234567890"
```

Notice the difference:
- Publishable key: Short, starts with `sb_publishable_`
- Anon key: Long JWT token, starts with `eyJ`

---

## 🔐 Security Note

The **anon key is safe to expose** in frontend code! It's meant to be public. Supabase uses Row Level Security (RLS) policies to protect your data.

---

## 🎯 What Each Key Does

| Key Type | Purpose | Where to Use |
|----------|---------|--------------|
| **Anon Key** | Public API access | Frontend apps ✅ |
| **Service Role Key** | Admin access (bypass RLS) | Backend only ⚠️ |
| **Publishable Key** | Stripe integration | Payment forms only |

You need the **Anon Key** for ResQLink!

---

## 📸 Visual Guide

### Where to Find Anon Key:

```
Supabase Dashboard
├── Settings (⚙️)
│   └── API
│       ├── Project URL: https://slwuctsdhqwdjwmyxsjn.supabase.co
│       └── Project API keys
│           ├── 🔓 anon public ← USE THIS ONE!
│           │   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
│           │   [Copy] button
│           │
│           └── 🔒 service_role (SECRET - don't use!)
```

---

## 🧪 Test After Fix

### 1. Check Console Output
Should see:
```
✅ Supabase client initialized
   URL: https://slwuctsdhqwdjwmyxsjn.supabase.co
   Real-time enabled: true
```

### 2. Try Logging In
- Go to login page
- Enter test credentials
- Should log in successfully

### 3. Create Test Emergency (as Patient)
- Click SOS button
- Should create emergency in database
- No "Failed to fetch" errors

---

## 💡 Alternative: Use Environment Variables

For better security, you can use environment variables:

### Step 1: Create `.env` file
```env
VITE_SUPABASE_URL=https://slwuctsdhqwdjwmyxsjn.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### Step 2: Update `info.tsx`
```typescript
export const projectId = import.meta.env.VITE_SUPABASE_URL?.split('//')[1]?.split('.')[0] || "slwuctsdhqwdjwmyxsjn";
export const publicAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "your_fallback_key";
```

---

## 🔍 Debugging Commands

### Check if key is working:
```javascript
// In browser console:
console.log('Project ID:', 'slwuctsdhqwdjwmyxsjn');
console.log('Key type:', 'sb_publishable_cMDmXHj3zncV-23w4aIgCw_9baqQgvm'.startsWith('sb_publishable_') ? '❌ Publishable (wrong)' : '✅ Anon (correct)');
```

### Test API call:
```javascript
// In browser console:
const { data, error } = await supabase.from('users').select('count');
if (error) {
  console.error('❌ API Error:', error);
} else {
  console.log('✅ API Working:', data);
}
```

---

## 📞 Still Need Help?

### Check These:
1. ✅ Anon key copied correctly (no extra spaces)
2. ✅ File saved after editing
3. ✅ Browser hard refreshed (Ctrl+Shift+R)
4. ✅ Supabase project is active (not paused)
5. ✅ Network connection working

### Logs to Check:
- Browser Console (F12)
- Network tab (check failed requests)
- Supabase Dashboard → Project Logs

---

## ✨ Once Fixed

Everything will work:
- ✅ User authentication
- ✅ Emergency creation
- ✅ Real-time updates
- ✅ Database queries
- ✅ File uploads
- ✅ Chat messages

**Your app will be fully functional!** 🚀
