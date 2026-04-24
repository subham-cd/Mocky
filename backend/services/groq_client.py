import os
from groq import AsyncGroq
from dotenv import load_dotenv

load_dotenv()

class GroqClient:
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY")
        if not self.api_key:
            print("Warning: GROQ_API_KEY not found in environment variables.")
        self.client = AsyncGroq(api_key=self.api_key) if self.api_key else None

    async def get_json_completion(self, prompt: str, system_message: str = "You are a helpful assistant that only returns JSON."):
        if not self.client:
            raise Exception("Groq client not initialized. Check API key in .env file.")
            
        try:
            chat_completion = await self.client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": system_message + " Your response MUST be a valid JSON object.",
                    },
                    {
                        "role": "user",
                        "content": prompt,
                    }
                ],
                model="llama-3.3-70b-versatile",
                response_format={"type": "json_object"},
            )
            return chat_completion.choices[0].message.content
        except Exception as e:
            raise Exception(f"Groq JSON API Error: {str(e)}")

    async def get_completion(self, prompt: str, system_message: str = "You are a helpful assistant."):
        if not self.client:
            raise Exception("Groq client not initialized. Check API key in .env file.")
            
        try:
            chat_completion = await self.client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": system_message,
                    },
                    {
                        "role": "user",
                        "content": prompt,
                    }
                ],
                model="llama-3.3-70b-versatile",
            )
            return chat_completion.choices[0].message.content
        except Exception as e:
            raise Exception(f"Groq API Error: {str(e)}")

    async def get_chat_completion(self, messages: list, system_message: str = "You are a helpful assistant."):
        if not self.client:
            raise Exception("Groq client not initialized. Check API key in .env file.")
            
        try:
            full_messages = [{"role": "system", "content": system_message}] + messages
            chat_completion = await self.client.chat.completions.create(
                messages=full_messages,
                model="llama-3.3-70b-versatile",
            )
            return chat_completion.choices[0].message.content
        except Exception as e:
            raise Exception(f"Groq Chat API Error: {str(e)}")

groq_client = GroqClient()
