from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import date, datetime
from decimal import Decimal


# Base schemas
class TaxCategoryBase(BaseModel):
    tax_category_name: str = Field(..., min_length=1, max_length=100, description="Name of the tax category")
    tax_rate: Decimal = Field(..., ge=0, le=100, description="Tax rate percentage (0-100)")
    effective_date: date = Field(..., description="Effective date for the tax rate")
    is_active: bool = Field(default=True, description="Whether the tax category is active")


class PaymentMethodBase(BaseModel):
    method_name: str = Field(..., min_length=1, max_length=100, description="Name of the payment method")
    is_active: bool = Field(default=True, description="Whether the payment method is active")


class ExpenseCategoryBase(BaseModel):
    category_name: str = Field(..., min_length=1, max_length=100, description="Name of the expense category")


class RoleBase(BaseModel):
    role_name: str = Field(..., min_length=1, max_length=100, description="Name of the role")
    description: Optional[str] = Field(None, description="Description of the role")


class PermissionBase(BaseModel):
    permission_name: str = Field(..., min_length=1, max_length=100, description="Name of the permission")
    description: Optional[str] = Field(None, description="Description of the permission")


class SettingBase(BaseModel):
    setting_key: str = Field(..., min_length=1, max_length=100, description="Setting key")
    setting_value: str = Field(..., description="Setting value")
    store_id: Optional[int] = Field(None, description="Store ID for store-specific settings")


class POSTerminalBase(BaseModel):
    store_id: int = Field(..., description="Store ID where the terminal is located")
    terminal_name: str = Field(..., min_length=1, max_length=100, description="Name of the POS terminal")
    ip_address: Optional[str] = Field(None, max_length=50, description="IP address of the terminal")
    is_active: bool = Field(default=True, description="Whether the terminal is active")


class RolePermissionBase(BaseModel):
    role_id: int = Field(..., description="Role ID")
    permission_id: int = Field(..., description="Permission ID")


# Create schemas
class TaxCategoryCreate(TaxCategoryBase):
    pass


class PaymentMethodCreate(PaymentMethodBase):
    pass


class ExpenseCategoryCreate(ExpenseCategoryBase):
    pass


class RoleCreate(RoleBase):
    pass


class PermissionCreate(PermissionBase):
    pass


class SettingCreate(SettingBase):
    pass


class POSTerminalCreate(POSTerminalBase):
    pass


class RolePermissionCreate(RolePermissionBase):
    pass


# Update schemas
class TaxCategoryUpdate(BaseModel):
    tax_category_name: Optional[str] = Field(None, min_length=1, max_length=100)
    tax_rate: Optional[Decimal] = Field(None, ge=0, le=100)
    effective_date: Optional[date] = None
    is_active: Optional[bool] = None


class PaymentMethodUpdate(BaseModel):
    method_name: Optional[str] = Field(None, min_length=1, max_length=100)
    is_active: Optional[bool] = None


class ExpenseCategoryUpdate(BaseModel):
    category_name: Optional[str] = Field(None, min_length=1, max_length=100)


class RoleUpdate(BaseModel):
    role_name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None


class PermissionUpdate(BaseModel):
    permission_name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None


class SettingUpdate(BaseModel):
    setting_value: Optional[str] = None
    store_id: Optional[int] = None


class POSTerminalUpdate(BaseModel):
    terminal_name: Optional[str] = Field(None, min_length=1, max_length=100)
    ip_address: Optional[str] = Field(None, max_length=50)
    is_active: Optional[bool] = None


# Response schemas
class TaxCategoryResponse(TaxCategoryBase):
    tax_category_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PaymentMethodResponse(PaymentMethodBase):
    payment_method_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ExpenseCategoryResponse(ExpenseCategoryBase):
    category_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class RoleResponse(RoleBase):
    role_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PermissionResponse(PermissionBase):
    permission_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class SettingResponse(SettingBase):
    setting_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class POSTerminalResponse(POSTerminalBase):
    terminal_id: int
    created_at: datetime
    updated_at: datetime
    store_name: Optional[str] = None  # For joined data

    class Config:
        from_attributes = True


class RolePermissionResponse(RolePermissionBase):
    role_name: Optional[str] = None
    permission_name: Optional[str] = None

    class Config:
        from_attributes = True


# List response schemas
class TaxCategoryListResponse(BaseModel):
    items: List[TaxCategoryResponse]
    total: int
    page: int
    size: int


class PaymentMethodListResponse(BaseModel):
    items: List[PaymentMethodResponse]
    total: int
    page: int
    size: int


class ExpenseCategoryListResponse(BaseModel):
    items: List[ExpenseCategoryResponse]
    total: int
    page: int
    size: int


class RoleListResponse(BaseModel):
    items: List[RoleResponse]
    total: int
    page: int
    size: int


class PermissionListResponse(BaseModel):
    items: List[PermissionResponse]
    total: int
    page: int
    size: int


class SettingListResponse(BaseModel):
    items: List[SettingResponse]
    total: int
    page: int
    size: int


class POSTerminalListResponse(BaseModel):
    items: List[POSTerminalResponse]
    total: int
    page: int
    size: int


class RolePermissionListResponse(BaseModel):
    items: List[RolePermissionResponse]
    total: int
    page: int
    size: int


# Special response schemas for role permissions
class RoleWithPermissionsResponse(RoleResponse):
    permissions: List[PermissionResponse] = []

    class Config:
        from_attributes = True


class PermissionWithRolesResponse(PermissionResponse):
    roles: List[RoleResponse] = []

    class Config:
        from_attributes = True


# Audit log schemas
class AuditLogBase(BaseModel):
    event_type: str = Field(..., min_length=1, max_length=100)
    event_details: Optional[str] = None
    ip_address: Optional[str] = Field(None, max_length=50)


class AuditLogCreate(AuditLogBase):
    user_id: Optional[int] = None


class AuditLogResponse(AuditLogBase):
    log_id: int
    user_id: Optional[int]
    timestamp: datetime
    user_name: Optional[str] = None  # For joined data

    class Config:
        from_attributes = True


class AuditLogListResponse(BaseModel):
    items: List[AuditLogResponse]
    total: int
    page: int
    size: int


# Search and filter schemas
class SettingsSearchParams(BaseModel):
    search: Optional[str] = None
    page: int = Field(default=1, ge=1)
    size: int = Field(default=10, ge=1, le=100)
    store_id: Optional[int] = None


class RolePermissionSearchParams(BaseModel):
    role_id: Optional[int] = None
    permission_id: Optional[int] = None
    page: int = Field(default=1, ge=1)
    size: int = Field(default=10, ge=1, le=100)


# Bulk operation schemas
class BulkRolePermissionCreate(BaseModel):
    role_id: int
    permission_ids: List[int] = Field(..., min_items=1)


class BulkRolePermissionDelete(BaseModel):
    role_id: int
    permission_ids: List[int] = Field(..., min_items=1)


# Validation methods
@validator('tax_category_name', 'method_name', 'category_name', 'role_name', 'permission_name')
def validate_name_not_empty(cls, v):
    if v and v.strip() == '':
        raise ValueError('Name cannot be empty or whitespace only')
    return v.strip()


@validator('setting_key')
def validate_setting_key(cls, v):
    if v and v.strip() == '':
        raise ValueError('Setting key cannot be empty or whitespace only')
    # Only allow alphanumeric and underscore
    if not v.replace('_', '').isalnum():
        raise ValueError('Setting key can only contain letters, numbers, and underscores')
    return v.strip() 