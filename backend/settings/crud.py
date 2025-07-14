import logging
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import List, Optional, Dict, Any, Union
from datetime import datetime
import os
import sys
import pip
from psycopg2 import pool

# Install python-dotenv if not available
try:
    from dotenv import load_dotenv
except ImportError:
    pip.main(['install', 'python-dotenv'])
    from dotenv import load_dotenv

# Import schemas
from . import schemas

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database connection config
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = os.getenv('DB_PORT', '5432')
DB_NAME = os.getenv('DB_NAME', 'POSSYSTEM')
DB_USER = os.getenv('DB_USER', 'postgres')
DB_PASS = os.getenv('DB_PASS', 'admin')

# Database connection pool for better performance
_connection_pool = None

def get_connection_pool():
    """Get or create database connection pool"""
    global _connection_pool
    if _connection_pool is None:
        _connection_pool = psycopg2.pool.SimpleConnectionPool(
            minconn=1,
            maxconn=20,
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASS,
            host=DB_HOST,
            port=DB_PORT,
            cursor_factory=RealDictCursor
        )
    return _connection_pool

def get_db_connection():
    """Get a database connection from the pool with RealDictCursor"""
    pool = get_connection_pool()
    return pool.getconn()

def return_db_connection(conn):
    """Return a database connection to the pool"""
    pool = get_connection_pool()
    pool.putconn(conn)

def handle_db_error(e: Exception, operation: str) -> None:
    """Handle database errors with proper logging"""
    logger.error(f"Database error during {operation}: {str(e)}")
    logger.error(f"Traceback: {e.__traceback__}")
    raise e

def dict_from_row(row: Optional[RealDictCursor]) -> Optional[Dict[str, Any]]:
    """Convert a database row to a dictionary safely"""
    if row is None:
        return None
    return {key: value for key, value in dict(row).items()}

def list_from_rows(rows: List[RealDictCursor]) -> List[Dict[str, Any]]:
    """Convert a list of database rows to a list of dictionaries safely"""
    return [dict_from_row(row) for row in rows]

# ============================================================================
# TAX CATEGORIES
# ============================================================================

def create_tax_category(tax_category: 'schemas.TaxCategoryCreate') -> Dict[str, Any]:
    """Create a new tax category with logging and error handling."""
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        logger.info(f"Creating tax category: {tax_category.tax_category_name}")
        
        cur.execute("""
            INSERT INTO tax_categories (
                tax_category_name, tax_rate, effective_date, is_active
            ) VALUES (%s, %s, %s, %s)
            RETURNING *
        """, (
            tax_category.tax_category_name,
            float(tax_category.tax_rate),
            tax_category.effective_date,
            tax_category.is_active
        ))
        
        new_tax_category = cur.fetchone()
        conn.commit()
        
        logger.info(f"Successfully created tax category with ID: {new_tax_category['tax_category_id']}")
        return dict(new_tax_category)
    except Exception as e:
        conn.rollback()
        handle_db_error(e, "create_tax_category")
    finally:
        cur.close()
        return_db_connection(conn)


