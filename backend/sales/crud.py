from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_, func, desc, cast, Date
from typing import List, Optional, Dict
from datetime import datetime, date, timedelta
from decimal import Decimal
from . import models, schemas
from backend.product import models as product_models
from backend.customer import models as customer_models
from backend.inventory import crud as inventory_crud
import random
import string

def generate_invoice_number(db: Session) -> str:
    """Generate a unique invoice number"""
    prefix = "INV"
    date_str = datetime.now().strftime("%Y%m%d")
    
    # Get the count of invoices for today
    today = date.today()
    count = db.query(func.count(models.SalesTransaction.sale_id)).filter(
        cast(models.SalesTransaction.sale_date, Date) == today
    ).scalar() or 0
    
    # Generate invoice number
    invoice_number = f"{prefix}-{date_str}-{count + 1:04d}"
    
    # Ensure uniqueness
    while db.query(models.SalesTransaction).filter(
        models.SalesTransaction.invoice_number == invoice_number
    ).first():
        random_suffix = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
        invoice_number = f"{prefix}-{date_str}-{count + 1:04d}-{random_suffix}"
    
    return invoice_number

def get_payment_methods(db: Session, is_active: Optional[bool] = None) -> List[models.PaymentMethod]:
    """Get all payment methods"""
    query = db.query(models.PaymentMethod)
    if is_active is not None:
        query = query.filter(models.PaymentMethod.is_active == is_active)
    return query.all()

def get_payment_method(db: Session, payment_method_id: int) -> Optional[models.PaymentMethod]:
    """Get a specific payment method"""
    return db.query(models.PaymentMethod).filter(
        models.PaymentMethod.payment_method_id == payment_method_id
    ).first()

def create_sale(db: Session, sale: schemas.SalesTransactionCreate, user_id: int) -> models.SalesTransaction:
    """Create a new sales transaction"""
    # Generate invoice number
    invoice_number = generate_invoice_number(db)
    
    # Calculate totals
    sub_total = Decimal("0.00")
    tax_amount = Decimal("0.00")
    
    # Create sale items and calculate totals
    sale_items_data = []
    for item in sale.sale_items:
        # Get product details
        product = db.query(product_models.Product).filter(
            product_models.Product.product_id == item.product_id
        ).first()
        
        if not product:
            raise ValueError(f"Product with ID {item.product_id} not found")
        
        # Get tax rate
        tax_rate = Decimal("0.00")
        if product.tax_category_id is not None:
            tax_category = db.query(product_models.TaxCategory).filter(
                product_models.TaxCategory.tax_category_id == product.tax_category_id
            ).first()
            if tax_category and tax_category.is_active is True:
                tax_rate = Decimal(str(tax_category.tax_rate))
        
        # Calculate item totals
        item_subtotal = item.quantity * item.unit_price
        item_discount = item.discount_per_item * item.quantity
        taxable_amount = item_subtotal - item_discount
        item_tax = (taxable_amount * tax_rate) / 100
        line_total = taxable_amount + item_tax
        
        sub_total += item_subtotal
        tax_amount += item_tax
        
        sale_items_data.append({
            **item.dict(),
            "tax_per_item": item_tax / item.quantity if item.quantity > 0 else Decimal("0.00"),
            "line_total": line_total
        })
    
    # Apply overall discount
    sub_total_after_discount = sub_total - sale.discount_amount
    grand_total = sub_total_after_discount + tax_amount
    
    # Calculate payment totals
    total_paid = sum(payment.amount for payment in sale.payments)
    change_given = max(Decimal("0.00"), total_paid - grand_total)
    
    # Determine payment status
    if total_paid >= grand_total:
        payment_status = schemas.PaymentStatus.PAID
    elif total_paid > 0:
        payment_status = schemas.PaymentStatus.PARTIAL
    else:
        payment_status = schemas.PaymentStatus.VOID
    
    # Create sales transaction
    db_sale = models.SalesTransaction(
        invoice_number=invoice_number,
        store_id=sale.store_id,
        pos_terminal_id=sale.pos_terminal_id,
        customer_id=sale.customer_id,
        user_id=user_id,
        sub_total=sub_total,
        discount_amount=sale.discount_amount,
        tax_amount=tax_amount,
        grand_total=grand_total,
        amount_paid=total_paid,
        change_given=change_given,
        payment_status=payment_status,
        notes=sale.notes
    )
    
    db.add(db_sale)
    db.flush()  # Get the sale_id
    
    # Create sale items
    for item_data in sale_items_data:
        db_item = models.SaleItem(
            sale_id=db_sale.sale_id,
            **item_data
        )
        db.add(db_item)
        
        # Update inventory
        from backend.inventory import crud as inventory_crud
        inventory_crud.update_inventory_for_sale(
            product_id=item_data["product_id"],
            variant_id=item_data.get("variant_id"),
            store_id=sale.store_id,
            quantity=item_data["quantity"],
            sale_id=int(db_sale.sale_id),
            user_id=user_id
        )
    
    # Create payments
    for payment in sale.payments:
        db_payment = models.Payment(
            sale_id=db_sale.sale_id,
            **payment.dict()
        )
        db.add(db_payment)
    
    # Update customer loyalty points if applicable
    if sale.customer_id:
        # Award 1 point per 100 currency units spent
        points_earned = int(grand_total / 100)
        if points_earned > 0:
            customer = db.query(customer_models.Customer).filter(
                customer_models.Customer.customer_id == sale.customer_id
            ).first()
            if customer:
                setattr(customer, 'total_loyalty_points', customer.total_loyalty_points + points_earned)
                setattr(customer, 'last_purchase_date', datetime.now())
                
                # Create loyalty history record
                loyalty_history = customer_models.LoyaltyPointsHistory(
                    customer_id=sale.customer_id,
                    sale_id=db_sale.sale_id,
                    points_change=points_earned,
                    description=f"Points earned from purchase {invoice_number}"
                )
                db.add(loyalty_history)
    
    db.commit()
    db.refresh(db_sale)
    
    return get_sale(db, int(db_sale.sale_id))

