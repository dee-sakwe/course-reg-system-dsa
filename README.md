# Course Registration System

A university course registration system with a TypeScript/React frontend and Python backend.

## Project Structure

```
course-reg-system-dsa/
├── frontend/                 # React + TypeScript frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API service layer
│   │   ├── types/           # TypeScript type definitions
│   │   └── utils/           # Utility functions
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── backend/                  # Python FastAPI backend
│   ├── api/                 # API route handlers
│   ├── models/              # Data models and schemas
│   ├── services/            # Business logic
│   ├── utils/               # Utility functions
│   ├── main.py              # Application entry point
│   └── requirements.txt
└── README.md
```

## Features

- **Course Catalog**: Browse and search available courses
- **Student Dashboard**: View enrollment status and statistics
- **Course Enrollment**: Enroll in and drop courses
- **Schedule Management**: View and manage course schedules
- **Modern UI**: Built with AWS Cloudscape Design System

## Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Python** (3.9 or higher)
- **pip**

## Frontend Setup

The frontend is built with React, TypeScript, Vite, and AWS Cloudscape components.

### Installation

```bash
cd frontend
npm install
```

### Development

```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Build

```bash
npm run build
```

### Lint

```bash
npm run lint
```

## Backend Setup

The backend is built with FastAPI and Python.

### Installation

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Development

```bash
python main.py
```

The API will be available at `http://localhost:8000`

### API Documentation

Once the backend is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## API Endpoints

### Courses
- `GET /courses` - Get all courses
- `GET /courses/{id}` - Get course by ID
- `GET /courses/search?q=query` - Search courses
- `POST /courses` - Create a new course

### Students
- `GET /students/{id}` - Get student by ID
- `GET /students/{id}/schedule` - Get student's schedule
- `POST /students` - Create a new student

### Enrollments
- `POST /enrollments` - Enroll in a course
- `DELETE /enrollments/{id}` - Drop a course

## Development Workflow

1. **Start Backend**:
   ```bash
   cd backend
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   python main.py
   ```

2. **Start Frontend** (in a new terminal):
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access the Application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

## Technology Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **AWS Cloudscape** - UI component library
- **ESLint** - Code linting

### Backend
- **FastAPI** - Modern Python web framework
- **Pydantic** - Data validation
- **Uvicorn** - ASGI server
- **SQLAlchemy** - ORM (ready for database integration)

## Next Steps

### For Frontend Developers
1. Customize the UI components in `frontend/src/components/`
2. Add new pages in `frontend/src/pages/`
3. Update API service calls in `frontend/src/services/api.ts`
4. Modify types in `frontend/src/types/index.ts`

### For Backend Developers
1. Implement database models and migrations
2. Add business logic in `backend/services/`
3. Extend API endpoints in `backend/api/`
4. Add authentication and authorization
5. Implement data validation and error handling

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

This project is for educational purposes.