def get_tax_category(tax_category_id: int) -> Optional[Dict[str, Any]]:
    """Get a tax category by ID."""
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            SELECT * FROM tax_categories 
            WHERE tax_category_id = %s
        """, (tax_category_id,))
        
        result = cur.fetchone()
        return dict(result) if result else None
    except Exception as e:
        handle_db_error(e, "get_tax_category")
    finally:
        cur.close()
        return_db_connection(conn)


def get_tax_categories(
    search: Optional[str] = None,
    active_only: bool = False,
    skip: int = 0,
    limit: int = 100
) -> List[Dict[str, Any]]:
    """Get tax categories with optional filtering and search."""
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        query = "SELECT * FROM tax_categories WHERE 1=1"
        params = []
        
        if search:
            query += " AND tax_category_name ILIKE %s"
            params.append(f"%{search}%")
        
        if active_only:
            query += " AND is_active = TRUE"
        
        query += " ORDER BY tax_category_name"
        query += " OFFSET %s LIMIT %s"
        params.extend([skip, limit])
        
        cur.execute(query, params)
        results = cur.fetchall()
        return [dict(row) for row in results]
    except Exception as e:
        handle_db_error(e, "get_tax_categories")
    finally:
        cur.close()
        return_db_connection(conn)


def update_tax_category(
    tax_category_id: int, 
    tax_category: 'schemas.TaxCategoryUpdate'
) -> Optional[Dict[str, Any]]:
    """Update a tax category."""
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        logger.info(f"Updating tax category {tax_category_id}")
        
        # Build update query dynamically based on provided fields
        update_fields = []
        params = []
        update_data = tax_category.dict(exclude_unset=True)
        
        for field, value in update_data.items():
            update_fields.append(f"{field} = %s")
            # Convert Decimal to float for tax_rate
            params.append(float(value) if field == 'tax_rate' else value)
        
        if not update_fields:
            return get_tax_category(tax_category_id)
        
        # Add updated_at field
        update_fields.append("updated_at = CURRENT_TIMESTAMP")
        
        # Add tax_category_id to params
        params.append(tax_category_id)
        
        query = f"""
            UPDATE tax_categories 
            SET {", ".join(update_fields)}
            WHERE tax_category_id = %s
            RETURNING *
        """
        
        cur.execute(query, params)
        updated = cur.fetchone()
        
        if not updated:
            return None
        
        conn.commit()
        logger.info(f"Successfully updated tax category {tax_category_id}")
        return dict(updated)
    except Exception as e:
        conn.rollback()
        handle_db_error(e, "update_tax_category")
    finally:
        cur.close()
        return_db_connection(conn)


def delete_tax_category(tax_category_id: int) -> bool:
    """Delete a tax category."""
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        logger.info(f"Deleting tax category {tax_category_id}")
        
        cur.execute("""
            DELETE FROM tax_categories 
            WHERE tax_category_id = %s
            RETURNING tax_category_id
        """, (tax_category_id,))
        
        deleted = cur.fetchone()
        conn.commit()
        
        success = bool(deleted)
        if success:
            logger.info(f"Successfully deleted tax category {tax_category_id}")
        else:
            logger.warning(f"Tax category {tax_category_id} not found for deletion")
        
        return success
    except Exception as e:
        conn.rollback()
        handle_db_error(e, "delete_tax_category")
    finally:
        cur.close()
        return_db_connection(conn)


# ============================================================================
# PAYMENT METHODS
# ============================================================================

def create_payment_method(payment_method: 'schemas.PaymentMethodCreate') -> Dict[str, Any]:
    """Create a new payment method."""
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        logger.info(f"Creating payment method: {payment_method.method_name}")
        
        cur.execute("""
            INSERT INTO payment_methods (
                method_name, is_active
            ) VALUES (%s, %s)
            RETURNING *
        """, (
            payment_method.method_name,
            payment_method.is_active
        ))
        
        new_payment_method = cur.fetchone()
        conn.commit()
        
        logger.info(f"Successfully created payment method with ID: {new_payment_method['payment_method_id']}")
        return dict(new_payment_method)
    except Exception as e:
        conn.rollback()
        handle_db_error(e, "create_payment_method")
    finally:
        cur.close()
        return_db_connection(conn)


def get_payment_method(payment_method_id: int) -> Optional[Dict[str, Any]]:
    """Get a payment method by ID."""
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            SELECT * FROM payment_methods 
            WHERE payment_method_id = %s
        """, (payment_method_id,))
        
        result = cur.fetchone()
        return dict(result) if result else None
    except Exception as e:
        handle_db_error(e, "get_payment_method")
    finally:
        cur.close()
        return_db_connection(conn)


def get_payment_methods(
    search: Optional[str] = None,
    active_only: bool = False,
    skip: int = 0,
    limit: int = 100
) -> List[Dict[str, Any]]:
    """Get payment methods with optional filtering."""
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        query = "SELECT * FROM payment_methods WHERE 1=1"
        params = []
        
        if search:
            query += " AND method_name ILIKE %s"
            params.append(f"%{search}%")
        
        if active_only:
            query += " AND is_active = TRUE"
        
        query += " ORDER BY method_name"
        query += " OFFSET %s LIMIT %s"
        params.extend([skip, limit])
        
        cur.execute(query, params)
        results = cur.fetchall()
        return [dict(row) for row in results]
    except Exception as e:
        handle_db_error(e, "get_payment_methods")
    finally:
        cur.close()
        return_db_connection(conn)


def update_payment_method(
    payment_method_id: int, 
    payment_method: 'schemas.PaymentMethodUpdate'
) -> Optional[Dict[str, Any]]:
    """Update a payment method."""
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        logger.info(f"Updating payment method {payment_method_id}")
        
        # Build update query dynamically based on provided fields
        update_fields = []
        params = []
        update_data = payment_method.dict(exclude_unset=True)
        
        for field, value in update_data.items():
            update_fields.append(f"{field} = %s")
            params.append(value)
        
        if not update_fields:
            return get_payment_method(payment_method_id)
        
        # Add updated_at field
        update_fields.append("updated_at = CURRENT_TIMESTAMP")
        
        # Add payment_method_id to params
        params.append(payment_method_id)
        
        query = f"""
            UPDATE payment_methods 
            SET {", ".join(update_fields)}
            WHERE payment_method_id = %s
            RETURNING *
        """
        
        cur.execute(query, params)
        updated = cur.fetchone()
        
        if not updated:
            return None
        
        conn.commit()
        logger.info(f"Successfully updated payment method {payment_method_id}")
        return dict(updated)
    except Exception as e:
        conn.rollback()
        handle_db_error(e, "update_payment_method")
    finally:
        cur.close()
        return_db_connection(conn)


