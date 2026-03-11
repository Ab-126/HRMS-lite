from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from datetime import date
import uuid

from database import get_db
from schema import AttendanceCreate, SuccessResponse, AttendanceListResponse, AttendanceStatus, AttendanceResponse
from models import Attendance, Employee

router = APIRouter(prefix="/attendance", tags=["Attendance"])

@router.post("/")
def mark_attendance(payload: AttendanceCreate, db: Session = Depends(get_db)):
    # Step 1 - Verify employee exists
    employee = db.query(Employee).filter(Employee.employee_id == payload.employee_id).first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee '{payload.employee_id}' not found.",
        )

    # Step 2 - Prevent duplicate attendance for same employee + date
    existing = (
        db.query(Attendance)
        .filter(
            Attendance.employee_id == payload.employee_id,
            Attendance.date == payload.date,
        )
        .first()
    )
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Attendance for employee '{payload.employee_id}' on {payload.date} is already marked as '{existing.status.value}'.",
        )

    # Step 3 - If not exist then add it to db
    record = Attendance(
        id=str(uuid.uuid4()),
        employee_id=payload.employee_id,
        date=payload.date,
        status=payload.status,
    )

    db.add(record)
    db.commit()
    db.refresh(record)

    response = AttendanceResponse.model_validate(record)
    response.employee_name = employee.full_name
    return response


@router.get("/")
def list_attendance(
    employee_id: Optional[str] = Query(None, description="Filter by employee ID"),
    date_filter: Optional[date] = Query(None, alias="date", description="Filter by specific date"),
    db: Session = Depends(get_db),
):
    query = db.query(Attendance)

    if employee_id:
        # Verify employee exists
        employee = db.query(Employee).filter(Employee.employee_id == employee_id).first()
        if not employee:
            raise HTTPException(status_code=404, detail=f"Employee '{employee_id}' not found.")
        query = query.filter(Attendance.employee_id == employee_id)

    if date_filter:
        query = query.filter(Attendance.date == date_filter)

    records = query.order_by(Attendance.date.desc()).all()

    # Enrich with employee names
    result = []
    for rec in records:
        r = AttendanceResponse.model_validate(rec)
        r.employee_name = rec.employee.full_name if rec.employee else None
        result.append(r)

    total_present = sum(1 for r in result if r.status == AttendanceStatus.present)
    total_absent = sum(1 for r in result if r.status == AttendanceStatus.absent)

    return AttendanceListResponse(
        records=result,
        total=len(result),
        total_present=total_present,
        total_absent=total_absent,
    )

@router.get("/employee/{employee_id}")
def get_employee_attendance(
    employee_id: str, 
    date_filter: Optional[date] = Query(None, alias="date", description="Filter by specific date"),
    db: Session = Depends(get_db),
):
    employee = db.query(Employee).filter(Employee.employee_id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail=f"Employee '{employee_id}' not found.")

    query = db.query(Attendance).filter(Attendance.employee_id == employee_id)
    if date_filter:
        query = query.filter(Attendance.date == date_filter)

    records = query.order_by(Attendance.date.desc()).all()

    result = []
    for rec in records:
        r = AttendanceResponse.model_validate(rec)
        r.employee_name = employee.full_name
        result.append(r)

    total_present = sum(1 for r in result if r.status == AttendanceStatus.present)
    total_absent = sum(1 for r in result if r.status == AttendanceStatus.absent)

    return AttendanceListResponse(
        records=result,
        total=len(result),
        total_present=total_present,
        total_absent=total_absent,
    )


@router.delete("/employee/{attendance_id}")
def delete_attendance(attendance_id: str, db: Session = Depends(get_db)):
    record = db.query(Attendance).filter(Attendance.id == attendance_id).first()
    if not record:
        raise HTTPException(status_code=404, detail=f"Attendance record '{attendance_id}' not found.")

    db.delete(record)
    db.commit()
    return SuccessResponse(message="Attendance record deleted successfully.")