from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from . import crud, schemas

router = APIRouter(prefix="/settings", tags=["settings"])

# Tax Categories
@router.get("/tax-categories", response_model=List[schemas.TaxCategoryResponse])
def get_tax_categories(
    search: Optional[str] = Query(None, description="Search by name"),
    active_only: bool = Query(False, description="Show only active tax categories")
):
    """Get tax categories with optional filtering"""
    try:
        return crud.get_tax_categories(search=search, active_only=active_only)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch tax categories: {str(e)}")

@router.post("/tax-categories", response_model=schemas.TaxCategoryResponse)
def create_tax_category(tax_category: schemas.TaxCategoryCreate):
    """Create a new tax category"""
    try:
        return crud.create_tax_category(tax_category)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create tax category: {str(e)}")

@router.put("/tax-categories/{tax_category_id}", response_model=schemas.TaxCategoryResponse)
def update_tax_category(tax_category_id: int, tax_category: schemas.TaxCategoryUpdate):
    """Update a tax category"""
    try:
        updated = crud.update_tax_category(tax_category_id, tax_category)
        if not updated:
            raise HTTPException(status_code=404, detail="Tax category not found")
        return updated
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update tax category: {str(e)}")

@router.delete("/tax-categories/{tax_category_id}")
def delete_tax_category(tax_category_id: int):
    """Delete a tax category"""
    try:
        if crud.delete_tax_category(tax_category_id):
            return {"message": "Tax category deleted successfully"}
        raise HTTPException(status_code=404, detail="Tax category not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete tax category: {str(e)}")

# Payment Methods
@router.get("/payment-methods", response_model=List[schemas.PaymentMethodResponse])
def get_payment_methods(
    search: Optional[str] = Query(None, description="Search by name"),
    active_only: bool = Query(False, description="Show only active payment methods")
):
    """Get payment methods with optional filtering"""
    try:
        return crud.get_payment_methods(search=search, active_only=active_only)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch payment methods: {str(e)}")

@router.post("/payment-methods", response_model=schemas.PaymentMethodResponse)
def create_payment_method(payment_method: schemas.PaymentMethodCreate):
    """Create a new payment method"""
    try:
        return crud.create_payment_method(payment_method)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create payment method: {str(e)}")

@router.put("/payment-methods/{payment_method_id}", response_model=schemas.PaymentMethodResponse)
def update_payment_method(payment_method_id: int, payment_method: schemas.PaymentMethodUpdate):
    """Update a payment method"""
    try:
        updated = crud.update_payment_method(payment_method_id, payment_method)
        if not updated:
            raise HTTPException(status_code=404, detail="Payment method not found")
        return updated
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update payment method: {str(e)}")

@router.delete("/payment-methods/{payment_method_id}")
def delete_payment_method(payment_method_id: int):
    """Delete a payment method"""
    try:
        if crud.delete_payment_method(payment_method_id):
            return {"message": "Payment method deleted successfully"}
        raise HTTPException(status_code=404, detail="Payment method not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete payment method: {str(e)}")

# Expense Categories
@router.get("/expense-categories", response_model=List[schemas.ExpenseCategoryResponse])
def get_expense_categories(
    search: Optional[str] = Query(None, description="Search by name")
):
    """Get expense categories with optional filtering"""
    try:
        return crud.get_expense_categories(search=search)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch expense categories: {str(e)}")

@router.post("/expense-categories", response_model=schemas.ExpenseCategoryResponse)
def create_expense_category(expense_category: schemas.ExpenseCategoryCreate):
    """Create a new expense category"""
    try:
        return crud.create_expense_category(expense_category)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create expense category: {str(e)}")

@router.put("/expense-categories/{category_id}", response_model=schemas.ExpenseCategoryResponse)
def update_expense_category(category_id: int, expense_category: schemas.ExpenseCategoryUpdate):
    """Update an expense category"""
    try:
        updated = crud.update_expense_category(category_id, expense_category)
        if not updated:
            raise HTTPException(status_code=404, detail="Expense category not found")
        return updated
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update expense category: {str(e)}")

@router.delete("/expense-categories/{category_id}")
def delete_expense_category(category_id: int):
    """Delete an expense category"""
    try:
        if crud.delete_expense_category(category_id):
            return {"message": "Expense category deleted successfully"}
        raise HTTPException(status_code=404, detail="Expense category not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete expense category: {str(e)}")

# Roles and Permissions
@router.get("/roles", response_model=List[schemas.RoleResponse])
def get_roles(
    search: Optional[str] = Query(None, description="Search by name or description")
):
    """Get all roles with optional filtering"""
    try:
        return crud.get_roles(search=search)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch roles: {str(e)}")

@router.post("/roles", response_model=schemas.RoleResponse)
def create_role(role: schemas.RoleCreate):
    """Create a new role"""
    try:
        return crud.create_role(role)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create role: {str(e)}")

