from sqlalchemy.orm import Session
from . import models, schemas
from typing import List, Optional
from sqlalchemy import text

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
        print('[update_product] Product not found:', product_id)
        return None
    for field, value in product.dict(exclude_unset=True).items():
        if field != 'variants':
            setattr(db_product, field, value)
    if product.variants is not None:
        print('[update_product] Incoming variants:', product.variants)
        existing_variants = db.query(models.ProductVariant).filter(models.ProductVariant.product_id == product_id).all()
        print('[update_product] Existing variants:', existing_variants)
        existing_variant_ids = set([v.variant_id for v in existing_variants if is_plain_int(v.variant_id)])
        payload_variant_ids = set([getattr(v, 'variant_id', None) for v in product.variants if is_plain_int(getattr(v, 'variant_id', None))])
        # Ensure both sets are only ints before subtraction
        existing_variant_ids = set([vid for vid in existing_variant_ids if is_plain_int(vid)])
        payload_variant_ids = set([vid for vid in payload_variant_ids if is_plain_int(vid)])
        print('[update_product] existing_variant_ids:', existing_variant_ids)
        print('[update_product] payload_variant_ids:', payload_variant_ids)

        # Update or insert variants from payload
        for v in product.variants:
            print('[update_product] Processing variant:', v)
            if hasattr(v, 'variant_id') and v.variant_id:
                db_variant = db.query(models.ProductVariant).get(v.variant_id)
                if db_variant:
                    # Barcode uniqueness check (exclude self)
                    if v.barcode:
                        print(f'[update_product] Checking barcode uniqueness for update: {v.barcode}, variant_id: {v.variant_id}')
                        existing = db.query(models.ProductVariant).filter(
                            models.ProductVariant.barcode == v.barcode,
                            models.ProductVariant.variant_id != v.variant_id
                        ).first()
                        print('[update_product] Barcode check result:', existing)
                        if existing:
                            print(f'[update_product] ERROR: Barcode {v.barcode} already exists for another variant.')
                            raise Exception(f"Barcode {v.barcode} already exists for another variant.")
                    for attr in ['size', 'color', 'sku_suffix', 'barcode', 'retail_price', 'base_price', 'is_active']:
                        setattr(db_variant, attr, getattr(v, attr, getattr(db_variant, attr)))
                    print('[update_product] Updated variant:', db_variant)
            else:
                # Barcode uniqueness check for new variant
                if getattr(v, 'barcode', None):
                    print(f'[update_product] Checking barcode uniqueness for new: {v.barcode}')
                    existing = db.query(models.ProductVariant).filter(
                        models.ProductVariant.barcode == v.barcode
                    ).first()
                    print('[update_product] Barcode check result:', existing)
                    if existing:
                        print(f'[update_product] ERROR: Barcode {v.barcode} already exists for another variant.')
                        raise Exception(f"Barcode {v.barcode} already exists for another variant.")
                db_variant = models.ProductVariant(
                    product_id=product_id,
                    size=getattr(v, 'size', None),
                    color=getattr(v, 'color', None),
                    sku_suffix=getattr(v, 'sku_suffix', None),
                    barcode=getattr(v, 'barcode', None),
                    retail_price=getattr(v, 'retail_price', None),
                    base_price=getattr(v, 'base_price', None),
                    is_active=getattr(v, 'is_active', True),
                )
                db.add(db_variant)
                print('[update_product] Added new variant:', db_variant)

        # For variants in DB but not in payload, try to delete or deactivate
        to_remove = existing_variant_ids - payload_variant_ids
        print('[update_product] Variants to remove:', to_remove)
        for variant_id in to_remove:
            inventory_ref = db.execute(
                text('SELECT 1 FROM inventory WHERE variant_id = :variant_id LIMIT 1'),
                {'variant_id': variant_id}
            ).first()
            db_variant = db.query(models.ProductVariant).get(variant_id)
            if inventory_ref:
                print(f'[update_product] Soft-deleting variant {variant_id} (referenced in inventory)')
                if db_variant:
                    db_variant.is_active = False
            else:
                print(f'[update_product] Deleting variant {variant_id} (not referenced)')
                if db_variant:
                    db.delete(db_variant)
    db.commit()
    db.refresh(db_product)
    print('[update_product] Product update complete:', db_product)
    return db_product

def delete_product(db: Session, product_id: int) -> bool:
    db_product = get_product(db, product_id)
    if not db_product:
        return False
    db.delete(db_product)
    db.commit()
    return True 

def is_plain_int(val):
    return isinstance(val, int) and not hasattr(val, '__clause_element__') 