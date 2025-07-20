from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from typing import List, Optional, Dict, Any
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor
from psycopg2 import pool
import os
from dotenv import load_dotenv
from . import models, schemas

# Load environment variables from .env file
load_dotenv()

# Database connection config from environment variables
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

# Store CRUD operations
def get_stores() -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            SELECT store_id, store_name, address, phone_number, email, 
                   city, province, postal_code, is_active, created_at, updated_at
            FROM stores 
            ORDER BY store_name
        """)
        stores = []
        for row in cur.fetchall():
            stores.append({
                'store_id': row['store_id'],
                'store_name': row['store_name'],
                'address': row['address'],
                'phone_number': row['phone_number'],
                'email': row['email'],
                'city': row['city'],
                'province': row['province'],
                'postal_code': row['postal_code'],
                'is_active': row['is_active'],
                'created_at': row['created_at'],
                'updated_at': row['updated_at']
            })
        return stores
    finally:
        cur.close()
        return_db_connection(conn)

def get_store(store_id: int) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            SELECT store_id, store_name, address, phone_number, email, 
                   city, province, postal_code, is_active, created_at, updated_at
            FROM stores 
            WHERE store_id = %s
        """, (store_id,))
        row = cur.fetchone()
        if row:
            return {
                'store_id': row['store_id'],
                'store_name': row['store_name'],
                'address': row['address'],
                'phone_number': row['phone_number'],
                'email': row['email'],
                'city': row['city'],
                'province': row['province'],
                'postal_code': row['postal_code'],
                'is_active': row['is_active'],
                'created_at': row['created_at'],
                'updated_at': row['updated_at']
            }
        return None
    finally:
        cur.close()
        return_db_connection(conn)

def create_store(store: 'schemas.StoreCreate') -> dict:
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            INSERT INTO stores (store_name, address, phone_number, email, city, province, postal_code, is_active)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING store_id, store_name, address, phone_number, email, city, province, postal_code, is_active, created_at, updated_at
        """, (
            store.store_name,
            store.address,
            store.phone_number,
            store.email,
            store.city,
            store.province,
            store.postal_code,
            store.is_active
        ))
        row = cur.fetchone()
        conn.commit()
        if row:
            return {
                'store_id': row['store_id'],
                'store_name': row['store_name'],
                'address': row['address'],
                'phone_number': row['phone_number'],
                'email': row['email'],
                'city': row['city'],
                'province': row['province'],
                'postal_code': row['postal_code'],
                'is_active': row['is_active'],
                'created_at': row['created_at'],
                'updated_at': row['updated_at']
            }
        else:
            raise Exception('Failed to create store')
    finally:
        cur.close()
        return_db_connection(conn)

def update_store(store_id: int, store: 'schemas.StoreCreate') -> dict:
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            UPDATE stores
            SET store_name = %s,
                address = %s,
                phone_number = %s,
                email = %s,
                city = %s,
                province = %s,
                postal_code = %s,
                is_active = %s,
                updated_at = CURRENT_TIMESTAMP
            WHERE store_id = %s
            RETURNING store_id, store_name, address, phone_number, email, city, province, postal_code, is_active, created_at, updated_at
        """, (
            store.store_name,
            store.address,
            store.phone_number,
            store.email,
            store.city,
            store.province,
            store.postal_code,
            store.is_active,
            store_id
        ))
        row = cur.fetchone()
        conn.commit()
        if row:
            return {
                'store_id': row['store_id'],
                'store_name': row['store_name'],
                'address': row['address'],
                'phone_number': row['phone_number'],
                'email': row['email'],
                'city': row['city'],
                'province': row['province'],
                'postal_code': row['postal_code'],
                'is_active': row['is_active'],
                'created_at': row['created_at'],
                'updated_at': row['updated_at']
            }
        else:
            raise Exception('Failed to update store')
    finally:
        cur.close()
        return_db_connection(conn)

def delete_store(store_id: int):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("DELETE FROM stores WHERE store_id = %s", (store_id,))
        if cur.rowcount == 0:
            raise Exception('Store not found')
        conn.commit()
    finally:
        cur.close()
        return_db_connection(conn)