def delete_payment_method(payment_method_id: int) -> bool:
    """Delete a payment method."""
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        logger.info(f"Deleting payment method {payment_method_id}")
        
        cur.execute("""
            DELETE FROM payment_methods 
            WHERE payment_method_id = %s
            RETURNING payment_method_id
        """, (payment_method_id,))
        
        deleted = cur.fetchone()
        conn.commit()
        
        success = bool(deleted)
        if success:
            logger.info(f"Successfully deleted payment method {payment_method_id}")
        else:
            logger.warning(f"Payment method {payment_method_id} not found for deletion")
        
        return success
    except Exception as e:
        conn.rollback()
        handle_db_error(e, "delete_payment_method")
    finally:
        cur.close()
        return_db_connection(conn)


# ============================================================================
# EXPENSE CATEGORIES
# ============================================================================

def create_expense_category(expense_category: 'schemas.ExpenseCategoryCreate') -> Dict[str, Any]:
    """Create a new expense category."""
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        logger.info(f"Creating expense category: {expense_category.category_name}")
        
        cur.execute("""
            INSERT INTO expense_categories (
                category_name
            ) VALUES (%s)
            RETURNING *
        """, (expense_category.category_name,))
        
        new_expense_category = cur.fetchone()
        conn.commit()
        
        logger.info(f"Successfully created expense category with ID: {new_expense_category['category_id']}")
        return dict(new_expense_category)
    except Exception as e:
        conn.rollback()
        handle_db_error(e, "create_expense_category")
    finally:
        cur.close()
        return_db_connection(conn)


def get_expense_category(category_id: int) -> Optional[Dict[str, Any]]:
    """Get an expense category by ID."""
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            SELECT * FROM expense_categories 
            WHERE category_id = %s
        """, (category_id,))
        
        result = cur.fetchone()
        return dict(result) if result else None
    except Exception as e:
        handle_db_error(e, "get_expense_category")
    finally:
        cur.close()
        return_db_connection(conn)


def get_expense_categories(
    search: Optional[str] = None,
    skip: int = 0, 
    limit: int = 100
) -> List[Dict[str, Any]]:
    """Get expense categories with optional search."""
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        query = "SELECT * FROM expense_categories WHERE 1=1"
        params = []
        
        if search:
            query += " AND category_name ILIKE %s"
            params.append(f"%{search}%")
        
        query += " ORDER BY category_name"
        query += " OFFSET %s LIMIT %s"
        params.extend([skip, limit])
        
        cur.execute(query, params)
        results = cur.fetchall()
        return [dict(row) for row in results]
    except Exception as e:
        handle_db_error(e, "get_expense_categories")
    finally:
        cur.close()
        return_db_connection(conn)


def update_expense_category(
    category_id: int, 
    expense_category: 'schemas.ExpenseCategoryUpdate'
) -> Optional[Dict[str, Any]]:
    """Update an expense category."""
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        logger.info(f"Updating expense category {category_id}")
        
        # Build update query dynamically based on provided fields
        update_fields = []
        params = []
        update_data = expense_category.dict(exclude_unset=True)
        
        for field, value in update_data.items():
            update_fields.append(f"{field} = %s")
            params.append(value)
        
        if not update_fields:
            return get_expense_category(category_id)
        
        # Add updated_at field
        update_fields.append("updated_at = CURRENT_TIMESTAMP")
        
        # Add category_id to params
        params.append(category_id)
        
        query = f"""
            UPDATE expense_categories 
            SET {", ".join(update_fields)}
            WHERE category_id = %s
            RETURNING *
        """
        
        cur.execute(query, params)
        updated = cur.fetchone()
        
        if not updated:
            return None
        
        conn.commit()
        logger.info(f"Successfully updated expense category {category_id}")
        return dict(updated)
    except Exception as e:
        conn.rollback()
        handle_db_error(e, "update_expense_category")
    finally:
        cur.close()
        return_db_connection(conn)


def delete_expense_category(category_id: int) -> bool:
    """Delete an expense category."""
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        logger.info(f"Deleting expense category {category_id}")
        
        cur.execute("""
            DELETE FROM expense_categories 
            WHERE category_id = %s
            RETURNING category_id
        """, (category_id,))
        
        deleted = cur.fetchone()
        conn.commit()
        
        success = bool(deleted)
        if success:
            logger.info(f"Successfully deleted expense category {category_id}")
        else:
            logger.warning(f"Expense category {category_id} not found for deletion")
        
        return success
    except Exception as e:
        conn.rollback()
        handle_db_error(e, "delete_expense_category")
    finally:
        cur.close()
        return_db_connection(conn)


# ============================================================================
# ROLES AND PERMISSIONS
# ============================================================================

def create_role(role: 'schemas.RoleCreate') -> Dict[str, Any]:
    """Create a new role."""
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        logger.info(f"Creating role: {role.role_name}")
        
        cur.execute("""
            INSERT INTO roles (
                role_name, description
            ) VALUES (%s, %s)
            RETURNING *
        """, (
            role.role_name,
            role.description
        ))
        
        new_role = cur.fetchone()
        conn.commit()
        
        logger.info(f"Successfully created role with ID: {new_role['role_id']}")
        return dict(new_role)
    except Exception as e:
        conn.rollback()
        handle_db_error(e, "create_role")
    finally:
        cur.close()
        return_db_connection(conn)


def get_role(role_id: int) -> Optional[Dict[str, Any]]:
    """Get a role by ID."""
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            SELECT * FROM roles 
            WHERE role_id = %s
        """, (role_id,))
        
        result = cur.fetchone()
        return dict(result) if result else None
    except Exception as e:
        handle_db_error(e, "get_role")
    finally:
        cur.close()
        return_db_connection(conn)


