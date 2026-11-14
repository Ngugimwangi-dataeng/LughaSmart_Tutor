#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

if [ ! -d ".venv" ]; then
  echo "Creating Python virtual environment (.venv)..."
  python3 -m venv .venv
fi

source .venv/bin/activate
pip install --quiet --upgrade pip
pip install --quiet -r requirements.txt

if [ ! -f ".env" ]; then
  cp .env.example .env
  echo "Created .env from .env.example (using zero-config SQLite by default)."
fi

python manage.py makemigrations academy --noinput
python manage.py migrate --noinput
python manage.py seed_lughasmart

echo ""
echo "Starting LughaSmart on http://127.0.0.1:8000"
echo "  Tutor Login:   tutor   / LughaTutor2026!"
echo "  Student Login: student / LughaStudent2026!"
echo ""
python manage.py runserver 0.0.0.0:8000
