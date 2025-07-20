from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime
from sqlalchemy.orm import declarative_base
from datetime import datetime

Base = declarative_base()

class Supplier(Base):
    __tablename__ = 'suppliers'
    
    supplier_id = Column(Integer, primary_key=True, index=True)
    supplier_name = Column(String(255), unique=True, nullable=False)
    contact_person = Column(String(100))
    phone_number = Column(String(20))
    email = Column(String(255))
    address = Column(Text)
    ntn = Column(String(20))  # National Tax Number
    gst_number = Column(String(20))  # GST Number
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow) 