# User CRUD operations
def get_users() -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            SELECT user_id, username, first_name, last_name, email, 
                   phone_number, role_id, store_id, is_active, last_login_at, created_at, updated_at
            FROM users 
            WHERE is_active = TRUE 
            ORDER BY first_name, last_name
        """)
        users = []
        for row in cur.fetchall():
            users.append({
                'user_id': row['user_id'],
                'username': row['username'],
                'first_name': row['first_name'],
                'last_name': row['last_name'],
                'email': row['email'],
                'phone_number': row['phone_number'],
                'role_id': row['role_id'],
                'store_id': row['store_id'],
                'is_active': row['is_active'],
                'last_login_at': row['last_login_at'],
                'created_at': row['created_at'],
                'updated_at': row['updated_at']
            })
        return users
    finally:
        cur.close()
        return_db_connection(conn)

def get_user(user_id: int) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            SELECT user_id, username, first_name, last_name, email, 
                   phone_number, role_id, store_id, is_active, last_login_at, created_at, updated_at
            FROM users 
            WHERE user_id = %s
        """, (user_id,))
        row = cur.fetchone()
        if row:
            return {
                'user_id': row['user_id'],
                'username': row['username'],
                'first_name': row['first_name'],
                'last_name': row['last_name'],
                'email': row['email'],
                'phone_number': row['phone_number'],
                'role_id': row['role_id'],
                'store_id': row['store_id'],
                'is_active': row['is_active'],
                'last_login_at': row['last_login_at'],
                'created_at': row['created_at'],
                'updated_at': row['updated_at']
            }
        return None
    finally:
        cur.close()
        return_db_connection(conn)

# Inventory CRUD operations
def get_inventory_with_details(
    store_id: Optional[int] = None,
    category_id: Optional[int] = None,
    brand_id: Optional[int] = None,
    search: Optional[str] = None,
    low_stock_only: bool = False,
    out_of_stock_only: bool = False
) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        query = """
            SELECT 
                i.inventory_id,
                i.product_id,
                i.variant_id,
                i.store_id,
                i.current_stock,
                i.last_reorder_date,
                i.last_stock_take_date,
                i.updated_at,
                -- Product details
                p.product_code,
                p.product_name,
                p.description,
                p.category_id,
                p.brand_id,
                p.supplier_id,
                p.base_price,
                p.retail_price,
                p.tax_category_id,
                p.is_active as product_active,
                p.barcode,
                p.unit_of_measure,
                p.weight,
                p.reorder_level,
                p.max_stock_level,
                p.created_at as product_created_at,
                p.updated_at as product_updated_at,
                -- Variant details
                pv.size,
                pv.color,
                pv.sku_suffix,
                pv.barcode as variant_barcode,
                pv.retail_price as variant_retail_price,
                pv.base_price as variant_base_price,
                pv.is_active as variant_active,
                -- Store details
                s.store_name,
                s.address,
                s.phone_number,
                s.email,
                s.city,
                s.province,
                s.postal_code,
                s.is_active as store_active,
                s.created_at,
                s.updated_at
            FROM inventory i
            JOIN products p ON i.product_id = p.product_id
            LEFT JOIN product_variants pv ON i.variant_id = pv.variant_id
            JOIN stores s ON i.store_id = s.store_id
            WHERE 1=1
        """
        params = []
        if store_id:
            query += " AND i.store_id = %s"
            params.append(store_id)
        if category_id:
            query += " AND p.category_id = %s"
            params.append(category_id)
        if brand_id:
            query += " AND p.brand_id = %s"
            params.append(brand_id)
        if search:
            query += """ AND (
                p.product_name ILIKE %s OR 
                p.product_code ILIKE %s OR
                (pv.size || ' ' || pv.color) ILIKE %s
            )"""
            search_term = f"%{search}%"
            params.extend([search_term, search_term, search_term])
        if low_stock_only:
            query += " AND i.current_stock <= p.reorder_level AND i.current_stock > 0"
        if out_of_stock_only:
            query += " AND i.current_stock = 0"
        query += " ORDER BY p.product_name, pv.size, pv.color"
        cur.execute(query, params)
        inventory_items = []
        for row in cur.fetchall():
            item = {
                'inventory_id': row['inventory_id'],
                'product_id': row['product_id'],
                'variant_id': row['variant_id'],
                'store_id': row['store_id'],
                'current_stock': row['current_stock'],
                'last_reorder_date': row['last_reorder_date'],
                'last_stock_take_date': row['last_stock_take_date'],
                'updated_at': row['updated_at'],
                'product': {
                    'product_id': row['product_id'],
                    'product_code': row['product_code'],
                    'product_name': row['product_name'],
                    'description': row['description'],
                    'category_id': row['category_id'],
                    'brand_id': row['brand_id'],
                    'supplier_id': row['supplier_id'],
                    'base_price': float(row['base_price']) if row['base_price'] else 0,
                    'retail_price': float(row['retail_price']) if row['retail_price'] else 0,
                    'tax_category_id': row['tax_category_id'],
                    'is_active': row['product_active'],
                    'barcode': row['barcode'],
                    'unit_of_measure': row['unit_of_measure'],
                    'weight': float(row['weight']) if row['weight'] else None,
                    'reorder_level': row['reorder_level'],
                    'max_stock_level': row['max_stock_level'],
                    'created_at': row['product_created_at'],
                    'updated_at': row['product_updated_at']
                },
                'variant': None,
                'store': {
                    'store_id': row['store_id'],
                    'store_name': row['store_name'],
                    'address': row['address'],
                    'phone_number': row['phone_number'],
                    'email': row['email'],
                    'city': row['city'],
                    'province': row['province'],
                    'postal_code': row['postal_code'],
                    'is_active': row['store_active'],
                    'created_at': row['created_at'],
                    'updated_at': row['updated_at']
                }
            }
            if row['variant_id']:  # variant_id exists
                item['variant'] = {
                    'variant_id': row['variant_id'],
                    'size': row['size'],
                    'color': row['color'],
                    'sku_suffix': row['sku_suffix'],
                    'barcode': row['variant_barcode'],
                    'retail_price': float(row['variant_retail_price']) if row['variant_retail_price'] else None,
                    'base_price': float(row['variant_base_price']) if row['variant_base_price'] else None,
                    'is_active': row['variant_active']
                }
            inventory_items.append(item)
        return inventory_items
    finally:
        cur.close()
        return_db_connection(conn)