def get_roles(
    search: Optional[str] = None,
    skip: int = 0, 
    limit: int = 100
) -> List[Dict[str, Any]]:
    """Get roles with optional search."""
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        query = "SELECT * FROM roles WHERE 1=1"
        params = []
        
        if search:
            query += """ AND (
                role_name ILIKE %s OR 
                description ILIKE %s
            )"""
            search_term = f"%{search}%"
            params.extend([search_term, search_term])
        
        query += " ORDER BY role_name"
        query += " OFFSET %s LIMIT %s"
        params.extend([skip, limit])
        
        cur.execute(query, params)
        results = cur.fetchall()
        return [dict(row) for row in results]
    except Exception as e:
        handle_db_error(e, "get_roles")
    finally:
        cur.close()
        return_db_connection(conn)


def update_role(
    role_id: int, 
    role: 'schemas.RoleUpdate'
) -> Optional[Dict[str, Any]]:
    """Update a role."""
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        logger.info(f"Updating role {role_id}")
        
        # Build update query dynamically based on provided fields
        update_fields = []
        params = []
        update_data = role.dict(exclude_unset=True)
        
        for field, value in update_data.items():
            update_fields.append(f"{field} = %s")
            params.append(value)
        
        if not update_fields:
            return get_role(role_id)
        
        # Add updated_at field
        update_fields.append("updated_at = CURRENT_TIMESTAMP")
        
        # Add role_id to params
        params.append(role_id)
        
        query = f"""
            UPDATE roles 
            SET {", ".join(update_fields)}
            WHERE role_id = %s
            RETURNING *
        """
        
        cur.execute(query, params)
        updated = cur.fetchone()
        
        if not updated:
            return None
        
        conn.commit()
        logger.info(f"Successfully updated role {role_id}")
        return dict(updated)
    except Exception as e:
        conn.rollback()
        handle_db_error(e, "update_role")
    finally:
        cur.close()
        return_db_connection(conn)


def delete_role(role_id: int) -> bool:
    """Delete a role."""
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        logger.info(f"Deleting role {role_id}")
        
        cur.execute("""
            DELETE FROM roles 
            WHERE role_id = %s
            RETURNING role_id
        """, (role_id,))
        
        deleted = cur.fetchone()
        conn.commit()
        
        success = bool(deleted)
        if success:
                logger.info(f"Successfully deleted role {role_id}")
        else:
            logger.warning(f"Role {role_id} not found for deletion")
        
        return success
    except Exception as e:
        conn.rollback()
        handle_db_error(e, "delete_role")
    finally:
        cur.close()
        return_db_connection(conn)


def get_permissions(
    search: Optional[str] = None,
    skip: int = 0, 
    limit: int = 100
) -> List[Dict[str, Any]]:
    """Get permissions with optional search."""
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        query = "SELECT * FROM permissions WHERE 1=1"
        params = []
        
        if search:
            query += """ AND (
                permission_name ILIKE %s OR 
                description ILIKE %s
            )"""
            search_term = f"%{search}%"
            params.extend([search_term, search_term])
        
        query += " ORDER BY permission_name"
        query += " OFFSET %s LIMIT %s"
        params.extend([skip, limit])
        
        cur.execute(query, params)
        results = cur.fetchall()
        return [dict(row) for row in results]
    except Exception as e:
        handle_db_error(e, "get_permissions")
    finally:
        cur.close()
        return_db_connection(conn)


