# Render Build & Deploy Configuration
# Deploy Django backend on Render

builders:
  - python
# dependencies for Django + production
pip:
  - Django>=4.2,<5
  - djangorestframework>=3.14,<4
  - django-cors-headers>=4,<5
  - openai>=1.30
  - pinecone>=4.1
  - python-dotenv>=1.0
  - requests>=2.32
  - gunicorn>=21.2
  - whitenoise>=6.6
  - slack-bolt>=1.18

build-command: |
  pip install -r requirements.txt
  python manage.py collectstatic --noinput
  python manage.py migrate --noinput

start-command: gunicorn resolveiq.wsgi:application --bind 0.0.0.0:$PORT
