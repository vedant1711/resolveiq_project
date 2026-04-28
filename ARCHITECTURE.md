# ResolveIQ Deployment Architecture

## 🏗️ System Design Overview

```
                        ┌──────────────────────────────────┐
                        │      End Users / Support Team     │
                        └──────────────┬───────────────────┘
                                       │
                ┌──────────────────────┼──────────────────────┐
                │                      │                      │
        ┌───────▼────────┐     ┌──────▼─────┐        ┌──────▼──────┐
        │ Web Browser    │     │ Slack      │        │ Mobile App  │
        │ (Vercel URL)   │     │ Workspace  │        │ (Future)    │
        └───────┬────────┘     └──────┬─────┘        └─────────────┘
                │                     │
                │                     │ OAuth
                │                     │ Requests
                └─────────┬───────────┘
                          │
           ┌──────────────▼──────────────┐
           │   VERCEL CDN GLOBAL         │
           │  resolveiq-frontend         │
           │  (Next.js Application)      │
           │                             │
           │  - Dashboard UI             │
           │  - Ticket Analysis Form     │
           │  - Draft Generation UI      │
           │  - Slack OAuth Flow         │
           └──────────────┬──────────────┘
                          │
                          │ API Calls
                          │ (HTTPS/REST)
                          │
           ┌──────────────▼──────────────┐
           │   RENDER CLOUD PLATFORM     │
           │  resolveiq-backend          │
           │  (Django + Gunicorn)        │
           │                             │
           │  ┌─────────────────────┐   │
           │  │  API Endpoints      │   │
           │  ├─────────────────────┤   │
           │  │ /api/tickets/       │   │
           │  │ /api/drafts/        │   │
           │  │ /api/slack/         │   │
           │  │ /api/dashboard/     │   │
           │  └─────────────────────┘   │
           │                             │
           │  ┌─────────────────────┐   │
           │  │  Database           │   │
           │  │  SQLite (Persistent)│   │
           │  └─────────────────────┘   │
           └──────────────┬──────────────┘
                          │
        ┌─────────────────┼─────────────────┬────────────────┐
        │                 │                 │                │
   ┌────▼──────┐   ┌─────▼──────┐   ┌─────▼──────┐   ┌────▼──────┐
   │  OpenAI   │   │ Pinecone   │   │  Slack     │   │ Jira/     │
   │  API      │   │  Vector DB │   │  API       │   │ Confluence│
   │           │   │            │   │            │   │           │
   │ GPT-4o    │   │ KB Docs    │   │ Transcripts│   │ Tickets   │
   │ Scoring   │   │ Search     │   │ Auth       │   │ Articles  │
   │ Drafting  │   │            │   │            │   │           │
   └───────────┘   └────────────┘   └────────────┘   └───────────┘
```

---

## 📊 Data Flow: Analyze Ticket

```
┌─────────────────────────────────────────────────────────┐
│ 1. User clicks "Analyze" on a ticket in Frontend        │
└────────────┬────────────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────────────┐
│ 2. Frontend sends POST /api/tickets/{id}/analyze/       │
│    with Jira ticket details                              │
└────────────┬────────────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────────────┐
│ 3. Backend receives request                              │
│    - Fetches ticket from Jira                            │
│    - Queries Pinecone for relevant KB articles           │
│    - Sends articles to OpenAI for scoring                │
└────────────┬────────────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────────────┐
│ 4. OpenAI GPT-4o-mini evaluates:                         │
│    - Relevance to ticket                                 │
│    - Actionability & completeness                        │
│    - Returns holistic 0-10 score per article             │
└────────────┬────────────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────────────┐
│ 5. Backend filters & ranks:                              │
│    - Only articles with score ≥ 4                        │
│    - Cap at 3 best matches                               │
│    - Post comment to Jira with results                   │
└────────────┬────────────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────────────┐
│ 6. Frontend displays:                                    │
│    - Article titles                                      │
│    - Relevance % (score/10 * 100)                        │
│    - Links to Confluence                                 │
│    - "Generate Draft" button for best match             │
└────────────┬────────────────────────────────────────────┘
             │
             ✅ Complete
```

