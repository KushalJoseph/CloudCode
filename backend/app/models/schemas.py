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
    terraformParams: Optional[Dict[str, Any]] = {}  # ALL Terraform params
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

class DiagramDiff(BaseModel):
    added_nodes: List[Node] = []
    removed_nodes: List[Node] = []
    modified_nodes: List[Node] = []
    added_edges: List[Edge] = []
    removed_edges: List[Edge] = []

class UpdateRequest(BaseModel):
    current_terraform: str
    old_diagram: Diagram
    new_diagram: Diagram
    diff: DiagramDiff

class UpdateResponse(BaseModel):
    valid: bool
    connection_valid: bool = True
    terraform: Optional[str] = None
    analysis: Optional[str] = None
    errors: Optional[List[str]] = None
    warnings: Optional[List[str]] = None

class DeployRequest(BaseModel):
    terraform_code: str = Field(..., description="Terraform code to deploy")
    region: str = Field(default="us-east-1", description="AWS Region")

class DeployResponse(BaseModel):
    success: bool
    message: str
    logs: str
    outputs: Optional[Dict[str, Any]] = None
