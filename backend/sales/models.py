from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, DECIMAL, ForeignKey, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from backend.database import Base
import enum

class PaymentStatus(str, enum.Enum):
    PAID = "PAID"
    PARTIAL = "PARTIAL"
    REFUNDED = "REFUNDED"
    VOID = "VOID"

class SalesTransaction(Base):
    __tablename__ = "sales_transactions"

    sale_id = Column(Integer, primary_key=True, index=True)
    invoice_number = Column(String(100), unique=True, nullable=False, index=True)
    store_id = Column(Integer, ForeignKey("stores.store_id"), nullable=False)
    pos_terminal_id = Column(Integer, ForeignKey("pos_terminals.terminal_id"), nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.customer_id"))
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    sale_date = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    sub_total = Column(DECIMAL(10, 2), nullable=False)
    discount_amount = Column(DECIMAL(10, 2), default=0)
    tax_amount = Column(DECIMAL(10, 2), default=0)
    grand_total = Column(DECIMAL(10, 2), nullable=False)
    amount_paid = Column(DECIMAL(10, 2), nullable=False)
    change_given = Column(DECIMAL(10, 2), default=0)
    payment_status = Column(Enum(PaymentStatus), default=PaymentStatus.PAID)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    sale_items = relationship("SaleItem", back_populates="sale", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="sale", cascade="all, delete-orphan")
    customer = relationship("Customer", backref="sales")

class SaleItem(Base):
    __tablename__ = "sale_items"

    sale_item_id = Column(Integer, primary_key=True, index=True)
    sale_id = Column(Integer, ForeignKey("sales_transactions.sale_id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.product_id"), nullable=False, index=True)
    variant_id = Column(Integer, ForeignKey("product_variants.variant_id"))
    quantity = Column(Integer, nullable=False)
    unit_price = Column(DECIMAL(10, 2), nullable=False)
    discount_per_item = Column(DECIMAL(10, 2), default=0)
    tax_per_item = Column(DECIMAL(10, 2), default=0)
    line_total = Column(DECIMAL(10, 2), nullable=False)
    return_quantity = Column(Integer, default=0)
    batch_number = Column(String(100))
    expiry_date = Column(DateTime)

    # Relationships
    sale = relationship("SalesTransaction", back_populates="sale_items")
    product = relationship("Product", backref="sale_items")
    variant = relationship("ProductVariant", backref="sale_items")

class Payment(Base):
    __tablename__ = "payments"

    payment_id = Column(Integer, primary_key=True, index=True)
    sale_id = Column(Integer, ForeignKey("sales_transactions.sale_id", ondelete="CASCADE"), nullable=False)
    payment_method_id = Column(Integer, ForeignKey("payment_methods.payment_method_id"), nullable=False)
    amount = Column(DECIMAL(10, 2), nullable=False)
    transaction_reference = Column(String(255))
    payment_date = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    sale = relationship("SalesTransaction", back_populates="payments")
    payment_method = relationship("PaymentMethod", backref="payments")

# PaymentMethod is defined in backend.settings.models to avoid duplication

# Import Product models to avoid circular imports
# These imports are moved to the bottom to avoid circular dependencies
from backend.product.models import Product, ProductVariant
from backend.customer.models import Customer
from backend.inventory.models import User, Store
from backend.settings.models import POSTerminal, PaymentMethod 