def get_inventory_summary() -> Dict[str, int]:
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        # Get total SKUs (unique product-variant combinations)
        cur.execute("""
            SELECT COUNT(DISTINCT product_id || '-' || COALESCE(variant_id::text, 'base')) as total_skus
            FROM inventory
        """)
        total_skus = (cur.fetchone() or {'total_skus': 0})['total_skus']
        
        # Get total stock
        cur.execute("SELECT COALESCE(SUM(current_stock), 0) as total_stock FROM inventory")
        total_stock = (cur.fetchone() or {'total_stock': 0})['total_stock']
        
        # Get low stock count
        cur.execute("""
            SELECT COUNT(*) as low_stock_count
            FROM inventory i
            JOIN products p ON i.product_id = p.product_id
            WHERE i.current_stock <= p.reorder_level AND i.current_stock > 0
        """)
        low_stock_count = (cur.fetchone() or {'low_stock_count': 0})['low_stock_count']
        
        # Get out of stock count
        cur.execute("SELECT COUNT(*) as out_of_stock_count FROM inventory WHERE current_stock = 0")
        out_of_stock_count = (cur.fetchone() or {'out_of_stock_count': 0})['out_of_stock_count']
        
        # Get over stock count
        cur.execute("""
            SELECT COUNT(*) as over_stock_count
            FROM inventory i
            JOIN products p ON i.product_id = p.product_id
            WHERE i.current_stock > COALESCE(p.max_stock_level, 999999)
        """)
        over_stock_count = (cur.fetchone() or {'over_stock_count': 0})['over_stock_count']
        
        return {
            'total_skus': total_skus,
            'total_stock': total_stock,
            'low_stock_count': low_stock_count,
            'out_of_stock_count': out_of_stock_count,
            'over_stock_count': over_stock_count
        }
    finally:
        cur.close()
        return_db_connection(conn)

def update_inventory_stock(inventory_id: int, new_stock: int, user_id: int, reason: str) -> bool:
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        # Get current inventory details
        cur.execute("""
            SELECT product_id, variant_id, store_id, current_stock
            FROM inventory 
            WHERE inventory_id = %s
        """, (inventory_id,))
        row = cur.fetchone()
        if not row:
            return False
        
        # Handle both dict and tuple responses
        if isinstance(row, dict):
            product_id = row['product_id']
            variant_id = row['variant_id']
            store_id = row['store_id']
            current_stock = row['current_stock']
        else:
            product_id = row[0]
            variant_id = row[1]
            store_id = row[2]
            current_stock = row[3]
        stock_change = new_stock - current_stock
        
        # Update inventory
        cur.execute("""
            UPDATE inventory 
            SET current_stock = %s, updated_at = CURRENT_TIMESTAMP
            WHERE inventory_id = %s
        """, (new_stock, inventory_id))
        
        # Record movement
        cur.execute("""
            INSERT INTO inventory_movements 
            (product_id, variant_id, store_id, movement_type, quantity, user_id, notes)
            VALUES (%s, %s, %s, 'ADJUSTMENT', %s, %s, %s)
        """, (product_id, variant_id, store_id, stock_change, user_id, reason or ""))
        
        conn.commit()
        return True
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cur.close()
        return_db_connection(conn)

