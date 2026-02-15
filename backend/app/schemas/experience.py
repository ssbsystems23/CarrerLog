from datetime import date, datetime

from pydantic import BaseModel, ConfigDict


class ExperienceCreate(BaseModel):
    company: str
    role: str
    start_date: date
    end_date: date | None = None
    description: str | None = None


class ExperienceResponse(BaseModel):
    id: str
    user_id: str
    company: str
    role: str
    start_date: date
    end_date: date | None = None
    description: str | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
