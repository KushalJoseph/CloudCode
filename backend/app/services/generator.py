from app.services.dedalus_client import dedalus_client
from app.core.system_prompt import get_infrastructure_system_prompt
import re
import json
import logging

logger = logging.getLogger(__name__)

async def generate_infrastructure(
    user_prompt: str, 
    cloud_provider: str,
    current_terraform: str = None,
    current_diagram: dict = None
) -> dict:
    """
    Generate complete infrastructure from user prompt with ONE LLM call
    
    Args:
        user_prompt: Raw user input
        cloud_provider: "aws" | "gcp" | "azure"
        current_terraform: Existing Terraform code (optional)
        current_diagram: Existing diagram JSON (optional)
    
    Returns:
        {
            "refined_prompt": str,
            "terraform": str,
            "diagram": dict
        }
    """
    
    # Get system prompt
    system_prompt = get_infrastructure_system_prompt(
        cloud_provider, 
        current_terraform, 
        current_diagram
    )
    
    # Make single LLM call
    response = await dedalus_client.generate(
        system_prompt=system_prompt,
        user_message=user_prompt,
        temperature=0.3
    )
    
    # Parse response into 3 parts
    result = parse_llm_response(response)
    
    return result


def parse_llm_response(response: str) -> dict:
    """
    Extract the 3 sections from LLM response
    
    Expected format:
    <refined>...</refined>
    <terraform>...</terraform>
    <diagram>...</diagram>
    """
    
    logger.info("--- PARSING RESPONSE ---")
    
    # Extract refined prompt
    refined_match = re.search(
        r'<refined>(.*?)</refined>', 
        response, 
        re.DOTALL
    )
    refined_prompt = refined_match.group(1).strip() if refined_match else ""
    logger.info(f"Found Refined Prompt: {bool(refined_match)}")
    
    # Extract Terraform
    terraform_match = re.search(
        r'<terraform>(.*?)</terraform>', 
        response, 
        re.DOTALL
    )
    terraform_code = terraform_match.group(1).strip() if terraform_match else ""
    logger.info(f"Found Terraform Code: {bool(terraform_match)}")

    # Print Terraform to console for debugging
    if terraform_code:
        print("\n" + "="*50)
        print(" GENERATED TERRAFORM CODE ")
        print("="*50 + "\n")
        print(terraform_code)
        print("\n" + "="*50 + "\n")
    
    # Extract diagram JSON
    diagram_match = re.search(
        r'<diagram>(.*?)</diagram>', 
        response, 
        re.DOTALL
    )
    
    logger.info(f"Found Diagram JSON: {bool(diagram_match)}")
    
    diagram = {"nodes": [], "edges": []}
    if diagram_match:
        diagram_str = diagram_match.group(1).strip()
        
        # Print Diagram JSON to console for debugging
        print("\n" + "="*50)
        print(" GENERATED DIAGRAM JSON ")
        print("="*50 + "\n")
        print(diagram_str)
        print("\n" + "="*50 + "\n")

        try:
            diagram = json.loads(diagram_str)
            logger.info(f"Successfully parsed diagram JSON with {len(diagram.get('nodes', []))} nodes")
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse diagram JSON: {e}")
            logger.debug(f"Raw diagram string: {diagram_str[:100]}...")
            # In a real app, you might want to retry or sanitize the JSON
            # For now, return empty diagram on parse failure
    
    return {
        "refined_prompt": refined_prompt,
        "terraform": terraform_code,
        "diagram": diagram
    }
