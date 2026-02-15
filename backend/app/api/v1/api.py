from fastapi import APIRouter

from app.api.v1.endpoints import auth, certifications, dashboard, experiences, interview_questions, learnings, problems, uploads

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(problems.router, prefix="/problems", tags=["problems"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(experiences.router, prefix="/experiences", tags=["experiences"])
api_router.include_router(certifications.router, prefix="/certifications", tags=["certifications"])
api_router.include_router(interview_questions.router, prefix="/interview-questions", tags=["interview-questions"])
api_router.include_router(learnings.router, prefix="/learnings", tags=["learnings"])
api_router.include_router(uploads.router, prefix="/uploads", tags=["uploads"])
