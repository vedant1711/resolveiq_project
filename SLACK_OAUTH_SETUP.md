# Slack OAuth Visual Guide

This guide shows exactly where to click and what values to copy during Slack OAuth setup.

---

## 🔗 Part 1: Create Slack App

### 1.1 Go to Slack API Dashboard
- **URL**: https://api.slack.com/apps
- You should see your workspace's Slack apps list

### 1.2 Create New App
- Click blue **"Create an App"** button (top right)
- Select **"From scratch"** option
- **App name**: `ResolveIQ`
- **Select workspace**: Your company workspace
- Click **"Create App"**

### 1.3 App Created ✅
- You're now on the **"Basic Information"** page
- Save these values:
  ```
  Client ID:     (in "App Credentials" section)
  Client Secret: (in "App Credentials" section)
  Signing Secret:(in "App Credentials" section)
  ```

---

## 🔐 Part 2: Configure OAuth & Permissions

### 2.1 Go to OAuth & Permissions
- Left sidebar: **"OAuth & Permissions"**

### 2.2 Add Redirect URLs
- Scroll to **"Redirect URLs"** section
- Click **"Add New Redirect URL"**
- Paste first URL:
  ```
  https://resolveiq-backend.onrender.com/api/slack/oauth/callback
  ```
- Click **"Add New Redirect URL"** again
- Paste second URL:
  ```
  https://resolveiq-frontend.vercel.app/api/slack/oauth/callback
  ```
- Click **"Save URLs"** button (bottom)

### 2.3 Configure Bot Scopes
- Under **"Scopes"** → **"Bot Token Scopes"**
- Click **"Add an OAuth Scope"**
- Add each scope:
  - [ ] `channels:history` - Read channel message history
  - [ ] `chat:write` - Post messages
  - [ ] `commands` - Slash commands
  - [ ] `groups:history` - Read DM history
  - [ ] `users:read` - Read user profiles

### 2.4 Install Bot to Workspace
- Click **"Install to Workspace"** button (or reinstall if already done)
- Slack will ask for permissions - click **"Allow"**
- You'll see **"Bot User OAuth Token"** → Copy this!
  ```
  Format: xoxb-1234567890-1234567890-XXXXXXXXXXXX
  ```

---

## 📋 Part 3: Get All Credentials

### 3.1 From "Basic Information" Tab:
```
Client ID:       [Copy this - looks like: 1234567890.1234567890]
Client Secret:   [Copy this - looks like: xxxxxxxxxxxxxxxxxxx]
Signing Secret:  [Copy this - if needed]
```

### 3.2 From "OAuth & Permissions" Tab:
```
Bot Token:       [Copy this - looks like: xoxb-123456...]
```

---

## 🔧 Part 4: Update Environment Variables

### 4.1 On Render Dashboard

1. Go to: https://dashboard.render.com
2. Click your **"resolveiq-backend"** service
3. Click **"Environment"** tab
4. Find these and update:

```env
SLACK_BOT_TOKEN=xoxb-...           (from Part 3.2)
SLACK_CLIENT_ID=...                (from Part 3.1)
SLACK_CLIENT_SECRET=...            (from Part 3.1)
```

5. Click **"Save"**
6. Service auto-restarts (watch the "Events" tab)

### 4.2 On Vercel Dashboard

1. Go to: https://vercel.com/dashboard
2. Click your **"resolveiq-frontend"** project
3. Click **"Settings"** → **"Environment Variables"**
4. Add or update:

```env
NEXT_PUBLIC_SLACK_CLIENT_ID=...    (from Part 3.1)
```

5. Click **"Save"**
6. Redeploy (click "Deployments" → Latest → "Redeploy")

---

## ✅ Part 5: Verify Setup

### Test 1: Check Backend
```bash
curl https://resolveiq-backend.onrender.com/api/slack/status/
```

Should return:
```json
{
  "slack_configured": true,
  "bot_token_set": true,
  "client_id_set": true,
  "channel_id_set": true
}
```

### Test 2: Check Slack OAuth
- Visit: `https://resolveiq-frontend.vercel.app`
- Look for **"Sign in with Slack"** button
- Click it - you should be redirected to Slack OAuth page
- Approve permissions
- Should redirect back with success

### Test 3: Check Bot in Slack
- Go to your Slack workspace
- Find **"#engineering"** or your team channel
- Type: `@ResolveIQ help`
- Bot should respond (or your custom command)

---

## 🎯 Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| **Redirect URL not accepted** | Ensure URLs match EXACTLY (trailing slash matters) |
| **Bot not responding** | Check `SLACK_BOT_TOKEN` is valid; restart service |
| **"Invalid credentials" error** | Verify `SLACK_CLIENT_ID` and `SLACK_CLIENT_SECRET` are correct |
| **Scopes not working** | Reinstall bot to workspace after adding scopes |
| **OAuth returns 404** | Verify `resolveiq-backend.onrender.com` is correct URL |

---

## 📞 If Something Goes Wrong

**Check these in order:**

1. **Render logs**:
   - Dashboard → Services → resolveiq-backend → Logs
   - Look for errors

2. **Vercel logs**:
   - Dashboard → Deployments → Latest → Logs
   - Check for API connection errors

3. **Slack OAuth settings**:
   - https://api.slack.com/apps
   - Click ResolveIQ app
   - OAuth & Permissions → Verify redirect URLs

4. **Browser DevTools**:
   - Press F12 → Console tab
   - Look for CORS or network errors
   - Network tab → check API calls

---

## 🔗 All URLs in One Place

| What | URL |
|------|-----|
| **Your Backend** | `https://resolveiq-backend.onrender.com` |
| **Your Frontend** | `https://resolveiq-frontend.vercel.app` |
| **Slack Apps** | `https://api.slack.com/apps` |
| **Render Dashboard** | `https://dashboard.render.com` |
| **Vercel Dashboard** | `https://vercel.com/dashboard` |
| **OAuth Start** | `https://resolveiq-backend.onrender.com/api/slack/oauth/start/` |

---

## 💾 Save These Values

Create a secure note with:

```
SLACK_CLIENT_ID = ___________________________
SLACK_CLIENT_SECRET = _______________________
SLACK_BOT_TOKEN = ___________________________
SLACK_SIGNING_SECRET = ______________________

Backend URL = https://resolveiq-backend.onrender.com
Frontend URL = https://resolveiq-frontend.vercel.app
```

*Store securely - don't share publicly!*

---

**Ready to test?** Visit your frontend URL and click the Slack integration! 🚀
