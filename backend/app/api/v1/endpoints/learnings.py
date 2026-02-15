from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.learning import Learning
from app.models.user import User
from app.schemas.learning import (
    LearningCreate,
    LearningListResponse,
    LearningResponse,
)

router = APIRouter()


@router.get("", response_model=LearningListResponse)
async def list_learnings(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    search: str | None = Query(None),
    tag: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = select(Learning).where(Learning.user_id == current_user.id)
    count_query = select(func.count()).select_from(Learning).where(
        Learning.user_id == current_user.id
    )

    if search:
        query = query.where(Learning.topic.ilike(f"%{search}%"))
        count_query = count_query.where(Learning.topic.ilike(f"%{search}%"))

    if tag:
        query = query.where(Learning.tags.cast(str).ilike(f'%"{tag}"%'))
        count_query = count_query.where(Learning.tags.cast(str).ilike(f'%"{tag}"%'))

    total_result = await db.execute(count_query)
    total = total_result.scalar()

    offset = (page - 1) * size
    query = query.order_by(Learning.learned_date.desc(), Learning.created_at.desc()).offset(offset).limit(size)

    result = await db.execute(query)
    learnings = result.scalars().all()

    return LearningListResponse(
        items=learnings,
        total=total,
        page=page,
        size=size,
    )


@router.post("", response_model=LearningResponse, status_code=status.HTTP_201_CREATED)
async def create_learning(
    learning_in: LearningCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    learning = Learning(
        user_id=current_user.id,
        topic=learning_in.topic,
        learned_date=learning_in.learned_date,
        tags=learning_in.tags,
    )
    db.add(learning)
    await db.flush()
    await db.refresh(learning)
    return learning


@router.delete("/{learning_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_learning(
    learning_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Learning).where(
            Learning.id == learning_id, Learning.user_id == current_user.id
        )
    )
    learning = result.scalar_one_or_none()
    if not learning:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Learning not found"
        )

    await db.delete(learning)
    await db.flush()