@router.put("/roles/{role_id}", response_model=schemas.RoleResponse)
def update_role(role_id: int, role: schemas.RoleUpdate):
    """Update a role"""
    try:
        updated = crud.update_role(role_id, role)
        if not updated:
            raise HTTPException(status_code=404, detail="Role not found")
        return updated
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update role: {str(e)}")

@router.delete("/roles/{role_id}")
def delete_role(role_id: int):
    """Delete a role"""
    try:
        if crud.delete_role(role_id):
            return {"message": "Role deleted successfully"}
        raise HTTPException(status_code=404, detail="Role not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete role: {str(e)}")

@router.get("/permissions", response_model=List[schemas.PermissionResponse])
def get_permissions(
    search: Optional[str] = Query(None, description="Search by name or description")
):
    """Get all permissions with optional filtering"""
    try:
        return crud.get_permissions(search=search)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch permissions: {str(e)}")

@router.post("/roles/{role_id}/permissions/{permission_id}")
def assign_permission_to_role(role_id: int, permission_id: int):
    """Assign a permission to a role"""
    try:
        result = crud.assign_permission_to_role(role_id, permission_id)
        if result:
            return {"message": "Permission assigned to role successfully"}
        raise HTTPException(status_code=404, detail="Role or permission not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to assign permission: {str(e)}")

@router.delete("/roles/{role_id}/permissions/{permission_id}")
def remove_permission_from_role(role_id: int, permission_id: int):
    """Remove a permission from a role"""
    try:
        if crud.remove_permission_from_role(role_id, permission_id):
            return {"message": "Permission removed from role successfully"}
        raise HTTPException(status_code=404, detail="Role-permission association not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to remove permission: {str(e)}")

@router.get("/roles/{role_id}/permissions", response_model=List[schemas.RolePermissionResponse])
def get_role_permissions(role_id: int):
    """Get all permissions for a specific role"""
    try:
        return crud.get_role_permissions(role_id=role_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch role permissions: {str(e)}")

# System Settings
@router.get("/system", response_model=List[schemas.SettingResponse])
def get_system_settings(
    store_id: Optional[int] = Query(None, description="Filter by store ID")
):
    """Get system settings with optional store filter"""
    try:
        return crud.get_settings(store_id=store_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch settings: {str(e)}")

@router.post("/system", response_model=schemas.SettingResponse)
def create_system_setting(setting: schemas.SettingCreate):
    """Create a new system setting"""
    try:
        return crud.create_setting(setting)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create setting: {str(e)}")

@router.put("/system/{setting_id}", response_model=schemas.SettingResponse)
def update_system_setting(setting_id: int, setting: schemas.SettingUpdate):
    """Update a system setting"""
    try:
        updated = crud.update_setting(setting_id, setting)
        if not updated:
            raise HTTPException(status_code=404, detail="Setting not found")
        return updated
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update setting: {str(e)}")

# POS Terminals
@router.get("/pos-terminals", response_model=List[schemas.POSTerminalResponse])
def get_pos_terminals(
    store_id: Optional[int] = Query(None, description="Filter by store ID"),
    active_only: bool = Query(False, description="Show only active terminals")
):
    """Get POS terminals with optional filtering"""
    try:
        return crud.get_pos_terminals(store_id=store_id, active_only=active_only)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch POS terminals: {str(e)}")

@router.post("/pos-terminals", response_model=schemas.POSTerminalResponse)
def create_pos_terminal(terminal: schemas.POSTerminalCreate):
    """Create a new POS terminal"""
    try:
        return crud.create_pos_terminal(terminal)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create POS terminal: {str(e)}")

@router.put("/pos-terminals/{terminal_id}", response_model=schemas.POSTerminalResponse)
def update_pos_terminal(terminal_id: int, terminal: schemas.POSTerminalUpdate):
    """Update a POS terminal"""
    try:
        updated = crud.update_pos_terminal(terminal_id, terminal)
        if not updated:
            raise HTTPException(status_code=404, detail="POS terminal not found")
        return updated
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update POS terminal: {str(e)}")

@router.delete("/pos-terminals/{terminal_id}")
def delete_pos_terminal(terminal_id: int):
    """Delete a POS terminal"""
    try:
        if crud.delete_pos_terminal(terminal_id):
            return {"message": "POS terminal deleted successfully"}
        raise HTTPException(status_code=404, detail="POS terminal not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete POS terminal: {str(e)}")

# ============================================================================
# BULK DATA OPTIMIZATION
# ============================================================================

@router.get("/bulk-data")
def get_all_settings_data():
    """Get all settings data in a single optimized call for faster loading"""
    try:
        return crud.get_all_settings_data()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch bulk data: {str(e)}") 