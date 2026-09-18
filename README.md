# Darukaa.Earth

A full-stack geospatial data analytics platform for managing environmental projects, geographic sites, carbon and biodiversity information, and spatial biodiversity observations.

Darukaa.Earth combines interactive mapping, project management, geospatial storage, authentication, and biodiversity analytics into a single workspace.

---

## Overview

Environmental and conservation projects often work with information spread across maps, spreadsheets, databases, and external biodiversity datasets.

Darukaa.Earth provides a focused workspace where users can:

- Create and manage environmental projects
- Add multiple geographic sites to each project
- Draw site boundaries directly on an interactive map
- Store site polygons using PostgreSQL/PostGIS
- Explore biodiversity observations for individual sites
- View biodiversity analytics and trends
- Manage authentication and account security
- Work with spatial biodiversity data from GBIF

The application is designed around a simple workflow:

```text
User
  ↓
Authentication
  ↓
Project Dashboard
  ↓
Project
  ↓
Geographic Sites
  ↓
Interactive Map
  ↓
Site Analytics
  ↓
GBIF Biodiversity Data

Technology Stack
Frontend
Technology	Purpose
React	UI framework
TypeScript	Type safety
Vite	Development/build tooling
React Router	Client-side routing
Axios	API communication
Tailwind CSS	UI styling
Mapbox GL JS	Interactive maps
Mapbox GL Draw	Polygon creation
Chart.js	Analytics visualisation
Backend
Technology	Purpose
Python	Backend language
FastAPI	REST API framework
SQLAlchemy	ORM
Alembic	Database migrations
Pydantic	Request/response validation
PyJWT	JWT authentication
bcrypt	Password hashing
GeoAlchemy2	PostGIS integration
Pytest	Automated tests
Ruff	Python linting
Database
PostgreSQL
     +
   PostGIS

PostGIS is used to store and query geographic site polygons.

External Data

Darukaa.Earth uses biodiversity occurrence data from:

GBIF — Global Biodiversity Information Facility

The application retrieves biodiversity observations relevant to geographic sites and transforms them into analytics suitable for the site detail experience.

Database Design

The primary data model is:

User
 │
 └──< Project
        │
        └──< Site
               │
               └──< SiteAnalytics
Users

Stores application accounts.

users
├── id
├── email
├── password_hash
└── created_at
Projects

Represents an environmental or conservation project.

projects
├── id
├── name
├── description
├── owner_id → users.id
└── created_at

Relationship:

User 1 ─────── N Projects
Sites

Represents a geographic site belonging to a project.

sites
├── id
├── project_id → projects.id
├── name
├── geometry
└── created_at

The geometry field is stored as:

POLYGON
SRID: 4326

Relationship:

Project 1 ─────── N Sites
Site Analytics

Stores analytical records associated with a site.

site_analytics
├── id
├── site_id → sites.id
├── recorded_date
├── carbon_sequestration
├── biodiversity_index
└── species_count

Relationship:

Site 1 ─────── N SiteAnalytics
Application Flow
1. Register

A user creates an account using:

POST /api/auth/register

The backend:

Validates the email
Validates password strength
Checks for an existing account
Hashes the password with bcrypt
Creates the user
Generates a JWT access token

The frontend stores the JWT locally and redirects the user to the dashboard.

2. Login

A registered user signs in through:

POST /api/auth/login

The backend validates the credentials and returns a JWT access token.

Authenticated API requests send:

Authorization: Bearer <token>
3. Create a Project

Projects are created from the dashboard.

Example:

Western Ghats Restoration

A project can contain multiple geographic sites.

4. Add a Geographic Site

Inside a project, the user opens the Mapbox map and starts drawing.

The user can:

Select the polygon drawing tool
Draw the geographic boundary
Finish the polygon
Provide a site name
Save the site

The polygon is sent to the backend as GeoJSON-compatible geometry and stored in PostGIS.

5. Explore a Site

Clicking a saved site opens:

/sites/:siteId

The site analytics page retrieves biodiversity information and presents it through charts and summary metrics.

Analytics

The site analytics experience currently uses GBIF biodiversity occurrence data.

The analytics page presents:

Total GBIF occurrences

The number of matching biodiversity occurrence records available for the site analysis.

Species richness

The number of distinct species represented within the analysed occurrence data.

Records processed

The number of biodiversity records successfully processed for the analytics view.

Observation activity

A time-series view of observations over time.

Taxonomic composition

A breakdown of observed records across taxonomic groups.

Record sources

A distribution of biodiversity records by source/publisher.

Top species

A view of the most frequently observed species in the analysed data.

Important Analytics Interpretation

GBIF occurrence records represent available biodiversity observations, not a complete census of all biodiversity within a geographic site.

Therefore:

Available occurrence records
        ≠
Complete biodiversity inventory

The analytics interface makes this distinction visible to avoid presenting occurrence data as a complete ecological census.

API

The backend exposes a REST API under /api.

Authentication
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/change-password
POST /api/auth/forgot-password
POST /api/auth/reset-password
Projects
GET    /api/projects
POST   /api/projects
GET    /api/projects/{project_id}
PATCH  /api/projects/{project_id}
DELETE /api/projects/{project_id}
Sites
GET    /api/projects/{project_id}/sites
POST   /api/projects/{project_id}/sites
GET    /api/sites/{site_id}
PATCH  /api/sites/{site_id}
DELETE /api/sites/{site_id}
Analytics
GET /api/sites/{site_id}/analytics
Health
GET /health
GET /health/db

The database health endpoint also checks PostGIS availability.

Authentication and Security

Authentication uses JWT access tokens.

Passwords are never stored in plaintext.

Passwords are hashed using bcrypt before being stored in PostgreSQL.

Password requirements include:

Minimum 8 characters
At least one uppercase character
At least one lowercase character
At least one number
At least one special character
No spaces

JWT tokens contain the authenticated user's ID and expiration information.

Protected backend routes use a FastAPI authentication dependency to validate the bearer token and resolve the current user.

Password Reset

The application includes a password reset flow.

The current development implementation intentionally does not depend on an external email provider.

The flow is:

Forgot password
      ↓
Backend generates secure reset token
      ↓
Token is stored as a SHA-256 hash
      ↓
Development token is printed by the backend
      ↓
User opens reset page with token
      ↓
New password is submitted
      ↓
Token is invalidated

Reset tokens expire after the configured period and cannot be reused after successful password reset.

For a production deployment, an email delivery provider can be integrated without changing the underlying reset-token model.

Local Development
Prerequisites

Install:

Node.js 20+
Python 3.11+
Docker Desktop
Git
1. Clone the repository
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd darukaa-earth
2. Start PostgreSQL + PostGIS

From the project root:

docker compose up -d

Check running containers:

docker ps

The project uses:

PostgreSQL + PostGIS

for local development.

3. Backend setup

Open a terminal:

cd backend

Create the Python virtual environment:

python -m venv .venv

Activate it:

.\.venv\Scripts\Activate.ps1

If PowerShell blocks script execution:

Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

Then:

.\.venv\Scripts\Activate.ps1

Install dependencies:

pip install -r requirements.txt
4. Backend environment variables

Create:

backend/.env

Example:

DATABASE_URL=postgresql+psycopg://YOUR_DB_USER:YOUR_DB_PASSWORD@localhost:5432/YOUR_DB_NAME
JWT_SECRET=replace-with-a-long-random-secret
APP_ENV=development
FRONTEND_URL=http://localhost:5173
PASSWORD_RESET_EXPIRE_MINUTES=30

Do not commit .env.

A safe example configuration should be maintained in:

backend/.env.example

without real credentials or secrets.

5. Run database migrations

From:

backend/

run:

alembic upgrade head

Check the current migration:

alembic current
6. Start the backend

From:

backend/

run:

uvicorn app.main:app --reload

The API will be available at:

http://127.0.0.1:8000

FastAPI documentation is available at:

http://127.0.0.1:8000/docs

Health check:

http://127.0.0.1:8000/health
7. Frontend setup

Open another terminal:

cd frontend

Install dependencies:

npm install
8. Frontend environment variables

Create:

frontend/.env

Example:

VITE_MAPBOX_TOKEN=your_mapbox_public_token

The Mapbox token should never be committed to Git.

A safe template should be maintained in:

frontend/.env.example
9. Start the frontend

Run:

npm run dev

The frontend will normally be available at:

http://localhost:5173
Development Workflow

The recommended local development workflow is:

Terminal 1
──────────
Docker
PostgreSQL + PostGIS


Terminal 2
──────────
Backend
FastAPI + Uvicorn


Terminal 3
──────────
Frontend
React + Vite
Testing
Backend linting

From backend/:

ruff check .
Backend tests
pytest
Frontend linting

From frontend/:

npm run lint
Frontend production build
npm run build

The frontend build runs TypeScript compilation followed by the Vite production build.

Continuous Integration

GitHub Actions runs automated checks for the frontend and backend.

Workflow:

GitHub Push / Pull Request
          │
          ├───────────────┐
          ↓               ↓
      Backend          Frontend
          │               │
      Python 3.11       Node.js
          │               │
        Ruff          npm ci
          │               │
       Pytest          Oxlint
          │               │
          │            Vite build
          │               │
          └───────┬───────┘
                  ↓
              CI result

The workflow is located at:

.github/workflows/ci.yml

Backend CI uses a PostGIS-enabled PostgreSQL service so database-dependent tests can run in the CI environment.

Code Quality

The project uses automated tooling to keep development consistent.

Backend
Ruff
Pytest
Alembic
Frontend
TypeScript
Oxlint
Vite
Git

Commits follow a conventional style such as:

feat: add project management
feat: integrate Mapbox
feat: add site analytics
test: add authentication tests
ci: add GitHub Actions workflow
docs: add project documentation
Deployment Architecture

The intended deployment architecture is:

                    ┌──────────────────┐
                    │     Browser      │
                    └────────┬─────────┘
                             │
                             ↓
                    ┌──────────────────┐
                    │ Vercel Frontend  │
                    │ React + Vite     │
                    └────────┬─────────┘
                             │
                         HTTPS/API
                             │
                             ↓
                    ┌──────────────────┐
                    │ Render Backend   │
                    │ FastAPI          │
                    └────────┬─────────┘
                             │
                             ↓
                    ┌──────────────────┐
                    │ PostgreSQL       │
                    │ + PostGIS        │
                    └──────────────────┘

                             │
                             │
                             ↓
                    ┌──────────────────┐
                    │      GBIF        │
                    │ Biodiversity API │
                    └──────────────────┘

Mapbox is used by the frontend for interactive geographic visualisation and polygon drawing.

Environment Variables
Backend
DATABASE_URL=
JWT_SECRET=
APP_ENV=
FRONTEND_URL=
PASSWORD_RESET_EXPIRE_MINUTES=
Frontend
VITE_MAPBOX_TOKEN=

Secrets must be configured through the deployment platform rather than committed to source control.

Project Structure
darukaa-earth/
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── backend/
│   ├── alembic/
│   │   └── versions/
│   │
│   ├── app/
│   │   ├── api/
│   │   │   ├── analytics.py
│   │   │   ├── auth.py
│   │   │   ├── projects.py
│   │   │   └── sites.py
│   │   │
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── dependencies.py
│   │   │   ├── passwords.py
│   │   │   └── security.py
│   │   │
│   │   ├── db/
│   │   │   ├── base.py
│   │   │   ├── dependencies.py
│   │   │   └── session.py
│   │   │
│   │   ├── models/
│   │   │   ├── password_reset_token.py
│   │   │   ├── project.py
│   │   │   ├── site.py
│   │   │   ├── site_analytics.py
│   │   │   └── user.py
│   │   │
│   │   ├── schemas/
│   │   │   ├── analytics.py
│   │   │   ├── auth.py
│   │   │   ├── project.py
│   │   │   └── site.py
│   │   │
│   │   ├── services/
│   │   │   └── gbif.py
│   │   │
│   │   └── main.py
│   │
│   ├── tests/
│   │   └── test_auth.py
│   │
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   ├── PasswordInput.tsx
│   │   │   └── PasswordRequirements.tsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── ForgotPassword.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── ProjectDetail.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── ResetPassword.tsx
│   │   │   ├── Settings.tsx
│   │   │   └── SiteAnalytics.tsx
│   │   │
│   │   ├── services/
│   │   │   └── api.ts
│   │   │
│   │   ├── App.tsx
│   │   └── index.css
│   │
│   ├── package.json
│   └── .env.example
│
├── docker-compose.yml
├── .gitignore
└── README.md
Design Principles

Darukaa.Earth follows several implementation principles.

1. Spatial data as a first-class concept

Geographic site boundaries are stored using PostGIS rather than being treated as plain JSON application data.

2. Separation of concerns

The backend separates:

API routes
    ↓
Schemas
    ↓
Models
    ↓
Database

External data access is isolated in service modules such as the GBIF integration.

3. Secure authentication

Authentication responsibilities are separated into:

Password validation
JWT creation/validation
Authentication dependency
API routes
4. External data transparency

The analytics interface identifies GBIF as the source of biodiversity occurrence data and communicates the distinction between occurrence records and a complete biodiversity census.

5. Maintainable frontend

The frontend separates:

Pages
Components
API service
Application routing

Shared layout components provide a consistent application experience.

Tradeoffs
FastAPI vs Django

FastAPI was selected for a lightweight API architecture with clear request/response schemas and straightforward integration with SQLAlchemy and Pydantic.

A Django implementation would provide a larger batteries-included framework, but the project primarily requires an API layer rather than Django's complete web framework stack.

PostgreSQL + PostGIS

PostGIS adds spatial capabilities directly to PostgreSQL.

This allows geographic site data to remain in the same transactional database as projects and users instead of introducing a separate spatial datastore.

Mapbox

Mapbox GL JS provides the interactive mapping layer required for drawing and visualising geographic project sites.

The application keeps the map interaction in the frontend while the backend remains responsible for persistence and validation.

GBIF

GBIF provides a practical external biodiversity data source for the analytics workflow.

The implementation treats the returned observations as available occurrence records rather than representing them as a complete census of biodiversity.

Development password reset

The current implementation prints the generated reset token during local development instead of requiring an external email provider.

This keeps the core reset-token functionality testable while avoiding an additional external dependency during development.

A production implementation can connect the existing reset flow to an email provider.

Future Improvements

Potential next steps include:

Production email delivery for password resets
Role-based access control
Project collaboration and team members
More advanced PostGIS spatial queries
Spatial filtering of GBIF observations
Time-series carbon monitoring
Satellite-derived environmental indicators
Biodiversity trend comparisons between sites
Project-level analytics
Exportable reports
CSV/GeoJSON export
Automated data refresh
Background jobs for large analytics workloads
Improved map clustering for large numbers of sites
More comprehensive integration and end-to-end tests
Production observability and error monitoring
Demo Workflow

A typical demonstration can follow this flow:

1. Register a new account
        ↓
2. Land on the dashboard
        ↓
3. Create an environmental project
        ↓
4. Open the project
        ↓
5. Draw a site polygon on the map
        ↓
6. Save the site
        ↓
7. Click the site
        ↓
8. View biodiversity analytics
        ↓
9. Open Settings
        ↓
10. Demonstrate account security controls

This demonstrates the complete product journey from authentication through spatial project creation to biodiversity analytics.

API Documentation

When running locally, interactive API documentation is available through FastAPI:

http://127.0.0.1:8000/docs

The OpenAPI schema can also be inspected through:

http://127.0.0.1:8000/openapi.json
Status

The project includes the core full-stack workflow:

Authentication
      ✓
Project management
      ✓
Interactive mapping
      ✓
Polygon site creation
      ✓
PostGIS storage
      ✓
GBIF biodiversity integration
      ✓
Site analytics
      ✓
Password management
      ✓
Backend testing
      ✓
Frontend linting
      ✓
Production frontend build
      ✓
GitHub Actions CI
      ✓
License

This project was created as part of a technical challenge / internship project.