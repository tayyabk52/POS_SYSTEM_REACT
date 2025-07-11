from sqlalchemy.orm import Session
from . import models, schemas
from typing import List, Optional

def get_product(db: Session, product_id: int) -> Optional[models.Product]:
    return db.query(models.Product).filter(models.Product.product_id == product_id).first()

def get_products(db: Session, skip: int = 0, limit: int = 100) -> List[models.Product]:
    return db.query(models.Product).offset(skip).limit(limit).all()

def create_product(db: Session, product: schemas.ProductCreate) -> models.Product:
    db_product = models.Product(
        product_code=product.product_code,
        product_name=product.product_name,
        description=product.description,
        category_id=product.category_id,
        brand_id=product.brand_id,
        supplier_id=product.supplier_id,
        base_price=product.base_price,
        retail_price=product.retail_price,
        tax_category_id=product.tax_category_id,
        is_active=product.is_active,
        barcode=product.barcode,
        unit_of_measure=product.unit_of_measure,
        weight=product.weight,
        reorder_level=product.reorder_level,
        max_stock_level=product.max_stock_level,
    )
    db.add(db_product)
    db.flush()  # get product_id
    # Add variants
    for v in product.variants or []:
        db_variant = models.ProductVariant(
            product_id=db_product.product_id,
            size=v.size,
            color=v.color,
            sku_suffix=v.sku_suffix,
            barcode=v.barcode,
            retail_price=v.retail_price,
            base_price=v.base_price,
            is_active=v.is_active,
        )
        db.add(db_variant)
    db.commit()
    db.refresh(db_product)
    return db_product

def update_product(db: Session, product_id: int, product: schemas.ProductUpdate) -> Optional[models.Product]:
    db_product = get_product(db, product_id)
    if not db_product:
        return None
    for field, value in product.dict(exclude_unset=True).items():
        if field != 'variants':
            setattr(db_product, field, value)
    # Handle variants: simple replace all for now
    if product.variants is not None:
        db.query(models.ProductVariant).filter(models.ProductVariant.product_id == product_id).delete()
        for v in product.variants:
            db_variant = models.ProductVariant(
                product_id=product_id,
                size=v.size,
                color=v.color,
                sku_suffix=v.sku_suffix,
                barcode=v.barcode,
                retail_price=v.retail_price,
                base_price=v.base_price,
                is_active=v.is_active,
            )
            db.add(db_variant)
    db.commit()
    db.refresh(db_product)
    return db_product

def delete_product(db: Session, product_id: int) -> bool:
    db_product = get_product(db, product_id)
    if not db_product:
        return False
    db.delete(db_product)
    db.commit()
    return True 