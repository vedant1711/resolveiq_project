# 🚀 DEPLOYMENT QUICK START

**Time to deploy: 30 minutes | Technical level: Beginner-friendly**

---

## 📋 Your 3-Step Deployment Plan

### ✅ Step 1: Deploy Backend (Render) - 10 minutes

```bash
# Step 1: Go to Render
# https://dashboard.render.com

# Step 2: Click "New +" → "Web Service"
# Step 3: Connect GitHub repo: ResolveIQ_Project

# Step 4: Configuration
Name: resolveiq-backend
Runtime: Python 3.11
Root Directory: backend
Build Command: pip install -r requirements.txt && python manage.py migrate --noinput && python manage.py collectstatic --noinput
Start Command: gunicorn resolveiq.wsgi:application --bind 0.0.0.0:$PORT

# Step 5: Add Environment Variables (from backend/.env.example)
DEBUG=False
SECRET_KEY=<generate-a-strong-key>
ALLOWED_HOSTS=localhost,127.0.0.1,resolveiq-backend.onrender.com
OPENAI_API_KEY=<your-key>
PINECONE_API_KEY=<your-key>
PINECONE_INDEX_NAME=resolveiqdocs
ATLASSIAN_BASE_URL=https://yourinstance.atlassian.net
ATLASSIAN_EMAIL=<your-email>
ATLASSIAN_API_TOKEN=<your-token>
CONFLUENCE_SPACE_KEY=MSKB
JIRA_PROJECT_KEY=IT
SLACK_BOT_TOKEN=xoxb-<will-update-later>
SLACK_CLIENT_ID=<will-update-later>
SLACK_CLIENT_SECRET=<will-update-later>
SLACK_CHANNEL_ID=C0123456789

# Step 6: Click "Create Web Service"
# Step 7: Wait for deployment (2-3 minutes)
# Step 8: Copy your URL: https://resolveiq-backend.onrender.com
```

---

### ✅ Step 2: Deploy Frontend (Vercel) - 10 minutes

```bash
# Step 1: Go to Vercel
# https://vercel.com/dashboard

# Step 2: Click "Add New..." → "Project"
# Step 3: Import GitHub repo: ResolveIQ_Project

# Step 4: Configuration
Framework: Next.js
Root Directory: frontend

# Step 5: Environment Variables
NEXT_PUBLIC_API_URL=https://resolveiq-backend.onrender.com

# Step 6: Click "Deploy"
# Step 7: Wait for deployment (1-2 minutes)
# Step 8: Copy your URL: https://resolveiq-frontend.vercel.app
```

---

### ✅ Step 3: Configure Slack OAuth - 10 minutes

```bash
# See SLACK_OAUTH_SETUP.md for detailed instructions with screenshots

# Quick version:
# 1. Go to https://api.slack.com/apps
# 2. Click "Create an App" → "From scratch"
#    Name: ResolveIQ
#    Workspace: Your workspace
#
# 3. Go to "OAuth & Permissions"
# 4. Add Redirect URLs:
#    https://resolveiq-backend.onrender.com/api/slack/oauth/callback
#    https://resolveiq-frontend.vercel.app/api/slack/oauth/callback
#
# 5. Add Bot Token Scopes:
#    - channels:history
#    - chat:write
#    - commands
#    - groups:history
#    - users:read
#
# 6. Copy credentials:
#    Bot Token: xoxb-...
#    Client ID: ...
#    Client Secret: ...
#
# 7. Update Render environment with Slack credentials:
#    SLACK_BOT_TOKEN=xoxb-...
#    SLACK_CLIENT_ID=...
#    SLACK_CLIENT_SECRET=...
#
# 8. Update Vercel environment:
#    NEXT_PUBLIC_SLACK_CLIENT_ID=...
```

---

## 🎯 Verify Everything Works

```bash
# Test 1: Backend API
curl https://resolveiq-backend.onrender.com/api/slack/status/
# Should return JSON with slack_configured info

# Test 2: Frontend
# Visit: https://resolveiq-frontend.vercel.app
# Should load without errors

# Test 3: Slack OAuth
# Click "Sign in with Slack" on frontend
# Should redirect to Slack, then back to your app
```

---

## 🔗 Important URLs (Save These!)

```
Backend API:        https://resolveiq-backend.onrender.com
Frontend:           https://resolveiq-frontend.vercel.app
Slack Apps:         https://api.slack.com/apps
Render Dashboard:   https://dashboard.render.com
Vercel Dashboard:   https://vercel.com/dashboard
```

---

## 📚 If You Need Help

| Need | File |
|------|------|
| Step-by-step checklist | `DEPLOYMENT_CHECKLIST.md` |
| Detailed deployment info | `DEPLOYMENT.md` |
| Slack setup with screenshots | `SLACK_OAUTH_SETUP.md` |
| System architecture | `ARCHITECTURE.md` |
| Local development | `README.md` |

---

## ⚠️ Common Issues

| Problem | Solution |
|---------|----------|
| 502 Bad Gateway | Check Render logs; restart service |
| CORS errors | Update CORS_ALLOWED_ORIGINS on Render |
| Slack not connecting | Verify bot token; check redirect URLs |
| Frontend won't load | Verify NEXT_PUBLIC_API_URL is correct |

---

## ✨ You're Done!

Your ResolveIQ app is now live. Share the frontend URL with your team:

```
https://resolveiq-frontend.vercel.app
```

**Next steps:**
- Test the Analyze feature
- Generate a KB draft
- Invite team members
- Monitor in Render/Vercel dashboards

---

**Questions?** Open an issue on GitHub or check the detailed guides above. 🎉