def assign_permission_to_role(role_id: int, permission_id: int) -> Optional[Dict[str, Any]]:
    """Assign a permission to a role."""
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        logger.info(f"Assigning permission {permission_id} to role {role_id}")
        
        # Check if role and permission exist
        cur.execute("SELECT role_id FROM roles WHERE role_id = %s", (role_id,))
        if not cur.fetchone():
            logger.warning(f"Role {role_id} not found")
            return None
        
        cur.execute("SELECT permission_id FROM permissions WHERE permission_id = %s", (permission_id,))
        if not cur.fetchone():
            logger.warning(f"Permission {permission_id} not found")
            return None
        
        # Check if assignment already exists
        cur.execute("""
            SELECT role_id FROM role_permissions 
            WHERE role_id = %s AND permission_id = %s
        """, (role_id, permission_id))
        
        if cur.fetchone():
            logger.warning(f"Permission {permission_id} already assigned to role {role_id}")
            return None
        
        # Create new assignment
        cur.execute("""
            INSERT INTO role_permissions (role_id, permission_id)
            VALUES (%s, %s)
            RETURNING *
        """, (role_id, permission_id))
        
        new_assignment = cur.fetchone()
        conn.commit()
        
        # Get role and permission details for response
        cur.execute("""
            SELECT 
                rp.role_id,
                rp.permission_id,
                r.role_name,
                p.permission_name
            FROM role_permissions rp
            JOIN roles r ON rp.role_id = r.role_id
            JOIN permissions p ON rp.permission_id = p.permission_id
            WHERE rp.role_id = %s AND rp.permission_id = %s
        """, (role_id, permission_id))
        
        result = cur.fetchone()
        logger.info(f"Successfully assigned permission {permission_id} to role {role_id}")
        return dict(result)
    except Exception as e:
        conn.rollback()
        handle_db_error(e, "assign_permission_to_role")
    finally:
        cur.close()
        return_db_connection(conn)


def remove_permission_from_role(role_id: int, permission_id: int) -> bool:
    """Remove a permission from a role."""
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        logger.info(f"Removing permission {permission_id} from role {role_id}")
        
        cur.execute("""
            DELETE FROM role_permissions 
            WHERE role_id = %s AND permission_id = %s
            RETURNING role_id
        """, (role_id, permission_id))
        
        deleted = cur.fetchone()
        conn.commit()
        
        success = bool(deleted)
        if success:
            logger.info(f"Successfully removed permission {permission_id} from role {role_id}")
        else:
            logger.warning(f"Permission {permission_id} not assigned to role {role_id}")
        
        return success
    except Exception as e:
        conn.rollback()
        handle_db_error(e, "remove_permission_from_role")
    finally:
        cur.close()
        return_db_connection(conn)


def get_role_permissions(
    role_id: Optional[int] = None,
    permission_id: Optional[int] = None,
    skip: int = 0, 
    limit: int = 100
) -> List[Dict[str, Any]]:
    """Get role permissions with optional filtering."""
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        query = """
            SELECT 
                rp.role_id,
                rp.permission_id,
                r.role_name,
                p.permission_name
            FROM role_permissions rp
            JOIN roles r ON rp.role_id = r.role_id
            JOIN permissions p ON rp.permission_id = p.permission_id
            WHERE 1=1
        """
        params = []
        
        if role_id:
            query += " AND rp.role_id = %s"
            params.append(role_id)
        
        if permission_id:
            query += " AND rp.permission_id = %s"
            params.append(permission_id)
        
        query += " ORDER BY r.role_name, p.permission_name"
        query += " OFFSET %s LIMIT %s"
        params.extend([skip, limit])
        
        cur.execute(query, params)
        results = cur.fetchall()
        return [dict(row) for row in results]
    except Exception as e:
        handle_db_error(e, "get_role_permissions")
    finally:
        cur.close()
        return_db_connection(conn)


def get_role_with_permissions(role_id: int) -> Optional[Dict[str, Any]]:
    """Get a role with all its permissions."""
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        # Get role details
        cur.execute("SELECT * FROM roles WHERE role_id = %s", (role_id,))
        role = cur.fetchone()
        
        if not role:
            return None
        
        # Get role's permissions
        cur.execute("""
            SELECT 
                p.permission_id,
                p.permission_name,
                p.description
            FROM permissions p
            JOIN role_permissions rp ON p.permission_id = rp.permission_id
            WHERE rp.role_id = %s
            ORDER BY p.permission_name
        """, (role_id,))
        
        permissions = cur.fetchall()
        
        role_dict = dict(role)
        role_dict['permissions'] = [dict(p) for p in permissions]
        return role_dict
    except Exception as e:
        handle_db_error(e, "get_role_with_permissions")
    finally:
        cur.close()
        return_db_connection(conn)


