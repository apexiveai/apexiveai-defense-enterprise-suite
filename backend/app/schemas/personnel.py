
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class PersonnelCreate(BaseModel):
    employee_code: str = Field(min_length=2, max_length=50)
    full_name: str = Field(min_length=2, max_length=150)
    department: str = Field(min_length=2, max_length=100)
    job_title: str = Field(min_length=2, max_length=100)


class PersonnelResponse(BaseModel):
    id: int
    employee_code: str
    full_name: str
    department: str
    job_title: str
    employment_status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
