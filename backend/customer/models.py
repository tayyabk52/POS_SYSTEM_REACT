from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, DECIMAL, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from backend.database import Base

class Customer(Base):
    __tablename__ = "customers"

    customer_id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    phone_number = Column(String(20))
    email = Column(String(255))
    address = Column(Text)
    city = Column(String(100))
    province = Column(String(100))
    postal_code = Column(String(20))
    loyalty_member_id = Column(String(50), unique=True)
    total_loyalty_points = Column(Integer, default=0)
    registration_date = Column(DateTime(timezone=True), server_default=func.now())
    last_purchase_date = Column(DateTime(timezone=True))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class LoyaltyPointsHistory(Base):
    __tablename__ = "loyalty_points_history"

    history_id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.customer_id"), nullable=False)
    sale_id = Column(Integer)
    points_change = Column(Integer, nullable=False)
    change_date = Column(DateTime(timezone=True), server_default=func.now())
    description = Column(Text) 