def get_sales(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    store_id: Optional[int] = None,
    customer_id: Optional[int] = None,
    user_id: Optional[int] = None,
    payment_status: Optional[schemas.PaymentStatus] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    search: Optional[str] = None
) -> List[models.SalesTransaction]:
    """Get sales transactions with filters"""
    query = db.query(models.SalesTransaction).options(
        joinedload(models.SalesTransaction.customer),
        joinedload(models.SalesTransaction.sale_items).joinedload(models.SaleItem.product)
    )
    
    if store_id:
        query = query.filter(models.SalesTransaction.store_id == store_id)
    
    if customer_id:
        query = query.filter(models.SalesTransaction.customer_id == customer_id)
    
    if user_id:
        query = query.filter(models.SalesTransaction.user_id == user_id)
    
    if payment_status:
        query = query.filter(models.SalesTransaction.payment_status == payment_status)
    
    if start_date:
        query = query.filter(models.SalesTransaction.sale_date >= start_date)
    
    if end_date:
        query = query.filter(models.SalesTransaction.sale_date <= end_date)
    
    if search:
        query = query.filter(
            models.SalesTransaction.invoice_number.ilike(f"%{search}%")
        )
    
    return query.order_by(desc(models.SalesTransaction.sale_date)).offset(skip).limit(limit).all()

def get_sale(db: Session, sale_id: int) -> Optional[models.SalesTransaction]:
    """Get a specific sale with all details"""
    sale = db.query(models.SalesTransaction).options(
        joinedload(models.SalesTransaction.sale_items).joinedload(models.SaleItem.product),
        joinedload(models.SalesTransaction.payments).joinedload(models.Payment.payment_method),
        joinedload(models.SalesTransaction.customer)
    ).filter(models.SalesTransaction.sale_id == sale_id).first()
    
    if sale:
        # Add additional computed fields
        if sale.customer:
            sale.customer_name = f"{sale.customer.first_name} {sale.customer.last_name}"
        
        # Get cashier name
        from backend.inventory import models as inventory_models
        user = db.query(inventory_models.User).filter(
            inventory_models.User.user_id == sale.user_id
        ).first()
        if user:
            sale.cashier_name = f"{user.first_name} {user.last_name}"
        
        # Get store name
        store = db.query(inventory_models.Store).filter(
            inventory_models.Store.store_id == sale.store_id
        ).first()
        if store:
            sale.store_name = store.store_name
        
        # Add product details to sale items
        for item in sale.sale_items:
            if item.product:
                item.product_name = item.product.product_name
                item.product_code = item.product.product_code
    
    return sale

def void_sale(db: Session, sale_id: int, user_id: int, reason: str) -> models.SalesTransaction:
    """Void a sales transaction"""
    sale = get_sale(db, sale_id)
    if not sale:
        raise ValueError("Sale not found")
    
    if sale.payment_status == schemas.PaymentStatus.VOID:
        raise ValueError("Sale is already voided")
    
    # Update sale status
    setattr(sale, 'payment_status', schemas.PaymentStatus.VOID)
    setattr(sale, 'notes', f"VOIDED: {reason}\n{sale.notes or ''}")
    
    # Reverse inventory movements
    from backend.inventory import crud as inventory_crud
    for item in sale.sale_items:
        inventory_crud.update_inventory_for_return(
            product_id=item.product_id,
            variant_id=item.variant_id,
            store_id=sale.store_id,
            quantity=item.quantity,
            sale_id=sale.sale_id,
            user_id=user_id
        )
    
    # Reverse loyalty points if applicable
    if sale.customer_id:
        points_to_reverse = int(float(sale.grand_total) / 100)
        if points_to_reverse > 0:
            customer = db.query(customer_models.Customer).filter(
                customer_models.Customer.customer_id == sale.customer_id
            ).first()
            if customer:
                current_points = int(customer.total_loyalty_points) if customer.total_loyalty_points else 0
                setattr(customer, 'total_loyalty_points', max(0, current_points - points_to_reverse))
                
                # Create loyalty history record
                loyalty_history = customer_models.LoyaltyPointsHistory(
                    customer_id=sale.customer_id,
                    sale_id=sale.sale_id,
                    points_change=-points_to_reverse,
                    description=f"Points reversed due to void of {sale.invoice_number}"
                )
                db.add(loyalty_history)
    
    db.commit()
    db.refresh(sale)
    
    return sale

