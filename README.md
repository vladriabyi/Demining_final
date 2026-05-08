# 💣 Demining System — Дипломна робота

Інформаційна система управління заявками на гуманітарне розмінування.

## Технічний стек

| Шар | Технологія |
|-----|-----------|
| Backend | Python 3.11, FastAPI, SQLAlchemy 2.0 async, PostgreSQL, Alembic |
| Auth | JWT (python-jose), bcrypt (passlib) |
| Frontend | React 18, TypeScript, Tailwind CSS, Vite |
| Карта | React-Leaflet + OpenStreetMap |
| Графіки | Recharts |
| Deploy | Docker + Docker Compose |

## Запуск через Docker (рекомендовано)

```bash
docker-compose up --build
```

- Frontend: http://localhost:5173  
- Backend API: http://localhost:8000  
- Swagger docs: http://localhost:8000/docs

## Локальний запуск

### Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# Запустити PostgreSQL:
docker run -d --name pg \
  -e POSTGRES_USER=demining -e POSTGRES_PASSWORD=demining_pass \
  -e POSTGRES_DB=demining_db -p 5432:5432 postgres:15-alpine

alembic upgrade head
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend && npm install && npm run dev
```

## Ролі та права

| Дія | Civilian | Operator | Coordinator | Admin |
|-----|----------|----------|-------------|-------|
| Переглядати карту | ✅ | ✅ | ✅ | ✅ |
| Створювати заявку | ✅ | ✅ | ✅ | ✅ |
| Бачити всі заявки | ❌ | ✅ | ✅ | ✅ |
| Змінювати статус | ❌ | ❌ | ✅ | ✅ |
| Призначати оператора | ❌ | ❌ | ✅ | ✅ |
| Управляти територіями | ❌ | ❌ | ✅ | ✅ |
| Адмін-панель | ❌ | ❌ | ✅ | ✅ |
