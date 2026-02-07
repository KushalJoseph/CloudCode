
import asyncio
from unittest.mock import MagicMock, patch, AsyncMock
from app.services.deployer import deploy_terraform_to_aws
import json
import traceback

async def test_deployment():
    # Mock terraform code
    tf_code = """
    resource "aws_s3_bucket" "example" {
      bucket = "my-tf-test-bucket"
    }
    """
    
    # Mock the subprocess calls
    # create_subprocess_exec is an async function, so we mock it with AsyncMock
    with patch("asyncio.create_subprocess_exec", new_callable=AsyncMock) as mock_exec:
        # The process object returned
        mock_process = MagicMock()
        mock_process.returncode = 0
        # communicate is an async method
        mock_process.communicate = AsyncMock(return_value=(b"Success", b""))
        
        mock_exec.return_value = mock_process
        
        print("Testing deploy_terraform_to_aws...")
        try:
            result = await deploy_terraform_to_aws(tf_code, "us-east-1")
            
            with open("verify_result.json", "w") as f:
                json.dump(result, f, indent=2)
            
            if result["success"]:
                print("\n✅ Verification Successful: Deployment logic executed without errors.")
            else:
                print("\n❌ Verification Failed: Deployment returned error. See verify_result.json")
        except Exception:
             traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_deployment())
