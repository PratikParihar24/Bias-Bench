# Bias-Bench Architecture & Context Map

## Overview
Bias-Bench is a full-stack web application designed for AI bias forensics. It consists of a Next.js (React) frontend and a FastAPI (Python) backend.
- **Frontend**: Handles the UI, renders the dashboard, and polls the backend for AI audit results.
- **Backend**: Serves the API, connects to the database, orchestrates calls to various LLMs (Gemini, Llama, Gemma, etc.), and stores the results.

---

## 💻 Frontend Architecture (`/frontend`)
- **Framework**: Next.js (App Router), React, TailwindCSS
- **Key Files**:
  - `app/page.tsx`: The main dashboard page. This file contains the core logic for triggering audits and polling the backend for job status.
  - `components/`: Contains reusable UI pieces like `Sidebar`, `ModelColumn`, `VerdictPanel`, and `PromptBar`.
- **API Connection Logic**: 
  - The frontend connects to the backend using the environment variable `NEXT_PUBLIC_API_URL`.
  - If `NEXT_PUBLIC_API_URL` is not set (like in local development), it automatically defaults to `http://127.0.0.1:8000`.

---

## ⚙️ Backend Architecture (`/backend`)
- **Framework**: FastAPI, Uvicorn, SQLAlchemy
- **Key Files**:
  - `main.py`: The entry point for the FastAPI server. Contains the API routes (`/api/audit`, `/api/jobs/{job_id}`, `/api/history`) and handles CORS configuration allowing cross-origin requests.
  - `app/database.py`: Sets up the SQLAlchemy database engine. Automatically formats the connection string to use the modern `postgresql+psycopg://` driver.
  - `app/models.py`: Defines the database schema (e.g., `AuditRecord`).
  - `app/services/llm_factory.py`: Handles the orchestration and actual API calls to the different AI models.
  - `requirements.txt`: Python dependencies.

---

## 🚀 Environments & How They Talk To Each Other

### 1. Local Development Setup
- **Backend**: Runs on `http://127.0.0.1:8000`. 
  - **Start Command**: `cd backend` then `uvicorn main:app --reload`
- **Frontend**: Runs on `http://localhost:3000`. 
  - **Start Command**: `cd frontend` then `npm run dev`
- **How they connect**: The frontend automatically defaults to `http://127.0.0.1:8000` when running locally. **No extra configuration is needed.**

### 2. Production Setup (Vercel + Render)
- **Backend (Render)**: Deployed as a Web Service. The database connection is handled automatically via Render's `DATABASE_URL` environment variable.
- **Frontend (Vercel)**: Deployed as a Next.js web application. 
- **How they connect**: You **MUST** set the `NEXT_PUBLIC_API_URL` environment variable in your Vercel project settings to your live Render backend URL (e.g., `https://your-backend-app.onrender.com`). Otherwise, the Vercel app will try to call `http://127.0.0.1:8000` and fail.
