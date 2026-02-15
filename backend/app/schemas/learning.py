from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, field_validator


class LearningCreate(BaseModel):
    topic: str
    learned_date: date | None = None
    tags: list[str] | None = []

    @field_validator("learned_date", mode="before")
    @classmethod
    def default_learned_date(cls, v):
        if v is None:
            return date.today()
        return v


class LearningResponse(BaseModel):
    id: str
    user_id: str
    topic: str
    learned_date: date
    tags: list[str] | None = []
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class LearningListResponse(BaseModel):
    items: list[LearningResponse]
    total: int
    page: int
    size: int
