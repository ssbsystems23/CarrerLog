from pydantic import BaseModel

from app.schemas.problem import ProblemResponse


class DashboardStats(BaseModel):
    total_problems: int
    total_experiences: int
    total_certifications: int
    problems_by_difficulty: dict
    recent_problems: list[ProblemResponse]