---

## 📊 Data Flow: Generate Draft

```
┌─────────────────────────────────────────────────────────┐
│ 1. User clicks "Generate Draft" on matched article      │
└────────────┬────────────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────────────┐
│ 2. Frontend POST /api/tickets/{id}/generate-draft/      │
│    with ticket ID and selected article ID               │
└────────────┬────────────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────────────┐
│ 3. Backend attempts to fetch Slack transcript:          │
│    - Calls Slack API: conversations.list()              │
│    - Searches for channel containing ticket mention     │
│    - Fetches thread messages with conversations.info()  │
│    - Falls back to mock JSON if not found               │
└────────────┬────────────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────────────┐
│ 4. Backend sends to OpenAI GPT-4o:                       │
│    - Ticket context (title, description, status)        │
│    - Slack transcript (discussion & resolution)         │
│    - Existing KB article (if any)                       │
│    - Returns: Markdown-formatted KB article draft       │
└────────────┬────────────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────────────┐
│ 5. Backend publishes to Confluence:                      │
│    - Creates or updates page in space                    │
│    - Returns: Confluence URL                             │
│    - Posts Jira comment with draft link                  │
└────────────┬────────────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────────────┐
│ 6. Frontend displays success:                            │
│    - "Draft created" notification                        │
│    - Link to Confluence article                          │
│    - Option to share with team                           │
└────────────┬────────────────────────────────────────────┘
             │
             ✅ Complete
```

---

## 🔐 Security Architecture

```
┌─────────────────────────────────────────────────────────┐
│ HTTPS EVERYWHERE                                         │
│ All connections encrypted in transit (TLS 1.3)          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ API KEY MANAGEMENT                                       │
├─────────────────────────────────────────────────────────┤
│ ✓ Keys never in code (environment variables only)       │
│ ✓ Frontend doesn't access backend secrets               │
│ ✓ Backend keeps external API keys private               │
│ ✓ Slack OAuth uses secure callback flow                 │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ AUTHENTICATION FLOW                                      │
├─────────────────────────────────────────────────────────┤
│ 1. User clicks "Sign in with Slack"                     │
│ 2. Redirects to Slack OAuth URL                         │
│ 3. User approves scopes in Slack                        │
│ 4. Slack redirects back with auth code                  │
│ 5. Backend exchanges code for bot token (secure)        │
│ 6. User authenticated & token stored                    │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ CORS SECURITY                                            │
├─────────────────────────────────────────────────────────┤
│ ✓ Frontend domain whitelisted on backend                │
│ ✓ Backend accepts requests only from Vercel domain      │
│ ✓ Production URLs hardcoded (no wildcard access)        │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ DATABASE SECURITY                                        │
├─────────────────────────────────────────────────────────┤
│ ✓ SQLite file in persistent volume (Render)             │
│ ✓ Django ORM prevents SQL injection                     │
│ ✓ Passwords hashed with PBKDF2                          │
│ ✓ Sensitive data stored encrypted (future: at-rest)     │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 Deployment Pipeline

```
┌──────────────────────────────────────────────────────────┐
│ Developer Git Push to GitHub                              │
│ git push origin main                                      │
└──────────────┬───────────────────────────────────────────┘
               │
       ┌───────┴────────┐
       │                │
┌──────▼────────┐  ┌───▼──────────┐
│   Render      │  │   Vercel      │
│ Webhook       │  │ Webhook       │
│ Triggered     │  │ Triggered     │
└──────┬────────┘  └───┬──────────┘
       │                │
┌──────▼────────┐  ┌───▼──────────┐
│ Build Phase:  │  │ Build Phase: │
│ pip install   │  │ npm install  │
│ npm build     │  │ next build   │
│ migrations    │  │              │
└──────┬────────┘  └───┬──────────┘
       │                │
┌──────▼────────┐  ┌───▼──────────┐
│ Deploy        │  │ Deploy       │
│ Replace old   │  │ CDN push     │
│ instance      │  │ Global       │
└──────┬────────┘  └───┬──────────┘
       │                │
