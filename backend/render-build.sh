#!/bin/bash
# Render Build Script
# This script runs migrations and collects static files before starting the server

set -e  # Exit on error

echo "Running Django migrations..."
python manage.py migrate --noinput

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Build complete!"
