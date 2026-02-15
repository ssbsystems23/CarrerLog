from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, field_validator


class ProblemCreate(BaseModel):
    title: str
    company_context: str | None = None
    difficulty: str
    situation: str
    task: str
    action: str
    result: str
    tags: list[str] | None = []
    solved_at: date | None = None

    @field_validator("difficulty")
    @classmethod
    def validate_difficulty(cls, v: str) -> str:
        if v not in ("Easy", "Medium", "Hard"):
            raise ValueError("difficulty must be one of: Easy, Medium, Hard")
        return v

    @field_validator("solved_at", mode="before")
    @classmethod
    def default_solved_at(cls, v):
        if v is None:
            return date.today()
        return v


class ProblemUpdate(BaseModel):
    title: str | None = None
    company_context: str | None = None
    difficulty: str | None = None
    situation: str | None = None
    task: str | None = None
    action: str | None = None
    result: str | None = None
    tags: list[str] | None = None
    solved_at: date | None = None

    @field_validator("difficulty")
    @classmethod
    def validate_difficulty(cls, v: str | None) -> str | None:
        if v is not None and v not in ("Easy", "Medium", "Hard"):
            raise ValueError("difficulty must be one of: Easy, Medium, Hard")
        return v


class ProblemResponse(BaseModel):
    id: str
    user_id: str
    title: str
    company_context: str | None = None
    difficulty: str
    situation: str
    task: str
    action: str
    result: str
    tags: list[str] | None = []
    solved_at: date
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ProblemListResponse(BaseModel):
    items: list[ProblemResponse]
    total: int
    page: int
    size: int
