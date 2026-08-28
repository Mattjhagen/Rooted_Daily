# OAuth Implementation Review - CRITICAL ISSUES FOUND

## Summary

The OAuth implementation has been reviewed. There are **critical security and account linking issues** that must be addressed before production use.

---

## ✅ What Works Correctly

### Apple & Google OAuth (via Supabase)
- **Redirect URI**: `rooted-daily://auth/callback` (generated dynamically)
- **Bundle ID**: `com.rooteddaily.bible` (from app.json)
- **URL Scheme**: `rooted-daily` (from app.json)
- **Token Storage**: AsyncStorage (secure, handled by Supabase SDK)
- **Session Management**: Supabase handles token refresh automatically
- **Logout**: `AuthService.signOut()` calls `supabase.auth.signOut()`, which clears AsyncStorage

### Implementation Details
- Supabase's native OAuth provider integration is used
- Tokens are NOT exposed to the mobile app
- PKCE is handled by Supabase server-side
- Callback validation is handled by Supabase

---

## ⚠️ CRITICAL ISSUES - MUST FIX BEFORE PRODUCTION

### Issue #1: YouVersion Client Secret Exposed in Mobile App

**Location**: `src/services/auth/AuthService.ts`, lines 13-14

```typescript
const YOUVERSION_CLIENT_ID = process.env.EXPO_PUBLIC_YOUVERSION_CLIENT_ID || '';
const YOUVERSION_CLIENT_SECRET = process.env.EXPO_PUBLIC_YOUVERSION_CLIENT_SECRET || '';
```

**Problem**: 
- `EXPO_PUBLIC_*` variables are bundled into the JavaScript bundle
- Anyone can extract the client secret from the app
- This violates OAuth security best practices
- YouVersion client secret should NEVER be in the mobile app

**Impact**: HIGH SECURITY RISK
- Attackers can impersonate your app
- Attackers can steal user tokens
- Your YouVersion API access could be revoked

**Solution Required**:
- Move YouVersion token exchange to a backend server
- Only send authorization code to server
- Server exchanges code for token using client secret
- Server returns Supabase session to app

**Current Status**: **NOT SAFE FOR PRODUCTION**

---

### Issue #2: Account Linking Not Handled

**Location**: `src/services/auth/AuthService.ts`, signInWithOAuth method

**Problem**:
Supabase handles account linking based on email, BUT:
1. If a user creates account with email/password: `user@example.com`
2. Then signs in with Google using same email: `user@example.com`
3. Supabase will either:
   - Create a NEW user with same email (duplicate accounts)
   - Link the identity to existing user (depends on Supabase settings)

**Current Behavior**: Unknown - depends on Supabase project configuration

**What Happens**:
- User may have multiple accounts with same email
- User's data (journal entries, etc.) may be split across accounts
- User confusion: "Why can't I see my journal entries?"

**Testing Required**:
1. Create account with email/password
2. Sign out
3. Sign in with Google using SAME email
4. Check if it's the same user or a new user
5. Check Supabase Dashboard → Authentication → Users

**Solution Options**:
1. Let Supabase handle it (check "Confirm email" setting)
2. Implement manual account linking logic
3. Disable email/password and only allow OAuth (not recommended)

**Current Status**: **UNKNOWN - MUST TEST**

---

### Issue #3: YouVersion Creates Password-Based Accounts (INSECURE)

**Location**: `src/services/auth/AuthService.ts`, lines 140-150

```typescript
const email = userData.email || `${userData.id}@youversion.app`;

// Sign up/in with a special YouVersion identifier
const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
  email,
  password: `youversion_${userData.id}_${YOUVERSION_CLIENT_ID}`,
});
```

**Problem**:
- Creates Supabase users with predictable passwords
- Password pattern: `youversion_{USER_ID}_{CLIENT_ID}`
- If CLIENT_ID leaks, anyone can calculate passwords
- If email doesn't exist, creates fake email: `{id}@youversion.app`

**Impact**: MEDIUM SECURITY RISK
- Attackers who know YouVersion user ID can potentially access accounts
- Fake emails can't receive password resets or notifications

**Better Approach**:
- Use Supabase custom OAuth provider feature
- Or: Use server-side token exchange with proper identity linking
- Or: Generate random, unguessable passwords and store securely

**Current Status**: **NOT SAFE FOR PRODUCTION**

---

### Issue #4: No PKCE Verification for YouVersion

**Location**: `src/services/auth/AuthService.ts`, lines 84-90

```typescript
const codeVerifier = await Crypto.digestStringAsync(
  Crypto.CryptoDigestAlgorithm.SHA256,
  Math.random().toString(36)
);

const codeChallenge = codeVerifier;
```

**Problem**:
- `codeChallenge` should be a transformation of `codeVerifier` (e.g., SHA256 hash)
- Currently they are THE SAME value
- This defeats the purpose of PKCE

**Correct PKCE Flow**:
```typescript
const codeVerifier = base64URLEncode(random(32));  // Random string
const codeChallenge = base64URLEncode(SHA256(codeVerifier));  // Hash of verifier
```

**Impact**: MEDIUM SECURITY RISK (for YouVersion OAuth only)
- Reduces protection against authorization code interception

**Current Status**: **INCORRECT IMPLEMENTATION**

---

## 🔍 Account Identity Model Analysis

### How Supabase Handles Identities

Supabase stores:
1. **User** - Main user record
2. **Identities** - Linked authentication methods (Google, Apple, email/password)

### Current Implementation

**Google & Apple (via Supabase OAuth)**:
- Supabase creates user with identity linked to provider
- If user exists with same email, Supabase can link the identity (depends on settings)
- **Identity Type**: `google` or `apple`
- **User Record**: One user, multiple identities possible

**YouVersion (Custom Implementation)**:
- Creates entirely separate Supabase user with email/password identity
- No connection to Google/Apple identities
- **Identity Type**: `email` (pretending to be email/password)
- **User Record**: Separate user, no linking

### The Problem

If a user:
1. Signs in with Google → Creates User A
2. Signs in with YouVersion (same email) → Creates User B
3. Two separate accounts, data not shared

**Current Status**: **ACCOUNTS ARE NOT LINKED ACROSS PROVIDERS**

---

## 📋 Recommendations

### Immediate Actions (Before Testing)

1. **DO NOT put YouVersion in production** until security issues are fixed
2. **Test Apple and Google only** - these are implemented correctly
3. **Test account linking**: 
   - Create account with email/password
   - Try signing in with Google/Apple using same email
   - Document behavior

### Short-Term Fix (Apple & Google Only)

1. Remove YouVersion button from login screen temporarily
2. Test and deploy Apple + Google OAuth only
3. These are secure and properly implemented

### Long-Term Fix (For YouVersion)

1. Build a backend API endpoint for YouVersion OAuth:
   - Endpoint: `POST /auth/youversion/callback`
   - Receives authorization code from app
   - Exchanges code for token using client secret (server-side)
   - Returns Supabase session to app
2. Implement proper account linking logic
3. Use Supabase's identity linking features

---

## ✅ Safe to Proceed With

**Apple Sign-In**: ✅ Secure, properly implemented  
**Google Sign-In**: ✅ Secure, properly implemented  
**Email/Password**: ✅ Already working

**YouVersion Sign-In**: ❌ NOT SAFE - Security issues must be fixed first

---

## Next Steps

I will now guide you through:
1. **Apple Sign-In setup** - Safe to proceed
2. **Google OAuth setup** - Safe to proceed  
3. **YouVersion** - Will explain security fixes needed first

Ready to proceed with Apple Sign-In configuration?
