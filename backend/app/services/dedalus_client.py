import os
import logging
from dedalus_labs import Dedalus
from app.core.config import settings

# Setup logger
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

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
        logger.info("--- SENDING REQUEST TO DEDALUS ---")
        logger.info(f"Model: {self.default_model}")
        logger.info(f"System Prompt (truncated): {system_prompt[:100]}...")
        logger.info(f"User Message: {user_message}")
        
        try:
            # Using chat completions as per the plan
            completion = self.client.chat.completions.create(
                model=self.default_model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message}
                ],
                temperature=temperature
            )
            
            content = completion.choices[0].message.content
            
            logger.info("--- RECEIVED RESPONSE FROM DEDALUS ---")
            logger.info(f"Response (truncated 200 chars): {content[:200]}...")
            
            return content
            
        except Exception as e:
            logger.error(f"Error calling Dedalus: {str(e)}")
            raise e

# Singleton instance
dedalus_client = DedalusClient()
