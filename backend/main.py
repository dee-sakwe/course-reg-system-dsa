from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import courses_router, students_router, enrollments_router

app = FastAPI(
    title="Course Registration System API",
    description="Backend API for university course registration system",
    version="1.0.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(courses_router)
app.include_router(students_router)
app.include_router(enrollments_router)


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Course Registration System API",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
