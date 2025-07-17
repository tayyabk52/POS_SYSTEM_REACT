from sqlalchemy.orm import Session
from sqlalchemy import and_, text
from typing import List, Optional
from . import models, schemas

def get_supplier(db: Session, supplier_id: int) -> Optional[models.Supplier]:
    """Get a single supplier by ID"""
    return db.query(models.Supplier).filter(models.Supplier.supplier_id == supplier_id).first()

def get_suppliers(
    db: Session, 
    skip: int = 0, 
    limit: int = 100,
    search: Optional[str] = None,
    is_active: Optional[bool] = None
) -> List[models.Supplier]:
    """Get list of suppliers with optional filtering"""
    query = db.query(models.Supplier)
    
    # Apply search filter
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            models.Supplier.supplier_name.ilike(search_term) |
            models.Supplier.contact_person.ilike(search_term) |
            models.Supplier.email.ilike(search_term) |
            models.Supplier.phone_number.ilike(search_term)
        )
    
    # Apply active status filter
    if is_active is not None:
        query = query.filter(models.Supplier.is_active == is_active)
    
    return query.order_by(models.Supplier.supplier_name).offset(skip).limit(limit).all()

def create_supplier(db: Session, supplier: schemas.SupplierCreate) -> models.Supplier:
    """Create a new supplier"""
    db_supplier = models.Supplier(**supplier.dict())
    db.add(db_supplier)
    db.commit()
    db.refresh(db_supplier)
    return db_supplier

def update_supplier(db: Session, supplier_id: int, supplier: schemas.SupplierUpdate) -> Optional[models.Supplier]:
    """Update an existing supplier"""
    db_supplier = get_supplier(db, supplier_id)
    if not db_supplier:
        return None
    
    # Update only provided fields
    update_data = supplier.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_supplier, field, value)
    
    db.commit()
    db.refresh(db_supplier)
    return db_supplier

def delete_supplier(db: Session, supplier_id: int) -> bool:
    """Delete a supplier (soft delete by setting is_active to False)"""
    db_supplier = get_supplier(db, supplier_id)
    if not db_supplier:
        return False
    
    # Check if supplier has associated products or purchase orders using raw SQL
    has_products = db.execute(
        text("SELECT 1 FROM products WHERE supplier_id = :supplier_id LIMIT 1"),
        {"supplier_id": supplier_id}
    ).first() is not None
    
    has_purchase_orders = db.execute(
        text("SELECT 1 FROM purchase_orders WHERE supplier_id = :supplier_id LIMIT 1"),
        {"supplier_id": supplier_id}
    ).first() is not None
    
    if has_products or has_purchase_orders:
        # Soft delete - set is_active to False
        setattr(db_supplier, 'is_active', False)
        db.commit()
        return True
    else:
        # Hard delete if no dependencies
        db.delete(db_supplier)
        db.commit()
        return True

def get_supplier_stats(db: Session) -> dict:
    """Get supplier statistics"""
    total_suppliers = db.query(models.Supplier).count()
    active_suppliers = db.query(models.Supplier).filter(models.Supplier.is_active == True).count()
    inactive_suppliers = total_suppliers - active_suppliers
    
    # Count suppliers with products using raw SQL
    try:
        suppliers_with_products = db.execute(
            text("SELECT COUNT(DISTINCT s.supplier_id) FROM suppliers s JOIN products p ON s.supplier_id = p.supplier_id")
        ).scalar()
    except Exception:
        suppliers_with_products = 0
    
    return {
        "total_suppliers": total_suppliers,
        "active_suppliers": active_suppliers,
        "inactive_suppliers": inactive_suppliers,
        "suppliers_with_products": suppliers_with_products or 0
    }

def check_supplier_name_exists(db: Session, supplier_name: str, exclude_id: Optional[int] = None) -> bool:
    """Check if supplier name already exists"""
    query = db.query(models.Supplier).filter(models.Supplier.supplier_name == supplier_name)
    if exclude_id:
        query = query.filter(models.Supplier.supplier_id != exclude_id)
    return query.first() is not None 