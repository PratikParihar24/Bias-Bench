import os 
import asyncio
from click import prompt
from dotenv import load_dotenv
from google import genai
from groq import AsyncGroq
import json

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

        # Construct the context for Gemini
        analysis_input = f"""
        {system_instructions}
        
        User Prompt: {user_prompt}
        
        Model A (Gemini): {answers.get('gemini')}
        Model B (Llama 70B): {answers.get('llama_70b')}
        Model C (Llama 8B): {answers.get('llama_8b')}
        """

        try: 
            # Call the gemini client using 'aio' sync as the judge becausee of its high reasoninng capabilities .. 

            response = await self.gemini_client.aio.models.generate_content(
                model='gemini-2.5-flash',
                contents=str(analysis_input),
                #force json mode
                config={'response_mime_type': 'application/json' }
            )

            return json.loads(response.text)
        
        except Exception as e:
            print(f"Gemini Judge Error: {str(e)}")

            return {
                "summary": "The Judge (Gemini) encountered an error during evaluation.",
                "subjectivity_score": 0,
                "bias_tag": "Unknown",
                "agreement_rate": "UNKNOWN",
                "confidence": 0
            }
    
        
    async def run_all(self,prompt:str) -> dict :
        """Runs all three models concurrently and bundles the results in a dictionary"""

        gemini_res,llama_res,mixtral_res = await asyncio.gather(
            self.fetch_gemini(prompt),
            self.fetch_llama(prompt),
            self.fetch_mixtral(prompt)
        )
        
        answers_dict={
            "gemini": gemini_res,
            "llama_70b": llama_res,
            "llama_8b": mixtral_res 
        }

        # Send the answers to the judge for evaluation

        verdict = await self.evaluate_bias(prompt,answers_dict
        )

        # Bundle everything in a single dictionary to return to the API route

        return {
            "responses": answers_dict,
            "verdict": verdict
        }