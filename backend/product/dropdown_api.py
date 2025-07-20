from fastapi import APIRouter, HTTPException, Body
from backend.database import engine
from sqlalchemy import text

router = APIRouter(prefix="/dropdown", tags=["dropdown"])

@router.get("/categories")
def get_categories():
    """Get all categories for dropdown"""
    with engine.connect() as conn:
        result = conn.execute(text("SELECT category_id, category_name FROM categories ORDER BY category_name"))
        return [{"category_id": row[0], "category_name": row[1]} for row in result]

@router.post("/categories")
def add_category(category_name: str = Body(..., embed=True)):
    if not category_name or not category_name.strip():
        raise HTTPException(status_code=400, detail="Category name required")
    with engine.begin() as conn:
        # Check for duplicate
        exists = conn.execute(
            text("SELECT 1 FROM categories WHERE category_name = :name"),
            {"name": category_name.strip()}
        ).first()
        if exists:
            raise HTTPException(status_code=409, detail="Category already exists")
        result = conn.execute(
            text("INSERT INTO categories (category_name) VALUES (:name) RETURNING category_id, category_name"),
            {"name": category_name.strip()}
        )
        row = result.mappings().first()
        if row:
            return dict(row)
        else:
            raise HTTPException(status_code=500, detail="Failed to add category")

@router.post("/brands")
def add_brand(brand_name: str = Body(..., embed=True)):
    if not brand_name or not brand_name.strip():
        raise HTTPException(status_code=400, detail="Brand name required")
    with engine.begin() as conn:
        exists = conn.execute(
            text("SELECT 1 FROM brands WHERE brand_name = :name"),
            {"name": brand_name.strip()}
        ).first()
        if exists:
            raise HTTPException(status_code=409, detail="Brand already exists")
        result = conn.execute(
            text("INSERT INTO brands (brand_name) VALUES (:name) RETURNING brand_id, brand_name"),
            {"name": brand_name.strip()}
        )
        row = result.mappings().first()
        if row:
            return dict(row)
        else:
            raise HTTPException(status_code=500, detail="Failed to add brand")

@router.get("/brands")
def get_brands():
    """Get all brands for dropdown"""
    with engine.connect() as conn:
        result = conn.execute(text("SELECT brand_id, brand_name FROM brands ORDER BY brand_name"))
        return [{"brand_id": row[0], "brand_name": row[1]} for row in result]

@router.get("/suppliers")
def get_suppliers():
    """Get all suppliers for dropdown"""
    with engine.connect() as conn:
        result = conn.execute(text("SELECT supplier_id, supplier_name FROM suppliers WHERE is_active = TRUE ORDER BY supplier_name"))
        return [{"supplier_id": row[0], "supplier_name": row[1]} for row in result]

@router.get("/tax-categories")
def get_tax_categories():
    """Get all tax categories for dropdown"""
    with engine.connect() as conn:
        result = conn.execute(text("SELECT tax_category_id, tax_category_name FROM tax_categories WHERE is_active = TRUE ORDER BY tax_category_name"))
        return [{"tax_category_id": row[0], "tax_category_name": row[1]} for row in result] 