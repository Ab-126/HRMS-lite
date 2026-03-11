# HRMS Lite

A lightweight Human Resource Management System built with FastAPI and React. Allows an admin to manage employee records and track daily attendance.

---

## Live Demo

| Service  | URL |
|----------|-----|
| Frontend | https://hrms-lite-1qmt8168z-geekisaprogrammergmailcoms-projects.vercel.app |
| Backend API | https://hrms-lite-4mvs.onrender.com |
| API Docs | https://hrms-lite-4mvs.onrender.com/docs |

---

## Tech Stack

### Backend
- **FastAPI** — REST API framework
- **SQLAlchemy** — ORM
- **Supabase (PostgreSQL)** — hosted database
- **Pydantic v2** — request/response validation
- **Uvicorn** — ASGI server

### Frontend
- **React 18** — UI framework
- **React Router v6** — client-side routing
- **Tailwind CSS v3** — styling
- **Axios** — HTTP client

### Deployment
- **Render** — backend hosting
- **Vercel** — frontend hosting
- **Supabase** — managed PostgreSQL database

---

## Project Structure

```
hrms/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app, CORS, router registration
│   │   ├── database.py      # SQLAlchemy engine and session
│   │   ├── models.py        # Employee and Attendance ORM models
│   │   ├── schemas.py       # Pydantic schemas for validation
│   │   └── routers/
│   │       ├── employees.py # Employee CRUD endpoints
│   │       └── attendance.py# Attendance endpoints
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/             # Axios client and service modules
│   │   ├── components/      # Reusable UI components
│   │   ├── hooks/           # useToast context hook
│   │   ├── pages/           # Dashboard, Employees, Attendance
│   │   ├── App.jsx
│   │   └── index.js
│   ├── package.json
│   └── .env.example
│
├── .gitignore
└── README.md
```

---

## Features

- **Employee Management** — add, view, search, and delete employees
- **Attendance Tracking** — mark Present / Absent per employee per day
- **Dashboard** — summary stats, department breakdown, recent employees
- **Filters** — filter attendance by employee and date
- **Validations** — duplicate employee ID / email detection, required fields, valid email format
- **Error handling** — meaningful error messages and HTTP status codes throughout

---

## Running Locally

### Prerequisites
- Python 3.10+
- Node.js 18+
- A Supabase project (free tier works)

---

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/hrms.git
cd hrms
```

---

### 2. Backend setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
Create a .env file
```

Your `.env` should look like:
```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres
```

```bash
# Start the server
uvicorn main:app --reload --port 8000
```

Backend runs at: http://localhost:8000
Swagger UI at: http://localhost:8000/docs

---

### 3. Frontend setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Open .env and set the backend URL
```

Your `.env` should look like:
```env
VITE_API_URL =http://localhost:8000/api/v1
```

```bash
# Start the dev server
npm run dev
```

Frontend runs at: http://localhost:3000

---

## API Reference

### Employees

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/employees/` | List all employees |
| `POST` | `/api/v1/employees/` | Create a new employee |
| `GET` | `/api/v1/employees/{id}` | Get a single employee |
| `DELETE` | `/api/v1/employees/{id}` | Delete an employee |

**Create Employee — Request Body**
```json
{
  "employee_id": "EMP001",
  "full_name": "John Doe",
  "email": "john@company.com",
  "department": "Engineering"
}
```

---

### Attendance

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/attendance/` | List all records (filterable) |
| `POST` | `/api/v1/attendance/` | Mark attendance |
| `GET` | `/api/v1/attendance/employee/{id}` | Get attendance for one employee |
| `DELETE` | `/api/v1/attendance/{id}` | Delete a record |

**Query Parameters for GET `/attendance/`**
- `?employee_id=EMP001` — filter by employee
- `?date=2024-01-15` — filter by date

**Mark Attendance — Request Body**
```json
{
  "employee_id": "EMP001",
  "date": "2024-01-15",
  "status": "Present"
}
```

---

## Deployment

### Backend — Render

| Setting | Value |
|---------|-------|
| Root Directory | `backend` |
| Runtime | Python 3 |
| Build Command | `pip install -r requirements.txt` |
| Start Command | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |

**Environment Variables on Render:**
```
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres
ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

---

### Frontend — Vercel

| Setting | Value |
|---------|-------|
| Root Directory | `frontend` |
| Framework | Create React App |
| Build Command | `npm run build` |
| Output Directory | `build` |

**Environment Variables on Vercel:**
```
VITE_API_URL =https://your-backend.onrender.com/api/v1
```

---

## Assumptions & Limitations

- Single admin user — no authentication or role management
- No leave management or payroll features (out of scope)
- Attendance can only be marked once per employee per day
- Deleting an employee also deletes all their attendance records
- Render free tier sleeps after 15 min of inactivity — first request may take ~30s to wake up