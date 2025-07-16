from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class CustomerBase(BaseModel):
    first_name: str
    last_name: str
    phone_number: Optional[str] = None
    email: Optional[EmailStr] = None
    address: Optional[str] = None
    city: Optional[str] = None
    province: Optional[str] = None
    postal_code: Optional[str] = None
    loyalty_member_id: Optional[str] = None
    is_active: bool = True

class CustomerCreate(CustomerBase):
    pass

class CustomerUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_number: Optional[str] = None
    email: Optional[EmailStr] = None
    address: Optional[str] = None
    city: Optional[str] = None
    province: Optional[str] = None
    postal_code: Optional[str] = None
    loyalty_member_id: Optional[str] = None
    is_active: Optional[bool] = None

class Customer(CustomerBase):
    customer_id: int
    total_loyalty_points: int
    registration_date: datetime
    last_purchase_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class LoyaltyPointsHistoryBase(BaseModel):
    customer_id: int
    sale_id: Optional[int] = None
    points_change: int
    description: Optional[str] = None

class LoyaltyPointsHistoryCreate(LoyaltyPointsHistoryBase):
    pass

class LoyaltyPointsHistory(LoyaltyPointsHistoryBase):
    history_id: int
    change_date: datetime

    class Config:
        from_attributes = True 