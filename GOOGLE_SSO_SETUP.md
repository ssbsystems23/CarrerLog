# Google SSO Setup Instructions

> Step-by-step guide to configure Google OAuth 2.0 for the Developer Dashboard

---

## Prerequisites

- Google Account (any Gmail account)
- Access to [Google Cloud Console](https://console.cloud.google.com/)

---

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Select a project"** → **"New Project"**
3. Enter project details:
   - **Project name:** `Developer Dashboard` (or any name)
   - **Organization:** Leave as default
4. Click **"Create"**
5. Wait for project to be created (~10 seconds)

---

## Step 2: Configure OAuth Consent Screen

1. In Google Cloud Console, go to **"APIs & Services"** → **"OAuth consent screen"**
2. Choose **"External"** (allows any Gmail user to sign in)
3. Click **"Create"**

4. **Fill in OAuth consent screen:**
   - **App name:** `Developer Dashboard`
   - **User support email:** Your email address
   - **App logo:** (Optional) Upload a logo
   - **Application home page:** `http://localhost:5173`
   - **Authorized domains:** Leave empty for localhost
   - **Developer contact information:** Your email

5. Click **"Save and Continue"**

6. **Scopes:**
   - Click **"Add or Remove Scopes"**
   - Select:
     - `./auth/userinfo.email` (See your email address)
     - `./auth/userinfo.profile` (See your personal info)
     - `openid` (Authenticate using OpenID Connect)
   - Click **"Update"**
   - Click **"Save and Continue"**

7. **Test users:** (Optional for development)
   - Add your Gmail address as a test user
   - Click **"Save and Continue"**

8. **Summary:**
   - Review and click **"Back to Dashboard"**

---

## Step 3: Create OAuth 2.0 Credentials

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"+ Create Credentials"** → **"OAuth 2.0 Client ID"**

3. If prompted, configure consent screen (use steps above)

4. **Create OAuth client ID:**
   - **Application type:** `Web application`
   - **Name:** `Developer Dashboard Web Client`

5. **Authorized JavaScript origins:**
   - Click **"+ Add URI"**
   - Add: `http://localhost:5173`
   - Add: `http://localhost:3000` (optional, if you use different port)

6. **Authorized redirect URIs:**
   - Click **"+ Add URI"**
   - Add: `http://localhost:5173/auth/callback`
   - Add: `http://localhost:3000/auth/callback` (optional)

7. Click **"Create"**

8. **Copy credentials** (shown in popup):
   - **Client ID:** `123456789-abcdefghij.apps.googleusercontent.com`
   - **Client Secret:** `GOCSPX-abc123def456`
   - Click **"OK"**

⚠️ **IMPORTANT:** Save these credentials - you'll need them in Step 4

---

## Step 4: Update Backend Environment

1. Open `backend/.env` file
2. Update with your credentials:

```bash
# Google OAuth2 Configuration
GOOGLE_CLIENT_ID=123456789-abcdefghij.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123def456
GOOGLE_REDIRECT_URI=http://localhost:5173/auth/callback
```

3. **Save the file**

⚠️ **SECURITY:**
- Never commit `.env` to Git
- Never share your Client Secret
- `.env` is already in `.gitignore`

---

## Step 5: Install Dependencies

```bash
# Backend
cd backend
.venv\Scripts\pip install authlib httpx

# Apply database migration
.venv\Scripts\alembic upgrade head
```

---

## Step 6: Start the Application

```bash
# Terminal 1: Start Backend
cd backend
.venv\Scripts\uvicorn app.main:app --reload

# Terminal 2: Start Frontend
cd frontend
npm run dev
```

---

## Step 7: Test Google SSO

1. Open browser: `http://localhost:5173/login`
2. You should see: **"Sign in with Google"** button
3. Click the button
4. You'll be redirected to Google login
5. Sign in with your **Gmail account** (must be @gmail.com)
6. Grant permissions when prompted
7. You'll be redirected back to the dashboard
8. **Success!** You're logged in

---

## Troubleshooting

### Error: "redirect_uri_mismatch"

**Problem:**
```
Error 400: redirect_uri_mismatch
```

**Solution:**
1. Go to Google Cloud Console → Credentials
2. Edit your OAuth 2.0 Client ID
3. Verify redirect URI is exactly: `http://localhost:5173/auth/callback`
4. No trailing slash, correct protocol (http vs https), correct port
5. Save and try again

### Error: "Only Gmail accounts are allowed"

**Problem:**
```
403 Forbidden: Only Gmail accounts are allowed
```

**Solution:**
- Use an @gmail.com email address
- Company Google Workspace accounts (@yourcompany.com) are not allowed by default
- To allow other domains, modify `backend/app/api/v1/endpoints/auth.py`

### Error: "Access blocked: This app's request is invalid"

**Problem:**
OAuth consent screen not properly configured

**Solution:**
1. Complete Step 2 above (OAuth Consent Screen)
2. Make sure app name, support email, and developer email are filled
3. Add yourself as a test user
4. Publishing status should be "Testing" or "In Production"

### Error: CORS policy error

**Problem:**
```
Access to fetch ... has been blocked by CORS policy
```

**Solution:**
1. Check backend is running on port 8000
2. Check frontend is running on port 5173
3. Verify CORS configuration in `backend/app/main.py`:
   ```python
   allow_origins=["http://localhost:5173"]
   ```

---

## Production Deployment

### For Production Environment:

1. **Update redirect URIs in Google Cloud Console:**
   ```
   https://yourdomain.com/auth/callback
   ```

2. **Update backend .env:**
   ```bash
   GOOGLE_REDIRECT_URI=https://yourdomain.com/auth/callback
   ```

3. **Publish OAuth consent screen:**
   - In Google Cloud Console
   - OAuth consent screen → "Publish App"
   - Submit for verification if needed

4. **Use HTTPS:**
   - Required for production
   - http:// redirect URIs will not work

---

## Security Checklist

- [ ] Client Secret is not committed to Git
- [ ] `.env` file is in `.gitignore`
- [ ] Only Gmail accounts can sign in (@gmail.com validation)
- [ ] JWT tokens expire after 24 hours
- [ ] HTTPS is used in production
- [ ] OAuth consent screen is configured correctly
- [ ] Authorized redirect URIs are whitelisted

---

## Quick Reference

### Google Cloud Console URLs

| Resource | URL |
|----------|-----|
| Cloud Console | https://console.cloud.google.com/ |
| OAuth Consent | https://console.cloud.google.com/apis/credentials/consent |
| Credentials | https://console.cloud.google.com/apis/credentials |
| API Library | https://console.cloud.google.com/apis/library |

### Local Development URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |
| OAuth Callback | http://localhost:5173/auth/callback |

### Environment Variables

```bash
# Backend (.env)
GOOGLE_CLIENT_ID=<your-client-id>
GOOGLE_CLIENT_SECRET=<your-client-secret>
GOOGLE_REDIRECT_URI=http://localhost:5173/auth/callback
```

---

## Need Help?

- 📖 [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- 📖 [GOOGLE_SSO_GUIDE.md](./frontend/GOOGLE_SSO_GUIDE.md) - Detailed implementation guide
- 🐛 [QUICK_REFERENCE.md](./frontend/QUICK_REFERENCE.md) - Debugging tips

---

*Last Updated: 2026-02-14*
