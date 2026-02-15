# CarrerLog

> A comprehensive portfolio and knowledge base platform for developers to track their professional growth, document problem-solving experiences, and manage career milestones.

## Overview

CarrerLog is a full-stack web application designed to help developers maintain a structured record of their professional journey. Built with modern technologies, it provides an intuitive interface for documenting solved problems using the STAR method, tracking certifications, managing work experiences, and showcasing technical skills.

### Key Features

- **STAR Method Problem Logging** - Document problems solved with Situation, Task, Action, and Result framework
- **Career Timeline** - Track work experiences and professional milestones
- **Certification Management** - Organize and display professional certifications with expiry tracking
- **Google SSO Authentication** - Secure, passwordless login with Google OAuth 2.0
- **Rich Text Editor** - Enhanced content editing with TipTap for detailed documentation
- **Tag-Based Organization** - Categorize problems by technology, difficulty, and custom tags
- **Dashboard Analytics** - Visual insights into your professional growth
- **Responsive Design** - Seamless experience across desktop and mobile devices

## Tech Stack

### Backend
- **Framework:** FastAPI (Python 3.11+)
- **Database:** PostgreSQL 15+ with AsyncIO support
- **ORM:** SQLAlchemy 2.0+
- **Authentication:** JWT tokens with Google OAuth 2.0
- **Validation:** Pydantic v2
- **Migrations:** Alembic
- **Security:** Bcrypt password hashing, OAuth2 flows

### Frontend
- **Framework:** React 18+ with TypeScript 5.x
- **Build Tool:** Vite 7.x
- **State Management:**
  - TanStack Query v5 (server state)
  - Zustand (client state)
- **Styling:** Tailwind CSS 4.x
- **UI Components:** Shadcn/UI (Radix Primitives)
- **Forms:** React Hook Form + Zod validation
- **Rich Text:** TipTap editor
- **Charts:** Recharts
- **Icons:** Lucide React

## Project Structure

```
CarrerLog/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── v1/
│   │   │   │   └── endpoints/
│   │   │   │       ├── auth.py          # Authentication endpoints
│   │   │   │       ├── problems.py      # Problem CRUD
│   │   │   │       ├── experiences.py   # Experience management
│   │   │   │       ├── certifications.py
│   │   │   │       └── dashboard.py     # Analytics
│   │   │   └── deps.py                  # Dependency injection
│   │   ├── core/
│   │   │   ├── config.py                # Configuration
│   │   │   └── security.py              # JWT utilities
│   │   ├── db/
│   │   │   └── session.py               # Database connection
│   │   ├── models/                      # SQLAlchemy models
│   │   ├── schemas/                     # Pydantic schemas
│   │   └── main.py                      # FastAPI app
│   ├── alembic/                         # Database migrations
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                      # Shadcn components
│   │   │   ├── layout/                  # Layout components
│   │   │   └── features/                # Feature components
│   │   ├── pages/                       # Route pages
│   │   ├── hooks/                       # Custom React hooks
│   │   ├── lib/                         # Utilities (axios, etc.)
│   │   └── types/                       # TypeScript types
│   ├── package.json
│   └── vite.config.ts
├── GOOGLE_SSO_SETUP.md
└── README.md
```

## Prerequisites

- **Python:** 3.11 or higher
- **Node.js:** 18.x or higher
- **PostgreSQL:** 15 or higher
- **Git:** Latest version
- **Google Cloud Account:** For OAuth 2.0 setup

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/CarrerLog.git
cd CarrerLog
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your configuration (see Configuration section)
```

### 3. Database Setup

```bash
# Make sure PostgreSQL is running
# Create database (using psql or pgAdmin)
createdb carrerlog

# Run migrations
alembic upgrade head
```

### 4. Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install
```

## Configuration

### Backend Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Database
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/carrerlog

# JWT
SECRET_KEY=your-secret-key-here-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Google OAuth (see GOOGLE_SSO_SETUP.md)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:5173/auth/callback

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Google OAuth Setup

Follow the detailed instructions in [GOOGLE_SSO_SETUP.md](./GOOGLE_SSO_SETUP.md) to:
1. Create a Google Cloud Project
2. Configure OAuth consent screen
3. Generate OAuth 2.0 credentials
4. Set up authorized redirect URIs

## Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
.venv\Scripts\activate  # or source .venv/bin/activate on macOS/Linux
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Access the application:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000
- **API Documentation:** http://localhost:8000/docs (Swagger UI)
- **Alternative API Docs:** http://localhost:8000/redoc

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login with email/password
- `GET /api/v1/auth/google/authorize` - Initiate Google SSO
- `GET /api/v1/auth/google/callback` - Google OAuth callback
- `GET /api/v1/auth/me` - Get current user profile

