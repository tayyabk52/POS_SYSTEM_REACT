from sqlalchemy import Column, Integer, String, Text, DateTime, DECIMAL, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from backend.database import Base

class Return(Base):
    __tablename__ = "returns"

    return_id = Column(Integer, primary_key=True, index=True)
    sale_id = Column(Integer, ForeignKey("sales_transactions.sale_id"), nullable=False)
    return_date = Column(DateTime(timezone=True), server_default=func.now())
    returned_by_user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    reason = Column(Text)
    refund_amount = Column(DECIMAL(10, 2), nullable=False)
    refund_method_id = Column(Integer, ForeignKey("payment_methods.payment_method_id"), nullable=False)
    notes = Column(Text)

    # Relationships
    sale = relationship("SalesTransaction", backref="returns")
    return_items = relationship("ReturnItem", back_populates="return_transaction", cascade="all, delete-orphan")
    refund_method = relationship("PaymentMethod")

class ReturnItem(Base):
    __tablename__ = "return_items"

    return_item_id = Column(Integer, primary_key=True, index=True)
    return_id = Column(Integer, ForeignKey("returns.return_id", ondelete="CASCADE"), nullable=False)
    sale_item_id = Column(Integer, ForeignKey("sale_items.sale_item_id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.product_id"), nullable=False)
    variant_id = Column(Integer, ForeignKey("product_variants.variant_id"))
    quantity_returned = Column(Integer, nullable=False)
    refund_per_item = Column(DECIMAL(10, 2), nullable=False)

    # Relationships
    return_transaction = relationship("Return", back_populates="return_items")
    sale_item = relationship("SaleItem")
    product = relationship("Product")
    variant = relationship("ProductVariant") 