# TaskFlow

## 1. Overview
TaskFlow is a minimal, high-performance task management system designed to streamline project-centric workflows. It provides users the ability to organize tasks within projects, set priorities and statuses, and manage role-based permissions effectively. Only project owners can edit projects or assign tasks, enhancing accountability.

**Tech Stack:**
- **Frontend:** React, Vite, TailwindCSS
- **Backend:** Node.js, Express
- **Database:** MongoDB
- **ORM / ODM:** Mongoose

## 2. Architecture Decisions
- **MERN Stack (MongoDB, Express, React, Node.js):** Chosen for rapid development and its cohesive JavaScript ecosystem from top to bottom.
- **MongoDB & Mongoose:** Used for data persistence instead of PostgreSQL. Mongoose perfectly maps our relational needs (Users, Projects, Tasks) via `ObjectId` references while offering the schema-less document flexibility required for scalable JSON applications.
- **Structured Logging (Pino):** Integrated for high-performance structured logging, crucial for observability in a production environment. 
- **Dockerization:** The entire application (API, Nginx static host for the frontend, and MongoDB) is fully containerized with Docker Compose to create a smooth, reproducible development and production environment.
- **Tradeoffs:**
  - **Client-Side Structuring vs Server-Side:** While filtering/pagination occurs server-side, project grouping is intentionally implemented client-side. This trades some initial payload size for a far more responsive UI experience.
  - **Cookie-Fallback Authentication:** The primary mechanism is Bearer tokens, but a cookie-based fallback exists to ease interactions during browser testing.
  - **Testing:** Integration testing currently covers the critical path (auth & core data flows) but exhaustive unit test coverage was intentionally omitted to focus purely on the robustness of system interaction and feature delivery.

## 3. Running Locally
To test out the application, ensure Docker is installed.

```bash
# Clone the repository
git clone https://github.com/Raghul2103/taskflow-raghulkumar.git
cd taskflow

# Prepare environment variables
cp .env.example .env

# Start the full stack
docker compose up --build
```
*App is available at `http://localhost:80` (or simply `http://localhost`). API is available at `http://localhost:5000`.*

## 4. Running Migrations
The application utilizes `migrate-mongo` for schema and index-level setups. To run migrations explicitly:

```bash
cd backend
npx migrate-mongo up
```
If you wish to seed the initial database with a clean state (this creates test users, projects, and tasks automatically):
```bash
cd backend
node seed/seed.js
```

## 5. Test Credentials
You can log in immediately (without registering) using the automatically seeded credentials:

**Email:**    `raghul@gmail.com`  
**Password:** `12345678`

## 6. API Reference

Here are the primary endpoints and expected requests/responses.

### Authentication

**Login Route**  
`POST /api/auth/login`
```json
// Request Body
{
  "email": "raghul@gmail.com",
  "password": "12345678"
}

// Response
{
  "user": {
    "_id": "60d0fc8...",
    "name": "Raghul",
    "email": "raghul@gmail.com"
  },
  "token": "eyJhbG..."
}
```

### Projects

**Get All Projects**  
`GET /api/projects`
```json
// Request Headers: Authorization: Bearer <token>

// Response
[
  {
    "_id": "60d0fd8...",
    "name": "TaskFlow Development",
    "description": "Main project for developing the TaskFlow...",
    "owner": "60d0fc8...",
    "deadline": "2024-12-31T00:00:00.000Z"
  }
]
```

### Tasks

**Get My Tasks**  
`GET /api/tasks/my-tasks`
```json
// Request Headers: Authorization: Bearer <token>

// Response
[
  {
    "_id": "60ea...",
    "title": "Design UI Mockups",
    "description": "Create initial design for the task board.",
    "status": "done",
    "priority": "high",
    "project": "60d0fd8...",
    "assignee": "60d0fc8...",
    "dueDate": "2024-05-15T00:00:00.000Z"
  }
]
```

## 7. What You'd Do With More Time
If given more time, here is how I would scale and improve the application:
1. **Real-time WebSockets:** To give TaskFlow its true "collaboration" feel, integrating Socket.io would allow project participants to immediately observe tasks moving across columns without needing simple Optimistic UI hacks.
2. **Kanban Board Drag & Drop:** I'd migrate the static list view to a `react-beautiful-dnd` powered Kanban board specifically segmented by `status`.
3. **Comprehensive Coverage:** Increase testing coverage beyond the critical path (integrating Playwright for E2E flows to guarantee the frontend and backend talk correctly at scale).
4. **Enhanced Media Support:** Attach robust handling of binary assets (like AWS S3 file uploads) so users can attach images or resources to their tasks instead of just text logs.
5. **RBAC Extensibility:** Flesh out deeper Role-Based Access Control, potentially moving beyond just 'Owner' to include generic admin interfaces.
