"""Projects API router - CRUD operations for cloud architecture projects."""

from fastapi import APIRouter, HTTPException, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field

from app.core.database import get_database
from app.models.schemas import Diagram


# Request/Response models
class ProjectCreate(BaseModel):
    """Request model for creating a project."""
    title: str
    description: str = ""
    provider: str = "AWS"  # AWS | GCP | Azure
    user_id: Optional[str] = None  # For future auth
    diagram: Optional[dict] = None
    terraform: Optional[str] = None
    chat_history: Optional[List[dict]] = None


class ProjectUpdate(BaseModel):
    """Request model for updating a project."""
    title: Optional[str] = None
    description: Optional[str] = None
    provider: Optional[str] = None
    diagram: Optional[Diagram] = None
    terraform: Optional[str] = None
    chat_history: Optional[List[dict]] = None


class ProjectResponse(BaseModel):
    """Response model for a project."""
    id: str
    title: str
    description: str
    provider: str
    user_id: Optional[str] = None
    diagram: Optional[Diagram] = None
    terraform: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


router = APIRouter()


def project_helper(project: dict) -> dict:
    """Convert MongoDB document to response format."""
    return {
        "id": str(project["_id"]),
        "title": project.get("title", ""),
        "description": project.get("description", ""),
        "provider": project.get("provider", "AWS"),
        "user_id": project.get("user_id"),
        "diagram": project.get("diagram"),
        "terraform": project.get("terraform"),
        "chat_history": project.get("chat_history", []),
        "created_at": project.get("created_at", datetime.utcnow()),
        "updated_at": project.get("updated_at", datetime.utcnow()),
    }


@router.get("/", response_model=List[ProjectResponse])
async def list_projects(
    user_id: Optional[str] = None,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """List all projects, optionally filtered by user_id."""
    query = {}
    if user_id:
        query["user_id"] = user_id
    
    projects = []
    cursor = db.projects.find(query).sort("updated_at", -1)
    async for project in cursor:
        projects.append(project_helper(project))
    
    return projects


@router.post("/", response_model=ProjectResponse, status_code=201)
async def create_project(
    project: ProjectCreate,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Create a new project."""
    now = datetime.utcnow()
    
    project_doc = {
        "title": project.title,
        "description": project.description,
        "provider": project.provider,
        "user_id": project.user_id,
        "diagram": project.diagram.dict() if project.diagram and hasattr(project.diagram, 'dict') else project.diagram,
        "terraform": project.terraform,
        "chat_history": project.chat_history or [],
        "created_at": now,
        "updated_at": now,
    }
    
    result = await db.projects.insert_one(project_doc)
    project_doc["_id"] = result.inserted_id
    
    return project_helper(project_doc)


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get a project by ID with full diagram data."""
    try:
        object_id = ObjectId(project_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid project ID format")
    
    project = await db.projects.find_one({"_id": object_id})
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    return project_helper(project)


@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: str,
    update: ProjectUpdate,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Update a project (diagram, terraform, metadata)."""
    try:
        object_id = ObjectId(project_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid project ID format")
    
    # Build update document with only provided fields
    update_doc = {"updated_at": datetime.utcnow()}
    
    if update.title is not None:
        update_doc["title"] = update.title
    if update.description is not None:
        update_doc["description"] = update.description
    if update.provider is not None:
        update_doc["provider"] = update.provider
    if update.diagram is not None:
        # Convert Pydantic model to dict
        update_doc["diagram"] = update.diagram.dict() if hasattr(update.diagram, 'dict') else update.diagram.model_dump()
    if update.terraform is not None:
        update_doc["terraform"] = update.terraform
    if update.chat_history is not None:
        update_doc["chat_history"] = update.chat_history
    
    result = await db.projects.find_one_and_update(
        {"_id": object_id},
        {"$set": update_doc},
        return_document=True
    )
    
    if not result:
        raise HTTPException(status_code=404, detail="Project not found")
    
    return project_helper(result)


@router.delete("/{project_id}", status_code=204)
async def delete_project(
    project_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Delete a project."""
    try:
        object_id = ObjectId(project_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid project ID format")
    
    result = await db.projects.delete_one({"_id": object_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    
    return None