def bulk_assign_permissions_to_role(
    role_id: int, 
    permission_ids: List[int]
) -> Dict[str, List[int]]:
    """Bulk assign multiple permissions to a role."""
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        logger.info(f"Bulk assigning {len(permission_ids)} permissions to role {role_id}")
        
        results = {
            "successful": [],
            "failed": [],
            "already_assigned": []
        }
        
        # Check if role exists
        cur.execute("SELECT role_id FROM roles WHERE role_id = %s", (role_id,))
        if not cur.fetchone():
            logger.warning(f"Role {role_id} not found")
            results["failed"].extend(permission_ids)
            return results
        
        for permission_id in permission_ids:
            try:
                # Check if permission exists
                cur.execute("SELECT permission_id FROM permissions WHERE permission_id = %s", (permission_id,))
                if not cur.fetchone():
                    logger.warning(f"Permission {permission_id} not found")
                    results["failed"].append(permission_id)
                    continue
                
                # Check if already assigned
                cur.execute("""
                    SELECT role_id FROM role_permissions 
                    WHERE role_id = %s AND permission_id = %s
                """, (role_id, permission_id))
                
                if cur.fetchone():
                    logger.warning(f"Permission {permission_id} already assigned to role {role_id}")
                    results["already_assigned"].append(permission_id)
                    continue
                
                # Assign permission
                cur.execute("""
                    INSERT INTO role_permissions (role_id, permission_id)
                    VALUES (%s, %s)
                """, (role_id, permission_id))
                
                results["successful"].append(permission_id)
            except Exception as e:
                logger.error(f"Error assigning permission {permission_id} to role {role_id}: {str(e)}")
                results["failed"].append(permission_id)
        
        conn.commit()
        logger.info(f"Bulk assignment completed for role {role_id}")
        return results
    except Exception as e:
        conn.rollback()
        handle_db_error(e, "bulk_assign_permissions_to_role")
    finally:
        cur.close()
        return_db_connection(conn)


def bulk_remove_permissions_from_role(
    role_id: int, 
    permission_ids: List[int]
) -> Dict[str, List[int]]:
    """Bulk remove multiple permissions from a role."""
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        logger.info(f"Bulk removing {len(permission_ids)} permissions from role {role_id}")
        
        results = {
            "successful": [],
            "failed": [],
            "not_assigned": []
        }
        
        # Check if role exists
        cur.execute("SELECT role_id FROM roles WHERE role_id = %s", (role_id,))
        if not cur.fetchone():
            logger.warning(f"Role {role_id} not found")
            results["failed"].extend(permission_ids)
            return results
        
        for permission_id in permission_ids:
            try:
                # Check if permission is assigned
                cur.execute("""
                    DELETE FROM role_permissions 
                    WHERE role_id = %s AND permission_id = %s
                    RETURNING role_id
                """, (role_id, permission_id))
                
                if cur.fetchone():
                    results["successful"].append(permission_id)
                else:
                    logger.warning(f"Permission {permission_id} not assigned to role {role_id}")
                    results["not_assigned"].append(permission_id)
            except Exception as e:
                logger.error(f"Error removing permission {permission_id} from role {role_id}: {str(e)}")
                results["failed"].append(permission_id)
        
        conn.commit()
        logger.info(f"Bulk removal completed for role {role_id}")
        return results
    except Exception as e:
        conn.rollback()
        handle_db_error(e, "bulk_remove_permissions_from_role")
    finally:
        cur.close()
        return_db_connection(conn) 

# ============================================================================
# SYSTEM SETTINGS
# ============================================================================

def create_setting(setting: 'schemas.SettingCreate') -> Dict[str, Any]:
    """Create a new system setting."""
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        logger.info(f"Creating setting: {setting.setting_key}")
        
        cur.execute("""
            INSERT INTO settings (
                setting_key, setting_value, store_id
            ) VALUES (%s, %s, %s)
            RETURNING *
        """, (
            setting.setting_key,
            setting.setting_value,
            setting.store_id
        ))
        
        new_setting = cur.fetchone()
        conn.commit()
        
        logger.info(f"Successfully created setting with ID: {new_setting['setting_id']}")
        return dict(new_setting)
    except Exception as e:
        conn.rollback()
        handle_db_error(e, "create_setting")
    finally:
        cur.close()
        return_db_connection(conn)


