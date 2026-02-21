from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel , Field 
import uvicorn
from dotenv import load_dotenv
from typing import List

from sqlalchemy.orm import Session
from app import models 
from app.database import engine, get_db
from app.services.llm_factory import LLMFactory

# create the SQLite tables on startup

models.Base.metadata.create_all(bind=engine)




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

# upgarde the request model to accept a list of chosen models

class PromptRequest(BaseModel):
    prompt:str = Field(..., min_length=5 ,max_length=500)
    models: List[str] = ["gemini", "llama_70b", "llama_8b"]


# Define the API endpoint to handle incoming prompts

@app.post("/api/audit")
async def run_audit(request:PromptRequest, db: Session = Depends(get_db)):
    try:
        results = await llm_engine.run_all(request.prompt , request.models)

        new_audit = models.AuditRecord(
            prompt = request.prompt,
            selected_models = request.models,
            responses = results["responses"],
            verdict = results["verdict"]
        )

        db.add(new_audit)
        db.commit()
        db.refresh(new_audit)

        # send the data back to react so we can display it on the frontend. We include the "status" field to make it easier for the frontend to handle errors in the future if we want to add that functionality.

        return {"status":"success", "data":results, "audit_id": new_audit.id}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Audit failed: {str(e)}")

@app.get("/api/history")

async def get_history(db: Session = Depends(get_db)):
    try : 
        #fetch the 10 ost recent audits , descending order by creation date

        past_audits = db.query(models.AuditRecord)\
        .order_by(models.AuditRecord.created_at.desc())\
        .limit(10)\
        .all()

        return {"status":"success", "data": past_audits}
    except Exception as e:
        print(f"Error fetching history: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    
    # Start the local server

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0" , port = 8000 , reload=True)