def perform_stock_take(inventory_id: int, actual_count: int, user_id: int, notes: Optional[str] = None) -> bool:
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        # Get current inventory details
        cur.execute("""
            SELECT product_id, variant_id, store_id, current_stock
            FROM inventory 
            WHERE inventory_id = %s
        """, (inventory_id,))
        row = cur.fetchone()
        if not row:
            return False
        
        # Handle both dict and tuple responses
        if isinstance(row, dict):
            product_id = row['product_id']
            variant_id = row['variant_id']
            store_id = row['store_id']
            current_stock = row['current_stock']
        else:
            product_id = row[0]
            variant_id = row[1]
            store_id = row[2]
            current_stock = row[3]
        stock_change = actual_count - current_stock
        
        # Update inventory
        cur.execute("""
            UPDATE inventory 
            SET current_stock = %s, last_stock_take_date = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
            WHERE inventory_id = %s
        """, (actual_count, inventory_id))
        
        # Record movement
        safe_notes = notes if notes is not None else ''
        cur.execute("""
            INSERT INTO inventory_movements 
            (product_id, variant_id, store_id, movement_type, quantity, user_id, notes)
            VALUES (%s, %s, %s, 'ADJUSTMENT', %s, %s, %s)
        """, (product_id, variant_id, store_id, stock_change, user_id, f"Stock take: {safe_notes}" if safe_notes else "Stock take"))
        
        conn.commit()
        return True
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cur.close()
        return_db_connection(conn)

def transfer_stock(from_inventory_id: int, to_store_id: int, quantity: int, user_id: int, notes: Optional[str] = None) -> bool:
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        # Get source inventory details
        cur.execute("""
            SELECT product_id, variant_id, store_id, current_stock
            FROM inventory 
            WHERE inventory_id = %s
        """, (from_inventory_id,))
        row = cur.fetchone()
        if not row:
            return False
        
        # Handle both dict and tuple responses
        if isinstance(row, dict):
            product_id = row['product_id']
            variant_id = row['variant_id']
            from_store_id = row['store_id']
            current_stock = row['current_stock']
        else:
            product_id = row[0]
            variant_id = row[1]
            from_store_id = row[2]
            current_stock = row[3]
        
        if current_stock < quantity:
            return False
        
        # Check if destination inventory exists (handle NULL variant_id correctly)
        if variant_id is None:
            cur.execute("""
                SELECT inventory_id, current_stock
                FROM inventory 
                WHERE product_id = %s AND variant_id IS NULL AND store_id = %s
            """, (product_id, to_store_id))
        else:
            cur.execute("""
                SELECT inventory_id, current_stock
                FROM inventory 
                WHERE product_id = %s AND variant_id = %s AND store_id = %s
            """, (product_id, variant_id, to_store_id))
        dest_row = cur.fetchone()
        
        if dest_row:
            # Update existing destination inventory
            dest_inventory_id = dest_row['inventory_id']
            dest_current_stock = dest_row['current_stock']
            cur.execute("""
                UPDATE inventory 
                SET current_stock = current_stock + %s, updated_at = CURRENT_TIMESTAMP
                WHERE inventory_id = %s
            """, (quantity, dest_inventory_id))
        else:
            # Create new destination inventory
            cur.execute("""
                INSERT INTO inventory (product_id, variant_id, store_id, current_stock)
                VALUES (%s, %s, %s, %s)
            """, (product_id, variant_id if variant_id is not None else None, to_store_id, quantity))
        
        # Update source inventory
        cur.execute("""
            UPDATE inventory 
            SET current_stock = current_stock - %s, updated_at = CURRENT_TIMESTAMP
            WHERE inventory_id = %s
        """, (quantity, from_inventory_id))
        
        # Record movements
        safe_notes = notes if notes is not None else ''
        transfer_out_notes = f"Transfer to store {to_store_id}: {safe_notes}" if safe_notes else f"Transfer to store {to_store_id}"
        transfer_in_notes = f"Transfer from store {from_store_id}: {safe_notes}" if safe_notes else f"Transfer from store {from_store_id}"
        
        cur.execute("""
            INSERT INTO inventory_movements 
            (product_id, variant_id, store_id, movement_type, quantity, user_id, notes)
            VALUES (%s, %s, %s, 'TRANSFER_OUT', %s, %s, %s)
        """, (product_id, variant_id if variant_id is not None else None, from_store_id, -quantity, user_id, transfer_out_notes))
        
        cur.execute("""
            INSERT INTO inventory_movements 
            (product_id, variant_id, store_id, movement_type, quantity, user_id, notes)
            VALUES (%s, %s, %s, 'TRANSFER_IN', %s, %s, %s)
        """, (product_id, variant_id if variant_id is not None else None, to_store_id, quantity, user_id, transfer_in_notes))
        
        conn.commit()
        return True
    except Exception as e:
        conn.rollback()
        print('[transfer_stock] Exception:', e)
        raise e
    finally:
        cur.close()
        return_db_connection(conn)

