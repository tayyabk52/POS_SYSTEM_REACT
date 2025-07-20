from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from datetime import datetime, date
from . import schemas, crud, models
from backend.database import get_db

router = APIRouter(prefix="/sales", tags=["sales"])

# Payment Method endpoints
@router.get("/payment-methods", response_model=List[schemas.PaymentMethod])
def list_payment_methods(
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    db: Session = Depends(get_db)
):
    return crud.get_payment_methods(db, is_active=is_active)

# Sales Transaction endpoints
@router.post("/", response_model=schemas.SalesTransaction)
def create_sale(
    sale: schemas.SalesTransactionCreate,
    user_id: int = Query(..., description="ID of the user creating the sale"),
    db: Session = Depends(get_db)
):
    try:
        return crud.create_sale(db, sale, user_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=List[schemas.SalesTransactionSummary])
def list_sales(
    skip: int = 0,
    limit: int = 100,
    store_id: Optional[int] = Query(None, description="Filter by store"),
    customer_id: Optional[int] = Query(None, description="Filter by customer"),
    user_id: Optional[int] = Query(None, description="Filter by cashier"),
    payment_status: Optional[schemas.PaymentStatus] = Query(None, description="Filter by payment status"),
    start_date: Optional[datetime] = Query(None, description="Filter by start date"),
    end_date: Optional[datetime] = Query(None, description="Filter by end date"),
    search: Optional[str] = Query(None, description="Search by invoice number"),
    db: Session = Depends(get_db)
):
    sales = crud.get_sales(
        db,
        skip=skip,
        limit=limit,
        store_id=store_id,
        customer_id=customer_id,
        user_id=user_id,
        payment_status=payment_status,
        start_date=start_date,
        end_date=end_date,
        search=search
    )
    
    # Convert to summary format
    summaries = []
    for sale in sales:
        customer_name = None
        if sale.customer:
            customer_name = f"{sale.customer.first_name} {sale.customer.last_name}"
        
        # Get cashier name
        from backend.inventory import models as inventory_models
        user = db.query(inventory_models.User).filter(
            inventory_models.User.user_id == sale.user_id
        ).first()
        cashier_name = f"{user.first_name} {user.last_name}" if user else None
        
        summaries.append(schemas.SalesTransactionSummary(
            sale_id=sale.sale_id,
            invoice_number=sale.invoice_number,
            sale_date=sale.sale_date,
            customer_name=customer_name,
            grand_total=sale.grand_total,
            payment_status=sale.payment_status,
            items_count=len(sale.sale_items),
            cashier_name=cashier_name
        ))
    
    return summaries

@router.get("/{sale_id}", response_model=schemas.SalesTransaction)
def get_sale(sale_id: int, db: Session = Depends(get_db)):
    sale = crud.get_sale(db, sale_id)
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    return sale

@router.post("/{sale_id}/void", response_model=schemas.SalesTransaction)
def void_sale(
    sale_id: int,
    user_id: int = Query(..., description="ID of the user voiding the sale"),
    reason: str = Body(..., description="Reason for voiding the sale"),
    db: Session = Depends(get_db)
):
    try:
        return crud.void_sale(db, sale_id, user_id, reason)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

# Statistics endpoints
@router.get("/stats/summary", response_model=schemas.SalesStats)
def get_sales_stats(
    store_id: Optional[int] = Query(None, description="Filter by store"),
    start_date: Optional[datetime] = Query(None, description="Start date"),
    end_date: Optional[datetime] = Query(None, description="End date"),
    db: Session = Depends(get_db)
):
    return crud.get_sales_stats(db, store_id=store_id, start_date=start_date, end_date=end_date)

@router.get("/stats/daily-report", response_model=schemas.DailySalesReport)
def get_daily_sales_report(
    report_date: date = Query(..., description="Date for the report"),
    store_id: Optional[int] = Query(None, description="Filter by store"),
    db: Session = Depends(get_db)
):
    return crud.get_daily_sales_report(db, report_date=report_date, store_id=store_id)

# Product search endpoint for POS
@router.get("/products/search")
def search_products_for_sale(
    search: str = Query(..., min_length=1, description="Search term"),
    store_id: int = Query(..., description="Store ID"),
    limit: int = Query(20, description="Maximum results"),
    db: Session = Depends(get_db)
):
    from backend.product import models as product_models
    from backend.inventory import models as inventory_models
    
    # Search products by name, code, or barcode
    # Use left join to include products even if they don't have inventory
    query = db.query(
        product_models.Product,
        inventory_models.Inventory.current_stock
    ).outerjoin(
        inventory_models.Inventory,
        (inventory_models.Inventory.product_id == product_models.Product.product_id) &
        (inventory_models.Inventory.store_id == store_id) &
        (inventory_models.Inventory.variant_id.is_(None))
    ).filter(
        product_models.Product.is_active == True,
        or_(
            product_models.Product.product_name.ilike(f"%{search}%"),
            product_models.Product.product_code.ilike(f"%{search}%"),
            product_models.Product.barcode.ilike(f"%{search}%")
        )
    ).limit(limit)
    
    results = []
    for product, stock in query:
        # Get tax rate
        tax_rate = 0
        if product.tax_category_id:
            tax_category = db.query(product_models.TaxCategory).filter(
                product_models.TaxCategory.tax_category_id == product.tax_category_id
            ).first()
            if tax_category and tax_category.is_active:
                tax_rate = float(tax_category.tax_rate) if tax_category.tax_rate else 0
        
        results.append({
            "product_id": product.product_id,
            "product_code": product.product_code,
            "product_name": product.product_name,
            "barcode": product.barcode,
            "retail_price": float(product.retail_price),
            "tax_rate": tax_rate,
            "current_stock": stock,
            "unit_of_measure": product.unit_of_measure
        })
    
    return results

# Customer search endpoint for POS
@router.get("/customers/search")
def search_customers_for_sale(
    search: str = Query(..., min_length=1, description="Search term"),
    limit: int = Query(20, description="Maximum results"),
    db: Session = Depends(get_db)
):
    from backend.customer import models as customer_models
    
    customers = db.query(customer_models.Customer).filter(
        customer_models.Customer.is_active == True,
        or_(
            customer_models.Customer.first_name.ilike(f"%{search}%"),
            customer_models.Customer.last_name.ilike(f"%{search}%"),
            customer_models.Customer.phone_number.ilike(f"%{search}%"),
            customer_models.Customer.loyalty_member_id.ilike(f"%{search}%")
        )
    ).limit(limit).all()
    
    results = []
    for customer in customers:
        results.append({
            "customer_id": customer.customer_id,
            "name": f"{customer.first_name} {customer.last_name}",
            "phone_number": customer.phone_number,
            "loyalty_member_id": customer.loyalty_member_id,
            "total_loyalty_points": customer.total_loyalty_points
        })
    
    return results 