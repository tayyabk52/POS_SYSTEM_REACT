from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.database import get_db
from . import crud, schemas

router = APIRouter(prefix="/customers", tags=["customers"])

@router.get("/", response_model=List[schemas.Customer])
def get_customers(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    search: Optional[str] = None,
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    """Get all customers with optional filtering"""
    return crud.get_customers(db, skip=skip, limit=limit, search=search, is_active=is_active)

@router.get("/{customer_id}", response_model=schemas.Customer)
def get_customer(customer_id: int, db: Session = Depends(get_db)):
    """Get a specific customer by ID"""
    customer = crud.get_customer(db, customer_id=customer_id)
    if customer is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer

@router.post("/", response_model=schemas.Customer)
def create_customer(customer: schemas.CustomerCreate, db: Session = Depends(get_db)):
    """Create a new customer"""
    return crud.create_customer(db, customer=customer)

@router.put("/{customer_id}", response_model=schemas.Customer)
def update_customer(customer_id: int, customer: schemas.CustomerUpdate, db: Session = Depends(get_db)):
    """Update an existing customer"""
    updated_customer = crud.update_customer(db, customer_id=customer_id, customer=customer)
    if updated_customer is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    return updated_customer

@router.delete("/{customer_id}")
def delete_customer(customer_id: int, db: Session = Depends(get_db)):
    """Delete a customer"""
    success = crud.delete_customer(db, customer_id=customer_id)
    if not success:
        raise HTTPException(status_code=404, detail="Customer not found")
    return {"message": "Customer deleted successfully"}

@router.get("/stats/summary")
def get_customer_stats(db: Session = Depends(get_db)):
    """Get customer statistics"""
    return crud.get_customer_stats(db)

@router.get("/{customer_id}/loyalty-history")
def get_loyalty_history(customer_id: int, db: Session = Depends(get_db)):
    """Get loyalty points history for a customer"""
    return crud.get_loyalty_points_history(db, customer_id=customer_id) 