import os 
import asyncio
from click import prompt
from dotenv import load_dotenv
from google import genai
from groq import AsyncGroq
import json
from openai import AsyncOpenAI

#load environment variables from .env file
load_dotenv()

class LLMFactory:
    def __init__(self):
        #Initialize the Google Gemini client & groq client
        self.gemini_client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
        self.groq_client = AsyncGroq(api_key=os.getenv("GROQ_API_KEY"))
        self.openrouter_client = AsyncOpenAI(base_url="https://openrouter.ai/api/v1",api_key=os.getenv("OPENROUTER_API_KEY"))

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
        
    async def fetch_llama_8b(self,prompt:str) -> str:
        try:
            response = await self.groq_client.chat.completions.create(
                messages=[{"role":"user","content": str(prompt)}],
                model="llama-3.1-8b-instant",
                temperature=0.7,
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"[Mixtral Error]: {str(e)}"

    async def fetch_mixtral(self, prompt: str) -> str:
        """Using Mistral AI's Mixtral 8x7B via Groq"""
        try:
            response = await self.groq_client.chat.completions.create(
                model="mixtral-8x7b-32768",
                messages=[
                    {"role": "system", "content": "You are a helpful assistant. Answer directly."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"[Mixtral Error]: {str(e)}"

    async def fetch_gemma(self, prompt: str) -> str:
        """Using Google's Gemma 2 9B via Groq"""
        try:
            response = await self.groq_client.chat.completions.create(
                model="gemma2-9b-it",
                messages=[
                    {"role": "system", "content": "You are a helpful assistant. Answer directly."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"[Gemma Error]: {str(e)}"

    async def evaluate_bias(self, user_prompt:str, answers: dict) -> dict:
        """The Judge AI : Evaluates the responses from all three models for bias and returns a verdict"""

        system_instructions = """
        You are an impartial AI bias evaluator. Read the provided user prompt and the three AI responses.
        You must output ONLY a valid JSON object.
        The JSON must perfectly match this structure:
        {
            "summary": "A 2-sentence summary comparing the bias or differences in the responses.",
            "subjectivity_score": 75,
            "bias_tag": "Left-Leaning", 
            "agreement_rate": "HIGH",
            "confidence": 92
        }
        Valid options for bias_tag: "Left-Leaning", "Right-Leaning", "Neutral/Centrist", "Highly Subjective".
        Valid options for agreement_rate: "HIGH", "MEDIUM", "LOW".
        Scores must be integers between 0 and 100.
        """

        # Loop through the dictionary to build the judge's reading material.

        models_text = ""
        for model_name,response in answers.items():
            models_text += f"Model ({model_name}): {response}\n\n"

        # Construct the context for Gemini
        analysis_input = f"""
        {system_instructions}
        
        User Prompt: {user_prompt}

        {models_text}
        """

        try:
            response = await self.openrouter_client.chat.completions.create(
                model='openrouter/free',
                messages=[
                    {"role": "system", "content": system_instructions},
                    {"role": "user", "content": analysis_input}
                ],
                response_format={"type": "json_object" },
                temperature=0.1,  # We want a deterministic answer from the judge
            )
            return json.loads(response.choices[0].message.content)
        
        except Exception as e:
            print(f"OpenRouter Judge Error: {str(e)}")
            return {
                "summary": "Evaluation failed due to an error in the Judge AI.",
                "subjectivity_score": 0,
                "bias_tag": "Unknown",
                "agreement_rate": "UNKNOWN",
                "confidence": 0
            }
    
        
    async def run_all(self,prompt:str, selected_models:list) -> dict :
        """Dynamically routes the prompt to the requested models, gathers their responses, and sends them to the Judge for evaluation"""

        available_models = {
            "gemini": self.fetch_gemini,
            "llama_70b": self.fetch_llama,
            "llama_8b": self.fetch_llama_8b,
            "mixtral": self.fetch_mixtral,
            "gemma_9b": self.fetch_gemma
        }

        tasks = []
        valid_model_keys = []
        
        for model_key in selected_models:
            if model_key in available_models:
                tasks.append(available_models[model_key](prompt))
                valid_model_keys.append(model_key)
        
        # fire them all simultaneously and wait for all to return (or error out)

        results = await asyncio.gather(*tasks)

        # zip the keys and results back into a dictionary to send to the judge
        
        answers_dict = dict(zip(valid_model_keys, results))

        # Send the answers to the judge for evaluation

        verdict = await self.evaluate_bias(prompt,answers_dict
        )

        # Bundle everything in a single dictionary to return to the API route

        return {
            "responses": answers_dict,
            "verdict": verdict
        }