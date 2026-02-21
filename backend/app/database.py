from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

SQLALCHEMY_DATABASE_URL = "sqlite:///./biasbench.db"

# we must add connect_args={"check_same_thread": False} for SQLite to allow multiple threads to access the database

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}
)

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