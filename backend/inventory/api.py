from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from . import crud, schemas

router = APIRouter(prefix="/inventory", tags=["inventory"])

@router.get("/", response_model=List[schemas.InventoryWithDetails])
def get_inventory(
    store_id: Optional[int] = Query(None, description="Filter by store ID"),
    category_id: Optional[int] = Query(None, description="Filter by category ID"),
    brand_id: Optional[int] = Query(None, description="Filter by brand ID"),
    search: Optional[str] = Query(None, description="Search by product name, code, or variant"),
    low_stock_only: bool = Query(False, description="Show only low stock items"),
    out_of_stock_only: bool = Query(False, description="Show only out of stock items")
):
    """Get inventory items with filtering options"""
    try:
        inventory_items = crud.get_inventory_with_details(
            store_id=store_id,
            category_id=category_id,
            brand_id=brand_id,
            search=search,
            low_stock_only=low_stock_only,
            out_of_stock_only=out_of_stock_only
        )
        return inventory_items
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch inventory: {str(e)}")

@router.get("/summary", response_model=schemas.InventorySummary)
def get_inventory_summary():
    """Get inventory summary statistics"""
    try:
        summary = crud.get_inventory_summary()
        return summary
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch inventory summary: {str(e)}")

@router.post("/", response_model=schemas.InventoryWithDetails)
def create_inventory(inventory: schemas.InventoryCreate):
    """Create a new inventory record"""
    try:
        new_inventory = crud.create_inventory(inventory)
        return new_inventory
    except ValueError as ve:
        raise HTTPException(status_code=409, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create inventory: {str(e)}")

@router.post("/adjust-stock")
def adjust_stock(adjustment: schemas.StockAdjustment):
    """Adjust stock for a specific inventory item"""
    try:
        success = crud.update_inventory_stock(
            inventory_id=adjustment.inventory_id,
            new_stock=adjustment.new_stock,
            user_id=adjustment.user_id,
            reason=adjustment.reason
        )
        if success:
            return {"message": "Stock adjusted successfully"}
        else:
            raise HTTPException(status_code=404, detail="Inventory item not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to adjust stock: {str(e)}")

@router.post("/stock-take")
def perform_stock_take(stock_take: schemas.StockTake):
    """Perform stock take for a specific inventory item"""
    try:
        success = crud.perform_stock_take(
            inventory_id=stock_take.inventory_id,
            actual_count=stock_take.actual_count,
            user_id=stock_take.user_id,
            notes=stock_take.notes
        )
        if success:
            return {"message": "Stock take completed successfully"}
        else:
            raise HTTPException(status_code=404, detail="Inventory item not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to perform stock take: {str(e)}")

@router.post("/transfer")
def transfer_stock(transfer: schemas.StockTransfer):
    """Transfer stock between stores"""
    try:
        success = crud.transfer_stock(
            from_inventory_id=transfer.from_inventory_id,
            to_store_id=transfer.to_store_id,
            quantity=transfer.quantity,
            user_id=transfer.user_id,
            notes=transfer.notes
        )
        if success:
            return {"message": "Stock transfer completed successfully"}
        else:
            raise HTTPException(status_code=400, detail="Transfer failed - insufficient stock or invalid inventory")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to transfer stock: {str(e)}")

@router.get("/movements", response_model=List[schemas.InventoryMovement])
def get_movements(
    product_id: Optional[int] = Query(None, description="Filter by product ID"),
    variant_id: Optional[int] = Query(None, description="Filter by variant ID"),
    store_id: Optional[int] = Query(None, description="Filter by store ID"),
    movement_type: Optional[str] = Query(None, description="Filter by movement type"),
    limit: int = Query(50, description="Number of movements to return")
):
    """Get inventory movements with filtering options"""
    try:
        movements = crud.get_inventory_movements(
            product_id=product_id,
            variant_id=variant_id,
            store_id=store_id,
            movement_type=movement_type,
            limit=limit
        )
        return movements
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch movements: {str(e)}")

@router.get("/stores", response_model=List[schemas.Store])
def get_stores():
    """Get all active stores"""
    try:
        stores = crud.get_stores()
        return stores
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch stores: {str(e)}")

@router.get("/stores/{store_id}", response_model=schemas.Store)
def get_store(store_id: int):
    """Get a specific store by ID"""
    try:
        store = crud.get_store(store_id)
        if store:
            return store
        else:
            raise HTTPException(status_code=404, detail="Store not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch store: {str(e)}")

@router.post("/stores", response_model=schemas.Store)
def create_store(store: schemas.StoreCreate):
    """Create a new store"""
    try:
        new_store = crud.create_store(store)
        return new_store
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create store: {str(e)}")

@router.put("/stores/{store_id}", response_model=schemas.Store)
def update_store(store_id: int, store: schemas.StoreCreate):
    """Update an existing store"""
    try:
        updated_store = crud.update_store(store_id, store)
        return updated_store
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update store: {str(e)}")

@router.delete("/stores/{store_id}")
def delete_store(store_id: int):
    """Delete a store by ID"""
    try:
        crud.delete_store(store_id)
        return {"message": "Store deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete store: {str(e)}")

@router.get("/users", response_model=List[schemas.User])
def get_users():
    """Get all active users"""
    try:
        users = crud.get_users()
        return users
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch users: {str(e)}")

@router.get("/users/{user_id}", response_model=schemas.User)
def get_user(user_id: int):
    """Get a specific user by ID"""
    try:
        user = crud.get_user(user_id)
        if user:
            return user
        else:
            raise HTTPException(status_code=404, detail="User not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch user: {str(e)}")

@router.delete("/{inventory_id}")
def delete_inventory(inventory_id: int):
    """Delete an inventory record and all related transfer logs"""
    try:
        crud.delete_inventory(inventory_id)
        return {"message": "Inventory record and related logs deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete inventory: {str(e)}")

# ============================================================================
# BULK DATA OPTIMIZATION
# ============================================================================

@router.get("/bulk-data")
def get_all_inventory_data(
    store_id: Optional[int] = Query(None, description="Filter by store ID"),
    category_id: Optional[int] = Query(None, description="Filter by category ID"),
    brand_id: Optional[int] = Query(None, description="Filter by brand ID"),
    search: Optional[str] = Query(None, description="Search by product name, code, or variant"),
    low_stock_only: bool = Query(False, description="Show only low stock items"),
    out_of_stock_only: bool = Query(False, description="Show only out of stock items")
):
    """Get all inventory data in a single optimized call for faster loading"""
    try:
        return crud.get_all_inventory_data(
            store_id=store_id,
            category_id=category_id,
            brand_id=brand_id,
            search=search,
            low_stock_only=low_stock_only,
            out_of_stock_only=out_of_stock_only
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch bulk data: {str(e)}") 