def create_inventory(inventory: 'schemas.InventoryCreate') -> dict:
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        # Check for duplicate before insert
        if inventory.variant_id is None:
            cur.execute("""
                SELECT inventory_id FROM inventory
                WHERE product_id = %s AND store_id = %s AND variant_id IS NULL
            """, (inventory.product_id, inventory.store_id))
        else:
            cur.execute("""
                SELECT inventory_id FROM inventory
                WHERE product_id = %s AND store_id = %s AND variant_id = %s
            """, (inventory.product_id, inventory.store_id, inventory.variant_id))
        
        if cur.fetchone():
            raise ValueError("Inventory record for this product/variant/store already exists.")
        
        cur.execute("""
            INSERT INTO inventory (product_id, variant_id, store_id, current_stock, last_reorder_date, last_stock_take_date)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING inventory_id
        """, (
            inventory.product_id,
            inventory.variant_id,
            inventory.store_id,
            inventory.current_stock,
            inventory.last_reorder_date,
            inventory.last_stock_take_date
        ))
        result = cur.fetchone()
        if result is None:
            raise Exception('Failed to create inventory record')
        inventory_id = result['inventory_id'] if isinstance(result, dict) else result[0]
        conn.commit()
        # Fetch the full record with details
        cur.execute("""
            SELECT 
                i.inventory_id,
                i.product_id,
                i.variant_id,
                i.store_id,
                i.current_stock,
                i.last_reorder_date,
                i.last_stock_take_date,
                i.updated_at,
                -- Product details
                p.product_code,
                p.product_name,
                p.description,
                p.category_id,
                p.brand_id,
                p.supplier_id,
                p.base_price,
                p.retail_price,
                p.tax_category_id,
                p.is_active as product_active,
                p.barcode,
                p.unit_of_measure,
                p.weight,
                p.reorder_level,
                p.max_stock_level,
                p.created_at as product_created_at,
                p.updated_at as product_updated_at,
                -- Variant details
                pv.size,
                pv.color,
                pv.sku_suffix,
                pv.barcode as variant_barcode,
                pv.retail_price as variant_retail_price,
                pv.base_price as variant_base_price,
                pv.is_active as variant_active,
                -- Store details
                s.store_name,
                s.address,
                s.phone_number,
                s.email,
                s.city,
                s.province,
                s.postal_code,
                s.is_active as store_active,
                s.created_at,
                s.updated_at
            FROM inventory i
            JOIN products p ON i.product_id = p.product_id
            LEFT JOIN product_variants pv ON i.variant_id = pv.variant_id
            JOIN stores s ON i.store_id = s.store_id
            WHERE i.inventory_id = %s
        """, (inventory_id,))
        row = cur.fetchone()
        if row is None:
            raise Exception('Failed to fetch created inventory')
        
        # Handle both dict and tuple responses
        if isinstance(row, dict):
            result = {
                'inventory_id': row['inventory_id'],
                'product': {
                    'product_id': row['product_id'],
                    'product_code': row['product_code'],
                    'product_name': row['product_name'],
                    'description': row['description'],
                    'category_id': row['category_id'],
                    'brand_id': row['brand_id'],
                    'supplier_id': row['supplier_id'],
                    'base_price': row['base_price'],
                    'retail_price': row['retail_price'],
                    'tax_category_id': row['tax_category_id'],
                    'is_active': row['product_active'],
                    'barcode': row['barcode'],
                    'unit_of_measure': row['unit_of_measure'],
                    'weight': row['weight'],
                    'reorder_level': row['reorder_level'],
                    'max_stock_level': row['max_stock_level'],
                    'created_at': row['product_created_at'],
                    'updated_at': row['product_updated_at'],
                },
                'variant': None,
                'store': {
                    'store_id': row['store_id'],
                    'store_name': row['store_name'],
                    'address': row['address'],
                    'phone_number': row['phone_number'],
                    'email': row['email'],
                    'city': row['city'],
                    'province': row['province'],
                    'postal_code': row['postal_code'],
                    'is_active': row['store_active'],
                    'created_at': row['created_at'],
                    'updated_at': row['updated_at'],
                },
                'current_stock': row['current_stock'],
                'last_reorder_date': row['last_reorder_date'],
                'last_stock_take_date': row['last_stock_take_date'],
                'updated_at': row['updated_at'],
            }
            if row['variant_id']:
                result['variant'] = {
                    'variant_id': row['variant_id'],
                    'size': row['size'],
                    'color': row['color'],
                    'sku_suffix': row['sku_suffix'],
                    'barcode': row['variant_barcode'],
                    'retail_price': row['variant_retail_price'],
                    'base_price': row['variant_base_price'],
                    'is_active': row['variant_active'],
                }
        else:
            # Handle tuple response (fallback)
            result = {
                'inventory_id': row[0],
                'product': {
                    'product_id': row[1],
                    'product_code': row[8],
                    'product_name': row[9],
                    'description': row[10],
                    'category_id': row[11],
                    'brand_id': row[12],
                    'supplier_id': row[13],
                    'base_price': row[14],
                    'retail_price': row[15],
                    'tax_category_id': row[16],
                    'is_active': row[17],
                    'barcode': row[18],
                    'unit_of_measure': row[19],
                    'weight': row[20],
                    'reorder_level': row[21],
                    'max_stock_level': row[22],
                    'created_at': row[23],
                    'updated_at': row[24],
                },
                'variant': None,
                'store': {
                    'store_id': row[3],
                    'store_name': row[32],
                    'address': row[33],
                    'phone_number': row[34],
                    'email': row[35],
                    'city': row[36],
                    'province': row[37],
                    'postal_code': row[38],
                    'is_active': row[39],
                    'created_at': row[40],
                    'updated_at': row[41],
                },
                'current_stock': row[4],
                'last_reorder_date': row[5],
                'last_stock_take_date': row[6],
                'updated_at': row[7],
            }
            if row[2]:
                result['variant'] = {
                    'variant_id': row[2],
                    'size': row[25],
                    'color': row[26],
                    'sku_suffix': row[27],
                    'barcode': row[28],
                    'retail_price': row[29],
                    'base_price': row[30],
                    'is_active': row[31],
                }
        return result
    finally:
        cur.close()
        return_db_connection(conn)

