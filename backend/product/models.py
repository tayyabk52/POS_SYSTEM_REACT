from sqlalchemy import Column, Integer, String, Text, Numeric, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship, declarative_base
from datetime import datetime

Base = declarative_base()

class Product(Base):
    __tablename__ = 'products'
    product_id = Column(Integer, primary_key=True, index=True)
    product_code = Column(String(50), unique=True, nullable=False)
    product_name = Column(String(255), nullable=False)
    description = Column(Text)
    category_id = Column(Integer, ForeignKey('categories.category_id'))
    brand_id = Column(Integer, ForeignKey('brands.brand_id'))
    supplier_id = Column(Integer, ForeignKey('suppliers.supplier_id'))
    base_price = Column(Numeric(10,2), nullable=False)
    retail_price = Column(Numeric(10,2), nullable=False)
    tax_category_id = Column(Integer, ForeignKey('tax_categories.tax_category_id'))
    is_active = Column(Boolean, default=True)
    barcode = Column(String(100), unique=True)
    unit_of_measure = Column(String(50))
    weight = Column(Numeric(10,3))
    reorder_level = Column(Integer, default=0)
    max_stock_level = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    variants = relationship('ProductVariant', back_populates='product', cascade='all, delete-orphan')

class ProductVariant(Base):
    __tablename__ = 'product_variants'
    variant_id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey('products.product_id', ondelete='CASCADE'), nullable=False)
    size = Column(String(50))
    color = Column(String(50))
    sku_suffix = Column(String(50))
    barcode = Column(String(100), unique=True)
    retail_price = Column(Numeric(10,2))
    base_price = Column(Numeric(10,2))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    product = relationship('Product', back_populates='variants')

class Category(Base):
    __tablename__ = 'categories'
    category_id = Column(Integer, primary_key=True)
    category_name = Column(String(100), unique=True, nullable=False)

class Brand(Base):
    __tablename__ = 'brands'
    brand_id = Column(Integer, primary_key=True)
    brand_name = Column(String(100), unique=True, nullable=False)

class Supplier(Base):
    __tablename__ = 'suppliers'
    supplier_id = Column(Integer, primary_key=True)
    supplier_name = Column(String(255), unique=True, nullable=False)

class TaxCategory(Base):
    __tablename__ = 'tax_categories'
    tax_category_id = Column(Integer, primary_key=True)
    tax_category_name = Column(String(100), unique=True, nullable=False)
    tax_rate = Column(Numeric(5,2), nullable=False)
    effective_date = Column(String(10), nullable=False)
    is_active = Column(Boolean, default=True) 