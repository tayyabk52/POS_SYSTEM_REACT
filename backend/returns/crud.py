from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_, func, desc
from typing import List, Optional
from datetime import datetime, date
from decimal import Decimal
from . import models, schemas
from backend.sales import models as sales_models
from backend.product import models as product_models
from backend.customer import models as customer_models

def create_return(db: Session, return_data: schemas.ReturnCreate, user_id: int) -> models.Return:
    """Create a new return transaction"""
    # Get the original sale
    sale = db.query(sales_models.SalesTransaction).options(
        joinedload(sales_models.SalesTransaction.sale_items),
        joinedload(sales_models.SalesTransaction.customer)
    ).filter(sales_models.SalesTransaction.sale_id == return_data.sale_id).first()
    
    if not sale:
        raise ValueError("Sale not found")
    
    if sale.payment_status == "VOID":
        raise ValueError("Cannot return items from a voided sale")
    
    # Calculate refund amount
    refund_amount = Decimal("0.00")
    return_items_data = []
    
    for item in return_data.return_items:
        # Get the original sale item
        sale_item = next(
            (si for si in sale.sale_items if si.sale_item_id == item.sale_item_id),
            None
        )
        
        if not sale_item:
            raise ValueError(f"Sale item {item.sale_item_id} not found in this sale")
        
        # Check if quantity is valid
        already_returned = sale_item.return_quantity or 0
        available_to_return = sale_item.quantity - already_returned
        
        if item.quantity_returned > available_to_return:
            raise ValueError(
                f"Cannot return {item.quantity_returned} of {sale_item.product.product_name}. "
                f"Only {available_to_return} available to return."
            )
        
        # Calculate refund for this item
        item_refund = item.quantity_returned * item.refund_per_item
        refund_amount += item_refund
        
        return_items_data.append({
            **item.dict(),
            "product_id": sale_item.product_id,
            "variant_id": sale_item.variant_id
        })
    
    # Create return transaction
    db_return = models.Return(
        sale_id=return_data.sale_id,
        returned_by_user_id=user_id,
        reason=return_data.reason,
        refund_amount=refund_amount,
        refund_method_id=return_data.refund_method_id,
        notes=return_data.notes
    )
    
    db.add(db_return)
    db.flush()  # Get the return_id
    
    # Create return items
    for item_data in return_items_data:
        db_item = models.ReturnItem(
            return_id=db_return.return_id,
            **item_data
        )
        db.add(db_item)
        
        # Update the original sale item's return quantity
        sale_item = db.query(sales_models.SaleItem).filter(
            sales_models.SaleItem.sale_item_id == item_data["sale_item_id"]
        ).first()
        if sale_item:
            sale_item.return_quantity = (sale_item.return_quantity or 0) + item_data["quantity_returned"]
        
        # Update inventory - add back the returned items
        from backend.inventory import crud as inventory_crud
        inventory_crud.update_inventory_for_return(
            product_id=item_data["product_id"],
            variant_id=item_data.get("variant_id"),
            store_id=int(sale.store_id),
            quantity=item_data["quantity_returned"],
            sale_id=int(sale.sale_id),
            user_id=user_id
        )
    
    # Update sale payment status based on refund amount
    total_returned = db.query(func.sum(models.Return.refund_amount)).filter(
        models.Return.sale_id == sale.sale_id
    ).scalar() or Decimal("0.00")
    
    # Calculate remaining amount after refunds
    remaining_amount = sale.grand_total - total_returned
    
    if total_returned >= sale.grand_total:
        # Fully refunded
        sale.payment_status = "REFUNDED"
    elif total_returned > 0:
        # Partially refunded - check if remaining amount is paid
        if remaining_amount <= sale.amount_paid:
            sale.payment_status = "PAID"  # Still paid, just partially refunded
        else:
            sale.payment_status = "PARTIAL"  # Partial payment with partial refund
    # If total_returned = 0, keep original status
    
    # Reverse loyalty points if applicable
    if sale.customer_id:
        points_to_reverse = int(refund_amount / 100)
        if points_to_reverse > 0:
            customer = sale.customer
            if customer:
                setattr(customer, 'total_loyalty_points', 
                       max(0, customer.total_loyalty_points - points_to_reverse))
                
                # Create loyalty history record
                loyalty_history = customer_models.LoyaltyPointsHistory(
                    customer_id=sale.customer_id,
                    sale_id=sale.sale_id,
                    points_change=-points_to_reverse,
                    description=f"Points reversed due to return on {sale.invoice_number}"
                )
                db.add(loyalty_history)
    
    db.commit()
    db.refresh(db_return)
    
    return get_return(db, db_return.return_id)

def get_returns(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    store_id: Optional[int] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    search: Optional[str] = None
) -> List[models.Return]:
    """Get returns with filters"""
    query = db.query(models.Return).join(
        sales_models.SalesTransaction
    ).options(
        joinedload(models.Return.sale).joinedload(sales_models.SalesTransaction.customer),
        joinedload(models.Return.return_items)
    )
    
    if store_id:
        query = query.filter(sales_models.SalesTransaction.store_id == store_id)
    
    if start_date:
        query = query.filter(models.Return.return_date >= start_date)
    
    if end_date:
        query = query.filter(models.Return.return_date <= end_date)
    
    if search:
        query = query.filter(
            sales_models.SalesTransaction.invoice_number.ilike(f"%{search}%")
        )
    
    return query.order_by(desc(models.Return.return_date)).offset(skip).limit(limit).all()

