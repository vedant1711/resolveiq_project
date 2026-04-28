# ResolveIQ Deployment Guide

This guide covers deploying ResolveIQ to **Render** (backend) and **Vercel** (frontend) with Slack OAuth integration.

## Overview

- **Backend**: Django/DRF on Render (free tier with auto-sleep)
- **Frontend**: Next.js on Vercel (free tier with unlimited deployments)
- **Slack OAuth**: Redirect URLs configured for both services
- **Database**: SQLite on Render (persistent via volumes)
- **Environment**: Production-ready with HTTPS

---

## Prerequisites

Before starting, you need:

1. **GitHub Account**: Repos must be pushed to GitHub
2. **Render Account**: https://render.com (sign up free)
3. **Vercel Account**: https://vercel.com (sign up free)
4. **Slack Workspace**: Admin access to configure OAuth app
5. **External API Credentials**:
   - OpenAI API key
   - Pinecone API key
   - Jira/Confluence credentials
   - Slack Bot Token (generate after OAuth setup)

---

## Part 1: Deploy Backend to Render

### Step 1.1: Create `render.yaml`

In the backend root, create `render.yaml`:

```yaml
# backend/render.yaml
services:
  - type: web
    name: resolveiq-backend
    runtime: python
    buildCommand: "pip install -r requirements.txt && python manage.py migrate --noinput"
    startCommand: "gunicorn resolveiq.wsgi:application --bind 0.0.0.0:$PORT"
    envVars:
      - key: DEBUG
        value: "False"
      - key: DJANGO_ENV
        value: production
      - key: ALLOWED_HOSTS
        fromDatabase:
          name: postgres
      - key: SECRET_KEY
        generateValue: true
    volumes:
      - path: /opt/render/project/src/db
        name: sqlite-db
```

Actually, for simpler manual setup (recommended for hobby projects):

### Step 1.2: Update `requirements.txt`

Add production dependencies:

```bash
cd backend
```

Edit `requirements.txt` to add:

```
gunicorn>=21.2  # Production WSGI server
whitenoise>=6.6  # Static file serving
```

### Step 1.3: Update Django Settings for Production

Edit `backend/resolveiq/settings.py`:

```python
# Add after imports
import dj_database_url

# Update ALLOWED_HOSTS
ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "localhost,127.0.0.1").split(",")

# Add Render-specific host (you'll update this after deployment)
if os.getenv("RENDER_EXTERNAL_HOSTNAME"):
    ALLOWED_HOSTS.append(os.getenv("RENDER_EXTERNAL_HOSTNAME"))

# Update CORS
CORS_ALLOWED_ORIGINS = os.getenv(
    "CORS_ALLOWED_ORIGINS",
    "http://localhost:3000"
).split(",")

# Add Vercel frontend URL after deployment
if os.getenv("FRONTEND_URL"):
    CORS_ALLOWED_ORIGINS.append(os.getenv("FRONTEND_URL"))

# Secure settings for production
SECURE_SSL_REDIRECT = not DEBUG
SESSION_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_SECURE = not DEBUG

# Static files
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATIC_URL = '/static/'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
```

### Step 1.4: Create Render Web Service

1. Go to **https://dashboard.render.com**
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repo (ResolveIQ_Project)
4. Configure:
   - **Name**: `resolveiq-backend`
   - **Runtime**: Python
   - **Build Command**: `pip install -r requirements.txt && python manage.py migrate --noinput`
   - **Start Command**: `gunicorn resolveiq.wsgi:application --bind 0.0.0.0:$PORT`
   - **Instance Type**: Free (will sleep after 15 min inactivity)
5. Click **"Create Web Service"**

### Step 1.5: Add Environment Variables to Render

In the Render dashboard for your service:

1. Go to **Environment** tab
2. Add the following env vars:

```
DEBUG=False
SECRET_KEY=[generate a strong key or let Render generate]
ALLOWED_HOSTS=localhost,127.0.0.1,resolveiq-backend.onrender.com
OPENAI_API_KEY=[your OpenAI key]
PINECONE_API_KEY=[your Pinecone key]
PINECONE_INDEX_NAME=[your index name]
JIRA_URL=[your Jira instance URL]
JIRA_USERNAME=[your Jira username]
JIRA_API_TOKEN=[your Jira API token]
CONFLUENCE_URL=[your Confluence URL]
CONFLUENCE_USERNAME=[your Confluence username]
CONFLUENCE_API_TOKEN=[your Confluence API token]
SLACK_BOT_TOKEN=[will update after OAuth setup]
SLACK_CHANNEL_ID=[your channel ID]
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://resolveiq-frontend.vercel.app
FRONTEND_URL=https://resolveiq-frontend.vercel.app
```

### Step 1.6: Get Backend URL

After deployment completes:
- Your backend URL: `https://resolveiq-backend.onrender.com`
- Save this for the next steps

---

## Part 2: Deploy Frontend to Vercel

### Step 2.1: Update Frontend Environment

Update `frontend/.env.local.example` → copy to `.env.production.local`:

```
NEXT_PUBLIC_API_URL=https://resolveiq-backend.onrender.com
NEXT_PUBLIC_SLACK_CLIENT_ID=[will set up in Part 3]
```

