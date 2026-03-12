from database import SessionLocal
from models import User
from auth import hash_password

db = SessionLocal()

# check if admin exists
admin = db.query(User).filter(User.role == "admin").first()

if admin:
    print("Admin already exists")
else:
    new_admin = User(
        fullname="System Admin",
        email="admin123@gmail.com",
        password=hash_password("admin123"),
        role="admin"
    )

    db.add(new_admin)
    db.commit()

    print("Admin created successfully")

db.close()