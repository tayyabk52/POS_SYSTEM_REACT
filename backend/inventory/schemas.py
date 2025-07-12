from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# Store Schemas
class StoreBase(BaseModel):
    store_name: str
    address: str
    phone_number: Optional[str] = None
    email: Optional[str] = None
    city: Optional[str] = None
    province: Optional[str] = None
    postal_code: Optional[str] = None
    is_active: bool = True

class StoreCreate(StoreBase):
    pass

class Store(StoreBase):
    store_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# User Schemas
class UserBase(BaseModel):
    username: str
    first_name: str
    last_name: str
    email: str
    phone_number: Optional[str] = None
    role_id: int
    store_id: Optional[int] = None
    is_active: bool = True

class UserCreate(UserBase):
    password_hash: str

class User(UserBase):
    user_id: int
    last_login_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Product Variant Schema (for inventory display)
class ProductVariant(BaseModel):
    variant_id: int
    size: Optional[str] = None
    color: Optional[str] = None
    sku_suffix: Optional[str] = None
    barcode: Optional[str] = None
    retail_price: Optional[float] = None
    base_price: Optional[float] = None
    is_active: bool = True

    class Config:
        from_attributes = True

# Product Schema (for inventory display)
class Product(BaseModel):
    product_id: int
    product_code: str
    product_name: str
    description: Optional[str] = None
    category_id: Optional[int] = None
    brand_id: Optional[int] = None
    supplier_id: Optional[int] = None
    base_price: float
    retail_price: float
    tax_category_id: Optional[int] = None
    is_active: bool = True
    barcode: Optional[str] = None
    unit_of_measure: Optional[str] = None
    weight: Optional[float] = None
    reorder_level: int = 0
    max_stock_level: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Inventory Schemas
class InventoryBase(BaseModel):
    product_id: int
    variant_id: Optional[int] = None
    store_id: int
    current_stock: int = 0
    last_reorder_date: Optional[datetime] = None
    last_stock_take_date: Optional[datetime] = None

class InventoryCreate(InventoryBase):
    pass

class InventoryUpdate(BaseModel):
    current_stock: Optional[int] = None
    last_reorder_date: Optional[datetime] = None
    last_stock_take_date: Optional[datetime] = None

class Inventory(InventoryBase):
    inventory_id: int
    updated_at: datetime
    product: Product
    variant: Optional[ProductVariant] = None
    store: Store

    class Config:
        from_attributes = True

# Inventory Movement Schemas
class InventoryMovementBase(BaseModel):
    product_id: int
    variant_id: Optional[int] = None
    store_id: int
    movement_type: str  # SALE, RETURN, PURCHASE, ADJUSTMENT, TRANSFER_OUT, TRANSFER_IN, WASTE
    quantity: int
    reference_id: Optional[int] = None
    notes: Optional[str] = None

class InventoryMovementCreate(InventoryMovementBase):
    user_id: int

class InventoryMovement(InventoryMovementBase):
    movement_id: int
    movement_date: datetime
    user: User
    product: Product
    variant: Optional[ProductVariant] = None
    store: Store

    class Config:
        from_attributes = True

# Stock Adjustment Schema
class StockAdjustment(BaseModel):
    inventory_id: int
    new_stock: int
    reason: str
    user_id: int

# Stock Take Schema
class StockTake(BaseModel):
    inventory_id: int
    actual_count: int
    notes: Optional[str] = None
    user_id: int

# Stock Transfer Schema
class StockTransfer(BaseModel):
    from_inventory_id: int
    to_store_id: int
    quantity: int
    notes: Optional[str] = None
    user_id: int

# Inventory Summary Schema
class InventorySummary(BaseModel):
    total_skus: int
    total_stock: int
    low_stock_count: int
    out_of_stock_count: int
    over_stock_count: int

# Inventory with Product Details (for frontend)
class InventoryWithDetails(BaseModel):
    inventory_id: int
    product: Product
    variant: Optional[ProductVariant] = None
    store: Store
    current_stock: int
    last_reorder_date: Optional[datetime] = None
    last_stock_take_date: Optional[datetime] = None
    updated_at: datetime

    class Config:
        from_attributes = True 