### Dashboard
- `GET /api/v1/dashboard/stats` - Get dashboard statistics

### Problems
- `GET /api/v1/problems` - List all problems (with pagination & filters)
- `POST /api/v1/problems` - Create new problem
- `GET /api/v1/problems/{id}` - Get problem details
- `PUT /api/v1/problems/{id}` - Update problem
- `DELETE /api/v1/problems/{id}` - Delete problem

### Experiences
- `GET /api/v1/experiences` - List work experiences
- `POST /api/v1/experiences` - Add new experience
- `PUT /api/v1/experiences/{id}` - Update experience
- `DELETE /api/v1/experiences/{id}` - Delete experience

### Certifications
- `GET /api/v1/certifications` - List certifications
- `POST /api/v1/certifications` - Add certification
- `PUT /api/v1/certifications/{id}` - Update certification
- `DELETE /api/v1/certifications/{id}` - Delete certification

## Database Schema

### Users Table
- Unique user identification with UUID
- Email-based authentication with hashed passwords
- Google OAuth integration
- Soft delete support

### Problems Table (STAR Method)
- **Situation:** Context and background
- **Task:** Challenge or objective
- **Action:** Steps taken to solve
- **Result:** Outcome and impact
- Tags, difficulty levels, and company context
- Date tracking for temporal analysis

### Experiences Table
- Company, role, and duration tracking
- Current position support (null end_date)
- Detailed descriptions

### Certifications Table
- Issuer and credential information
- Expiry date tracking
- External credential URL links

## Features in Detail

### Problem Logging with STAR Method
The core feature allows developers to document their problem-solving experiences using the proven STAR (Situation, Task, Action, Result) interview framework. This creates a searchable repository of real-world experiences that can be referenced during interviews or performance reviews.

### Google SSO Integration
Secure, passwordless authentication using Google OAuth 2.0. Users can sign in with their Gmail accounts without managing additional passwords. The system validates email domains and creates user profiles automatically.

### Rich Text Editing
Built-in TipTap editor supports formatted text, allowing for detailed technical documentation with code snippets, lists, and structured content.

### Analytics Dashboard
Visual representation of your professional growth including:
- Total problems solved
- Certifications earned
- Experience timeline
- Tag-based skill distribution

## Development

### Running Tests
```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm run test
```

### Code Quality
```bash
# Backend linting
cd backend
flake8 app/
black app/

# Frontend linting
cd frontend
npm run lint
```

### Database Migrations
```bash
# Create new migration
cd backend
alembic revision --autogenerate -m "Description of changes"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

## Production Deployment

### Backend
1. Set environment variables securely
2. Use production database (managed PostgreSQL recommended)
3. Configure HTTPS
4. Update CORS origins to production domain
5. Use a production ASGI server (e.g., Gunicorn with Uvicorn workers)

### Frontend
1. Build production bundle: `npm run build`
2. Serve `dist/` folder with static hosting (Vercel, Netlify, etc.)
3. Update API base URL to production backend
4. Configure production redirect URIs in Google Cloud Console

### Google OAuth Production Setup
- Update authorized origins and redirect URIs
- Publish OAuth consent screen
- Use HTTPS for all redirect URIs
- Configure production environment variables

## Security Considerations

- JWT tokens with configurable expiration
- Bcrypt password hashing with salt rounds
- CORS protection with whitelisted origins
- Environment-based secrets management
- SQL injection protection via SQLAlchemy ORM
- XSS protection in frontend rendering
- Gmail-only validation for Google SSO (configurable)

## Troubleshooting

### Common Issues

**Database Connection Error:**
- Verify PostgreSQL is running
- Check DATABASE_URL in .env
- Ensure database exists

**Google SSO "redirect_uri_mismatch":**
- Verify redirect URI in Google Cloud Console matches exactly
- Check for trailing slashes, protocol (http/https), and port numbers

**CORS Errors:**
- Ensure frontend URL is in CORS_ORIGINS
- Check that both backend and frontend are running on correct ports

**Migration Issues:**
- Try `alembic downgrade base` and `alembic upgrade head`
- Check for schema conflicts

## Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [Shadcn/UI Components](https://ui.shadcn.com/)
- [Google OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)
- [Detailed Setup Guide](./GOOGLE_SSO_SETUP.md)

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Acknowledgments

- Built with modern web technologies
- Inspired by the need for better developer career tracking
- UI components from Shadcn/UI
- Icons from Lucide React

---

**Version:** 1.0.0
**Last Updated:** February 2026
**Author:** Your Name

For detailed Google SSO setup instructions, see [GOOGLE_SSO_SETUP.md](./GOOGLE_SSO_SETUP.md)
