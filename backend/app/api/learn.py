from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.services.dedalus_client import dedalus_client

router = APIRouter()

class ChatMessage(BaseModel):
    role: str  # 'user' or 'assistant'
    content: str

class LearnChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []

class LearnChatResponse(BaseModel):
    response: str

LEARN_SYSTEM_PROMPT = """You are CloudCode Learn, an expert cloud computing educator. Your role is to help users learn about cloud computing concepts, services, and best practices.

Your expertise covers:
- **Cloud Fundamentals**: IaaS, PaaS, SaaS, deployment models, scalability, availability
- **Major Cloud Providers**: AWS, Google Cloud Platform (GCP), Microsoft Azure
- **Compute Services**: EC2, Lambda, Cloud Functions, Azure VMs, Kubernetes, ECS, EKS
- **Storage Services**: S3, EBS, Cloud Storage, Azure Blob, databases (RDS, DynamoDB, Cloud SQL)
- **Networking**: VPCs, subnets, load balancers, CDNs, DNS, API Gateway
- **Security**: IAM, encryption, security groups, compliance, zero trust
- **Serverless Architecture**: Functions, event-driven design, cost optimization
- **DevOps & IaC**: Terraform, CloudFormation, CI/CD, monitoring

Guidelines:
1. Explain concepts clearly with practical examples
2. Compare services across different cloud providers when relevant
3. Provide code snippets or configuration examples when helpful
4. Suggest best practices and common patterns
5. Keep explanations beginner-friendly but accurate
6. Use analogies to explain complex concepts

Always be encouraging and patient. Cloud computing can be complex, so break down concepts into digestible pieces."""

@router.post("/chat", response_model=LearnChatResponse)
async def learn_chat(request: LearnChatRequest):
    """
    Educational chatbot for cloud computing learning.
    Uses the Dedalus LLM client with a specialized education prompt.
    """
    try:
        # Build context from history if provided
        context = ""
        if request.history:
            for msg in request.history[-6:]:  # Keep last 6 messages for context
                role_label = "User" if msg.role == "user" else "Assistant"
                context += f"{role_label}: {msg.content}\n\n"
        
        user_message = request.message
        if context:
            user_message = f"Previous conversation:\n{context}\nCurrent question: {request.message}"
        
        response = await dedalus_client.generate(
            system_prompt=LEARN_SYSTEM_PROMPT,
            user_message=user_message,
            temperature=0.7  # Slightly higher for more engaging educational responses
        )
        
        return LearnChatResponse(response=response)
        
    except Exception as e:
        print(f"Error in learn chat: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate response: {str(e)}"
        )
