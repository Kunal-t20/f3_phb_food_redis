from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import router
from database import engine, SessionLocal
import models
from auth import hash_password


# ---------------- CREATE TABLES ----------------
models.Base.metadata.create_all(bind=engine)


# ---------------- CREATE APP ----------------
app = FastAPI(
    title="Hunger Relief Network",
    description="API for food donation, inspection and distribution",
    version="1.0.0"
)


# ---------------- CORS ----------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------- AUTO CREATE ADMIN ----------------
def create_admin():
    db = SessionLocal()

    admin = db.query(models.User).filter(models.User.role == "admin").first()

    if not admin:
        new_admin = models.User(
            fullname="System Admin",
            email="admin123@gmail.com",
            password=hash_password("admin123"),
            role="admin"
        )

        db.add(new_admin)
        db.commit()
        print("Admin created successfully")

    else:
        print("Admin already exists")

    db.close()


# Run when server starts
create_admin()


# ---------------- ROUTERS ----------------
app.include_router(router, prefix="/api")


# ---------------- ROOT ----------------
@app.get("/")
def root():
    return {"message": "Hunger Relief Network API running"}