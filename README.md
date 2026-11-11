# School Admission System

A containerized School Admission Management System built with ASP.NET Core, React, and PostgreSQL. The application uses Docker Compose to simplify deployment and ensure that the frontend, backend, and database run together in an isolated environment.

## Technology Stack

| Component        | Technology              |
| ---------------- | ----------------------- |
| Backend          | ASP.NET Core Web API    |
| Frontend         | React, TypeScript, Vite |
| Database         | PostgreSQL 16           |
| Web Server       | Nginx                   |
| Containerization | Docker                  |
| Orchestration    | Docker Compose          |

## Architecture

The application consists of three services:

```text
                  Browser
                     |
                     |
              localhost:3000
                     |
                     v
              +-------------+
              |   Frontend  |
              | React + Nginx|
              +-------------+
                     |
                     | /api/
                     v
              +-------------+
              |   Backend   |
              | ASP.NET Core|
              +-------------+
                     |
                     |
                     v
              +-------------+
              | PostgreSQL  |
              |  Database   |
              +-------------+
                     |
                     v
              Persistent Volume
```

### Services

| Service    | Container Port | Host Port | Description                       |
| ---------- | -------------: | --------: | --------------------------------- |
| Frontend   |             80 |      3000 | React application served by Nginx |
| Backend    |           8080 |      8080 | ASP.NET Core Web API              |
| PostgreSQL |           5432 |  Internal | Relational database               |

The frontend communicates with the backend through the Nginx reverse proxy using `/api/`.

PostgreSQL is accessible internally through the Docker network and does not need to be exposed publicly.

## Prerequisites

You only need:

- Docker Engine
- Docker Compose v2

Verify your installation:

```bash
docker --version
docker compose version
```

You do not need to install Node.js, .NET SDK, or PostgreSQL separately to run the containerized application.

## Project Structure

```text
SchoolAdmissionSystem/
│
├── backend/
│   ├── SchoolAdmission.API/
│   │   └── Dockerfile
│   ├── SchoolAdmission.Application/
│   ├── SchoolAdmission.Domain/
│   └── SchoolAdmission.Infrastructure/
│
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── dist/
│   ├── public/
│   └── src/
|   |__env
|   |__env.example
│
├── docker-compose.yml
├── .dockerignore
├── .env
├── .env.example
└── README.md
```

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/momin210103/SchoolAdmissionSystem.git

cd SchoolAdmissionSystem
```

### 2. Configure Environment Variables

Create your environment file from the example both in the root and frontend directories:

```bash
cp .env.example .env
```

Open `.env` and configure the values:

```env
POSTGRES_DB=SchoolAdmissionDb
POSTGRES_USER=postgres
POSTGRES_PASSWORD=ChangeThisToAStrongPassword

HOLD_DURATION_SECONDS=600
```

**Environment variables:**

| Variable                | Description                  | Example             |
| ----------------------- | ---------------------------- | ------------------- |
| `POSTGRES_DB`           | PostgreSQL database name     | `SchoolAdmissionDb` |
| `POSTGRES_USER`         | PostgreSQL username          | `postgres`          |
| `POSTGRES_PASSWORD`     | PostgreSQL password          | Strong password     |
| `HOLD_DURATION_SECONDS` | Admission seat hold duration | `600`               |

The default hold duration is 600 seconds (10 minutes).

### 3. Start the Application

From the repository root, execute:

```bash
docker compose up --build
```

To run the application in detached mode:

```bash
docker compose up --build -d
```

Docker Compose will:

1. Build the backend image.
2. Build the frontend image.
3. Start PostgreSQL.
4. Wait for PostgreSQL health checks where configured.
5. Start the backend.
6. Start the frontend.
7. Connect the services through the Docker network.

### 4. Access the Application

Once the containers are running:

| Application | URL                           |
| ----------- | ----------------------------- |
| Frontend    | http://localhost:3000         |
| Backend API | http://localhost:8080         |
| Swagger UI  | http://localhost:8080/swagger |

Swagger UI is available if enabled in the backend configuration.

**Warning:** The `-v` option deletes the database volume and permanently removes the stored database data. Do not use it when you need to preserve application records.

## Updating Environment Variables

When changing runtime environment variables, recreate the affected service.

For example, after changing `HOLD_DURATION_SECONDS`:

```bash
docker compose up -d --force-recreate backend
```

For frontend source or build-time environment changes, rebuild the frontend image:

```bash
cd frontend
npm run build
cd ..

docker compose up -d --build --force-recreate frontend
```

The frontend Docker image currently serves the prebuilt `frontend/dist/` directory. Ensure this directory is available when building the frontend image.

For all services:

```bash
docker compose up -d --build
```

## Stopping the Application

To stop the complete application:

```bash
docker compose down
```

To start it again:

```bash
docker compose up -d
```

Your PostgreSQL data remains stored in the persistent Docker volume.

## Running Backend Integration Tests

The project includes backend integration tests to verify API endpoints, database interactions, and admission workflows.

### Prerequisites

- .NET SDK 10.0
- PostgreSQL 16
- A dedicated PostgreSQL test database

### 1. Configure Test Database

Set the `TEST_DATABASE_CONNECTION` environment variable with your test database connection string.

Example for Linux/macOS:

```bash
export TEST_DATABASE_CONNECTION="Host=localhost;Port=5432;Database=school_admission_test;Username=postgres;Password=your_password"
```

**Important:** Use a dedicated test database. Do not use production or application data for integration testing.

### 2. Run Integration Tests

From the repository root:

```bash
dotnet test backend/SchoolAdmission.Tests/SchoolAdmission.Tests.csproj
```

### 3. Run with Detailed Output

```bash
dotnet test backend/SchoolAdmission.Tests/SchoolAdmission.Tests.csproj --logger "console;verbosity=normal"
```

### 4. Run a Specific Test

```bash
dotnet test backend/SchoolAdmission.Tests/SchoolAdmission.Tests.csproj \
  --filter "FullyQualifiedName~ConcurrencyApiTests"
```

If test another replace `ConcurrencyApiTests` with the relevant test class or method name to filter the tests.

### Integration Test Coverage

The integration tests verify the following backend functionality:

- Class creation and retrieval.
- Admission hold creation.
- Duplicate active application prevention.
- Seat availability validation.
- Admission confirmation.
- Student ownership validation.
- API response status codes.
- Database-backed admission workflows.

## License

This project was developed as part of a software engineering assignment.
