from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from . import schemas, crud, models
from backend.database import get_db

router = APIRouter(prefix="/customers", tags=["customers"])

@router.get("/", response_model=List[schemas.Customer])
def list_customers(
    skip: int = 0, 
    limit: int = 100, 
    search: Optional[str] = Query(None, description="Search by name, phone, email, or loyalty ID"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    db: Session = Depends(get_db)
):
    return crud.get_customers(db, skip=skip, limit=limit, search=search, is_active=is_active)

@router.get("/{customer_id}", response_model=schemas.Customer)
def get_customer(customer_id: int, db: Session = Depends(get_db)):
    db_customer = crud.get_customer(db, customer_id)
    if not db_customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return db_customer

@router.post("/", response_model=schemas.Customer)
def create_customer(customer: schemas.CustomerCreate, db: Session = Depends(get_db)):
    # Check for duplicate phone number
    if customer.phone_number and crud.get_customer_by_phone(db, customer.phone_number):
        raise HTTPException(status_code=409, detail="Phone number already registered")
    
    # Check for duplicate email
    if customer.email and crud.get_customer_by_email(db, customer.email):
        raise HTTPException(status_code=409, detail="Email already registered")
    
    # Check for duplicate loyalty member ID
    if customer.loyalty_member_id and crud.get_customer_by_loyalty_id(db, customer.loyalty_member_id):
        raise HTTPException(status_code=409, detail="Loyalty member ID already exists")
    
    return crud.create_customer(db, customer)

@router.put("/{customer_id}", response_model=schemas.Customer)
def update_customer(customer_id: int, customer: schemas.CustomerUpdate, db: Session = Depends(get_db)):
    db_customer = crud.update_customer(db, customer_id, customer)
    if not db_customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return db_customer

@router.delete("/{customer_id}")
def delete_customer(customer_id: int, db: Session = Depends(get_db)):
    ok = crud.delete_customer(db, customer_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Customer not found")
    return {"ok": True}

@router.get("/stats/summary")
def get_customer_stats(db: Session = Depends(get_db)):
    return crud.get_customer_stats(db)

@router.get("/{customer_id}/loyalty-history", response_model=List[schemas.LoyaltyPointsHistory])
def get_loyalty_points_history(
    customer_id: int, 
    skip: int = 0, 
    limit: int = 50, 
    db: Session = Depends(get_db)
):
    db_customer = crud.get_customer(db, customer_id)
    if not db_customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return crud.get_loyalty_points_history(db, customer_id, skip=skip, limit=limit)

@router.post("/{customer_id}/loyalty-points")
def add_loyalty_points(
    customer_id: int,
    points_change: int,
    sale_id: Optional[int] = None,
    description: Optional[str] = None,
    db: Session = Depends(get_db)
):
    db_customer = crud.add_loyalty_points(db, customer_id, points_change, sale_id, description)
    if not db_customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return {"message": "Loyalty points updated successfully", "customer": db_customer} 