def delete_inventory(inventory_id: int):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        # Get the inventory details (product_id, variant_id, store_id)
        cur.execute("""
            SELECT product_id, variant_id, store_id FROM inventory WHERE inventory_id = %s
        """, (inventory_id,))
        row = cur.fetchone()
        if not row:
            raise Exception('Inventory record not found')
        # Handle both dict and tuple responses
        if isinstance(row, dict):
            product_id = row['product_id']
            variant_id = row['variant_id']
            store_id = row['store_id']
        else:
            product_id, variant_id, store_id = row
        # Delete related inventory_movements
        if variant_id is None:
            cur.execute("""
                DELETE FROM inventory_movements
                WHERE product_id = %s AND variant_id IS NULL AND store_id = %s
            """, (product_id, store_id))
        else:
            cur.execute("""
                DELETE FROM inventory_movements
                WHERE product_id = %s AND variant_id = %s AND store_id = %s
            """, (product_id, variant_id, store_id))
        # Delete the inventory record
        cur.execute("""
            DELETE FROM inventory WHERE inventory_id = %s
        """, (inventory_id,))
        conn.commit()
        return True  # Return success indicator
    finally:
        cur.close()
        return_db_connection(conn)

# Inventory Movement CRUD operations
def update_inventory_for_sale(
    product_id: int,
    variant_id: Optional[int],
    store_id: int,
    quantity: int,
    sale_id: int,
    user_id: int
) -> bool:
    """Update inventory for a sale transaction"""
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        # Get current inventory
        if variant_id is None:
            cur.execute("""
                SELECT inventory_id, current_stock
                FROM inventory 
                WHERE product_id = %s AND store_id = %s AND variant_id IS NULL
            """, (product_id, store_id))
        else:
            cur.execute("""
                SELECT inventory_id, current_stock
                FROM inventory 
                WHERE product_id = %s AND store_id = %s AND variant_id = %s
            """, (product_id, store_id, variant_id))
        
        row = cur.fetchone()
        if not row:
            raise ValueError(f"No inventory found for product {product_id} in store {store_id}")
        
        # Handle both dict and tuple responses
        if isinstance(row, dict):
            inventory_id = row['inventory_id']
            current_stock = row['current_stock']
        else:
            inventory_id = row[0]
            current_stock = row[1]
        
        # Check if enough stock
        if current_stock < quantity:
            raise ValueError(f"Insufficient stock. Available: {current_stock}, Required: {quantity}")
        
        # Update inventory
        new_stock = current_stock - quantity
        cur.execute("""
            UPDATE inventory 
            SET current_stock = %s, updated_at = CURRENT_TIMESTAMP
            WHERE inventory_id = %s
        """, (new_stock, inventory_id))
        
        # Record movement
        cur.execute("""
            INSERT INTO inventory_movements 
            (product_id, variant_id, store_id, movement_type, quantity, reference_id, user_id, notes)
            VALUES (%s, %s, %s, 'SALE', %s, %s, %s, %s)
        """, (product_id, variant_id, store_id, -quantity, sale_id, user_id, f"Sale transaction {sale_id}"))
        
        conn.commit()
        return True
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cur.close()
        return_db_connection(conn)

