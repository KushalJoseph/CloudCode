from fastapi import APIRouter, HTTPException
from app.models.schemas import GenerateRequest, GenerateResponse, UpdateRequest, UpdateResponse
from app.services.generator import generate_infrastructure
from app.services.updater import update_terraform_from_changes

router = APIRouter()

@router.post("/generate", response_model=GenerateResponse)
async def generate(request: GenerateRequest):
    """
    Generate infrastructure from user prompt
    
    Single LLM call returns:
    - Refined prompt
    - Terraform code
    - Visual diagram (with complete params in each node)
    """
    
    try:
        result = await generate_infrastructure(
            user_prompt=request.prompt,
            cloud_provider=request.cloud_provider,
            current_terraform=request.current_terraform,
            current_diagram=request.current_diagram
        )
        
        return GenerateResponse(**result)
        
    except Exception as e:
        # In production, log the error details
        print(f"Error during generation: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Generation failed: {str(e)}"
        )

@router.post("/update", response_model=UpdateResponse)
async def update_infrastructure(request: UpdateRequest):
    """
    Update infrastructure based on diagram changes
    """
    print("----- RECEIVED UPDATE REQUEST -----")
    print(f"Diff: {request.diff}")
    print(f"New Diagram Node Count: {len(request.new_diagram.nodes)}")
    
    try:
        # Convert Pydantic model to dict for internal service
        # Support both Pydantic v1 and v2
        new_diagram_dict = request.new_diagram.dict() if hasattr(request.new_diagram, 'dict') else request.new_diagram.model_dump()
        
        result = await update_terraform_from_changes(
            current_terraform=request.current_terraform,
            diff=request.diff,
            new_diagram=new_diagram_dict
        )
        return UpdateResponse(**result)
    except Exception as e:
        print(f"Error during update: {e}")
        raise HTTPException(status_code=500, detail=str(e))
