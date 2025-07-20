from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.sql import func
from backend.database import Base

class Customer(Base):
    __tablename__ = "customers"

    customer_id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    phone_number = Column(String(20), unique=True, index=True)
    email = Column(String(100), unique=True, index=True)
    address = Column(Text)
    city = Column(String(50))
    province = Column(String(50))
    postal_code = Column(String(20))
    loyalty_member_id = Column(String(50), unique=True, index=True)
    total_loyalty_points = Column(Integer, default=0)
    registration_date = Column(DateTime, default=func.now())
    last_purchase_date = Column(DateTime)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

class LoyaltyPointsHistory(Base):
    __tablename__ = "loyalty_points_history"

    history_id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.customer_id"), nullable=False)
    sale_id = Column(Integer, ForeignKey("sales_transactions.sale_id"))
    points_change = Column(Integer, nullable=False)
    description = Column(Text)
    change_date = Column(DateTime, default=func.now()) 