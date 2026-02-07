import json
import re
import logging
from app.services.dedalus_client import dedalus_client
from app.core.system_prompt import TERRAFORM_UPDATE_PROMPT
from app.models.schemas import DiagramDiff, UpdateResponse

logger = logging.getLogger(__name__)

async def update_terraform_from_changes(
    current_terraform: str,
    diff: DiagramDiff,
    new_diagram: dict
) -> dict:
    """
    Update Terraform based on diagram changes
    """
    print(f"----- UPDATE SERVICE CALLED -----")
    print(f"Diff Summary: Added={len(diff.added_nodes)}, Removed={len(diff.removed_nodes)}, Modified={len(diff.modified_nodes)}")
    
    # helper to format the diff for the prompt
    change_description = build_change_description(diff)
    
    user_message = f"""
CURRENT TERRAFORM:
```hcl
{current_terraform}
```

USER CHANGES:
{change_description}

NEW DIAGRAM STATE:
```json
{json.dumps(new_diagram, indent=2)}
```

Validate these changes and update Terraform if valid.
"""
    
    try:
        response = await dedalus_client.generate(
            system_prompt=TERRAFORM_UPDATE_PROMPT,
            user_message=user_message,
            temperature=0.2
        )
        
        # Parse logic
        return parse_llm_response(response, current_terraform)

    except Exception as e:
        logger.error(f"Error in update_terraform_from_changes: {e}")
        return {
            "valid": False,
            "connection_valid": False, # Assume failure means something went wrong
            "terraform": current_terraform,
            "errors": [f"System Error: {str(e)}"],
            "warnings": []
        }


def build_change_description(diff: DiagramDiff) -> str:
    """Convert diff into human-readable description"""
    parts = []
    
    if diff.added_nodes:
        parts.append("ADDED NODES:")
        for node in diff.added_nodes:
            parts.append(f"  - {node.data.label} ({node.data.service})")
            if node.data.terraformParams:
                parts.append(f"    Params: {json.dumps(node.data.terraformParams)}")
    
    if diff.removed_nodes:
        parts.append("\nREMOVED NODES:")
        for node in diff.removed_nodes:
            parts.append(f"  - {node.data.label} (ID: {node.id})")
    
    if diff.modified_nodes:
        parts.append("\nMODIFIED NODES:")
        for node in diff.modified_nodes:
             parts.append(f"  - {node.data.label}")
             # In a real app we'd show the param diff here
            
    if diff.added_edges:
        parts.append("\nADDED CONNECTIONS:")
        for edge in diff.added_edges:
            parts.append(f"  - {edge.source} -> {edge.target}")
            
    if diff.removed_edges:
        parts.append("\nREMOVED CONNECTIONS:")
        for edge in diff.removed_edges:
            parts.append(f"  - {edge.source} -> {edge.target}")
            
    return "\n".join(parts) if parts else "No significant changes detected."

def parse_llm_response(response: str, original_terraform: str) -> dict:
    """Extract sections from LLM XML-like response"""
    
    # Extract Analysis
    analysis_match = re.search(r'<analysis>(.*?)</analysis>', response, re.DOTALL)
    analysis = analysis_match.group(1).strip() if analysis_match else "Analysis not provided."
    
    # Extract Status
    status_match = re.search(r'<status>(.*?)</status>', response, re.DOTALL)
    status = status_match.group(1).strip().upper() if status_match else "INVALID"
    
    is_valid = (status == "VALID")
    
    # Extract Terraform
    terraform = original_terraform
    if is_valid:
        tf_match = re.search(r'<terraform>(.*?)</terraform>', response, re.DOTALL)
        if tf_match:
            terraform = tf_match.group(1).strip()
    
    # Extract Errors
    errors = []
    error_match = re.search(r'<error>(.*?)</error>', response, re.DOTALL)
    if error_match:
        err_text = error_match.group(1).strip()
        if err_text:
            errors.append(err_text)
            
    return {
        "valid": is_valid,
        "connection_valid": True, # If LLM parsed it, connection to LLM was ok
        "terraform": terraform,
        "analysis": analysis,
        "errors": errors,
        "warnings": [] # LLM prompt doesn't explicitly separate warnings yet, maybe in future
    }
