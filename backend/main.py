from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel , Field 
import uvicorn

from app.services.llm_factory import LLMFactory

#Initialize FastAPI app and LLMFactory

app = FastAPI(title="BiasBench API", version="1.0.0")

# Configure CORS to allow Next.js (port 3000) to communicate with this backend (port 8000)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Wildcard allows Next.js to connect from ANY local IP
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Spin up the AI engine 

llm_engine = LLMFactory()

# Input Validation Schema 

class PromptRequest(BaseModel):
    prompt:str = Field(..., min_length=5 ,max_length=500)

# Define the API endpoint to handle incoming prompts

@app.post("/api/audit")
async def run_audit(request:PromptRequest):
    try:
        results = await llm_engine.run_all(request.prompt)
        return {"status":"success", "data":results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Audit failed: {str(e)}")
    
    # Start the local server

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0" , port = 8000 , reload=True)