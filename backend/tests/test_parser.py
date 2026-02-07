import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.services.generator import parse_llm_response
import json

def test_parsing():
    mock_response = """
Here is the infrastructure you requested.

<refined>
A refined prompt describing a simple API with AWS Lambda.
</refined>

<terraform>
resource "aws_lambda_function" "test" {
  filename = "function.zip"
}
</terraform>

<diagram>
{
  "nodes": [{"id": "1", "type": "function", "data": {"label": "Lambda"}}],
  "edges": []
}
</diagram>
    """

    result = parse_llm_response(mock_response)

    assert result["refined_prompt"] == "A refined prompt describing a simple API with AWS Lambda."
    assert 'resource "aws_lambda_function" "test"' in result["terraform"]
    assert len(result["diagram"]["nodes"]) == 1
    
    print("Parsing test passed!")

if __name__ == "__main__":
    test_parsing()
