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

## Frontend (Next.js)

```zsh
cd frontend
npm install
npm run dev
```

Default: http://localhost:3000

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

## Environment

Backend uses `backend/.env`. Frontend can use `frontend/.env.local`.

## Notes

- Jira/Confluence/OpenAI/Pinecone/Slack require valid credentials in `backend/.env`.
- For local dev, keep both apps running to enable dashboard API calls.
