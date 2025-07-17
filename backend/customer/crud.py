from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from typing import List, Optional
from . import models, schemas

def get_customers(db: Session, skip: int = 0, limit: int = 100, search: Optional[str] = None, is_active: Optional[bool] = None):
    query = db.query(models.Customer)
    
    if search:
        search_filter = or_(
            models.Customer.first_name.ilike(f"%{search}%"),
            models.Customer.last_name.ilike(f"%{search}%"),
            models.Customer.phone_number.ilike(f"%{search}%"),
            models.Customer.email.ilike(f"%{search}%"),
            models.Customer.loyalty_member_id.ilike(f"%{search}%")
        )
        query = query.filter(search_filter)
    
    if is_active is not None:
        query = query.filter(models.Customer.is_active == is_active)
    
    return query.offset(skip).limit(limit).all()

def get_customer(db: Session, customer_id: int):
    return db.query(models.Customer).filter(models.Customer.customer_id == customer_id).first()

def get_customer_by_loyalty_id(db: Session, loyalty_member_id: str):
    return db.query(models.Customer).filter(models.Customer.loyalty_member_id == loyalty_member_id).first()

def get_customer_by_phone(db: Session, phone_number: str):
    return db.query(models.Customer).filter(models.Customer.phone_number == phone_number).first()

def get_customer_by_email(db: Session, email: str):
    return db.query(models.Customer).filter(models.Customer.email == email).first()

def create_customer(db: Session, customer: schemas.CustomerCreate):
    db_customer = models.Customer(**customer.dict())
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer

def update_customer(db: Session, customer_id: int, customer: schemas.CustomerUpdate):
    db_customer = db.query(models.Customer).filter(models.Customer.customer_id == customer_id).first()
    if db_customer:
        update_data = customer.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_customer, field, value)
        db.commit()
        db.refresh(db_customer)
    return db_customer

def delete_customer(db: Session, customer_id: int):
    db_customer = db.query(models.Customer).filter(models.Customer.customer_id == customer_id).first()
    if db_customer:
        db.delete(db_customer)
        db.commit()
        return True
    return False

def get_customer_stats(db: Session):
    total_customers = db.query(func.count(models.Customer.customer_id)).scalar()
    active_customers = db.query(func.count(models.Customer.customer_id)).filter(models.Customer.is_active == True).scalar()
    loyalty_members = db.query(func.count(models.Customer.customer_id)).filter(models.Customer.loyalty_member_id.isnot(None)).scalar()
    
    return {
        "total_customers": total_customers,
        "active_customers": active_customers,
        "loyalty_members": loyalty_members,
        "inactive_customers": total_customers - active_customers
    }

def get_loyalty_points_history(db: Session, customer_id: int, skip: int = 0, limit: int = 50):
    return db.query(models.LoyaltyPointsHistory).filter(
        models.LoyaltyPointsHistory.customer_id == customer_id
    ).order_by(models.LoyaltyPointsHistory.change_date.desc()).offset(skip).limit(limit).all()

def add_loyalty_points(db: Session, customer_id: int, points_change: int, sale_id: Optional[int] = None, description: Optional[str] = None):
    # Update customer's total points
    db_customer = get_customer(db, customer_id)
    if db_customer:
        db_customer.total_loyalty_points = db_customer.total_loyalty_points + points_change
        
        # Create history record
        history_record = models.LoyaltyPointsHistory(
            customer_id=customer_id,
            sale_id=sale_id,
            points_change=points_change,
            description=description
        )
        db.add(history_record)
        db.commit()
        db.refresh(db_customer)
        return db_customer
    return None 