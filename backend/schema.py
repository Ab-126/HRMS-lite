from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List
from datetime import date, datetime
from enum import Enum

class AttendanceStatus(str, Enum):
    present = "Present"
    absent = "Absent"

class EmployeeCreate(BaseModel):
    employee_id: str
    full_name: str
    email: EmailStr
    department: str

    @field_validator("employee_id", "full_name", "department")
    @classmethod
    def not_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Field cannot be empty or whitespace")
        return v.strip()

    @field_validator("full_name")
    @classmethod
    def name_length(cls, v: str) -> str:
        if len(v) < 2:
            raise ValueError("Full name must be at least 2 characters")
        return v
    
class EmployeeResponse(BaseModel):
    employee_id: str
    full_name: str
    email: str
    department: str
    created_at: datetime
    total_present_days: Optional[int] = 0

    class Config:
        from_attributes = True

class EmployeeListResponse(BaseModel):
    employees: List[EmployeeResponse]
    total: int

class AttendanceCreate(BaseModel):
    employee_id: str
    date: date
    status: AttendanceStatus

    @field_validator("employee_id")
    @classmethod
    def not_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("employee_id cannot be empty")
        return v.strip()

class AttendanceResponse(BaseModel):
    id: str
    employee_id: str
    date: date
    status: AttendanceStatus
    created_at: datetime
    employee_name: Optional[str] = None

    class Config:
        from_attributes = True

class AttendanceListResponse(BaseModel):
    records: List[AttendanceResponse]
    total: int
    total_present: int
    total_absent: int

class ErrorResponse(BaseModel):
    detail: str

class SuccessResponse(BaseModel):
    message: str