┌──────▼────────┐  ┌───▼──────────┐
│ Service       │  │ Live         │
│ Running       │  │ at           │
│ at .onrender. │  │ .vercel.app  │
│ com           │  │              │
└───────────────┘  └──────────────┘
```

---

## 📈 Scaling Strategy

### Current (Hobby/Dev)
```
┌────────────────────────────────────┐
│ Render - Free Tier                  │
│ - 1 web service instance            │
│ - Shared CPU                        │
│ - Sleeps after 15 min inactivity    │
│ - SQLite database                   │
│ Cost: $0/month                      │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│ Vercel - Free Tier                  │
│ - Global CDN                        │
│ - Unlimited deployments             │
│ - Serverless functions auto-scale   │
│ Cost: $0/month                      │
└────────────────────────────────────┘
```

### Production (Enterprise)
```
┌────────────────────────────────────┐
│ Render - Pro Tier ($12/mo)          │
│ - Persistent service (no sleep)     │
│ - Dedicated IP                      │
│ - PostgreSQL database (upgrade)     │
│ - Load balancing ready              │
│ Cost: $12-120/month                 │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│ Vercel - Pro Tier ($20/mo)          │
│ - Priority support                  │
│ - Advanced analytics                │
│ - Custom domains                    │
│ - Edge config                       │
│ Cost: $20-100/month                 │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│ Optional: Auto-Scaling              │
│ - Multiple Render dynos             │
│ - Load balancer                     │
│ - Read replicas (PostgreSQL)        │
│ - Redis caching layer               │
│ Cost: Custom (100-500/mo)           │
└────────────────────────────────────┘
```

---

## 🔍 Monitoring & Observability

### What to Monitor

| Metric | Where | Alert Threshold |
|--------|-------|-----------------|
| **API Response Time** | Render logs, Vercel analytics | > 2 seconds |
| **Error Rate** | Render logs, Sentry | > 5% of requests |
| **Database Size** | Render dashboard | > 100MB (SQLite) |
| **Cold Start** | Render events | First request after sleep |
| **Build Time** | Render/Vercel logs | > 5 minutes |
| **Memory Usage** | Render dashboard | > 80% of limit |

### Tools (Optional)
- **Sentry**: Error tracking
- **New Relic**: Performance monitoring
- **DataDog**: Infrastructure monitoring
- **LogRocket**: Frontend debugging

---

## 🚨 Disaster Recovery

### Backup Strategy

```
Daily Backups:
├── Download db.sqlite3 from Render
├── Store locally (Git history)
├── Keep 7 recent backups
└── Test recovery quarterly

Version Control:
├── All code in GitHub
├── Tags for each production deployment
├── Rollback available via git
└── 90-day history retained

Environment Backups:
├── Export Render env vars
├── Export Vercel env vars
├── Store in secure password manager
└── Update after each credential rotation
```

### Incident Response

```
If Backend Down:
1. Check Render dashboard status
2. View recent logs for errors
3. Restart service (auto on Render)
4. Rollback to previous version if needed
5. Notify team

If Frontend Down:
1. Check Vercel deployment status
2. Redeploy latest from main branch
3. Check for build errors
4. Verify backend connectivity
5. Notify team

If Database Corrupted:
1. Download latest backup
2. Restore to new SQLite file
3. Restart Render service
4. Verify data integrity
5. Increase backup frequency
```

---

## ✅ Deployment Checklist

- [ ] Code pushed to GitHub main branch
- [ ] Backend deployed to Render
- [ ] Frontend deployed to Vercel
- [ ] Environment variables configured on both platforms
- [ ] Slack OAuth redirect URLs configured
- [ ] CORS_ALLOWED_ORIGINS includes Vercel URL
- [ ] Database migrations ran successfully
- [ ] Static files collected on Render
- [ ] API health check passes
- [ ] Frontend loads without errors
- [ ] Slack integration verified
- [ ] Team notified of live URL
- [ ] Backups configured

---

**Your system is now production-ready! 🚀**
