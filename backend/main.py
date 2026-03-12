from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import router
from database import engine
import models

# create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Food Redistribution System",
    description="API for food donation, inspection and distribution",
    version="1.0.0"
)

# CORS (required for React frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# include routers
app.include_router(router, prefix="/api")


@app.get("/")
def root():
    return {"message": "Food Redistribution API running"}