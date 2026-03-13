from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
import models, schemas
from auth import (
    hash_password,
    verify_password,
    create_access_token,
    require_role
)

router = APIRouter(prefix="/api")


# ---------------- REGISTER ----------------

@router.post("/register", response_model=schemas.UserResponse)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):

    existing = db.query(models.User).filter(
        models.User.email == user.email
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = hash_password(user.password)

    new_user = models.User(
        fullname=user.fullname,
        email=user.email,
        password=hashed_password,
        role=user.role
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


# ---------------- LOGIN ----------------

@router.post("/login")
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):

    db_user = db.query(models.User).filter(
        models.User.email == user.email
    ).first()

    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token(
        {"user_id": db_user.id, "role": db_user.role}
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "role": db_user.role
    }


# ---------------- DONOR DONATE ----------------

@router.post("/donor/donate")
def donate_food(
    food: schemas.FoodCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_role("donor"))
):

    new_food = models.FoodItem(
        donor_id=current_user.id,
        name=food.name,
        quantity=food.quantity,
        category=food.category,
        latitude=food.latitude,
        longitude=food.longitude,
        status="Pending Inspection"
    )

    db.add(new_food)
    db.commit()
    db.refresh(new_food)

    return {
        "message": "Donation submitted",
        "food_id": new_food.id
    }


# ---------------- DONOR VIEW OWN DONATIONS ----------------

@router.get("/donor/my-donations")
def donor_donations(
    db: Session = Depends(get_db),
    current_user = Depends(require_role("donor"))
):

    foods = db.query(models.FoodItem).filter(
        models.FoodItem.donor_id == current_user.id
    ).all()

    return foods


# ---------------- DELETE DONATION ----------------

@router.delete("/donor/food/{food_id}")
def delete_donation(
    food_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_role("donor"))
):

    food = db.query(models.FoodItem).filter(
        models.FoodItem.id == food_id,
        models.FoodItem.donor_id == current_user.id
    ).first()

    if not food:
        raise HTTPException(status_code=404, detail="Food item not found")

    if food.status != "Pending Inspection":
        raise HTTPException(
            status_code=400,
            detail="Cannot delete donation after inspection"
        )

    db.delete(food)
    db.commit()

    return {"message": "Donation deleted"}


# ---------------- INSPECTOR VIEW PENDING ----------------

@router.get("/inspector/pending")
def pending_foods(
    db: Session = Depends(get_db),
    current_user = Depends(require_role("inspector"))
):

    foods = db.query(models.FoodItem).filter(
        models.FoodItem.status == "Pending Inspection"
    ).all()

    return foods


# ---------------- INSPECT FOOD ----------------

@router.post("/inspect/{food_id}")
def inspect_food(
    food_id: int,
    inspection: schemas.InspectionCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_role("inspector"))
):

    food = db.query(models.FoodItem).filter(
        models.FoodItem.id == food_id
    ).first()

    if not food:
        raise HTTPException(status_code=404, detail="Food not found")

    if food.status != "Pending Inspection":
        raise HTTPException(status_code=400, detail="Food already inspected")

    record = models.InspectionRecord(
        food_item_id=food_id,
        inspector_id=current_user.id,
        remarks=inspection.remarks,
        result=inspection.result
    )

    food.status = inspection.result

    db.add(record)
    db.commit()

    return {"message": f"Food {inspection.result}"}


# ---------------- INSPECTOR HISTORY ----------------

@router.get("/inspector/history")
def inspection_history(
    db: Session = Depends(get_db),
    current_user = Depends(require_role("inspector"))
):

    records = db.query(models.InspectionRecord).filter(
        models.InspectionRecord.inspector_id == current_user.id
    ).all()

    return records


# ---------------- INSPECTOR CLEAR HISTORY ----------------

@router.delete("/inspector/history/clear")
def clear_inspection_history(
    db: Session = Depends(get_db),
    current_user = Depends(require_role("inspector"))
):

    db.query(models.InspectionRecord).filter(
        models.InspectionRecord.inspector_id == current_user.id
    ).delete()

    db.commit()

    return {"message": "Inspection history cleared"}


# ---------------- RECIPIENT VIEW APPROVED FOOD ----------------

