# Google SSO Authentication Guide

> **IMPORTANT UPDATE**: The application now uses **Google Single Sign-On (SSO)** exclusively. Password-based authentication has been replaced.

---

## Table of Contents
1. [What Changed](#what-changed)
2. [How Google SSO Works](#how-google-sso-works)
3. [Authentication Flow](#authentication-flow)
4. [Code Changes](#code-changes)
5. [Setup Instructions](#setup-instructions)
6. [Debugging Google SSO](#debugging-google-sso)
7. [Security Considerations](#security-considerations)

---

## What Changed

### Before (Password-Based Auth)
- Users created accounts with email + password
- Login form with email/password fields
- Backend validated passwords
- Registration endpoint created new users

### After (Google SSO)
- **Only Gmail accounts** can sign in
- Single "Sign in with Google" button
- No password storage or validation
- Google handles authentication
- Users auto-created on first login

---

## How Google SSO Works

### Overview
Instead of managing passwords, we use Google's OAuth 2.0 to authenticate users:

```
User → Clicks "Sign in with Google"
     → Redirects to Google login page
     → User logs in with their Gmail account
     → Google redirects back with authorization code
     → Backend exchanges code for user info
     → Backend creates/finds user
     → Frontend receives JWT token
     → User is logged in
```

### Why Google SSO?

**Advantages:**
- ✅ **No password management** - Google handles it
- ✅ **More secure** - No password storage in our database
- ✅ **Better UX** - One-click login
- ✅ **Gmail-only** - Ensures verified email addresses
- ✅ **No registration flow** - Users auto-created on first login

**Trade-offs:**
- ❌ Users must have a Gmail account
- ❌ Dependent on Google's service availability
- ❌ Requires Google API configuration

---

## Authentication Flow

### Detailed Flow Diagram

```
┌────────────────────────────────────────────────────────────────────┐
│                     GOOGLE SSO AUTHENTICATION FLOW                  │
└────────────────────────────────────────────────────────────────────┘

USER                  FRONTEND              BACKEND               GOOGLE
  │                      │                      │                     │
  │  Visits /login       │                      │                     │
  ├─────────────────────▶│                      │                     │
  │                      │                      │                     │
  │  Clicks "Sign in     │                      │                     │
  │  with Google"        │                      │                     │
  ├─────────────────────▶│                      │                     │
  │                      │                      │                     │
  │                      │  GET /auth/google/   │                     │
  │                      │  login               │                     │
  │                      ├─────────────────────▶│                     │
  │                      │                      │                     │
  │                      │  Returns             │                     │
  │                      │  authorization_url   │                     │
  │                      │◀─────────────────────┤                     │
  │                      │                      │                     │
  │   Redirect to        │                      │                     │
  │   Google OAuth       │                      │                     │
  │◀─────────────────────┤                      │                     │
  │                      │                      │                     │
  │                 Google Login Page                                 │
  ├───────────────────────────────────────────────────────────────────▶│
  │                      │                      │                     │
  │  Enter Gmail         │                      │                     │
  │  credentials         │                      │                     │
  │                      │                      │                     │
  │  Grant permissions   │                      │                     │
  │                      │                      │                     │
  │                      │                      │  Authorization Code │
  │                      │   Redirect to        │◀────────────────────┤
  │                      │   /auth/callback?    │                     │
  │                      │   code=xyz123        │                     │
  │◀─────────────────────┴──────────────────────┘                     │
  │                      │                      │                     │
  │  /auth/callback      │                      │                     │
  │  page loads          │                      │                     │
  ├─────────────────────▶│                      │                     │
  │                      │                      │                     │
  │                      │  POST /auth/google/  │                     │
  │                      │  callback            │                     │
  │                      │  { code: "xyz123" }  │                     │
  │                      ├─────────────────────▶│                     │
  │                      │                      │                     │
  │                      │                      │  Exchange code for  │
  │                      │                      │  access token       │
  │                      │                      ├────────────────────▶│
  │                      │                      │                     │
  │                      │                      │  Returns:           │
  │                      │                      │  - access_token     │
  │                      │                      │◀────────────────────┤
  │                      │                      │                     │
  │                      │                      │  Get user info      │
  │                      │                      ├────────────────────▶│
  │                      │                      │                     │
  │                      │                      │  Returns:           │
  │                      │                      │  - email            │
  │                      │                      │  - name             │
  │                      │                      │  - google_id        │
  │                      │                      │◀────────────────────┤
  │                      │                      │                     │
  │                      │                ┌─────▼─────┐               │
  │                      │                │ Validate  │               │
  │                      │                │ email ends│               │
  │                      │                │ @gmail.com│               │
  │                      │                └─────┬─────┘               │
  │                      │                      │                     │
  │                      │                ┌─────▼─────┐               │
  │                      │                │ Find or   │               │
  │                      │                │ Create    │               │
  │                      │                │ User in DB│               │
  │                      │                └─────┬─────┘               │
  │                      │                      │                     │
  │                      │                ┌─────▼─────┐               │
  │                      │                │ Generate  │               │
  │                      │                │ JWT Token │               │
  │                      │                └─────┬─────┘               │
  │                      │                      │                     │
  │                      │  Returns:            │                     │
  │                      │  {                   │                     │
  │                      │    access_token,     │                     │
  │                      │    user: {...}       │                     │
  │                      │  }                   │                     │
  │                      │◀─────────────────────┤                     │
  │                      │                      │                     │
  │                 ┌────▼─────┐                │                     │
  │                 │ Store in │                │                     │
  │                 │localStorage                │                     │
  │                 │ & Zustand│                │                     │
  │                 └────┬─────┘                │                     │
  │                      │                      │                     │
  │  Redirect to         │                      │                     │
  │  Dashboard           │                      │                     │
  │◀─────────────────────┤                      │                     │
  │                      │                      │                     │
  │  Dashboard Page      │                      │                     │
  │  (Authenticated)     │                      │                     │
  │                      │                      │                     │
```

### Step-by-Step Explanation

#### 1. User Clicks "Sign in with Google"
```tsx
// frontend/src/pages/login.tsx
async function handleGoogleLogin() {
  // Get Google's authorization URL from backend
  const response = await api.get("/auth/google/login");
  const { authorization_url } = response.data;

  // Redirect user to Google
  window.location.href = authorization_url;
}
```

**What happens:**
- Frontend asks backend for Google's OAuth URL
- Backend constructs URL with client ID and redirect URI
- Frontend redirects user to Google's login page

#### 2. Google Login Page
User sees Google's official login page:
- Enters Gmail credentials
- Reviews permissions (email, profile)
- Clicks "Allow"

#### 3. Google Redirects Back
```
http://localhost:5173/auth/callback?code=4/0AY0e-g7X...
```

**What's in the URL:**
- `code` - Authorization code (one-time use)
- Valid for ~10 minutes
- Must be exchanged for access token

#### 4. Callback Page Handles Code
```tsx
// frontend/src/pages/auth-callback.tsx
useEffect(() => {
  const code = searchParams.get("code");

  // Send code to backend
  const response = await api.post("/auth/google/callback", { code });
  const { access_token, user } = response.data;

  // Save authentication
  setAuth(access_token, user);
  navigate("/");
}, []);
```

#### 5. Backend Exchanges Code for Token
```python
# backend/app/api/v1/endpoints/auth.py
@router.post("/google/callback")
async def google_callback(code: str, db: AsyncSession):
    # Exchange code for access token
    token_response = await httpx.post(
        "https://oauth2.googleapis.com/token",
        data={
            "code": code,
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "grant_type": "authorization_code",
        },
    )
    access_token = token_response.json()["access_token"]

    # Get user info from Google
    userinfo = await httpx.get(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        headers={"Authorization": f"Bearer {access_token}"},
    )

    # Validate Gmail domain
    email = userinfo.json()["email"]
    if not email.endswith("@gmail.com"):
        raise HTTPException(403, "Only Gmail accounts allowed")

    # Find or create user
    user = await find_or_create_user(email, google_id, name)

    # Create JWT
    jwt_token = create_access_token(subject=str(user.id))

    return {"access_token": jwt_token, "user": user}
```

#### 6. User is Authenticated
- JWT token stored in localStorage
- User object in Zustand store
- Subsequent requests include `Authorization: Bearer <token>`

---

## Code Changes

### Backend Changes

#### 1. User Model
```python
# backend/app/models/user.py
class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True)
    full_name: Mapped[str] = mapped_column(String(255))

    # Password is now optional (None for OAuth users)
    hashed_password: Mapped[str | None] = mapped_column(String(255), nullable=True)

    # NEW: Google ID for OAuth users
    google_id: Mapped[str | None] = mapped_column(String(255), unique=True, nullable=True)

    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
```

**Key Changes:**
- `hashed_password` is now nullable
- Added `google_id` field
- Users can authenticate via Google OR password (backwards compatible)

#### 2. Auth Endpoints
```python
# backend/app/api/v1/endpoints/auth.py

@router.get("/google/login")
async def google_login():
    """Returns Google OAuth authorization URL"""
    return {"authorization_url": "https://accounts.google.com/o/oauth2/..."}

@router.post("/google/callback")
async def google_callback(code: str, db: AsyncSession):
    """Exchanges OAuth code for JWT token"""
    # 1. Exchange code for Google access token
    # 2. Get user info from Google
    # 3. Validate email ends with @gmail.com
    # 4. Find or create user in database
    # 5. Generate JWT token
    # 6. Return token + user info
```

#### 3. Environment Variables
```bash
# backend/.env
GOOGLE_CLIENT_ID=your-client-id-from-google-console
GOOGLE_CLIENT_SECRET=your-client-secret-from-google-console
GOOGLE_REDIRECT_URI=http://localhost:5173/auth/callback
```

### Frontend Changes

#### 1. Login Page
```tsx
// frontend/src/pages/login.tsx

// Before: Email/password form
<Input type="email" />
<Input type="password" />
<Button>Sign In</Button>

// After: Single Google button
<Button onClick={handleGoogleLogin}>
  <GoogleIcon />
  Sign in with Google
</Button>
```

#### 2. New Callback Page
```tsx
// frontend/src/pages/auth-callback.tsx

export default function AuthCallback() {
  const code = useSearchParams().get("code");

  useEffect(() => {
    // Exchange code for token
    api.post("/auth/google/callback", { code })
       .then(({ access_token, user }) => {
         setAuth(access_token, user);
         navigate("/");
       });
  }, []);

  return <LoadingSpinner text="Completing sign in..." />;
}
```

#### 3. Updated Routes
```tsx
// frontend/src/App.tsx

<Routes>
  <Route path="/login" element={<LoginPage />} />

  {/* NEW: OAuth callback route */}
  <Route path="/auth/callback" element={<AuthCallback />} />

  <Route element={<DashboardLayout />}>
    {/* Protected routes */}
  </Route>
</Routes>
```

#### 4. Simplified Auth Hooks
```tsx
// frontend/src/hooks/use-auth.ts

// REMOVED: useLogin(), useRegister()

// KEPT: useMe() for fetching current user
export function useMe() {
  const token = useAuthStore(s => s.token);
  return useQuery({
    queryKey: ["me"],
    queryFn: () => api.get("/auth/me"),
    enabled: !!token,
  });
}
```

---

## Setup Instructions

### For Developers

#### 1. Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable "Google+ API"
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Choose "Web application"
6. Add authorized redirect URIs:
   ```
   http://localhost:5173/auth/callback
   http://localhost:3000/auth/callback (if using different port)
   ```
7. Copy the **Client ID** and **Client Secret**

#### 2. Update Backend Environment
```bash
# backend/.env
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123def456ghi789
GOOGLE_REDIRECT_URI=http://localhost:5173/auth/callback
```

#### 3. Install Dependencies
```bash
# Backend
cd backend
.venv/Scripts/pip install authlib httpx

# Run migration
.venv/Scripts/alembic upgrade head
```

#### 4. Test the Flow
```bash
# Start backend
cd backend
.venv/Scripts/uvicorn app.main:app --reload

# Start frontend
cd frontend
npm run dev

# Visit http://localhost:5173/login
# Click "Sign in with Google"
# Use a @gmail.com account
```

---

## Debugging Google SSO

### Common Issues

#### Issue 1: "redirect_uri_mismatch"
**Error:**
```
Error 400: redirect_uri_mismatch
The redirect URI in the request, http://localhost:5173/auth/callback,
does not match the ones authorized for the OAuth client.
```

**Fix:**
1. Go to Google Cloud Console → Credentials
2. Edit your OAuth 2.0 Client ID
3. Add exact redirect URI: `http://localhost:5173/auth/callback`
4. Save and try again

#### Issue 2: "Only Gmail accounts are allowed"
**Error:**
```
403 Forbidden
Only Gmail accounts are allowed
```

**Cause:** User tried to sign in with non-Gmail account (e.g., company email)

**Fix:** Only @gmail.com accounts are allowed. This is by design.

**To allow other domains:**
```python
# backend/app/api/v1/endpoints/auth.py

# Change this:
if not email.endswith("@gmail.com"):
    raise HTTPException(403, "Only Gmail accounts allowed")

# To this (allow multiple domains):
allowed_domains = ["@gmail.com", "@yourdomain.com"]
if not any(email.endswith(domain) for domain in allowed_domains):
    raise HTTPException(403, "Email domain not allowed")
```

#### Issue 3: "Invalid authorization code"
**Error:**
```
400 Bad Request
OAuth error: invalid_grant
```

**Causes:**
- Code expired (> 10 minutes old)
- Code already used
- Time sync issue

**Fix:**
1. Try logging in again
2. Check system time is correct
3. Clear browser cookies/cache

#### Issue 4: Infinite redirect loop
**Symptoms:** Keeps redirecting between /login and /

**Cause:** Token not being saved properly

**Debug:**
```tsx
// frontend/src/pages/auth-callback.tsx

// Add logging
console.log("Code:", code);
console.log("Response:", response.data);
console.log("Token saved:", localStorage.getItem("token"));
```

**Check:**
1. Is `code` present in URL?
2. Does backend return `access_token`?
3. Is token being saved to localStorage?

#### Issue 5: CORS errors
**Error:**
```
Access to fetch at 'http://localhost:8000/api/v1/auth/google/callback'
from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Fix:**
```python
# backend/app/main.py

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Must match frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Debugging Checklist

When SSO isn't working:

- [ ] Google Client ID and Secret are correct
- [ ] Redirect URI matches exactly (check for http vs https, port numbers)
- [ ] Backend is running (`http://localhost:8000`)
- [ ] Frontend is running (`http://localhost:5173`)
- [ ] CORS is configured correctly
- [ ] Google Cloud project has OAuth consent screen configured
- [ ] Using a @gmail.com account
- [ ] Browser allows third-party cookies
- [ ] Check browser console for errors
- [ ] Check backend logs for errors
- [ ] Check Network tab for failed requests

---

## Security Considerations

### What We Verify

1. **Email Domain**
   ```python
   if not email.endswith("@gmail.com"):
       raise HTTPException(403, "Only Gmail accounts allowed")
   ```

2. **Google ID Uniqueness**
   ```python
   # Each Google account can only create one user
   google_id: Mapped[str | None] = mapped_column(unique=True)
   ```

3. **Token Expiration**
   ```python
   # JWT tokens expire after 24 hours
   ACCESS_TOKEN_EXPIRE_MINUTES = 1440
   ```

### What Google Verifies

- User owns the Gmail account
- Password is correct
- 2FA if enabled
- Account is not suspended
- User grants permissions

### Best Practices

1. **Never expose Client Secret**
   ```bash
   # ❌ Don't commit to Git
   GOOGLE_CLIENT_SECRET=abc123

   # ✅ Use environment variables
   # ✅ Add .env to .gitignore
   ```

2. **Use HTTPS in Production**
   ```python
   # Development
   GOOGLE_REDIRECT_URI=http://localhost:5173/auth/callback

   # Production
   GOOGLE_REDIRECT_URI=https://yourdomain.com/auth/callback
   ```

3. **Validate Token on Every Request**
   ```python
   # Backend automatically validates JWT on protected routes
   current_user: User = Depends(get_current_user)
   ```

4. **Store Minimal User Data**
   ```python
   # Only store: email, name, google_id
   # Don't store: password, photos, contacts
   ```

---

## Migration Guide

### Migrating Existing Users

If you had password-based users before SSO:

#### Option 1: Require Re-authentication
```python
# All users must sign in with Google
# Old password accounts become invalid
```

#### Option 2: Support Both (Hybrid)
```python
# Keep both password and OAuth
# Users can log in either way

# Check if user has google_id
if user.google_id:
    # OAuth user
    if not user.hashed_password:
        # Pure OAuth user
else:
    # Password user
    if user.hashed_password:
        # Can still use password login
```

#### Option 3: Link Accounts
```python
# If user with same email exists:
if existing_user and not existing_user.google_id:
    # Link Google ID to existing account
    existing_user.google_id = google_id
    await db.flush()
```

**Current Implementation:** Option 3 (Link Accounts)
- Existing users can sign in with Google
- Google ID is added to their account
- Password becomes optional

---

## Testing SSO

### Manual Testing

1. **First-time user**
   - Sign in with new Gmail account
   - Verify user is created in database
   - Verify dashboard loads correctly

2. **Returning user**
   - Sign in with same Gmail account
   - Verify auto-login works
   - Verify data persists

3. **Non-Gmail account**
   - Try signing in with non-Gmail account
   - Verify error message shown
   - Verify not allowed

4. **Logout and re-login**
   - Click logout
   - Verify redirected to login
   - Sign in again
   - Verify works correctly

### Automated Testing (Future)

```python
# backend/tests/test_auth.py

async def test_google_callback_gmail_allowed():
    """Gmail accounts should be allowed"""
    response = await client.post("/auth/google/callback", json={
        "code": "mock_code",  # Mock Google OAuth
    })
    assert response.status_code == 200
    assert "access_token" in response.json()

async def test_google_callback_non_gmail_rejected():
    """Non-Gmail accounts should be rejected"""
    response = await client.post("/auth/google/callback", json={
        "code": "mock_code_company_email",
    })
    assert response.status_code == 403
    assert "Only Gmail accounts" in response.json()["detail"]
```

---

## FAQ

### Q: Can users sign in with non-Gmail Google accounts?
**A:** No, only @gmail.com accounts are allowed. This is enforced in the backend.

### Q: What if I want to allow company Google Workspace accounts?
**A:** Modify the email validation in `auth.py`:
```python
# Allow @gmail.com and @yourcompany.com
allowed = email.endswith("@gmail.com") or email.endswith("@yourcompany.com")
```

### Q: Is password login completely removed?
**A:** The backend still supports it (hashed_password field exists), but the frontend only shows Google SSO button. You can add password login back if needed.

### Q: What happens to existing users with passwords?
**A:** They can sign in with Google using the same email. Their Google ID will be linked to their account.

### Q: How long does the JWT token last?
**A:** 24 hours (1440 minutes). After that, users must sign in again.

### Q: Can I use this with other OAuth providers (GitHub, Microsoft)?
**A:** Yes! The pattern is the same. You'd add new endpoints like `/auth/github/login` and `/auth/github/callback`.

### Q: Is this secure?
**A:** Yes, OAuth 2.0 is an industry-standard security protocol. We're leveraging Google's authentication instead of managing passwords ourselves.

---

## Summary

### Key Takeaways

1. **Google SSO replaces password-based authentication**
   - Simpler, more secure
   - Only Gmail accounts allowed
   - No registration flow needed

2. **OAuth 2.0 Flow**
   - User → Google login → Code → Token exchange → Authenticated

3. **Backend stores minimal data**
   - email, name, google_id
   - No passwords for OAuth users

4. **Frontend simplified**
   - Single "Sign in with Google" button
   - Callback page handles OAuth response

5. **Setup requires Google Cloud Console configuration**
   - Create OAuth 2.0 credentials
   - Set redirect URIs
   - Add credentials to .env

---

**Related Documentation:**
- [FRONTEND_GUIDE.md](./FRONTEND_GUIDE.md) - General frontend guide
- [ARCHITECTURE_DIAGRAMS.md](./ARCHITECTURE_DIAGRAMS.md) - Updated with SSO flow
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - SSO code snippets

---

*Last Updated: 2026-02-14 (Google SSO Implementation)*
