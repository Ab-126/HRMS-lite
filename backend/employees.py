from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db
from schema import EmployeeCreate, SuccessResponse, EmployeeResponse, EmployeeListResponse
from models import Employee, Attendance, AttendanceStatus

router = APIRouter(prefix="/employees", tags=["Employees"])

@router.post("/")
def create_employee(payload: EmployeeCreate, db: Session = Depends(get_db)):
    # Check duplicate employee_id
    if db.query(Employee).filter(Employee.employee_id == payload.employee_id).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Employee with ID '{payload.employee_id}' already exists.",
        )
    
    # Check duplicate email
    if db.query(Employee).filter(Employee.email == payload.email).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Employee with email '{payload.email}' already exists.",
        )

    employee = Employee(**payload.model_dump())
    db.add(employee)
    db.commit()
    db.refresh(employee)

    response = EmployeeResponse.model_validate(employee)
    response.total_present_days = 0
    return response


@router.get("/")
def list_employees(db: Session = Depends(get_db)):
    employees = db.query(Employee).order_by(Employee.created_at.desc()).all()
    
    result = []
    for emp in employees:
        present_days = (
            db.query(func.count(Attendance.id))
            .filter(
                Attendance.employee_id == emp.employee_id,
                Attendance.status == AttendanceStatus.present,
            )
            .scalar()
        )
        emp_res = EmployeeResponse.model_validate(emp)
        emp_res.total_present_days = present_days
        result.append(emp_res)
    
    return EmployeeListResponse(employees=result, total=len(result))



@router.get("/{employee_id}")
def get_employee(employee_id: str, db: Session = Depends(get_db)):
    employee = db.query(Employee).filter(Employee.employee_id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail=f"Employee '{employee_id}' not found.")
    
    present_days = (
        db.query(func.count(Attendance.id))
        .filter(
            Attendance.employee_id == employee_id,
            Attendance.status == AttendanceStatus.present
        ).scalar()
    )

    emp_res = EmployeeResponse.model_validate(employee)
    emp_res.total_present_days = present_days
    return emp_res


@router.delete("/{employee_id}")
def delete_employee(employee_id: str, db: Session = Depends(get_db)):
    employee = db.query(Employee).filter(Employee.employee_id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail=f"Employee '{employee_id}' not found.")
    
    db.delete(employee)
    db.commit()
    return SuccessResponse(message=f"Employee '{employee_id}' deleted successfully.")