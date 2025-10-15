# Task Management API

A RESTful API for task management built with Flask and SQLAlchemy, fully containerized with Docker.

## Features

- **CRUD Operations**: Create, Read, Update, and Delete tasks
- **Task Filtering**: Filter tasks by status and priority
- **Status Management**: Track tasks as pending, in_progress, or completed
- **Priority Levels**: Organize tasks by low, medium, or high priority
- **Timestamps**: Automatic creation and update timestamps
- **Health Check**: Built-in health check endpoint
- **Docker Support**: Fully containerized with multi-stage builds
- **Production Ready**: Uses Gunicorn for production deployment

## Tech Stack

- **Python 3.11**
- **Flask** - Web framework
- **SQLAlchemy** - ORM for database operations
- **SQLite** - Database (can be easily switched to PostgreSQL/MySQL)
- **Gunicorn** - WSGI HTTP Server
- **Docker** - Containerization

## Quick Start

### Using Docker Compose (Recommended)

1. Build and run the application:
```bash
docker-compose up --build
```

2. The API will be available at `http://localhost:5000`

### Using Docker

1. Build the image:
```bash
docker build -t task-api .
```

2. Run the container:
```bash
docker run -p 5000:5000 task-api
```

### Local Development

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the application:
```bash
python app.py
```

## API Endpoints

### Get API Information
```bash
GET /
```

### Health Check
```bash
GET /health
```

### Get All Tasks
```bash
GET /tasks

# With filters
GET /tasks?status=pending
GET /tasks?priority=high
GET /tasks?status=in_progress&priority=medium
```

### Get Single Task
```bash
GET /tasks/{id}
```

### Create Task
```bash
POST /tasks
Content-Type: application/json

{
  "title": "Complete project documentation",
  "description": "Write comprehensive docs for the API",
  "status": "pending",
  "priority": "high"
}
```

### Update Task
```bash
PUT /tasks/{id}
Content-Type: application/json

{
  "status": "completed",
  "priority": "medium"
}
```

### Delete Task
```bash
DELETE /tasks/{id}
```

## Example Usage

### Create a task
```bash
curl -X POST http://localhost:5000/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Learn Docker",
    "description": "Complete Docker tutorial",
    "priority": "high"
  }'
```

### Get all tasks
```bash
curl http://localhost:5000/tasks
```

### Update a task
```bash
curl -X PUT http://localhost:5000/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed"
  }'
```

### Delete a task
```bash
curl -X DELETE http://localhost:5000/tasks/1
```

## Task Schema

| Field | Type | Required | Default | Options |
|-------|------|----------|---------|---------|
| title | string | Yes | - | - |
| description | string | No | "" | - |
| status | string | No | "pending" | pending, in_progress, completed |
| priority | string | No | "medium" | low, medium, high |
| created_at | datetime | Auto | - | - |
| updated_at | datetime | Auto | - | - |

## Docker Configuration

### Multi-stage Build
The Dockerfile uses a multi-stage build to optimize the final image size:
- **Builder stage**: Installs dependencies in a virtual environment
- **Production stage**: Copies only necessary files for a lean image

### Health Check
The container includes a health check that runs every 30 seconds to ensure the API is responding.

### Security Features
- Runs as non-root user
- Minimal base image (python:3.11-slim)
- No unnecessary packages

## Production Considerations

- **Database**: For production, consider switching to PostgreSQL or MySQL
- **Environment Variables**: Use `.env` files or secrets management
- **Logging**: Configure proper logging and log aggregation
- **Monitoring**: Add monitoring and alerting
- **Scaling**: Use Docker Swarm or Kubernetes for scaling

## License

MIT

