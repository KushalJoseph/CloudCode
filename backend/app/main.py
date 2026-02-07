import sys
from dotenv import load_dotenv
load_dotenv()

# Fix for Windows asyncio subprocess not implemented error
if sys.platform == 'win32':
    import asyncio
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.api import infrastructure, projects, learn
from app.core.database import connect_to_mongodb, close_mongodb_connection


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager - startup and shutdown events."""
    # Startup
    await connect_to_mongodb()
    yield
    # Shutdown
    await close_mongodb_connection()


app = FastAPI(
    title="Prompt to Infrastructure API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
# Allowing all origins for development simplicity
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(
    infrastructure.router,
    prefix="/api/infrastructure",
    tags=["infrastructure"]
)

app.include_router(
    learn.router,
    prefix="/api/learn",
    tags=["learn"]
)

app.include_router(
    projects.router,
    prefix="/api/projects",
    tags=["projects"]
)

@app.get("/health")
async def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
