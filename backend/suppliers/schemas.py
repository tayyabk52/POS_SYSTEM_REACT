from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class SupplierBase(BaseModel):
    supplier_name: str = Field(..., min_length=1, max_length=255, description="Supplier name")
    contact_person: Optional[str] = Field(None, max_length=100, description="Contact person name")
    phone_number: Optional[str] = Field(None, max_length=20, description="Phone number")
    email: Optional[EmailStr] = Field(None, description="Email address")
    address: Optional[str] = Field(None, description="Full address")
    ntn: Optional[str] = Field(None, max_length=20, description="National Tax Number")
    gst_number: Optional[str] = Field(None, max_length=20, description="GST Number")
    is_active: Optional[bool] = Field(True, description="Active status")

class SupplierCreate(SupplierBase):
    pass

class SupplierUpdate(BaseModel):
    supplier_name: Optional[str] = Field(None, min_length=1, max_length=255, description="Supplier name")
    contact_person: Optional[str] = Field(None, max_length=100, description="Contact person name")
    phone_number: Optional[str] = Field(None, max_length=20, description="Phone number")
    email: Optional[EmailStr] = Field(None, description="Email address")
    address: Optional[str] = Field(None, description="Full address")
    ntn: Optional[str] = Field(None, max_length=20, description="National Tax Number")
    gst_number: Optional[str] = Field(None, max_length=20, description="GST Number")
    is_active: Optional[bool] = Field(None, description="Active status")

class Supplier(SupplierBase):
    supplier_id: int
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "supplier_id": 1,
                "supplier_name": "ABC Electronics Ltd",
                "contact_person": "John Smith",
                "phone_number": "+92-300-1234567",
                "email": "john.smith@abcelectronics.com",
                "address": "123 Main Street, Karachi, Pakistan",
                "ntn": "1234567-8",
                "gst_number": "123456789012345",
                "is_active": True,
                "created_at": "2024-01-01T00:00:00",
                "updated_at": "2024-01-01T00:00:00"
            }
        } 