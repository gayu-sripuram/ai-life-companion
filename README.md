# AI Life Companion - Phase 1 MVP

This is a beginner-friendly full-stack app built with:

- React + Vite frontend
- FastAPI backend
- SQLite database
- OpenAI API for journal analysis

## Features

- Email/password signup and login
- JWT authentication
- Journal entries
- Daily mood tracking
- Habit tracking with streaks
- AI summary and sentiment for journal text

## Folder Structure

```text
backend/
  models/
  routes/
  schemas/
  services/
  main.py
frontend/
  src/
```

## Backend Setup

1. Open a terminal in [backend](./backend)
2. Create a virtual environment:

```powershell
python -m venv venv
```

3. Activate it:

```powershell
.\venv\Scripts\Activate.ps1
```

4. Install dependencies:

```powershell
pip install -r requirements.txt
```

5. Create a `.env` file in `backend/` using [backend/.env.example](./backend/.env.example):

```env
OPENAI_API_KEY=your_key_here
SECRET_KEY=your_secret_here
CORS_ORIGINS=http://localhost:5173
DATABASE_URL=sqlite:///./life_companion.db
```

6. Start the backend locally:

```powershell
uvicorn main:app --host 0.0.0.0 --port 10000
```

Beginner note:

- SQLite creates `life_companion.db` automatically.
- The FastAPI app creates the tables automatically on startup.

## Frontend Setup

1. Open a second terminal in [frontend](./frontend)
2. Install packages:

```powershell
npm install
```

3. Create a `.env` file in `frontend/` using [frontend/.env.example](./frontend/.env.example):

```env
VITE_API_BASE_URL=http://localhost:10000
```

4. Start the frontend:

```powershell
npm run dev
```

5. Open the URL shown by Vite, usually `http://localhost:5173`

## API Overview

- `POST /auth/signup`
- `POST /auth/login`
- `POST /journal/`
- `GET /journal/`
- `POST /moods/`
- `GET /moods/`
- `POST /habits/`
- `GET /habits/`
- `POST /habits/{habit_id}/toggle`
- `POST /ai/analyze-journal`

Example AI response:

```json
{
  "summary": "You handled a stressful day with resilience and reflection.",
  "sentiment": "neutral"
}
```

## Render Backend Deployment

1. Push the project to GitHub.
2. In Render, click `New +` and choose `Web Service`.
3. Connect your GitHub repository.
4. Configure the backend service:
   - Root Directory: `backend`
   - Environment: `Python 3`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add these environment variables in Render:
   - `OPENAI_API_KEY=your_key_here`
   - `SECRET_KEY=your_secret_here`
   - `CORS_ORIGINS=https://your-frontend-url.onrender.com`
   - `DATABASE_URL=sqlite:///./life_companion.db`
6. Click deploy.

Important note:

- Render provides a dynamic port through the `PORT` environment variable, so the start command must use `$PORT`.
- SQLite is fine for this MVP, but free hosting can reset local files during restarts or redeploys. That is okay for learning and demos, but later you should move to PostgreSQL for persistent production data.

## Frontend Deployment

You can host the frontend for free on Render Static Sites, Vercel, or Netlify.

If you use Render Static Sites:

1. Click `New +` and choose `Static Site`
2. Connect the same repository
3. Configure:
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
4. Add this environment variable:
   - `VITE_API_BASE_URL=https://your-backend-name.onrender.com`
5. Deploy

## Beginner Tips

- If you get a CORS error, check that `CORS_ORIGINS` exactly matches your frontend URL.
- If OpenAI analysis fails, the journal entry still saves.
- This MVP stores the JWT token in `localStorage` for simplicity.
