from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
from decimal import Decimal
from enum import Enum

class PaymentStatus(str, Enum):
    PAID = "PAID"
    PARTIAL = "PARTIAL"
    REFUNDED = "REFUNDED"
    VOID = "VOID"

# Payment Method Schemas
class PaymentMethodBase(BaseModel):
    method_name: str
    is_active: bool = True

class PaymentMethodCreate(PaymentMethodBase):
    pass

class PaymentMethod(PaymentMethodBase):
    payment_method_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Sale Item Schemas
class SaleItemBase(BaseModel):
    product_id: int
    variant_id: Optional[int] = None
    quantity: int = Field(gt=0)
    unit_price: Decimal
    discount_per_item: Decimal = Field(default=Decimal("0.00"))
    batch_number: Optional[str] = None
    expiry_date: Optional[datetime] = None

class SaleItemCreate(SaleItemBase):
    pass

class SaleItemUpdate(BaseModel):
    quantity: Optional[int] = Field(None, gt=0)
    discount_per_item: Optional[Decimal] = None

class SaleItem(SaleItemBase):
    sale_item_id: int
    sale_id: int
    tax_per_item: Decimal
    line_total: Decimal
    return_quantity: int = 0
    product_name: Optional[str] = None
    product_code: Optional[str] = None

    class Config:
        from_attributes = True

# Payment Schemas
class PaymentBase(BaseModel):
    payment_method_id: int
    amount: Decimal
    transaction_reference: Optional[str] = None

class PaymentCreate(PaymentBase):
    pass

class Payment(PaymentBase):
    payment_id: int
    sale_id: int
    payment_date: datetime
    method_name: Optional[str] = None

    class Config:
        from_attributes = True

# Sales Transaction Schemas
class SalesTransactionBase(BaseModel):
    store_id: int
    pos_terminal_id: int
    customer_id: Optional[int] = None
    discount_amount: Decimal = Field(default=Decimal("0.00"))
    notes: Optional[str] = None

class SalesTransactionCreate(SalesTransactionBase):
    sale_items: List[SaleItemCreate]
    payments: List[PaymentCreate]
    
    @validator('sale_items')
    def validate_sale_items(cls, v):
        if not v:
            raise ValueError('At least one sale item is required')
        return v
    
    @validator('payments')
    def validate_payments(cls, v):
        if not v:
            raise ValueError('At least one payment is required')
        return v

class SalesTransactionUpdate(BaseModel):
    customer_id: Optional[int] = None
    discount_amount: Optional[Decimal] = None
    notes: Optional[str] = None
    payment_status: Optional[PaymentStatus] = None

class SalesTransaction(SalesTransactionBase):
    sale_id: int
    invoice_number: str
    user_id: int
    sale_date: datetime
    sub_total: Decimal
    tax_amount: Decimal
    grand_total: Decimal
    amount_paid: Decimal
    change_given: Decimal
    payment_status: PaymentStatus
    created_at: datetime
    updated_at: datetime
    
    # Related data
    sale_items: List[SaleItem] = []
    payments: List[Payment] = []
    customer_name: Optional[str] = None
    cashier_name: Optional[str] = None
    store_name: Optional[str] = None

    class Config:
        from_attributes = True

class SalesTransactionSummary(BaseModel):
    sale_id: int
    invoice_number: str
    sale_date: datetime
    customer_name: Optional[str] = None
    grand_total: Decimal
    payment_status: PaymentStatus
    items_count: int
    cashier_name: Optional[str] = None

    class Config:
        from_attributes = True

# Statistics Schemas
class SalesStats(BaseModel):
    total_sales: Decimal
    sales_count: int
    average_sale: Decimal
    total_tax: Decimal
    total_discount: Decimal

class DailySalesReport(BaseModel):
    date: datetime
    total_sales: Decimal
    sales_count: int
    cash_sales: Decimal
    card_sales: Decimal
    other_sales: Decimal 