def get_sales_stats(
    db: Session,
    store_id: Optional[int] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None
) -> schemas.SalesStats:
    """Get sales statistics"""
    query = db.query(
        func.sum(models.SalesTransaction.grand_total).label("total_sales"),
        func.count(models.SalesTransaction.sale_id).label("sales_count"),
        func.avg(models.SalesTransaction.grand_total).label("average_sale"),
        func.sum(models.SalesTransaction.tax_amount).label("total_tax"),
        func.sum(models.SalesTransaction.discount_amount).label("total_discount")
    ).filter(
        models.SalesTransaction.payment_status != schemas.PaymentStatus.VOID
    )
    
    if store_id:
        query = query.filter(models.SalesTransaction.store_id == store_id)
    
    if start_date:
        query = query.filter(models.SalesTransaction.sale_date >= start_date)
    
    if end_date:
        query = query.filter(models.SalesTransaction.sale_date <= end_date)
    
    result = query.first()
    
    if result is None:
        return schemas.SalesStats(
            total_sales=Decimal("0.00"),
            sales_count=0,
            average_sale=Decimal("0.00"),
            total_tax=Decimal("0.00"),
            total_discount=Decimal("0.00")
        )
    
    return schemas.SalesStats(
        total_sales=result.total_sales or Decimal("0.00"),
        sales_count=result.sales_count or 0,
        average_sale=result.average_sale or Decimal("0.00"),
        total_tax=result.total_tax or Decimal("0.00"),
        total_discount=result.total_discount or Decimal("0.00")
    )

def get_daily_sales_report(
    db: Session,
    report_date: date,
    store_id: Optional[int] = None
) -> schemas.DailySalesReport:
    """Get daily sales report"""
    start_datetime = datetime.combine(report_date, datetime.min.time())
    end_datetime = datetime.combine(report_date, datetime.max.time())
    
    # Base query
    base_query = db.query(models.SalesTransaction).filter(
        models.SalesTransaction.sale_date >= start_datetime,
        models.SalesTransaction.sale_date <= end_datetime,
        models.SalesTransaction.payment_status != schemas.PaymentStatus.VOID
    )
    
    if store_id:
        base_query = base_query.filter(models.SalesTransaction.store_id == store_id)
    
    # Get total sales
    total_result = base_query.with_entities(
        func.sum(models.SalesTransaction.grand_total).label("total"),
        func.count(models.SalesTransaction.sale_id).label("count")
    ).first()
    
    # Get sales by payment method
    payment_totals = db.query(
        models.PaymentMethod.method_name,
        func.sum(models.Payment.amount).label("total")
    ).join(
        models.Payment,
        models.Payment.payment_method_id == models.PaymentMethod.payment_method_id
    ).join(
        models.SalesTransaction,
        models.SalesTransaction.sale_id == models.Payment.sale_id
    ).filter(
        models.SalesTransaction.sale_date >= start_datetime,
        models.SalesTransaction.sale_date <= end_datetime,
        models.SalesTransaction.payment_status != schemas.PaymentStatus.VOID
    )
    
    if store_id:
        payment_totals = payment_totals.filter(models.SalesTransaction.store_id == store_id)
    
    payment_totals = payment_totals.group_by(models.PaymentMethod.method_name).all()
    
    # Organize payment totals
    cash_sales = Decimal("0.00")
    card_sales = Decimal("0.00")
    other_sales = Decimal("0.00")
    
    for method_name, total in payment_totals:
        if method_name.lower() == "cash":
            cash_sales = total or Decimal("0.00")
        elif method_name.lower() in ["credit card", "debit card"]:
            card_sales += total or Decimal("0.00")
        else:
            other_sales += total or Decimal("0.00")
    
    return schemas.DailySalesReport(
        date=report_date,
        total_sales=total_result.total or Decimal("0.00"),
        sales_count=total_result.count or 0,
        cash_sales=cash_sales,
        card_sales=card_sales,
        other_sales=other_sales
    ) 