def update_inventory_for_return(
    product_id: int,
    variant_id: Optional[int],
    store_id: int,
    quantity: int,
    sale_id: int,
    user_id: int
) -> bool:
    """Update inventory for a return transaction"""
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        # Get current inventory
        if variant_id is None:
            cur.execute("""
                SELECT inventory_id, current_stock
                FROM inventory 
                WHERE product_id = %s AND store_id = %s AND variant_id IS NULL
            """, (product_id, store_id))
        else:
            cur.execute("""
                SELECT inventory_id, current_stock
                FROM inventory 
                WHERE product_id = %s AND store_id = %s AND variant_id = %s
            """, (product_id, store_id, variant_id))
        
        row = cur.fetchone()
        if not row:
            raise ValueError(f"No inventory found for product {product_id} in store {store_id}")
        
        # Handle both dict and tuple responses
        if isinstance(row, dict):
            inventory_id = row['inventory_id']
            current_stock = row['current_stock']
        else:
            inventory_id = row[0]
            current_stock = row[1]
        
        # Update inventory (add back to stock)
        new_stock = current_stock + quantity
        cur.execute("""
            UPDATE inventory 
            SET current_stock = %s, updated_at = CURRENT_TIMESTAMP
            WHERE inventory_id = %s
        """, (new_stock, inventory_id))
        
        # Record movement
        cur.execute("""
            INSERT INTO inventory_movements 
            (product_id, variant_id, store_id, movement_type, quantity, reference_id, user_id, notes)
            VALUES (%s, %s, %s, 'RETURN', %s, %s, %s, %s)
        """, (product_id, variant_id, store_id, quantity, sale_id, user_id, f"Return for sale {sale_id}"))
        
        conn.commit()
        return True
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cur.close()
        return_db_connection(conn)

def get_inventory_movements(
    product_id: Optional[int] = None,
    variant_id: Optional[int] = None,
    store_id: Optional[int] = None,
    movement_type: Optional[str] = None,
    limit: int = 50
) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        query = """
            SELECT 
                im.movement_id,
                im.product_id,
                im.variant_id,
                im.store_id,
                im.movement_type,
                im.quantity,
                im.reference_id,
                im.movement_date,
                im.user_id,
                im.notes,
                -- User details
                u.first_name,
                u.last_name,
                -- Product details
                p.product_name,
                p.product_code,
                -- Variant details
                pv.size,
                pv.color,
                -- Store details
                s.store_name
            FROM inventory_movements im
            JOIN users u ON im.user_id = u.user_id
            JOIN products p ON im.product_id = p.product_id
            LEFT JOIN product_variants pv ON im.variant_id = pv.variant_id
            JOIN stores s ON im.store_id = s.store_id
            WHERE 1=1
        """
        params = []
        
        if product_id:
            query += " AND im.product_id = %s"
            params.append(product_id)
        
        if variant_id:
            query += " AND im.variant_id = %s"
            params.append(variant_id)
        
        if store_id:
            query += " AND im.store_id = %s"
            params.append(store_id)
        
        if movement_type:
            query += " AND im.movement_type = %s"
            params.append(movement_type)
        
        query += " ORDER BY im.movement_date DESC LIMIT %s"
        params.append(limit)
        
        cur.execute(query, params)
        movements = []
        
        for row in cur.fetchall():
            dt = '1970-01-01T00:00:00Z'
            movement = {
                'movement_id': row['movement_id'],
                'product_id': row['product_id'],
                'variant_id': row['variant_id'],
                'store_id': row['store_id'],
                'movement_type': row['movement_type'],
                'quantity': row['quantity'],
                'reference_id': row['reference_id'],
                'movement_date': row['movement_date'],
                'user_id': row['user_id'],
                'notes': row['notes'],
                'user': {
                    'user_id': row['user_id'],
                    'first_name': row['first_name'],
                    'last_name': row['last_name'],
                    'username': '',
                    'email': '',
                    'role_id': 0,
                    'created_at': dt,
                    'updated_at': dt
                },
                'product': {
                    'product_id': row['product_id'],
                    'product_name': row['product_name'],
                    'product_code': row['product_code'],
                    'base_price': 0,
                    'retail_price': 0,
                    'created_at': dt,
                    'updated_at': dt
                },
                'variant': None,
                'store': {
                    'store_id': row['store_id'],
                    'store_name': row['store_name'],
                    'address': '',
                    'phone_number': '',
                    'email': '',
                    'city': '',
                    'province': '',
                    'postal_code': '',
                    'is_active': True,
                    'created_at': dt,
                    'updated_at': dt
                }
            }
            if row['variant_id']:  # variant_id exists
                movement['variant'] = {
                    'variant_id': row['variant_id'],
                    'size': row['size'],
                    'color': row['color']
                }
            movements.append(movement)
        return movements
    finally:
        cur.close()
        return_db_connection(conn) 

