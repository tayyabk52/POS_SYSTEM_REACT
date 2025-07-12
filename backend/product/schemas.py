from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class ProductVariantBase(BaseModel):
    size: Optional[str] = None
    color: Optional[str] = None
    sku_suffix: Optional[str] = None
    barcode: Optional[str] = None
    retail_price: Optional[float] = None
    base_price: Optional[float] = None
    is_active: Optional[bool] = True

class ProductVariantCreate(ProductVariantBase):
    variant_id: Optional[int] = None

class ProductVariant(ProductVariantBase):
    variant_id: int
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        orm_mode = True

class ProductBase(BaseModel):
    product_code: str
    product_name: str
    description: Optional[str] = None
    category_id: Optional[int] = None
    brand_id: Optional[int] = None
    supplier_id: Optional[int] = None
    base_price: float
    retail_price: float
    tax_category_id: Optional[int] = None
    is_active: Optional[bool] = True
    barcode: Optional[str] = None
    unit_of_measure: Optional[str] = None
    weight: Optional[float] = None
    reorder_level: Optional[int] = 0
    max_stock_level: Optional[int] = None

class ProductCreate(ProductBase):
    variants: Optional[List[ProductVariantCreate]] = []

class ProductUpdate(ProductBase):
    variants: Optional[List[ProductVariantCreate]] = []

class Product(ProductBase):
    product_id: int
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    variants: List[ProductVariant] = []

    class Config:
        orm_mode = True 