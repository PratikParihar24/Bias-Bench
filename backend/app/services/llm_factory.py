import os 
import asyncio
from click import prompt
from dotenv import load_dotenv
from google import genai
from groq import AsyncGroq

#load environment variables from .env file
load_dotenv()

class LLMFactory:
    def __init__(self):
        #Initialize the Google Gemini client & groq client
        self.gemini_client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
        self.groq_client = AsyncGroq(api_key=os.getenv("GROQ_API_KEY"))

    async def fetch_gemini(self,prompt:str) -> str:
        try:
            # The .aio accesor ensures this network request does not block the server
            response = await self.gemini_client.aio.models.generate_content(
                model='gemini-2.5-flash',
                contents=str(prompt),
            )
            return response.text
        except Exception as e:
            return f"[Gemini Error]: {str(e)}"

    async def fetch_llama(self,prompt:str) -> str:
        try:
            response = await self.groq_client.chat.completions.create(
                messages=[{"role":"user","content": str(prompt)}],
                model="llama-3.3-70b-versatile",
                temperature=0.7,
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"[Llama Error]: {str(e)}"
        
    async def fetch_mixtral(self,prompt:str) -> str:
        try:
            response = await self.groq_client.chat.completions.create(
                messages=[{"role":"user","content": str(prompt)}],
                model="llama-3.1-8b-instant",
                temperature=0.7,
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"[Mixtral Error]: {str(e)}"
        
    async def run_all(self,prompt:str) -> dict :
        """Runs all three models concurrently and bundles the results in a dictionary"""

        gemini_res,llama_res,mixtral_res = await asyncio.gather(
            self.fetch_gemini(prompt),
            self.fetch_llama(prompt),
            self.fetch_mixtral(prompt)
        )
        return {
            "gemini":gemini_res,
            "llama":llama_res,
            "mixtral":mixtral_res
        }