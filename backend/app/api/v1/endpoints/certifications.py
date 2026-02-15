from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.certification import Certification
from app.models.user import User
from app.schemas.certification import CertificationCreate, CertificationResponse

router = APIRouter()


@router.get("", response_model=list[CertificationResponse])
async def list_certifications(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Certification)
        .where(Certification.user_id == current_user.id)
        .order_by(Certification.issue_date.desc())
    )
    certifications = result.scalars().all()
    return certifications


@router.post("", response_model=CertificationResponse, status_code=status.HTTP_201_CREATED)
async def create_certification(
    certification_in: CertificationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    certification = Certification(
        user_id=current_user.id,
        name=certification_in.name,
        issuer=certification_in.issuer,
        issue_date=certification_in.issue_date,
        expiry_date=certification_in.expiry_date,
        credential_url=certification_in.credential_url,
    )
    db.add(certification)
    await db.flush()
    await db.refresh(certification)
    return certification
