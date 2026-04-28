# ResolveIQ Project

Monorepo containing the ResolveIQ frontend (Next.js) and backend (Django/DRF).

## Structure

```
ResolveIQ_Project/
  frontend/     # Next.js app
  backend/      # Django + DRF API
```

## Prerequisites

- Node.js 18+
- Python 3.9+

## Clone & Setup

```zsh
git clone git@github.com:vedant1711/ResolveIQ_Project.git
cd ResolveIQ_Project
```

## Environment Variables

```zsh
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local
```

Fill in the required values in `backend/.env` (OpenAI, Pinecone, Jira/Confluence, Slack).

## Backend (Django)

```zsh
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Default: http://localhost:8000

## Frontend (Next.js)

```zsh
cd frontend
npm install
npm run dev
```

Default: http://localhost:3000

## Notes

- If Next.js fails with Turbopack errors, run `npm run dev -- --no-turbo`.
- Jira/Confluence/OpenAI/Pinecone/Slack require valid credentials in `backend/.env`.
- For local dev, keep both apps running to enable dashboard API calls.
