from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from . import schemas, crud, models
from backend.database import get_db

router = APIRouter(prefix="/returns", tags=["returns"])

@router.post("/", response_model=schemas.Return)
def create_return(
    return_data: schemas.ReturnCreate,
    user_id: int = Query(..., description="ID of the user processing the return"),
    db: Session = Depends(get_db)
):
    try:
        return crud.create_return(db, return_data, user_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=List[schemas.ReturnSummary])
def list_returns(
    skip: int = 0,
    limit: int = 100,
    store_id: Optional[int] = Query(None, description="Filter by store"),
    start_date: Optional[datetime] = Query(None, description="Filter by start date"),
    end_date: Optional[datetime] = Query(None, description="Filter by end date"),
    search: Optional[str] = Query(None, description="Search by invoice number"),
    db: Session = Depends(get_db)
):
    returns = crud.get_returns(
        db,
        skip=skip,
        limit=limit,
        store_id=store_id,
        start_date=start_date,
        end_date=end_date,
        search=search
    )
    
    # Convert to summary format
    summaries = []
    for return_transaction in returns:
        summaries.append(schemas.ReturnSummary(
            return_id=return_transaction.return_id,
            return_date=return_transaction.return_date,
            invoice_number=return_transaction.sale.invoice_number if return_transaction.sale else "",
            customer_name=f"{return_transaction.sale.customer.first_name} {return_transaction.sale.customer.last_name}" 
                         if return_transaction.sale and return_transaction.sale.customer else None,
            refund_amount=return_transaction.refund_amount,
            items_count=len(return_transaction.return_items),
            reason=return_transaction.reason
        ))
    
    return summaries

@router.get("/{return_id}", response_model=schemas.Return)
def get_return(return_id: int, db: Session = Depends(get_db)):
    return_transaction = crud.get_return(db, return_id)
    if not return_transaction:
        raise HTTPException(status_code=404, detail="Return not found")
    return return_transaction

@router.get("/stats/summary", response_model=schemas.ReturnsStats)
def get_returns_stats(
    store_id: Optional[int] = Query(None, description="Filter by store"),
    start_date: Optional[datetime] = Query(None, description="Start date"),
    end_date: Optional[datetime] = Query(None, description="End date"),
    db: Session = Depends(get_db)
):
    return crud.get_returns_stats(db, store_id=store_id, start_date=start_date, end_date=end_date)

@router.get("/sales/returnable")
def get_returnable_sales(
    search: Optional[str] = Query(None, description="Search by invoice or customer"),
    store_id: Optional[int] = Query(None, description="Filter by store"),
    limit: int = Query(50, description="Maximum results"),
    db: Session = Depends(get_db)
):
    sales = crud.get_returnable_sales(db, search=search, store_id=store_id, limit=limit)
    
    # Format response
    results = []
    for sale in sales:
        returnable_items = []
        for item in sale.sale_items:
            available_to_return = item.quantity - (item.return_quantity or 0)
            if available_to_return > 0:
                returnable_items.append({
                    "sale_item_id": item.sale_item_id,
                    "product_id": item.product_id,
                    "product_name": item.product.product_name if item.product else "",
                    "product_code": item.product.product_code if item.product else "",
                    "quantity_sold": item.quantity,
                    "quantity_returned": item.return_quantity or 0,
                    "available_to_return": available_to_return,
                    "unit_price": float(item.unit_price),
                    "discount_per_item": float(item.discount_per_item),
                    "tax_per_item": float(item.tax_per_item)
                })
        
        results.append({
            "sale_id": sale.sale_id,
            "invoice_number": sale.invoice_number,
            "sale_date": sale.sale_date,
            "customer_name": getattr(sale, 'customer_name', None),
            "grand_total": float(sale.grand_total),
            "returnable_items": returnable_items
        })
    
    return results 