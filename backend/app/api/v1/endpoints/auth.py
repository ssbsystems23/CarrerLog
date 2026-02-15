from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import RedirectResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from authlib.integrations.starlette_client import OAuth
from pydantic import BaseModel
import httpx

from app.api.deps import get_current_user
from app.core.config import settings
from app.core.security import create_access_token
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import Token, UserResponse


class GoogleCallbackRequest(BaseModel):
    code: str

router = APIRouter()

# Configure OAuth
oauth = OAuth()
oauth.register(
    name="google",
    client_id=settings.GOOGLE_CLIENT_ID,
    client_secret=settings.GOOGLE_CLIENT_SECRET,
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={"scope": "openid email profile"},
)


@router.get("/google/login")
async def google_login():
    """Initiate Google OAuth flow"""
    redirect_uri = settings.GOOGLE_REDIRECT_URI
    authorization_url = (
        f"https://accounts.google.com/o/oauth2/v2/auth?"
        f"client_id={settings.GOOGLE_CLIENT_ID}&"
        f"redirect_uri={redirect_uri}&"
        f"response_type=code&"
        f"scope=openid%20email%20profile&"
        f"access_type=offline&"
        f"prompt=consent"
    )
    return {"authorization_url": authorization_url}


@router.post("/google/callback", response_model=Token)
async def google_callback(
    request: GoogleCallbackRequest,
    db: AsyncSession = Depends(get_db),
):
    """Handle Google OAuth callback"""
    code = request.code
    try:
        # Exchange code for token
        async with httpx.AsyncClient() as client:
            token_response = await client.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "code": code,
                    "client_id": settings.GOOGLE_CLIENT_ID,
                    "client_secret": settings.GOOGLE_CLIENT_SECRET,
                    "redirect_uri": settings.GOOGLE_REDIRECT_URI,
                    "grant_type": "authorization_code",
                },
            )

            # Log the response for debugging
            print(f"Google token response status: {token_response.status_code}")
            print(f"Google token response: {token_response.text}")

            token_data = token_response.json()

            if "error" in token_data:
                error_msg = token_data.get('error_description', token_data.get('error', 'Unknown error'))
                print(f"Google OAuth error: {error_msg}")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"OAuth error: {error_msg}",
                )

            # Get user info
            access_token = token_data["access_token"]
            userinfo_response = await client.get(
                "https://www.googleapis.com/oauth2/v2/userinfo",
                headers={"Authorization": f"Bearer {access_token}"},
            )
            user_info = userinfo_response.json()

        # Validate Gmail domain
        email = user_info.get("email")
        if not email or not email.endswith("@gmail.com"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only Gmail accounts are allowed",
            )

        google_id = user_info.get("id")
        name = user_info.get("name", email.split("@")[0])

        # Find or create user
        result = await db.execute(
            select(User).where(
                (User.email == email) | (User.google_id == google_id)
            )
        )
        user = result.scalar_one_or_none()
        print(user)
        if not user:
            # Create new user
            user = User(
                email=email,
                full_name=name,
                google_id=google_id,
                hashed_password=None,  # No password for OAuth users
            )
            print(f"user created  {user}")
            print(user)
            db.add(user)
            await db.flush()
            await db.refresh(user)
        else:
            # Update google_id if not set
            if not user.google_id:
                user.google_id = google_id
                await db.flush()

        # Create access token
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        print(f"access token  {access_token_expires}")
        jwt_token = create_access_token(
            subject=str(user.id), expires_delta=access_token_expires
        )
        print(f"jwt token is {jwt_token}")
        return Token(access_token=jwt_token, token_type="bearer", user=user)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Authentication failed: {str(e)}",
        )


@router.get("/me", response_model=UserResponse)
async def read_current_user(current_user: User = Depends(get_current_user)):
    """Get current authenticated user"""
    return current_user
