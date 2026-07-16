from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel , Field 
from requests import session
import uvicorn
from dotenv import load_dotenv
from typing import List

from sqlalchemy.orm import Session
from app import models 
from app.database import engine, get_db, SessionLocal
from app.services.llm_factory import LLMFactory
from fastapi import HTTPException, BackgroundTasks
import uuid

# 1. Global dictionary to temporarily store job states
JOBS = {}

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


# Background execution function
async def process_audit(job_id: str, request: PromptRequest):
    try:
        results = await llm_engine.run_all(request.prompt, request.models)
        
        # Open an isolated session for this background task
        db = SessionLocal()
        try:
            new_audit = models.AuditRecord(
                prompt = request.prompt,
                selected_models = request.models,
                responses = results["responses"],
                verdict = results["verdict"]
            )
            db.add(new_audit)
            db.commit()
            db.refresh(new_audit)
            
            JOBS[job_id] = {
                "status": "completed",
                "data": {"status": "success", "data": results, "audit_id": new_audit.id}
            }
        finally:
            db.close()
            
    except Exception as e:
        JOBS[job_id] = {
            "status": "failed",
            "error": str(e)
        }

@app.post("/api/audit")
async def run_audit(request:PromptRequest, background_tasks: BackgroundTasks):
    job_id = str(uuid.uuid4())
    JOBS[job_id] = {"status": "processing", "data": None}
    background_tasks.add_task(process_audit, job_id, request)
    return {"job_id": job_id}

@app.get("/api/jobs/{job_id}")
async def get_job_status(job_id: str):
    job = JOBS.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@app.get("/api/history")

async def get_history(db: Session = Depends(get_db)):
    try : 
        #fetch the 10 most recent audits , descending order by creation date

        past_audits = db.query(models.AuditRecord)\
        .order_by(models.AuditRecord.created_at.desc())\
        .limit(10)\
        .all()

        return {"status":"success", "data": past_audits}
    except Exception as e:
        print(f"Error fetching history: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    
@app.delete("/api/history/{audit_id}")
def delete_audit(audit_id: int, db : session = Depends(get_db)):

    # Search the database for the specific audit ID
    audit = db.query(models.AuditRecord).filter(models.AuditRecord.id == audit_id).first()

    # if someone tries to delete something that does not exist 

    if not audit:
        raise HTTPException(status_code=404, detail="Audit not found")
    
    # delete it from the database and save the changes 
    
    db.delete(audit)
    db.commit()

    return {"message": f"Audit with ID {audit_id} has been deleted successfully."}

@app.get("/api/cron")
@app.get("/api/cron/")
@app.get("/cron")
@app.get("/cron/")
@app.get("/health")
@app.get("/health/")
def cron_ping():
    """
    Lightweight endpoint to keep the Render service awake.
    Render spins down after 15 minutes of inactivity, so pinging this endpoint
    every 14 minutes will prevent it from shutting down.
    Supports /api/cron, /cron, and /health (with or without trailing slashes).
    """
    return {"status": "healthy", "message": "Keep-alive successful"}

    # Start the local server

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0" , port = 8000 , reload=True)