def get_setting(setting_id: int) -> Optional[Dict[str, Any]]:
    """Get a setting by ID."""
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            SELECT s.*, st.store_name 
            FROM settings s
            LEFT JOIN stores st ON s.store_id = st.store_id
            WHERE s.setting_id = %s
        """, (setting_id,))
        
        result = cur.fetchone()
        return dict(result) if result else None
    except Exception as e:
        handle_db_error(e, "get_setting")
    finally:
        cur.close()
        return_db_connection(conn)


def get_settings(
    store_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100
) -> List[Dict[str, Any]]:
    """Get settings with optional store filter."""
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        query = """
            SELECT s.*, st.store_name 
            FROM settings s
            LEFT JOIN stores st ON s.store_id = st.store_id
            WHERE 1=1
        """
        params = []
        
        if store_id:
            query += " AND s.store_id = %s"
            params.append(store_id)
        
        query += " ORDER BY s.setting_key"
        query += " OFFSET %s LIMIT %s"
        params.extend([skip, limit])
        
        cur.execute(query, params)
        results = cur.fetchall()
        return [dict(row) for row in results]
    except Exception as e:
        handle_db_error(e, "get_settings")
    finally:
        cur.close()
        return_db_connection(conn)


def update_setting(
    setting_id: int,
    setting: 'schemas.SettingUpdate'
) -> Optional[Dict[str, Any]]:
    """Update a system setting."""
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        logger.info(f"Updating setting {setting_id}")
        
        # Build update query dynamically based on provided fields
        update_fields = []
        params = []
        update_data = setting.dict(exclude_unset=True)
        
        for field, value in update_data.items():
            update_fields.append(f"{field} = %s")
            params.append(value)
        
        if not update_fields:
            return get_setting(setting_id)
        
        # Add updated_at field
        update_fields.append("updated_at = CURRENT_TIMESTAMP")
        
        # Add setting_id to params
        params.append(setting_id)
        
        query = f"""
            UPDATE settings 
            SET {", ".join(update_fields)}
            WHERE setting_id = %s
            RETURNING *
        """
        
        cur.execute(query, params)
        updated = cur.fetchone()
        
        if not updated:
            return None
        
        conn.commit()
        logger.info(f"Successfully updated setting {setting_id}")
        
        # Get full setting details including store name
        return get_setting(setting_id)
    except Exception as e:
        conn.rollback()
        handle_db_error(e, "update_setting")
    finally:
        cur.close()
        return_db_connection(conn)


def delete_setting(setting_id: int) -> bool:
    """Delete a system setting."""
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        logger.info(f"Deleting setting {setting_id}")
        
        cur.execute("""
            DELETE FROM settings 
            WHERE setting_id = %s
            RETURNING setting_id
        """, (setting_id,))
        
        deleted = cur.fetchone()
        conn.commit()
        
        success = bool(deleted)
        if success:
            logger.info(f"Successfully deleted setting {setting_id}")
        else:
            logger.warning(f"Setting {setting_id} not found for deletion")
        
        return success
    except Exception as e:
        conn.rollback()
        handle_db_error(e, "delete_setting")
    finally:
        cur.close()
        return_db_connection(conn) 

# ============================================================================
# POS TERMINALS
# ============================================================================

def create_pos_terminal(terminal: 'schemas.POSTerminalCreate') -> Dict[str, Any]:
    """Create a new POS terminal."""
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        logger.info(f"Creating POS terminal: {terminal.terminal_name}")
        
        cur.execute("""
            INSERT INTO pos_terminals (
                store_id, terminal_name, ip_address, is_active
            ) VALUES (%s, %s, %s, %s)
            RETURNING *
        """, (
            terminal.store_id,
            terminal.terminal_name,
            terminal.ip_address,
            terminal.is_active
        ))
        
        new_terminal = cur.fetchone()
        conn.commit()
        
        logger.info(f"Successfully created POS terminal with ID: {new_terminal['terminal_id']}")
        return get_pos_terminal(new_terminal['terminal_id'])  # Get with store details
    except Exception as e:
        conn.rollback()
        handle_db_error(e, "create_pos_terminal")
    finally:
        cur.close()
        return_db_connection(conn)


def get_pos_terminal(terminal_id: int) -> Optional[Dict[str, Any]]:
    """Get a POS terminal by ID."""
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            SELECT t.*, s.store_name 
            FROM pos_terminals t
            JOIN stores s ON t.store_id = s.store_id
            WHERE t.terminal_id = %s
        """, (terminal_id,))
        
        result = cur.fetchone()
        return dict(result) if result else None
    except Exception as e:
        handle_db_error(e, "get_pos_terminal")
    finally:
        cur.close()
        return_db_connection(conn)


def get_pos_terminals(
    store_id: Optional[int] = None,
    active_only: bool = False,
    skip: int = 0,
    limit: int = 100
) -> List[Dict[str, Any]]:
    """Get POS terminals with optional filtering."""
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        query = """
            SELECT t.*, s.store_name 
            FROM pos_terminals t
            JOIN stores s ON t.store_id = s.store_id
            WHERE 1=1
        """
        params = []
        
        if store_id:
            query += " AND t.store_id = %s"
            params.append(store_id)
        
        if active_only:
            query += " AND t.is_active = TRUE"
        
        query += " ORDER BY s.store_name, t.terminal_name"
        query += " OFFSET %s LIMIT %s"
        params.extend([skip, limit])
        
        cur.execute(query, params)
        results = cur.fetchall()
        return [dict(row) for row in results]
    except Exception as e:
        handle_db_error(e, "get_pos_terminals")
    finally:
        cur.close()
        return_db_connection(conn)


