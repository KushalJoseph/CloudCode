from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class GenerateRequest(BaseModel):
    prompt: str = Field(..., description="User's infrastructure description")
    cloud_provider: str = Field(default="aws", description="aws|gcp|azure")
    current_terraform: Optional[str] = Field(default=None, description="Existing Terraform code if refining")
    current_diagram: Optional[Dict[str, Any]] = Field(default=None, description="Existing diagram JSON if refining")

class NodeData(BaseModel):
    label: str
    service: str
    resourceType: str
    icon: str
    color: str
    terraformParams: Dict[str, Any]  # ALL Terraform params
    description: Optional[str] = None
    cost: Optional[str] = None

class Node(BaseModel):
    id: str
    type: str
    data: NodeData
    position: Dict[str, float]

class Edge(BaseModel):
    id: str
    source: str
    target: str
    label: Optional[str] = None
    animated: bool = False

class Diagram(BaseModel):
    nodes: List[Node]
    edges: List[Edge]

class GenerateResponse(BaseModel):
    refined_prompt: str
    terraform: str
    diagram: Diagram
