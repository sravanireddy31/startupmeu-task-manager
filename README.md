# StartupMeu Task Manager

A full-stack MERN task manager for creating, tracking, updating, and deleting tasks. The application pairs a responsive React dashboard with an Express API backed by MongoDB.

Repository: [sravanireddy31/startupmeu-task-manager](https://github.com/sravanireddy31/startupmeu-task-manager)

## Features

- Create tasks with a title, optional description, and status.
- View tasks ordered by newest first, including creation date and completion progress.
- Edit task details and status, or delete a task after confirmation.
- Responsive dashboard with loading, empty, success, and error states.
- Retry initial task loading without refreshing the browser.
- Prevent duplicate save and delete requests while an operation is in progress.
- Validate task input in both the client and API.
- Return consistent API responses with `success`, `data`, `message`, and `errors` where applicable.

## Tech stack

- **Frontend:** React, Vite
- **Backend:** Node.js, Express
- **Database:** MongoDB, Mongoose

## Project structure

```text
.
├── backend/
│   ├── models/
│   │   └── Task.js
│   ├── routes/
│   │   └── taskRoutes.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── App.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   └── package.json
└── README.md
```

## Prerequisites

- Node.js (current LTS recommended)
- npm
- A running MongoDB instance, either local or hosted

## Installation

Clone the repository and install dependencies for each application:

```bash
git clone https://github.com/sravanireddy31/startupmeu-task-manager.git
cd startupmeu-task-manager

cd backend
npm install

cd ../frontend
npm install
```

## Environment configuration

Environment files are ignored by Git. Create local `.env` files and do not commit secrets.

### Backend

Create `backend/.env`:

```env
MONGO_URI=your_mongodb_connection_string
PORT=5001
CLIENT_URL=http://localhost:5173
```

- `MONGO_URI` is the MongoDB connection string used by Mongoose.
- `PORT=5001` matches the default frontend API configuration.
- `CLIENT_URL` is the browser origin allowed by CORS.

### Frontend

Copy `frontend/.env.example` to `frontend/.env`, or create it with:

```env
VITE_API_URL=http://localhost:5001
```

`VITE_API_URL` is optional because the frontend falls back to `http://localhost:5001`, but setting it makes the API target explicit.

## Run locally

Start the backend in one terminal:

```bash
cd backend
npm run dev
```

Start the frontend in a second terminal:

```bash
cd frontend
npm run dev
```

Open the URL displayed by Vite (normally `http://localhost:5173`).

## REST API

Base URL: `http://localhost:5001/api/tasks`

| Method | Endpoint | Description | Success response |
| --- | --- | --- | --- |
| `POST` | `/api/tasks` | Create a task | `201` with `success` and `data` |
| `GET` | `/api/tasks` | List tasks, newest first | `200` with `success` and `data` |
| `GET` | `/api/tasks/:id` | Get one task | `200` with `success` and `data` |
| `PUT` | `/api/tasks/:id` | Partially update a task | `200` with `success` and `data` |
| `DELETE` | `/api/tasks/:id` | Delete a task | `200` with `success` and `message` |

Example request body for create or update:

```json
{
  "title": "Prepare sprint demo",
  "description": "Confirm the agenda and update the slides.",
  "status": "in-progress"
}
```

Supported statuses are `pending`, `in-progress`, and `completed`.

## Validation and error handling

The API validates incoming POST and PUT bodies before changing the database:

- Only `title`, `description`, and `status` fields are accepted.
- A title is required for new tasks, must be a string, cannot be blank, and is limited to 160 characters.
- `description` must be a string when supplied.
- `status` must be one of the supported status values.
- PUT accepts partial updates, but an empty update body is rejected.
- Invalid task IDs, missing tasks, malformed JSON, and JSON bodies larger than 10kb return appropriate error responses.

Validation failures return a `400` response in this form:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": ["Title cannot be empty"]
}
```

The frontend displays API errors, offers a retry action when initial task loading fails, and automatically clears successful-operation notices after three seconds.

## Manual testing

After starting MongoDB, the backend, and the frontend:

1. Create a task with a title, description, and each available status.
2. Confirm the new task appears at the top of the list and the progress count updates after marking one completed.
3. Edit a task title, description, or status and save the changes.
4. Delete a task and confirm it is removed after the confirmation prompt.
5. Try a blank title, a title longer than 160 characters, an invalid status, and an unexpected API field; each should be rejected with a clear error.
6. Stop the backend, reload the frontend to observe the loading error, then restart the backend and use **Retry**.

Frontend quality checks are available from `frontend/`:

```bash
npm run lint
npm run build
```

## AI Development Experience

CodeZero AI was used as a development assistant for focused, reviewed implementation work in this project. The Git history reflects the completed work, including:

- Building the responsive React task-management dashboard.
- Connecting the Express API to MongoDB and implementing task CRUD routes.
- Improving frontend API configuration, date safety, loading recovery, duplicate-request protection, and success notifications.
- Strengthening backend request validation, CORS configuration, request-size limits, and structured API error handling.

The application code, configuration, and behavior should be reviewed like any other project contribution. No environment secrets, deployment URLs, screenshots, or automated test claims are included in this repository documentation.
