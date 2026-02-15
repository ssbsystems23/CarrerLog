from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.certification import Certification
from app.models.experience import Experience
from app.models.problem import Problem
from app.models.user import User
from app.schemas.dashboard import DashboardStats

router = APIRouter()


@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Total problems
    problems_result = await db.execute(
        select(func.count()).select_from(Problem).where(
            Problem.user_id == current_user.id
        )
    )
    total_problems = problems_result.scalar()

    # Total experiences
    experiences_result = await db.execute(
        select(func.count()).select_from(Experience).where(
            Experience.user_id == current_user.id
        )
    )
    total_experiences = experiences_result.scalar()

    # Total certifications
    certifications_result = await db.execute(
        select(func.count()).select_from(Certification).where(
            Certification.user_id == current_user.id
        )
    )
    total_certifications = certifications_result.scalar()

    # Problems by difficulty
    difficulty_result = await db.execute(
        select(Problem.difficulty, func.count())
        .where(Problem.user_id == current_user.id)
        .group_by(Problem.difficulty)
    )
    problems_by_difficulty = {row[0]: row[1] for row in difficulty_result.all()}

    # Recent 5 problems
    recent_result = await db.execute(
        select(Problem)
        .where(Problem.user_id == current_user.id)
        .order_by(Problem.created_at.desc())
        .limit(5)
    )
    recent_problems = recent_result.scalars().all()

    return DashboardStats(
        total_problems=total_problems,
        total_experiences=total_experiences,
        total_certifications=total_certifications,
        problems_by_difficulty=problems_by_difficulty,
        recent_problems=recent_problems,
    )