### Step 2.2: Deploy to Vercel

1. Go to **https://vercel.com/dashboard**
2. Click **"Add New..."** → **"Project"**
3. Select your GitHub repo (ResolveIQ_Project)
4. Configure:
   - **Framework**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
5. Add Environment Variables:
   - `NEXT_PUBLIC_API_URL`: `https://resolveiq-backend.onrender.com`
6. Click **"Deploy"**

### Step 2.3: Get Frontend URL

After deployment:
- Your frontend URL: `https://resolveiq-frontend.vercel.app` (or your custom domain)
- Update backend `CORS_ALLOWED_ORIGINS` to include this URL

---

## Part 3: Set Up Slack OAuth

### Step 3.1: Create Slack App

1. Go to **https://api.slack.com/apps**
2. Click **"Create an App"** → **"From scratch"**
3. **App name**: `ResolveIQ`
4. **Workspace**: Select your workspace
5. Click **"Create App"**

### Step 3.2: Configure OAuth & Permissions

1. In the left menu: **"OAuth & Permissions"**
2. Scroll to **"Redirect URLs"** and add:
   ```
   https://resolveiq-backend.onrender.com/api/slack/oauth/callback
   https://resolveiq-frontend.vercel.app/api/slack/oauth/callback
   ```
3. Under **"Scopes"** → **"Bot Token Scopes"**, add:
   ```
   channels:history
   chat:write
   commands
   groups:history
   users:read
   ```
4. Under **"Scopes"** → **"User Token Scopes"**, add:
   ```
   channels:history
   ```
5. Click **"Save URLs"**

### Step 3.3: Get Credentials

1. Scroll to **"Tokens for Your Workspace"**
2. Copy:
   - **Bot User OAuth Token**: `xoxb-...`
   - **User OAuth Token**: `xoxp-...` (optional)
3. Go to **"Basic Information"** tab
   - Copy **Client ID**
   - Copy **Client Secret**

### Step 3.4: Update Environment Variables

**On Render** (backend):
```
SLACK_BOT_TOKEN=xoxb-[your bot token]
SLACK_CLIENT_ID=[your client ID]
SLACK_CLIENT_SECRET=[your client secret]
```

**On Vercel** (frontend):
```
NEXT_PUBLIC_SLACK_CLIENT_ID=[your client ID]
```

### Step 3.5: Enable Event Subscriptions (Optional)

1. In Slack app settings: **"Event Subscriptions"**
2. Toggle **"Enable Events"** → **On**
3. **Request URL**: `https://resolveiq-backend.onrender.com/api/slack/events`
4. Subscribe to Bot Events:
   - `message.channels`
   - `message.groups`
   - `app_mention`

---

## Part 4: Verify Deployments

### Test Backend

```bash
curl https://resolveiq-backend.onrender.com/api/health
# Should return 200 or similar health check response
```

### Test Frontend

Visit `https://resolveiq-frontend.vercel.app` and verify:
- [ ] Page loads
- [ ] API calls work (try "Analyze" on a ticket)
- [ ] No CORS errors in browser console

### Test Slack Integration

1. In Slack, mention ResolveIQ app
2. Check if bot responds

---

## Part 5: Important Notes

### Database

- **SQLite on Render**: File stored in `/opt/render/project/src/db` (persistent volume)
- **Backup recommendation**: Periodically download `db.sqlite3` from Render

### Cold Starts

- **Render Free**: Service sleeps after 15 min inactivity, takes 30-60 sec to wake
- **Vercel**: Auto-scales, no cold start issues

### Scaling

- **Render**: Upgrade to **Pro** ($12/mo) for persistent service + production features
- **Vercel**: Scales automatically; Pro plan for advanced features

### Debugging

**Render Logs**:
```bash
# View in dashboard: Services → [backend] → Logs
```

**Vercel Logs**:
```bash
# View in dashboard: Project → Deployments → [selected] → Logs
```

---

## Troubleshooting

### 502 Bad Gateway on Render

- Check `gunicorn` start command
- Verify `SECRET_KEY` and `DEBUG` are set
- Check logs for migration errors

### CORS Errors in Frontend

- Verify `CORS_ALLOWED_ORIGINS` includes Vercel URL
- Clear browser cache

### Slack Not Connecting

- Verify bot token is valid
- Check Slack OAuth redirect URLs match exactly
- Ensure channel ID is correct

---

## Summary of Deployed URLs

Once complete, you'll have:

| Service | URL |
|---------|-----|
| **Backend API** | `https://resolveiq-backend.onrender.com` |
| **Frontend** | `https://resolveiq-frontend.vercel.app` |
| **Slack OAuth Redirect** | `https://resolveiq-backend.onrender.com/api/slack/oauth/callback` |

---

## Next Steps

1. ✅ Deploy backend to Render
2. ✅ Deploy frontend to Vercel
3. ✅ Set up Slack OAuth
4. ✅ Update environment variables on both platforms
5. ✅ Test all integrations
6. 🔄 Monitor logs and iterate

For production (non-hobby) use:
- Upgrade to Render **Pro** ($12/mo)
- Use **PostgreSQL** instead of SQLite
- Set up CI/CD pipelines
- Enable monitoring and alerting
