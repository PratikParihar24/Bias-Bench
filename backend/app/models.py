from sqlalchemy import Column, Integer , String, JSON , DateTime
from datetime import datetime 
from app.database import Base 

class AuditRecord(Base):
    __tablename__ = "audits"

    id = Column(Integer, primary_key=True,index=True)
    prompt = Column(String,index=True)

    # We use JSON columns because our data shapes are dictionaries/arrays!

    selected_models = Column(JSON)
    responses = Column(JSON)
    verdict = Column(JSON)

    created_at = Column(DateTime, default=datetime.utcnow)