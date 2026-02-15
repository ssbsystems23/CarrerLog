from datetime import date, datetime

from pydantic import BaseModel, ConfigDict


class CertificationCreate(BaseModel):
    name: str
    issuer: str
    issue_date: date
    expiry_date: date | None = None
    credential_url: str | None = None


class CertificationResponse(BaseModel):
    id: str
    user_id: str
    name: str
    issuer: str
    issue_date: date
    expiry_date: date | None = None
    credential_url: str | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
