from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base
import employees, attendance

# Create table on start up
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="HRMS Lite API",
    description="A lightweight Human Resource Management System API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(employees.router, prefix="/api/v1")
app.include_router(attendance.router, prefix="/api/v1")

@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "message": "HRMS Lite API is running 🚀"}


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy"}