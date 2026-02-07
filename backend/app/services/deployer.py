import os
import shutil
import tempfile
import asyncio
import json
import logging
import subprocess
from fastapi import HTTPException
from app.models.schemas import DeployResponse

# Configure logging
logger = logging.getLogger(__name__)

async def deploy_terraform_to_aws(terraform_code: str, region: str = "us-east-1") -> dict:
    """
    Deploys the given Terraform code to AWS.
    
    Args:
        terraform_code: The Terraform configuration string.
        region: The AWS region to deploy to.
        
    Returns:
        dict: Result containing success status, logs, and outputs.
    """
    
    # Create a temporary directory for the Terraform workspace
    with tempfile.TemporaryDirectory() as temp_dir:
        logger.info(f"Created temporary directory for Terraform: {temp_dir}")
        
        # Write the Terraform code to main.tf
        main_tf_path = os.path.join(temp_dir, "main.tf")
        with open(main_tf_path, "w") as f:
            f.write(terraform_code)
            
        # Prepare environment variables
        env = os.environ.copy()
        env["AWS_DEFAULT_REGION"] = region
        # AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY should already be in env
        
        logs = []
        
        try:
            # Helper function to run command synchronously
            def run_command(command, cwd, env):
                result = subprocess.run(
                    command,
                    cwd=cwd,
                    env=env,
                    capture_output=True,
                    text=True
                )
                return result

            # 1. Terraform Init
            logger.info("Running terraform init...")
            init_result = await asyncio.to_thread(
                run_command, ["terraform", "init", "-no-color"], temp_dir, env
            )
            logs.append(f"--- Init Output ---\n{init_result.stdout}\n{init_result.stderr}")
            
            if init_result.returncode != 0:
                raise Exception(f"Terraform init failed: {init_result.stderr}")

            # 2. Terraform Apply
            logger.info("Running terraform apply...")
            apply_result = await asyncio.to_thread(
                run_command, ["terraform", "apply", "-auto-approve", "-no-color"], temp_dir, env
            )
            logs.append(f"--- Apply Output ---\n{apply_result.stdout}\n{apply_result.stderr}")
            
            if apply_result.returncode != 0:
                 raise Exception(f"Terraform apply failed: {apply_result.stderr}")
            
            # 3. Terraform Output (to get resource details)
            logger.info("Running terraform output...")
            output_result = await asyncio.to_thread(
                run_command, ["terraform", "output", "-json", "-no-color"], temp_dir, env
            )
            
            outputs = {}
            if output_result.returncode == 0 and output_result.stdout:
                try:
                    outputs = json.loads(output_result.stdout)
                except json.JSONDecodeError:
                    logs.append(f"Warning: Could not parse terraform output JSON: {output_result.stdout}")

            return {
                "success": True,
                "message": "Deployment successful",
                "logs": "\n".join(logs),
                "outputs": outputs
            }
            
        except Exception as e:
            logger.error(f"Deployment failed: {e}", exc_info=True)
            return {
                "success": False,
                "message": f"Deployment failed: {type(e).__name__}: {str(e)}",
                "logs": "\n".join(logs),
                "outputs": None
            }
