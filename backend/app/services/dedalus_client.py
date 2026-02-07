import os
from dedalus_labs import Dedalus
from app.core.config import settings

class DedalusClient:
    """Wrapper around Dedalus SDK"""
    
    def __init__(self):
        # Initialize client with API key from settings
        # Note: In a real scenario, handle missing API key gracefully
        self.client = Dedalus(
            api_key=settings.DEDALUS_API_KEY
        )
        self.default_model = settings.DEFAULT_MODEL
    
    async def generate(
        self, 
        system_prompt: str,
        user_message: str,
        temperature: float = 0.3
    ) -> str:
        """
        Single LLM call
        Returns complete text response
        """
        # Using chat completions as per the plan
        completion = self.client.chat.completions.create(
            model=self.default_model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            temperature=temperature
        )
        
        # Accessing content safely
        return completion.choices[0].message.content

# Singleton instance
dedalus_client = DedalusClient()
