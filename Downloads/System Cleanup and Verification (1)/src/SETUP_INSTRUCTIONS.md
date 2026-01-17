# ResQLink Setup Instructions

## 🔴 IMPORTANT: Fix "Email not confirmed" Error

You're seeing this error because Supabase requires email confirmation by default.

## ✅ Quick Fix (Takes 30 seconds)

### Option 1: Disable Email Confirmation (Recommended for Testing)

Follow these 5 simple steps:

1. **Open your Supabase Dashboard** at https://supabase.com/dashboard
2. Select your ResQLink project
3. Click **Authentication** in the left sidebar
4. Click **Providers** at the top
5. Find **Email** in the list and click it
6. **UNCHECK** the box that says **"Confirm email"**
7. Click **Save** at the bottom

**That's it!** Now you can:
- Sign up with any email (even fake ones like test@test.com)
- Sign in immediately without confirming
- Start testing ResQLink right away

### Option 2: Check Your Email

If you want to keep email confirmation enabled:
1. Check your email inbox (and spam folder)
2. Click the confirmation link from Supabase
3. Then try signing in again

Or click the **"Resend Confirmation Email"** button on the sign-in page.

## 🎯 After Setup

Once email confirmation is disabled, you can:

1. **Sign Up** with a new account (any email works)
2. **Sign In** immediately
3. Access your dashboard based on role:
   - 🏥 **Patient**: Emergency SOS button, GPS tracking
   - 🏥 **Hospital**: Emergency monitoring, ambulance assignment
   - 🚑 **Ambulance**: Accept requests, turn-by-turn navigation

## ⚠️ Note

- For production, **re-enable email confirmation** for security
- For development/testing, keeping it disabled makes testing much easier
- You can always change this setting later

---

**Need help?** Check the TROUBLESHOOTING.md file or press F12 to see console errors.