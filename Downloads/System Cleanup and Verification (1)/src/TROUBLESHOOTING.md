# ResQLink Troubleshooting Guide

## Sign In Issues

### Step 1: Check Browser Console
1. Press **F12** to open Developer Tools
2. Click the **Console** tab
3. Try to sign in again
4. Look for error messages (usually in red)

### Step 2: Common Issues & Solutions

#### Issue: "Invalid login credentials"
**Cause**: Wrong email/password or account doesn't exist
**Solution**: 
- Make sure you created an account first (use Sign Up tab)
- Check that email and password match what you signed up with
- Passwords are case-sensitive

#### Issue: "Email not confirmed"
**Cause**: Email confirmation is enabled in Supabase but you haven't confirmed your email
**Solution**: 
- Option 1: Check your email inbox and click the confirmation link
- Option 2: Disable email confirmation in Supabase (see SETUP_INSTRUCTIONS.md)

#### Issue: "Failed to fetch" or "Network error"
**Cause**: Cannot connect to Supabase
**Solution**: 
- Check your internet connection
- Verify Supabase project is active
- Check if you're connected to Supabase (see below)

### Step 3: Verify Supabase Connection

Go to your Supabase Dashboard:
1. Check that your project is **Active** (not paused)
2. Verify the project URL matches: `bdvmlbsxjcedczhfjxyz.supabase.co`
3. Make sure Authentication is enabled

### Step 4: Test Sign Up First

Before signing in, make sure you have an account:
1. Click **Sign Up** tab
2. Choose account type (Patient/Hospital/Ambulance)
3. Fill in all required fields
4. Create account
5. If email confirmation is enabled, check your email
6. Then try signing in

### Step 5: Clear and Start Fresh

If nothing works:
1. Open browser console (F12)
2. Type: `localStorage.clear()`
3. Press Enter
4. Refresh the page
5. Try signing up with a NEW email address

## Still Having Issues?

Please provide:
1. **Exact error message** from console (F12)
2. **Steps you took** (signed up? tried to sign in?)
3. **Account type** you're trying to use (patient/hospital/ambulance)
4. **Did you disable email confirmation?** (yes/no)

---

## Quick Checklist

- [ ] Supabase project is active
- [ ] Email confirmation is disabled (or email is confirmed)
- [ ] You created an account with Sign Up
- [ ] You're using the same email/password you signed up with
- [ ] Browser console shows no red errors (F12)
