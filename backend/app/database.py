from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

import os
from dotenv import load_dotenv

# Load environment variables from .env BEFORE reading os.getenv
load_dotenv()

raw_db_url = os.getenv("DATABASE_URL", "sqlite:///./biasbench.db")

if "sqlite" in raw_db_url:
    engine = create_engine(raw_db_url, connect_args={"check_same_thread": False})
else:
    SQLALCHEMY_DATABASE_URL = raw_db_url.replace("postgres://", "postgresql+psycopg://", 1).replace("postgresql://", "postgresql+psycopg://", 1)
    engine = create_engine(SQLALCHEMY_DATABASE_URL)

# this is the "factory" that will create new database sessions for us whenever we need to interact with the database

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# The base class that all out future database models will inherit from. It contains the metadata and other information about the database schema.

Base = declarative_base()

# A generator function that will create a new database session for each request and ensure that it is properly closed after the request is done.

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()