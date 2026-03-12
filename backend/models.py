from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime

from database import Base


# ---------------- USERS ----------------
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    fullname = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    password = Column(String, nullable=False)
    role = Column(String, nullable=False, default="donor")
    created_at = Column(DateTime, default=datetime.utcnow)

    donations = relationship("FoodItem", back_populates="donor")
    inspections = relationship("InspectionRecord", back_populates="inspector")
    deliveries = relationship("Delivery", back_populates="recipient")


# ---------------- WAREHOUSE ----------------
class Warehouse(Base):
    __tablename__ = "warehouse"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, default="Central Warehouse")
    location = Column(String, nullable=False)
    capacity = Column(Integer, default=1000)
    manager_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"))

    foods = relationship("FoodItem", back_populates="warehouse")


# ---------------- FOOD ITEMS ----------------
class FoodItem(Base):
    __tablename__ = "food_items"

    id = Column(Integer, primary_key=True, index=True)
    donor_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    name = Column(String, nullable=False)
    category = Column(String, default="edible")
    quantity = Column(String, nullable=False)
    status = Column(String, default="Pending Inspection")

    stored_in = Column(Integer, ForeignKey("warehouse.id", ondelete="SET NULL"))

    latitude = Column(Float)
    longitude = Column(Float)

    created_at = Column(DateTime, default=datetime.utcnow)

    donor = relationship("User", back_populates="donations")
    warehouse = relationship("Warehouse", back_populates="foods")
    inspections = relationship("InspectionRecord", back_populates="food_item")
    deliveries = relationship("Delivery", back_populates="food_item")


# ---------------- INSPECTION RECORDS ----------------
class InspectionRecord(Base):
    __tablename__ = "inspection_records"

    id = Column(Integer, primary_key=True, index=True)
    food_item_id = Column(Integer, ForeignKey("food_items.id", ondelete="CASCADE"))
    inspector_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))

    remarks = Column(Text)
    result = Column(String)

    inspected_at = Column(DateTime, default=datetime.utcnow)

    food_item = relationship("FoodItem", back_populates="inspections")
    inspector = relationship("User", back_populates="inspections")


# ---------------- DELIVERIES ----------------
class Delivery(Base):
    __tablename__ = "deliveries"

    id = Column(Integer, primary_key=True, index=True)

    food_item_id = Column(Integer, ForeignKey("food_items.id", ondelete="CASCADE"))
    recipient_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))

    driver_name = Column(String)
    delivery_status = Column(String, default="Pending")

    pickup_latitude = Column(Float)
    pickup_longitude = Column(Float)

    drop_latitude = Column(Float)
    drop_longitude = Column(Float)

    requested_at = Column(DateTime, default=datetime.utcnow)
    assigned_at = Column(DateTime)
    delivered_at = Column(DateTime)

    food_item = relationship("FoodItem", back_populates="deliveries")
    recipient = relationship("User", back_populates="deliveries")