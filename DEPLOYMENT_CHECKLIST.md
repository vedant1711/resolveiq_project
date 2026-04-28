# Quick Deployment Checklist

Use this checklist to deploy ResolveIQ to Render (backend) and Vercel (frontend).

## Phase 1: Preparation

- [ ] **GitHub**: Push code to GitHub
  ```bash
  git add .
  git commit -m "Add deployment files"
  git push origin main
  ```

- [ ] **External Services**: Ensure you have active accounts for:
  - [ ] Render (https://render.com)
  - [ ] Vercel (https://vercel.com)
  - [ ] Slack (your workspace with admin access)
  - [ ] OpenAI API key
  - [ ] Pinecone API key
  - [ ] Jira/Confluence credentials

## Phase 2: Backend Deployment (Render)

### 2.1 Create Render Web Service
- [ ] Go to https://dashboard.render.com
- [ ] Click "New +" → "Web Service"
- [ ] Connect GitHub repo: `ResolveIQ_Project`
- [ ] Select `main` branch

### 2.2 Configure Service
- [ ] **Name**: `resolveiq-backend`
- [ ] **Runtime**: Python 3.11 (or latest)
- [ ] **Build Command**: `pip install -r requirements.txt && python manage.py migrate --noinput && python manage.py collectstatic --noinput`
- [ ] **Start Command**: `gunicorn resolveiq.wsgi:application --bind 0.0.0.0:$PORT`
- [ ] **Root Directory**: `backend` (if monorepo)

### 2.3 Environment Variables (Copy from backend/.env.example)
- [ ] `DEBUG`: `False`
- [ ] `SECRET_KEY`: (Auto-generate or create strong key)
- [ ] `ALLOWED_HOSTS`: `localhost,127.0.0.1,resolveiq-backend.onrender.com`
- [ ] `OPENAI_API_KEY`: (Your OpenAI key)
- [ ] `PINECONE_API_KEY`: (Your Pinecone key)
- [ ] `PINECONE_INDEX_NAME`: (Your index name)
- [ ] `ATLASSIAN_BASE_URL`: (Your Jira/Confluence URL)
- [ ] `ATLASSIAN_EMAIL`: (Your Atlassian email)
- [ ] `ATLASSIAN_API_TOKEN`: (Your Atlassian API token)
- [ ] `CONFLUENCE_SPACE_KEY`: (e.g., `MSKB`)
- [ ] `JIRA_PROJECT_KEY`: (e.g., `IT`)
- [ ] `SLACK_BOT_TOKEN`: (Will add after Slack OAuth setup)
- [ ] `SLACK_CHANNEL_ID`: (Your Slack channel ID)
- [ ] `CORS_ALLOWED_ORIGINS`: `http://localhost:3000`
- [ ] `FRONTEND_URL`: (Will update after Vercel deployment)

### 2.4 Deploy
- [ ] Click "Create Web Service"
- [ ] Wait for deployment to complete
- [ ] **Note Render URL**: `https://resolveiq-backend.onrender.com`

---

## Phase 3: Frontend Deployment (Vercel)

### 3.1 Deploy to Vercel
- [ ] Go to https://vercel.com/dashboard
- [ ] Click "Add New..." → "Project"
- [ ] Import GitHub repo: `ResolveIQ_Project`

### 3.2 Configure Project
- [ ] **Framework**: Next.js
- [ ] **Root Directory**: `frontend`

### 3.3 Environment Variables
- [ ] `NEXT_PUBLIC_API_URL`: `https://resolveiq-backend.onrender.com` (from Phase 2)
- [ ] `NEXT_PUBLIC_SLACK_CLIENT_ID`: (Will add after Slack OAuth setup)

### 3.4 Deploy
- [ ] Click "Deploy"
- [ ] Wait for deployment to complete
- [ ] **Note Vercel URL**: `https://resolveiq-frontend.vercel.app`

---

## Phase 4: Update Backend Environment

### 4.1 Add Frontend URL to Render
Go back to Render dashboard for `resolveiq-backend`:
- [ ] Go to Environment tab
- [ ] Update `CORS_ALLOWED_ORIGINS`: Add Vercel URL
  ```
  http://localhost:3000,https://resolveiq-frontend.vercel.app
  ```
- [ ] Update `FRONTEND_URL`: `https://resolveiq-frontend.vercel.app`
- [ ] Click "Save"
- [ ] Service will auto-restart with new variables

---

## Phase 5: Slack OAuth Setup

### 5.1 Create Slack App
- [ ] Go to https://api.slack.com/apps
- [ ] Click "Create an App" → "From scratch"
- [ ] **App name**: `ResolveIQ`
- [ ] **Workspace**: Select your workspace
- [ ] Click "Create App"

### 5.2 Configure OAuth & Permissions
- [ ] Left menu: Click "OAuth & Permissions"
- [ ] **Redirect URLs**: Add both:
  ```
  https://resolveiq-backend.onrender.com/api/slack/oauth/callback
  https://resolveiq-frontend.vercel.app/api/slack/oauth/callback
  ```
- [ ] Click "Add New Redirect URL" for each
- [ ] Click "Save URLs"

### 5.3 Configure Bot Token Scopes
- [ ] Under **"Scopes"** → **"Bot Token Scopes"**, click "Add an OAuth Scope"
- [ ] Add scopes:
  - [ ] `channels:history`
  - [ ] `chat:write`
  - [ ] `commands`
  - [ ] `groups:history`
  - [ ] `users:read`

### 5.4 Get Credentials
- [ ] Scroll to **"Tokens for Your Workspace"**
- [ ] Copy **Bot User OAuth Token**: `xoxb-...` (save this)
- [ ] Go to **"Basic Information"** tab
- [ ] Copy **Client ID** (save this)
- [ ] Copy **Client Secret** (save this)

### 5.5 Update Render Environment
Go to Render dashboard for `resolveiq-backend`:
- [ ] Add/Update `SLACK_BOT_TOKEN`: `xoxb-...` (from 5.4)
- [ ] Add/Update `SLACK_CLIENT_ID`: (from 5.4)
- [ ] Add/Update `SLACK_CLIENT_SECRET`: (from 5.4)
- [ ] Save environment

### 5.6 Update Vercel Environment
Go to Vercel dashboard for `resolveiq-frontend`:
- [ ] Add/Update `NEXT_PUBLIC_SLACK_CLIENT_ID`: (from 5.4)
- [ ] Redeploy or trigger new deployment

---

## Phase 6: Verification

### Test Backend API
- [ ] Run in terminal:
  ```bash
  curl https://resolveiq-backend.onrender.com/api/
  ```
- [ ] Should return some response (not 500 error)

### Test Frontend
- [ ] Visit `https://resolveiq-frontend.vercel.app`
- [ ] Page should load
- [ ] Check browser console for CORS errors
- [ ] Try clicking "Analyze" on a ticket

### Test Slack Integration
- [ ] In your Slack workspace, mention the ResolveIQ app
- [ ] Bot should respond (or perform intended action)

---

## Phase 7: Monitoring & Maintenance

### Render Backend
- [ ] View logs: Dashboard → Services → [backend] → Logs
- [ ] Monitor cold starts (free tier sleeps after 15 min)
- [ ] Periodically download DB backup: `db.sqlite3`

### Vercel Frontend
- [ ] View logs: Dashboard → Deployments → [latest] → Logs
- [ ] Monitor function execution times
- [ ] Check analytics if Pro account

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| 502 Bad Gateway | Check Render logs; verify `gunicorn` start command; ensure migrations ran |
| CORS errors | Verify `CORS_ALLOWED_ORIGINS` includes Vercel URL; clear browser cache |
| Slack not connecting | Verify bot token is valid; check OAuth redirect URLs; ensure channel ID is correct |
| Database errors | Ensure migrations ran on Render; check SQLite file permissions |
| Static files missing | Run `python manage.py collectstatic` on Render; restart service |

---

## Summary of Deployed URLs

| Service | URL |
|---------|-----|
| **Backend API** | `https://resolveiq-backend.onrender.com` |
| **Frontend** | `https://resolveiq-frontend.vercel.app` |
| **Slack Bot Token** | From Slack App Settings |

---

**✅ Deployment Complete!** Your ResolveIQ app is now live. Share the frontend URL with your team.
