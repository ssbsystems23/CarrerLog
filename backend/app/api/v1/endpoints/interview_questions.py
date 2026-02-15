from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.interview_question import InterviewQuestion
from app.models.user import User
from app.schemas.interview_question import (
    InterviewQuestionCreate,
    InterviewQuestionResponse,
)

router = APIRouter()


@router.get("", response_model=list[InterviewQuestionResponse])
async def list_interview_questions(
    company: str | None = Query(None),
    date_from: str | None = Query(None),
    date_to: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = select(InterviewQuestion).where(
        InterviewQuestion.user_id == current_user.id
    )

    if company:
        query = query.where(InterviewQuestion.company.ilike(f"%{company}%"))

    if date_from:
        query = query.where(InterviewQuestion.asked_date >= date_from)

    if date_to:
        query = query.where(InterviewQuestion.asked_date <= date_to)

    query = query.order_by(InterviewQuestion.asked_date.desc())

    result = await db.execute(query)
    return result.scalars().all()


@router.post("", response_model=InterviewQuestionResponse, status_code=status.HTTP_201_CREATED)
async def create_interview_question(
    data: InterviewQuestionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    question = InterviewQuestion(
        user_id=current_user.id,
        question=data.question,
        answer=data.answer,
        company=data.company,
        asked_date=data.asked_date,
    )
    db.add(question)
    await db.flush()
    await db.refresh(question)
    return question


@router.delete("/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_interview_question(
    question_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from fastapi import HTTPException

    result = await db.execute(
        select(InterviewQuestion).where(
            InterviewQuestion.id == question_id,
            InterviewQuestion.user_id == current_user.id,
        )
    )
    question = result.scalar_one_or_none()
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Question not found"
        )
    await db.delete(question)
    await db.flush()