def get_return(db: Session, return_id: int) -> Optional[models.Return]:
    """Get a specific return with all details"""
    return_transaction = db.query(models.Return).options(
        joinedload(models.Return.sale).joinedload(sales_models.SalesTransaction.customer),
        joinedload(models.Return.return_items).joinedload(models.ReturnItem.product),
        joinedload(models.Return.refund_method)
    ).filter(models.Return.return_id == return_id).first()
    
    if return_transaction:
        # Add additional computed fields
        if return_transaction.sale:
            return_transaction.invoice_number = return_transaction.sale.invoice_number
            return_transaction.original_sale_date = return_transaction.sale.sale_date
            
            if return_transaction.sale.customer:
                customer = return_transaction.sale.customer
                return_transaction.customer_name = f"{customer.first_name} {customer.last_name}"
        
        if return_transaction.refund_method:
            return_transaction.refund_method_name = return_transaction.refund_method.method_name
        
        # Get returned by user name
        from backend.inventory import models as inventory_models
        user = db.query(inventory_models.User).filter(
            inventory_models.User.user_id == return_transaction.returned_by_user_id
        ).first()
        if user:
            return_transaction.returned_by_name = f"{user.first_name} {user.last_name}"
        
        # Add product details to return items
        for item in return_transaction.return_items:
            if item.product:
                item.product_name = item.product.product_name
                item.product_code = item.product.product_code
    
    return return_transaction

def get_returns_stats(
    db: Session,
    store_id: Optional[int] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None
) -> schemas.ReturnsStats:
    """Get returns statistics"""
    query = db.query(
        func.sum(models.Return.refund_amount).label("total_returns"),
        func.count(models.Return.return_id).label("returns_count"),
        func.avg(models.Return.refund_amount).label("average_return")
    ).join(
        sales_models.SalesTransaction
    )
    
    if store_id:
        query = query.filter(sales_models.SalesTransaction.store_id == store_id)
    
    if start_date:
        query = query.filter(models.Return.return_date >= start_date)
    
    if end_date:
        query = query.filter(models.Return.return_date <= end_date)
    
    result = query.first()
    
    # Get most returned products
    product_query = db.query(
        product_models.Product.product_name,
        product_models.Product.product_code,
        func.sum(models.ReturnItem.quantity_returned).label("total_returned"),
        func.count(models.ReturnItem.return_item_id).label("return_count")
    ).join(
        models.ReturnItem,
        models.ReturnItem.product_id == product_models.Product.product_id
    ).join(
        models.Return
    ).join(
        sales_models.SalesTransaction
    )
    
    if store_id:
        product_query = product_query.filter(sales_models.SalesTransaction.store_id == store_id)
    
    if start_date:
        product_query = product_query.filter(models.Return.return_date >= start_date)
    
    if end_date:
        product_query = product_query.filter(models.Return.return_date <= end_date)
    
    most_returned = product_query.group_by(
        product_models.Product.product_id,
        product_models.Product.product_name,
        product_models.Product.product_code
    ).order_by(desc("total_returned")).limit(10).all()
    
    return schemas.ReturnsStats(
        total_returns=result.total_returns or Decimal("0.00"),
        returns_count=result.returns_count or 0,
        average_return=result.average_return or Decimal("0.00"),
        most_returned_products=[
            {
                "product_name": p.product_name,
                "product_code": p.product_code,
                "total_returned": p.total_returned,
                "return_count": p.return_count
            }
            for p in most_returned
        ]
    )

def get_returnable_sales(
    db: Session,
    search: Optional[str] = None,
    store_id: Optional[int] = None,
    limit: int = 50
) -> List[sales_models.SalesTransaction]:
    """Get sales that have items available for return"""
    print(f"[DEBUG] get_returnable_sales called with search='{search}', store_id={store_id}, limit={limit}")
    
    query = db.query(sales_models.SalesTransaction).options(
        joinedload(sales_models.SalesTransaction.sale_items).joinedload(sales_models.SaleItem.product),
        joinedload(sales_models.SalesTransaction.customer)
    ).filter(
        sales_models.SalesTransaction.payment_status.in_(["PAID", "PARTIAL"])
    )
    
    if store_id:
        query = query.filter(sales_models.SalesTransaction.store_id == store_id)
    
    if search:
        # Use a simpler search approach that works better with SQLAlchemy
        search_term = f"%{search}%"
        print(f"[DEBUG] Applying search filter with term: {search_term}")
        query = query.filter(
            or_(
                sales_models.SalesTransaction.invoice_number.ilike(search_term),
                and_(
                    sales_models.SalesTransaction.customer_id.isnot(None),
                    sales_models.SalesTransaction.customer.has(
                        customer_models.Customer.first_name.ilike(search_term)
                    )
                ),
                and_(
                    sales_models.SalesTransaction.customer_id.isnot(None),
                    sales_models.SalesTransaction.customer.has(
                        customer_models.Customer.last_name.ilike(search_term)
                    )
                ),
                and_(
                    sales_models.SalesTransaction.customer_id.isnot(None),
                    sales_models.SalesTransaction.customer.has(
                        customer_models.Customer.phone_number.ilike(search_term)
                    )
                )
            )
        )
    
    # Order by most recent first
    sales = query.order_by(desc(sales_models.SalesTransaction.sale_date)).limit(limit).all()
    print(f"[DEBUG] Found {len(sales)} sales before filtering for returnable items")
    
    # Filter out sales with no returnable items
    returnable_sales = []
    for sale in sales:
        has_returnable_items = False
        for item in sale.sale_items:
            if item.quantity > (item.return_quantity or 0):
                has_returnable_items = True
                break
        
        if has_returnable_items:
            # Add computed fields
            if sale.customer:
                sale.customer_name = f"{sale.customer.first_name} {sale.customer.last_name}"
            returnable_sales.append(sale)
    
    print(f"[DEBUG] Returning {len(returnable_sales)} sales with returnable items")
    return returnable_sales 