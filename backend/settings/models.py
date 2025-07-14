from sqlalchemy import Column, Integer, String, Text, Boolean, Date, DateTime, DECIMAL, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from backend.database import Base


class TaxCategory(Base):
    __tablename__ = "tax_categories"
    
    tax_category_id = Column(Integer, primary_key=True, index=True)
    tax_category_name = Column(String(100), unique=True, nullable=False, index=True)
    tax_rate = Column(DECIMAL(5, 2), nullable=False)
    effective_date = Column(Date, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    products = relationship("Product", back_populates="tax_category")


class PaymentMethod(Base):
    __tablename__ = "payment_methods"
    
    payment_method_id = Column(Integer, primary_key=True, index=True)
    method_name = Column(String(100), unique=True, nullable=False, index=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    payments = relationship("Payment", back_populates="payment_method")
    returns = relationship("Return", back_populates="refund_method")


class ExpenseCategory(Base):
    __tablename__ = "expense_categories"
    
    category_id = Column(Integer, primary_key=True, index=True)
    category_name = Column(String(100), unique=True, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    expenses = relationship("Expense", back_populates="expense_category")


class Role(Base):
    __tablename__ = "roles"
    
    role_id = Column(Integer, primary_key=True, index=True)
    role_name = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    users = relationship("User", back_populates="role")
    role_permissions = relationship("RolePermission", back_populates="role", cascade="all, delete-orphan")


class Permission(Base):
    __tablename__ = "permissions"
    
    permission_id = Column(Integer, primary_key=True, index=True)
    permission_name = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    role_permissions = relationship("RolePermission", back_populates="permission", cascade="all, delete-orphan")


class RolePermission(Base):
    __tablename__ = "role_permissions"
    
    role_id = Column(Integer, ForeignKey("roles.role_id", ondelete="CASCADE"), primary_key=True)
    permission_id = Column(Integer, ForeignKey("permissions.permission_id", ondelete="CASCADE"), primary_key=True)
    
    # Relationships
    role = relationship("Role", back_populates="role_permissions")
    permission = relationship("Permission", back_populates="role_permissions")


class Setting(Base):
    __tablename__ = "settings"
    
    setting_id = Column(Integer, primary_key=True, index=True)
    setting_key = Column(String(100), unique=True, nullable=False, index=True)
    setting_value = Column(Text, nullable=False)
    store_id = Column(Integer, ForeignKey("stores.store_id", ondelete="CASCADE"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    store = relationship("Store", back_populates="settings")


class POSTerminal(Base):
    __tablename__ = "pos_terminals"
    
    terminal_id = Column(Integer, primary_key=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.store_id", ondelete="CASCADE"), nullable=False)
    terminal_name = Column(String(100), nullable=False)
    ip_address = Column(String(50))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Unique constraint for store_id and terminal_name combination
    __table_args__ = (UniqueConstraint('store_id', 'terminal_name', name='unique_store_terminal'),)
    
    # Relationships
    store = relationship("Store", back_populates="pos_terminals")
    sales_transactions = relationship("SalesTransaction", back_populates="pos_terminal")


class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    log_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="SET NULL"), nullable=True)
    event_type = Column(String(100), nullable=False, index=True)
    event_details = Column(Text)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    ip_address = Column(String(50))
    
    # Relationships
    user = relationship("User", back_populates="audit_logs")


# Import and extend existing models to add relationships
from backend.inventory.models import Store, User
from backend.product.models import Product
from backend.inventory.models import Expense, Payment, Return

# Add relationships to existing models
Store.settings = relationship("Setting", back_populates="store", cascade="all, delete-orphan")
Store.pos_terminals = relationship("POSTerminal", back_populates="store", cascade="all, delete-orphan")

User.role = relationship("Role", back_populates="users")
User.audit_logs = relationship("AuditLog", back_populates="user")

Product.tax_category = relationship("TaxCategory", back_populates="products")

Expense.expense_category = relationship("ExpenseCategory", back_populates="expenses")
Payment.payment_method = relationship("PaymentMethod", back_populates="payments")
Return.refund_method = relationship("PaymentMethod", back_populates="returns") 