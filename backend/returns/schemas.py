from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
from decimal import Decimal

# Return Item Schemas
class ReturnItemBase(BaseModel):
    sale_item_id: int
    quantity_returned: int = Field(gt=0)
    refund_per_item: Decimal

class ReturnItemCreate(ReturnItemBase):
    pass

class ReturnItem(ReturnItemBase):
    return_item_id: int
    return_id: int
    product_id: int
    variant_id: Optional[int] = None
    product_name: Optional[str] = None
    product_code: Optional[str] = None

    class Config:
        from_attributes = True

# Return Schemas
class ReturnBase(BaseModel):
    sale_id: int
    reason: str
    refund_method_id: int
    notes: Optional[str] = None

class ReturnCreate(ReturnBase):
    return_items: List[ReturnItemCreate]
    
    @validator('return_items')
    def validate_return_items(cls, v):
        if not v:
            raise ValueError('At least one return item is required')
        return v

class Return(ReturnBase):
    return_id: int
    return_date: datetime
    returned_by_user_id: int
    refund_amount: Decimal
    
    # Related data
    return_items: List[ReturnItem] = []
    invoice_number: Optional[str] = None
    customer_name: Optional[str] = None
    original_sale_date: Optional[datetime] = None
    refund_method_name: Optional[str] = None
    returned_by_name: Optional[str] = None

    class Config:
        from_attributes = True

class ReturnSummary(BaseModel):
    return_id: int
    return_date: datetime
    invoice_number: str
    customer_name: Optional[str] = None
    refund_amount: Decimal
    items_count: int
    reason: str

    class Config:
        from_attributes = True

# Statistics Schemas
class ReturnsStats(BaseModel):
    total_returns: Decimal
    returns_count: int
    average_return: Decimal
    most_returned_products: List[dict] = [] 