def update_pos_terminal(
    terminal_id: int,
    terminal: 'schemas.POSTerminalUpdate'
) -> Optional[Dict[str, Any]]:
    """Update a POS terminal."""
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        logger.info(f"Updating POS terminal {terminal_id}")
        
        # Build update query dynamically based on provided fields
        update_fields = []
        params = []
        update_data = terminal.dict(exclude_unset=True)
        
        for field, value in update_data.items():
            update_fields.append(f"{field} = %s")
            params.append(value)
        
        if not update_fields:
            return get_pos_terminal(terminal_id)
        
        # Add updated_at field
        update_fields.append("updated_at = CURRENT_TIMESTAMP")
        
        # Add terminal_id to params
        params.append(terminal_id)
        
        query = f"""
            UPDATE pos_terminals 
            SET {", ".join(update_fields)}
            WHERE terminal_id = %s
            RETURNING *
        """
        
        cur.execute(query, params)
        updated = cur.fetchone()
        
        if not updated:
            return None
        
        conn.commit()
        logger.info(f"Successfully updated POS terminal {terminal_id}")
        
        # Get full terminal details including store name
        return get_pos_terminal(terminal_id)
    except Exception as e:
        conn.rollback()
        handle_db_error(e, "update_pos_terminal")
    finally:
        cur.close()
        return_db_connection(conn)


def delete_pos_terminal(terminal_id: int) -> bool:
    """Delete a POS terminal."""
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        logger.info(f"Deleting POS terminal {terminal_id}")
        
        cur.execute("""
            DELETE FROM pos_terminals 
            WHERE terminal_id = %s
            RETURNING terminal_id
        """, (terminal_id,))
        
        deleted = cur.fetchone()
        conn.commit()
        
        success = bool(deleted)
        if success:
            logger.info(f"Successfully deleted POS terminal {terminal_id}")
        else:
            logger.warning(f"POS terminal {terminal_id} not found for deletion")
        
        return success
    except Exception as e:
        conn.rollback()
        handle_db_error(e, "delete_pos_terminal")
    finally:
        cur.close()
        return_db_connection(conn) 

# ============================================================================
# BULK DATA OPTIMIZATION
# ============================================================================

def get_all_settings_data() -> Dict[str, Any]:
    """Get all settings data in a single optimized query for faster loading."""
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        logger.info("Fetching all settings data in bulk")
        
        # Get tax categories
        cur.execute("""
            SELECT * FROM tax_categories 
            ORDER BY tax_category_name
        """)
        tax_categories = [dict(row) for row in cur.fetchall()]
        
        # Get payment methods
        cur.execute("""
            SELECT * FROM payment_methods 
            ORDER BY method_name
        """)
        payment_methods = [dict(row) for row in cur.fetchall()]
        
        # Get expense categories
        cur.execute("""
            SELECT * FROM expense_categories 
            ORDER BY category_name
        """)
        expense_categories = [dict(row) for row in cur.fetchall()]
        
        # Get roles
        cur.execute("""
            SELECT * FROM roles 
            ORDER BY role_name
        """)
        roles = [dict(row) for row in cur.fetchall()]
        
        # Get permissions
        cur.execute("""
            SELECT * FROM permissions 
            ORDER BY permission_name
        """)
        permissions = [dict(row) for row in cur.fetchall()]
        
        # Get system settings with store names
        cur.execute("""
            SELECT s.*, st.store_name 
            FROM settings s
            LEFT JOIN stores st ON s.store_id = st.store_id
            ORDER BY s.setting_key
        """)
        system_settings = [dict(row) for row in cur.fetchall()]
        
        # Get POS terminals with store names
        cur.execute("""
            SELECT t.*, s.store_name 
            FROM pos_terminals t
            JOIN stores s ON t.store_id = s.store_id
            ORDER BY s.store_name, t.terminal_name
        """)
        pos_terminals = [dict(row) for row in cur.fetchall()]
        
        # Get all role permissions in a single query
        cur.execute("""
            SELECT 
                rp.role_id,
                rp.permission_id,
                r.role_name,
                p.permission_name
            FROM role_permissions rp
            JOIN roles r ON rp.role_id = r.role_id
            JOIN permissions p ON rp.permission_id = p.permission_id
            ORDER BY r.role_name, p.permission_name
        """)
        role_permissions = [dict(row) for row in cur.fetchall()]
        
        # Get stores
        cur.execute("""
            SELECT * FROM stores 
            ORDER BY store_name
        """)
        stores = [dict(row) for row in cur.fetchall()]
        
        logger.info("Successfully fetched all settings data")
        
        return {
            "tax_categories": tax_categories,
            "payment_methods": payment_methods,
            "expense_categories": expense_categories,
            "roles": roles,
            "permissions": permissions,
            "system_settings": system_settings,
            "pos_terminals": pos_terminals,
            "role_permissions": role_permissions,
            "stores": stores
        }
    except Exception as e:
        handle_db_error(e, "get_all_settings_data")
    finally:
        cur.close()
        return_db_connection(conn) 