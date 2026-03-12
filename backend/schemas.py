from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


# ---------------- USERS ----------------

class UserBase(BaseModel):
    fullname: str
    email: EmailStr
    role: Optional[str] = "donor"


class UserCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ---------------- WAREHOUSE ----------------

class WarehouseBase(BaseModel):
    name: Optional[str] = "Central Warehouse"
    location: str
    capacity: Optional[int] = 1000


class WarehouseResponse(WarehouseBase):
    id: int

    class Config:
        from_attributes = True


# ---------------- FOOD ITEMS ----------------

class FoodCreate(BaseModel):
    name: str
    quantity: str
    category: Optional[str] = "edible"
    latitude: Optional[float]
    longitude: Optional[float]


class FoodResponse(BaseModel):
    id: int
    donor_id: Optional[int]
    name: str
    category: str
    quantity: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


# ---------------- INSPECTION ----------------

class InspectionCreate(BaseModel):
    food_item_id: int
    remarks: Optional[str] = None
    result: str


class InspectionResponse(BaseModel):
    id: int
    food_item_id: int
    inspector_id: int
    remarks: Optional[str]
    result: str
    inspected_at: datetime

    class Config:
        from_attributes = True


# ---------------- DELIVERIES ----------------

class DeliveryCreate(BaseModel):
    food_item_id: int
    recipient_id: int
    drop_latitude: Optional[float]
    drop_longitude: Optional[float]


class DeliveryResponse(BaseModel):
    id: int
    food_item_id: int
    recipient_id: int
    driver_name: Optional[str]
    delivery_status: str
    requested_at: datetime

    class Config:
        from_attributes = True