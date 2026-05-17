# ResolveIQ Project

**ResolveIQ** is an AI-powered IT incident resolution platform that ensures your engineering teams never solve the same problem twice. By seamlessly integrating with Slack, Jira, and Confluence, ResolveIQ automatically analyzes production outages, surfaces relevant knowledge base articles in real-time, and generates new documentation drafts directly from incident chat threads.

### 🎥 See ResolveIQ in Action


https://github.com/user-attachments/assets/5b65fc43-7944-4ff3-be8d-56573357af6e



---

Monorepo containing the ResolveIQ frontend (Next.js) and backend (Django/DRF).

## 📁 Structure

```
ResolveIQ_Project/
  frontend/               # Next.js app
  backend/                # Django + DRF API
```

## 🚀 Quick Start (Local Development)

### Prerequisites

- Node.js 18+
- Python 3.9+

### Clone & Setup

```bash
git clone git@github.com:vedant1711/ResolveIQ_Project.git
cd ResolveIQ_Project
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local
```

Fill in the required credentials in `backend/.env` (OpenAI, Pinecone, Jira/Confluence, Slack).

### Backend (Django)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Backend runs at: **http://localhost:8000**

### Frontend (Next.js)

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: **http://localhost:3000**

## 🌐 Production Deployment

ResolveIQ is optimized for production deployment on:
- **Backend**: Render (https://render.com)
- **Frontend**: Vercel (https://vercel.com)

Deployment steps are described below in this README.

## 📋 Environment Variables

### Backend (backend/.env)

```
# Django
DEBUG=False                                    # Set to False in production
SECRET_KEY=your-secret-key-here               # Generate strong key
ALLOWED_HOSTS=localhost,127.0.0.1             # Add deployed domains

# OpenAI
OPENAI_API_KEY=sk-...

# Pinecone Vector DB
PINECONE_API_KEY=...
PINECONE_INDEX_NAME=resolveiqdocs
PINECONE_NAMESPACE=confluence-docs

# Atlassian (Jira + Confluence)
ATLASSIAN_BASE_URL=https://yourinstance.atlassian.net
ATLASSIAN_EMAIL=your-email@company.com
ATLASSIAN_API_TOKEN=...
CONFLUENCE_SPACE_KEY=MSKB
JIRA_PROJECT_KEY=IT

# Slack (Bot token setup)
SLACK_BOT_TOKEN=xoxb-...
SLACK_CHANNEL_ID=C0123456789

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://resolveiq-frontend.vercel.app
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🤖 Slack Bot Token Setup (No OAuth)

Follow these steps to get a bot token and channel ID for reading Slack threads:

1. Go to https://api.slack.com/apps → **Create New App** → **From scratch**.
2. Choose a name (e.g., ResolveIQ) and your workspace.
3. In **OAuth & Permissions**, add **Bot Token Scopes**:
  - `channels:history`
  - `groups:history`
  - `users:read`
4. Click **Install to Workspace** and allow access.
5. Copy the **Bot User OAuth Token** (`xoxb-...`).
6. Get the channel ID:
  - Open the channel in Slack → click the channel name → **Copy channel ID**.
7. Set env vars in `backend/.env`:

```
SLACK_BOT_TOKEN=xoxb-...
SLACK_CHANNEL_ID=C0123456789
```

If the channel is private, invite the bot to the channel: `/invite @ResolveIQ`.

## ⚙️ Features

✅ **AI-Powered Ticket Analysis**
- OpenAI GPT scoring with 10-level holistic rubric
- Automatically matches KB articles to support tickets

✅ **Knowledge Base Integration**
- Retrieves Confluence articles via Pinecone vector search
- Displays matched articles with relevance scores

✅ **Draft Generation**
- Creates KB drafts from Slack thread transcripts
- Publishes directly to Confluence

✅ **Slack Integration**
- Bot token based Slack API access
- Thread transcript fetching

✅ **Modern UI**
- Dark mode with Tailwind CSS
- Responsive design with shadcn/ui components
- Real-time analysis feedback

## 🔧 Technology Stack

**Backend:**
- Django 4.2+ with DRF
- OpenAI GPT-4o (scoring & drafts)
- Pinecone (vector database)
- Slack Bolt SDK
- Jira & Confluence APIs

**Frontend:**
- Next.js 16.2+ with TypeScript
- React 19.2+
- Tailwind CSS 4
- shadcn/ui components

## 📖 API Documentation

### Analyze Ticket

```bash
POST /api/tickets/{ticket_id}/analyze/
```

Response:
```json
{
  "status": "success",
  "score": 8,
  "matched_articles": [
    {
      "title": "How to Reset Password",
      "url": "https://confluence.../wiki/spaces/MSKB/pages/...",
      "relevance": 92
    }
  ]
}
```

### Generate Draft

```bash
POST /api/tickets/{ticket_id}/generate-draft/
```

Fetches Slack transcript and generates KB article.

## 🐛 Troubleshooting

### Backend Issues

- **502 Bad Gateway (Render)**:
  - Check logs: Dashboard → Services → Logs
  - Verify migrations ran: `python manage.py migrate --noinput`
  - Restart service on Render

- **CORS errors**:
  - Verify `CORS_ALLOWED_ORIGINS` in `backend/.env`
  - Add frontend URL to Render environment

### Frontend Issues

- **Turbopack errors**:
  ```bash
  npm run dev -- --no-turbo
  ```

- **API connection issues**:
  - Verify `NEXT_PUBLIC_API_URL` in `.env.local`
  - Check network tab in browser DevTools
  - Ensure backend is running/deployed

### Slack Integration

- **OAuth not working**:
  - Verify redirect URLs in Slack App settings
  - Check bot token is valid
  - Ensure scopes are configured

## 📚 Guides

- **Local Development**: See Backend/Frontend sections above
- **Production Deployment**: Read [`DEPLOYMENT_CHECKLIST.md`](DEPLOYMENT_CHECKLIST.md)
- **Detailed Deployment Info**: Read [`DEPLOYMENT.md`](DEPLOYMENT.md)
- **Slack Setup**: See Part 5 in `DEPLOYMENT_CHECKLIST.md`

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes and test locally
3. Push and create a pull request

## 📄 License

Proprietary - ResolveIQ 2026

---

**Questions?** Check the deployment guides or open an issue on GitHub.

npm install
npm run dev
```

Default: http://localhost:3000

## Notes

- If Next.js fails with Turbopack errors, run `npm run dev -- --no-turbo`.
- Jira/Confluence/OpenAI/Pinecone/Slack require valid credentials in `backend/.env`.
- For local dev, keep both apps running to enable dashboard API calls.
