from datetime import date, datetime

from pydantic import BaseModel, ConfigDict


class InterviewQuestionCreate(BaseModel):
    question: str
    answer: str
    company: str
    asked_date: date


class InterviewQuestionResponse(BaseModel):
    id: str
    user_id: str
    question: str
    answer: str
    company: str
    asked_date: date
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