# ============================================================================
# BULK DATA OPTIMIZATION
# ============================================================================

def get_store_terminals(store_id: int) -> List[Dict[str, Any]]:
    """Get all terminals for a specific store"""
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            SELECT terminal_id, store_id, terminal_name, ip_address, is_active, created_at, updated_at
            FROM pos_terminals
            WHERE store_id = %s AND is_active = true
            ORDER BY terminal_name
        """, (store_id,))
        rows = cur.fetchall()
        terminals = []
        for row in rows:
            if isinstance(row, dict):
                terminals.append(row)
            else:
                terminals.append({
                    'terminal_id': row[0],
                    'store_id': row[1],
                    'terminal_name': row[2],
                    'ip_address': row[3],
                    'is_active': row[4],
                    'created_at': row[5],
                    'updated_at': row[6]
                })
        return terminals
    finally:
        cur.close()
        return_db_connection(conn)

def create_store_terminal(store_id: int, terminal: 'schemas.POSTerminalCreate') -> dict:
    """Create a new terminal for a store"""
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            INSERT INTO pos_terminals (store_id, terminal_name, ip_address, is_active)
            VALUES (%s, %s, %s, %s)
            RETURNING terminal_id, store_id, terminal_name, ip_address, is_active, created_at, updated_at
        """, (store_id, terminal.terminal_name, terminal.ip_address, terminal.is_active))
        
        row = cur.fetchone()
        if not row:
            raise Exception('Failed to create terminal')
        
        if isinstance(row, dict):
            result = row
        else:
            result = {
                'terminal_id': row[0],
                'store_id': row[1],
                'terminal_name': row[2],
                'ip_address': row[3],
                'is_active': row[4],
                'created_at': row[5],
                'updated_at': row[6]
            }
        
        conn.commit()
        return result
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cur.close()
        return_db_connection(conn)

def get_all_inventory_data(
    store_id: Optional[int] = None,
    category_id: Optional[int] = None,
    brand_id: Optional[int] = None,
    search: Optional[str] = None,
    low_stock_only: bool = False,
    out_of_stock_only: bool = False
) -> Dict[str, Any]:
    """Get all inventory data in a single optimized query for faster loading."""
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        # Get inventory with details
        inventory_items = get_inventory_with_details(
            store_id=store_id,
            category_id=category_id,
            brand_id=brand_id,
            search=search,
            low_stock_only=low_stock_only,
            out_of_stock_only=out_of_stock_only
        )
        
        # Get stores
        stores = get_stores()
        
        # Get products (from product API)
        cur.execute("""
            SELECT p.*, c.category_name, b.brand_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.category_id
            LEFT JOIN brands b ON p.brand_id = b.brand_id
            ORDER BY p.product_name
        """)
        products = [dict(row) for row in cur.fetchall()]
        
        # Get categories
        cur.execute("""
            SELECT * FROM categories 
            ORDER BY category_name
        """)
        categories = [dict(row) for row in cur.fetchall()]
        
        # Get brands
        cur.execute("""
            SELECT * FROM brands 
            ORDER BY brand_name
        """)
        brands = [dict(row) for row in cur.fetchall()]
        
        # Get users
        users = get_users()
        
        # Get summary
        summary = get_inventory_summary()
        
        return {
            "inventory": inventory_items,
            "stores": stores,
            "products": products,
            "categories": categories,
            "brands": brands,
            "users": users,
            "summary": summary
        }
    except Exception as e:
        raise e
    finally:
        cur.close()
        return_db_connection(conn) 