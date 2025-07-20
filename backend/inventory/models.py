from sqlalchemy import Column, Integer, String, Text, Numeric, Boolean, ForeignKey, DateTime, Date
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.database import Base

class Store(Base):
    __tablename__ = 'stores'
    store_id = Column(Integer, primary_key=True, index=True)
    store_name = Column(String(255), unique=True, nullable=False)
    address = Column(Text, nullable=False)
    phone_number = Column(String(20))
    email = Column(String(255))
    city = Column(String(100))
    province = Column(String(100))
    postal_code = Column(String(20))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class User(Base):
    __tablename__ = 'users'
    user_id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    phone_number = Column(String(20))
    role_id = Column(Integer, ForeignKey('roles.role_id'), nullable=False)
    store_id = Column(Integer, ForeignKey('stores.store_id'))
    is_active = Column(Boolean, default=True)
    last_login_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Inventory(Base):
    __tablename__ = 'inventory'
    inventory_id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey('products.product_id'), nullable=False)
    variant_id = Column(Integer, ForeignKey('product_variants.variant_id'))
    store_id = Column(Integer, ForeignKey('stores.store_id'), nullable=False)
    current_stock = Column(Integer, nullable=False, default=0)
    last_reorder_date = Column(DateTime)
    last_stock_take_date = Column(DateTime)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    product = relationship('Product', backref='inventory_items')
    variant = relationship('ProductVariant', backref='inventory_items')
    store = relationship('Store', backref='inventory_items')

class InventoryMovement(Base):
    __tablename__ = 'inventory_movements'
    movement_id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey('products.product_id'), nullable=False)
    variant_id = Column(Integer, ForeignKey('product_variants.variant_id'))
    store_id = Column(Integer, ForeignKey('stores.store_id'), nullable=False)
    movement_type = Column(String(20), nullable=False)  # SALE, RETURN, PURCHASE, ADJUSTMENT, TRANSFER_OUT, TRANSFER_IN, WASTE
    quantity = Column(Integer, nullable=False)
    reference_id = Column(Integer)  # For linking to sales, purchases, etc.
    movement_date = Column(DateTime, default=datetime.utcnow)
    user_id = Column(Integer, ForeignKey('users.user_id'), nullable=False)
    notes = Column(Text)

    # Relationships
    product = relationship('Product', backref='movements')
    variant = relationship('ProductVariant', backref='movements')
    store = relationship('Store', backref='movements')
    user = relationship('User', backref='movements')

class Expense(Base):
    __tablename__ = 'expenses'
    expense_id = Column(Integer, primary_key=True, index=True)
    store_id = Column(Integer, ForeignKey('stores.store_id'), nullable=False)
    category_id = Column(Integer, ForeignKey('expense_categories.category_id'), nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    description = Column(Text)
    expense_date = Column(Date, nullable=False)
    user_id = Column(Integer, ForeignKey('users.user_id'), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    store = relationship('Store', backref='expenses')
    user = relationship('User', backref='expenses')

# Payment model is defined in sales/models.py to avoid conflicts

# Return model is defined in returns/models.py to avoid conflicts

# Import existing models for relationships
try:
    from product.models import Product, ProductVariant
except ImportError:
    # Fallback for when running as module
    from ..product.models import Product, ProductVariant 