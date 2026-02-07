from fastapi import APIRouter, HTTPException
from app.models.schemas import GenerateRequest, GenerateResponse
from app.services.generator import generate_infrastructure

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
            cloud_provider=request.cloud_provider
        )
        
        return GenerateResponse(**result)
        
    except Exception as e:
        # In production, log the error details
        print(f"Error during generation: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Generation failed: {str(e)}"
        )
