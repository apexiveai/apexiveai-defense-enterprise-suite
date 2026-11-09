
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, or_
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.personnel import Personnel
from app.schemas.personnel import PersonnelCreate, PersonnelResponse

router = APIRouter(
    prefix="/personnel",
    tags=["Personnel Administration"],
)


@router.post(
    "/",
    response_model=PersonnelResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_personnel(
    payload: PersonnelCreate,
    db: Session = Depends(get_db),
):
    existing = db.scalar(
        select(Personnel).where(
            Personnel.employee_code == payload.employee_code
        )
    )

    if existing:
        raise HTTPException(
            status_code=409,
            detail="Employee code already exists",
        )

    record = Personnel(**payload.model_dump())

    try:
        db.add(record)
        db.commit()
        db.refresh(record)
        return record
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Unable to create personnel record",
        )


@router.get("/", response_model=list[PersonnelResponse])
def list_personnel(
    search: str | None = Query(default=None, max_length=100),
    department: str | None = Query(default=None, max_length=100),
    db: Session = Depends(get_db),
):
    statement = select(Personnel)

    if search:
        term = f"%{search.strip()}%"
        statement = statement.where(
            or_(
                Personnel.employee_code.ilike(term),
                Personnel.full_name.ilike(term),
                Personnel.department.ilike(term),
                Personnel.job_title.ilike(term),
            )
        )

    if department and department != "All":
        statement = statement.where(
            Personnel.department == department
        )

    statement = statement.order_by(Personnel.id.desc())

    return db.scalars(statement).all()


@router.get("/{personnel_id}", response_model=PersonnelResponse)
def get_personnel(
    personnel_id: int,
    db: Session = Depends(get_db),
):
    record = db.get(Personnel, personnel_id)

    if not record:
        raise HTTPException(
            status_code=404,
            detail="Personnel record not found",
        )

    return record