@router.get("/recipient/foods", response_model=list[schemas.FoodResponse])
def available_food(
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user = Depends(require_role("recipient"))
):

    foods = db.query(models.FoodItem).filter(
        models.FoodItem.status == "Approved"
    ).offset(skip).limit(limit).all()

    return foods


# ---------------- CLAIM FOOD ----------------

@router.post("/claim/{food_id}")
def claim_food(
    food_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_role("recipient"))
):

    food = db.query(models.FoodItem).filter(
        models.FoodItem.id == food_id,
        models.FoodItem.status == "Approved"
    ).first()

    if not food:
        raise HTTPException(status_code=404, detail="Food not available")

    delivery = models.Delivery(
        food_item_id=food_id,
        recipient_id=current_user.id,
        pickup_latitude=food.latitude,
        pickup_longitude=food.longitude,
        delivery_status="Pending"
    )

    food.status = "Claimed"

    db.add(delivery)
    db.commit()
    db.refresh(delivery)

    return {
        "message": "Food claimed successfully",
        "delivery_id": delivery.id
    }


# ---------------- DONOR MARK DELIVERY COMPLETE ----------------

@router.post("/donor/delivered/{food_id}")
def mark_delivered(
    food_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_role("donor"))
):

    food = db.query(models.FoodItem).filter(
        models.FoodItem.id == food_id,
        models.FoodItem.donor_id == current_user.id
    ).first()

    if not food:
        raise HTTPException(status_code=404, detail="Food not found")

    if food.status != "Claimed":
        raise HTTPException(
            status_code=400,
            detail="Food must be claimed first"
        )

    delivery = db.query(models.Delivery).filter(
        models.Delivery.food_item_id == food_id
    ).first()

    if not delivery:
        raise HTTPException(status_code=404, detail="Delivery not found")

    delivery.delivery_status = "Delivered"
    food.status = "Delivered"

    db.commit()

    return {"message": "Delivery completed"}


# ---------------- RECIPIENT CONFIRM RECEIVED ----------------

@router.post("/recipient/received/{food_id}")
def confirm_received(
    food_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_role("recipient"))
):

    delivery = db.query(models.Delivery).filter(
        models.Delivery.food_item_id == food_id,
        models.Delivery.recipient_id == current_user.id,
        models.Delivery.delivery_status == "Delivered"
    ).first()

    if not delivery:
        raise HTTPException(
            status_code=404,
            detail="No delivered delivery found for this food item"
        )

    food = db.query(models.FoodItem).filter(
        models.FoodItem.id == food_id
    ).first()

    if food:
        food.status = "Received"

    delivery.delivery_status = "Received"
    db.commit()

    return {"message": "Delivery confirmed as received"}


# ---------------- RECIPIENT CLAIM HISTORY ----------------

@router.get("/recipient/my-claims")
def my_claims(
    db: Session = Depends(get_db),
    current_user = Depends(require_role("recipient"))
):

    claims = db.query(models.Delivery).filter(
        models.Delivery.recipient_id == current_user.id
    ).all()

    return claims


# ---------------- ADMIN USERS ----------------

@router.get("/admin/users", response_model=list[schemas.UserResponse])
def get_users(
    db: Session = Depends(get_db),
    current_user = Depends(require_role("admin"))
):

    users = db.query(models.User).all()

    return users


# ---------------- ADMIN DELETE USER ----------------

@router.delete("/admin/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_role("admin"))
):

    user = db.query(models.User).filter(
        models.User.id == user_id
    ).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(user)
    db.commit()

    return {"message": "User deleted"}


# ---------------- ADMIN DELETE FOOD ----------------

@router.delete("/admin/food/{food_id}")
def delete_food(
    food_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_role("admin"))
):

    food = db.query(models.FoodItem).filter(
        models.FoodItem.id == food_id
    ).first()

    if not food:
        raise HTTPException(status_code=404, detail="Food not found")

    db.delete(food)
    db.commit()

    return {"message": "Food deleted"}


# ---------------- ADMIN DELIVERY DASHBOARD ----------------

@router.get("/admin/deliveries")
def admin_deliveries(
    db: Session = Depends(get_db),
    current_user = Depends(require_role("admin"))
):

    deliveries = db.query(models.Delivery).order_by(
        models.Delivery.id.desc()
    ).all()

    return deliveries