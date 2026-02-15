from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.experience import Experience
from app.models.user import User
from app.schemas.experience import ExperienceCreate, ExperienceResponse

router = APIRouter()


@router.get("", response_model=list[ExperienceResponse])
async def list_experiences(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Experience)
        .where(Experience.user_id == current_user.id)
        .order_by(Experience.start_date.desc())
    )
    experiences = result.scalars().all()
    return experiences


@router.post("", response_model=ExperienceResponse, status_code=status.HTTP_201_CREATED)
async def create_experience(
    experience_in: ExperienceCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    experience = Experience(
        user_id=current_user.id,
        company=experience_in.company,
        role=experience_in.role,
        start_date=experience_in.start_date,
        end_date=experience_in.end_date,
        description=experience_in.description,
    )
    db.add(experience)
    await db.flush()
    await db.refresh(experience)
    return experience
