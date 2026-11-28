# CareerVerse

**Experience your future before choosing it.**

CareerVerse is an interactive career exploration platform that helps users discover career paths, experience realistic workplace scenarios, evaluate their decision-making skills, and build personalized skill-development roadmaps.

Instead of relying only on career descriptions, CareerVerse lets users experience a simulated professional challenge and receive feedback based on their decisions.

## Features

### Authentication
- User registration and login
- JWT-based authentication
- Protected application routes
- Secure password hashing

### Career Discovery
- Interactive career questionnaire
- Personalized career recommendations
- Weighted recommendation matching
- Match scores and explanations
- Career reality checks

### Interactive Career Simulation
- Realistic workplace decision-making scenarios
- Multi-stage branching decisions
- Consequences and feedback
- Performance scoring

**Currently available simulation:** Software Engineer — *The NexaTech Login Outage*.

### Performance Assessment
- Overall performance score
- Skill-level breakdown
- Strengths and improvement areas
- Personalized recommendations

### Personalized Skill Roadmap
- Learning tasks for recommended skills
- Portfolio project suggestions
- Completion goals
- Persistent task completion tracking

### Dashboard and History
- Simulation statistics
- Recent activity
- Simulation history
- Access to previous assessments

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React, TypeScript, Vite |
| Routing | React Router |
| HTTP client | Axios |
| Icons | Lucide React |
| Backend | Python, FastAPI |
| Database | PostgreSQL |
| ORM | SQLAlchemy |
| Migrations | Alembic |
| Authentication | JWT, Argon2 |
| Validation | Pydantic |

## Architecture

```text
CareerVerse/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   ├── models/
│   │   └── modules/
│   │       ├── auth/
│   │       ├── discovery/
│   │       └── simulations/
│   ├── alembic/
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   └── types/
│   └── package.json
│
└── README.md
```

*The directory structure above is representative; individual files may vary.*

## Getting Started

### Prerequisites

Install the following:

- Python 3.12
- Node.js and npm
- PostgreSQL
- Git

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/CareerVerse.git
cd CareerVerse
```

### 2. Configure the backend

Open a terminal in the backend directory:

```bash
cd backend

python -m venv .venv
```

Activate the virtual environment on Windows:

```powershell
.venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create a local `.env` file in the backend directory.

Example configuration:

```env
APP_NAME=CareerVerse
APP_VERSION=0.1.0
DEBUG=False
LOG_LEVEL=INFO

DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/careerverse

SECRET_KEY=YOUR_GENERATED_SECRET_KEY
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

FRONTEND_URL=http://localhost:5173

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=
SMTP_PASSWORD=
SMTP_FROM_EMAIL=
SMTP_FROM_NAME=CareerVerse

EMAIL_VERIFICATION_EXPIRE_HOURS=24
```

Do not commit your actual `.env` file or credentials.

Create the PostgreSQL database named `careerverse` if it does not already exist.

Run database migrations:

```bash
alembic upgrade head
```

Start the backend:

```bash
python -m uvicorn app.main:app --reload
```

Backend API:

`http://127.0.0.1:8000`

Interactive API documentation:

`http://127.0.0.1:8000/docs`

### 3. Configure the frontend

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file:

```env
VITE_API_URL=http://127.0.0.1:8000/api/v1
```

Start the frontend:

```bash
npm run dev
```

Open:

`http://localhost:5173`

## Screenshots

### Dashboard
![CareerVerse Dashboard](screenshots/dashboard.png)

### Career Discovery
![Career Discovery](screenshots/career-discovery.png)

### Interactive Career Simulation
![Software Engineer Simulation](screenshots/simulation.png)

### Skill Assessment & Roadmap
![Assessment and Skill Roadmap](screenshots/assessment1.0.png)

![Assessment and Skill Roadmap](screenshots/assessment1.1.png)


## Application Workflow

1. Register or log in.
2. Complete the career discovery questionnaire.
3. Explore personalized career recommendations.
4. Start the available Software Engineer simulation.
5. Make decisions during the NexaTech workplace incident.
6. Review your performance assessment.
7. Follow your personalized skill-development roadmap.
8. Track completed tasks and revisit previous simulations.

## Current Scope and Future Development

CareerVerse currently provides a working end-to-end experience with career discovery and a playable Software Engineer simulation.

Potential future improvements include:

- Additional career simulations
- AI-powered career mentoring
- More advanced adaptive recommendations
- Expanded scenario libraries
- Deeper learning-resource integration
- Deployment and production monitoring

## Security Notes

- Keep database credentials and secret keys out of source control.
- Use a strong, unique JWT secret.
- Configure CORS appropriately for the deployment environment.
- Never commit personal access tokens or production credentials.

## Project Status

**Core application workflow implemented and manually tested locally.**

CareerVerse is an evolving project. The currently supported simulation is the NexaTech Software Engineer scenario; additional career simulations are planned.

---

Built with React, FastAPI, PostgreSQL, and Python.
