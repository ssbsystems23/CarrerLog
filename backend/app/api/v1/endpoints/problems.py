from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.problem import Problem
from app.models.user import User
from app.schemas.problem import (
    ProblemCreate,
    ProblemListResponse,
    ProblemResponse,
    ProblemUpdate,
)

router = APIRouter()


@router.get("", response_model=ProblemListResponse)
async def list_problems(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    difficulty: str | None = Query(None),
    search: str | None = Query(None),
    tag: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = select(Problem).where(Problem.user_id == current_user.id)
    count_query = select(func.count()).select_from(Problem).where(
        Problem.user_id == current_user.id
    )

    if difficulty:
        query = query.where(Problem.difficulty == difficulty)
        count_query = count_query.where(Problem.difficulty == difficulty)

    if search:
        query = query.where(Problem.title.ilike(f"%{search}%"))
        count_query = count_query.where(Problem.title.ilike(f"%{search}%"))

    if tag:
        # For JSON array stored as text in SQLite, use LIKE to search for tag
        query = query.where(Problem.tags.cast(str).ilike(f'%"{tag}"%'))
        count_query = count_query.where(Problem.tags.cast(str).ilike(f'%"{tag}"%'))

    # Get total count
    total_result = await db.execute(count_query)
    total = total_result.scalar()

    # Apply pagination
    offset = (page - 1) * size
    query = query.order_by(Problem.created_at.desc()).offset(offset).limit(size)

    result = await db.execute(query)
    problems = result.scalars().all()

    return ProblemListResponse(
        items=problems,
        total=total,
        page=page,
        size=size,
    )


@router.post("", response_model=ProblemResponse, status_code=status.HTTP_201_CREATED)
async def create_problem(
    problem_in: ProblemCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    problem = Problem(
        user_id=current_user.id,
        title=problem_in.title,
        company_context=problem_in.company_context,
        difficulty=problem_in.difficulty,
        situation=problem_in.situation,
        task=problem_in.task,
        action=problem_in.action,
        result=problem_in.result,
        tags=problem_in.tags,
        solved_at=problem_in.solved_at,
    )
    db.add(problem)
    await db.flush()
    await db.refresh(problem)
    return problem


@router.get("/{problem_id}", response_model=ProblemResponse)
async def get_problem(
    problem_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Problem).where(
            Problem.id == problem_id, Problem.user_id == current_user.id
        )
    )
    problem = result.scalar_one_or_none()
    if not problem:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Problem not found"
        )
    return problem


@router.put("/{problem_id}", response_model=ProblemResponse)
async def update_problem(
    problem_id: str,
    problem_in: ProblemUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Problem).where(
            Problem.id == problem_id, Problem.user_id == current_user.id
        )
    )
    problem = result.scalar_one_or_none()
    if not problem:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Problem not found"
        )

    update_data = problem_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(problem, field, value)

    await db.flush()
    await db.refresh(problem)
    return problem


@router.delete("/{problem_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_problem(
    problem_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Problem).where(
            Problem.id == problem_id, Problem.user_id == current_user.id
        )
    )
    problem = result.scalar_one_or_none()
    if not problem:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Problem not found"
        )

    await db.delete(problem)
    await db.flush()
