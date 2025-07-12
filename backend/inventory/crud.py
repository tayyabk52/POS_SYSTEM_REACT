from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from typing import List, Optional, Dict, Any
from datetime import datetime
import psycopg2
from . import models, schemas

# Database connection config
DB_HOST = 'localhost'
DB_PORT = '5432'
DB_NAME = 'POSSYSTEM'
DB_USER = 'postgres'
DB_PASS = 'admin'

def get_db_connection():
    return psycopg2.connect(
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASS,
        host=DB_HOST,
        port=DB_PORT
    )

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
                'store_id': row[0],
                'store_name': row[1],
                'address': row[2],
                'phone_number': row[3],
                'email': row[4],
                'city': row[5],
                'province': row[6],
                'postal_code': row[7],
                'is_active': row[8],
                'created_at': row[9],
                'updated_at': row[10]
            })
        return stores
    finally:
        cur.close()
        conn.close()

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
                'store_id': row[0],
                'store_name': row[1],
                'address': row[2],
                'phone_number': row[3],
                'email': row[4],
                'city': row[5],
                'province': row[6],
                'postal_code': row[7],
                'is_active': row[8],
                'created_at': row[9],
                'updated_at': row[10]
            }
        return None
    finally:
        cur.close()
        conn.close()

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
                'store_id': row[0],
                'store_name': row[1],
                'address': row[2],
                'phone_number': row[3],
                'email': row[4],
                'city': row[5],
                'province': row[6],
                'postal_code': row[7],
                'is_active': row[8],
                'created_at': row[9],
                'updated_at': row[10]
            }
        else:
            raise Exception('Failed to create store')
    finally:
        cur.close()
        conn.close()

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
                'store_id': row[0],
                'store_name': row[1],
                'address': row[2],
                'phone_number': row[3],
                'email': row[4],
                'city': row[5],
                'province': row[6],
                'postal_code': row[7],
                'is_active': row[8],
                'created_at': row[9],
                'updated_at': row[10]
            }
        else:
            raise Exception('Failed to update store')
    finally:
        cur.close()
        conn.close()

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
        conn.close()

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
                'user_id': row[0],
                'username': row[1],
                'first_name': row[2],
                'last_name': row[3],
                'email': row[4],
                'phone_number': row[5],
                'role_id': row[6],
                'store_id': row[7],
                'is_active': row[8],
                'last_login_at': row[9],
                'created_at': row[10],
                'updated_at': row[11]
            })
        return users
    finally:
        cur.close()
        conn.close()

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
                'user_id': row[0],
                'username': row[1],
                'first_name': row[2],
                'last_name': row[3],
                'email': row[4],
                'phone_number': row[5],
                'role_id': row[6],
                'store_id': row[7],
                'is_active': row[8],
                'last_login_at': row[9],
                'created_at': row[10],
                'updated_at': row[11]
            }
        return None
    finally:
        cur.close()
        conn.close()

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
                i.inventory_id,         -- 0
                i.product_id,           -- 1
                i.variant_id,           -- 2
                i.store_id,             -- 3
                i.current_stock,        -- 4
                i.last_reorder_date,    -- 5
                i.last_stock_take_date, -- 6
                i.updated_at,           -- 7
                -- Product details
                p.product_code,         -- 8
                p.product_name,         -- 9
                p.description,          -- 10
                p.category_id,          -- 11
                p.brand_id,             -- 12
                p.supplier_id,          -- 13
                p.base_price,           -- 14
                p.retail_price,         -- 15
                p.tax_category_id,      -- 16
                p.is_active as product_active, -- 17
                p.barcode,              -- 18
                p.unit_of_measure,      -- 19
                p.weight,               -- 20
                p.reorder_level,        -- 21
                p.max_stock_level,      -- 22
                p.created_at as product_created_at, -- 23
                p.updated_at as product_updated_at, -- 24
                -- Variant details
                pv.size,                -- 25
                pv.color,               -- 26
                pv.sku_suffix,          -- 27
                pv.barcode as variant_barcode, -- 28
                pv.retail_price as variant_retail_price, -- 29
                pv.base_price as variant_base_price, -- 30
                pv.is_active as variant_active, -- 31
                -- Store details
                s.store_name,           -- 32
                s.address,              -- 33
                s.phone_number,         -- 34
                s.email,                -- 35
                s.city,                 -- 36
                s.province,             -- 37
                s.postal_code,          -- 38
                s.is_active as store_active, -- 39
                s.created_at,           -- 40
                s.updated_at            -- 41
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
            if len(row) != 42:
                print(f"[DEBUG] Inventory row length: {len(row)} (expected 42)")
            item = {
                'inventory_id': row[0],
                'product_id': row[1],
                'variant_id': row[2],
                'store_id': row[3],
                'current_stock': row[4],
                'last_reorder_date': row[5],
                'last_stock_take_date': row[6],
                'updated_at': row[7],
                'product': {
                    'product_id': row[1],
                    'product_code': row[8],
                    'product_name': row[9],
                    'description': row[10],
                    'category_id': row[11],
                    'brand_id': row[12],
                    'supplier_id': row[13],
                    'base_price': float(row[14]) if row[14] else 0,
                    'retail_price': float(row[15]) if row[15] else 0,
                    'tax_category_id': row[16],
                    'is_active': row[17],
                    'barcode': row[18],
                    'unit_of_measure': row[19],
                    'weight': float(row[20]) if row[20] else None,
                    'reorder_level': row[21],
                    'max_stock_level': row[22],
                    'created_at': row[23],
                    'updated_at': row[24]
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
                    'updated_at': row[41]
                }
            }
            if row[2]:  # variant_id exists
                item['variant'] = {
                    'variant_id': row[2],
                    'size': row[25],
                    'color': row[26],
                    'sku_suffix': row[27],
                    'barcode': row[28],
                    'retail_price': float(row[29]) if row[29] else None,
                    'base_price': float(row[30]) if row[30] else None,
                    'is_active': row[31]
                }
            inventory_items.append(item)
        return inventory_items
    finally:
        cur.close()
        conn.close()

def get_inventory_summary() -> Dict[str, int]:
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        # Get total SKUs (unique product-variant combinations)
        cur.execute("""
            SELECT COUNT(DISTINCT product_id || '-' || COALESCE(variant_id::text, 'base'))
            FROM inventory
        """)
        total_skus = (cur.fetchone() or [0])[0]
        
        # Get total stock
        cur.execute("SELECT COALESCE(SUM(current_stock), 0) FROM inventory")
        total_stock = (cur.fetchone() or [0])[0]
        
        # Get low stock count
        cur.execute("""
            SELECT COUNT(*)
            FROM inventory i
            JOIN products p ON i.product_id = p.product_id
            WHERE i.current_stock <= p.reorder_level AND i.current_stock > 0
        """)
        low_stock_count = (cur.fetchone() or [0])[0]
        
        # Get out of stock count
        cur.execute("SELECT COUNT(*) FROM inventory WHERE current_stock = 0")
        out_of_stock_count = (cur.fetchone() or [0])[0]
        
        # Get over stock count
        cur.execute("""
            SELECT COUNT(*)
            FROM inventory i
            JOIN products p ON i.product_id = p.product_id
            WHERE i.current_stock > COALESCE(p.max_stock_level, 999999)
        """)
        over_stock_count = (cur.fetchone() or [0])[0]
        
        return {
            'total_skus': total_skus,
            'total_stock': total_stock,
            'low_stock_count': low_stock_count,
            'out_of_stock_count': out_of_stock_count,
            'over_stock_count': over_stock_count
        }
    finally:
        cur.close()
        conn.close()

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
        
        product_id, variant_id, store_id, current_stock = row
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
        conn.close()

def perform_stock_take(inventory_id: int, actual_count: int, user_id: int, notes: str = None) -> bool:
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
        
        product_id, variant_id, store_id, current_stock = row
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
        conn.close()

def transfer_stock(from_inventory_id: int, to_store_id: int, quantity: int, user_id: int, notes: str = None) -> bool:
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
        
        # Ensure row is not None before unpacking
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
            dest_inventory_id, dest_current_stock = dest_row
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
        conn.close()

def create_inventory(inventory: 'schemas.InventoryCreate') -> dict:
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        # Check for duplicate before insert
        cur.execute("""
            SELECT inventory_id FROM inventory
            WHERE product_id = %s AND store_id = %s AND (
                (variant_id IS NULL AND %s IS NULL) OR (variant_id = %s)
            )
        """, (
            inventory.product_id,
            inventory.store_id,
            inventory.variant_id,
            inventory.variant_id
        ))
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
        inventory_id = cur.fetchone()[0]
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
        # Map to dict for InventoryWithDetails
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
        conn.close()

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
    finally:
        cur.close()
        conn.close()

# Inventory Movement CRUD operations
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
                'movement_id': row[0],
                'product_id': row[1],
                'variant_id': row[2],
                'store_id': row[3],
                'movement_type': row[4],
                'quantity': row[5],
                'reference_id': row[6],
                'movement_date': row[7],
                'user_id': row[8],
                'notes': row[9],
                'user': {
                    'user_id': row[8],
                    'first_name': row[10],
                    'last_name': row[11],
                    'username': '',
                    'email': '',
                    'role_id': 0,
                    'created_at': dt,
                    'updated_at': dt
                },
                'product': {
                    'product_id': row[1],
                    'product_name': row[12],
                    'product_code': row[13],
                    'base_price': 0,
                    'retail_price': 0,
                    'created_at': dt,
                    'updated_at': dt
                },
                'variant': None,
                'store': {
                    'store_id': row[3],
                    'store_name': row[16],
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
            if row[2]:  # variant_id exists
                movement['variant'] = {
                    'variant_id': row[2],
                    'size': row[14],
                    'color': row[15]
                }
            movements.append(movement)
        return movements
    finally:
        cur.close()
        conn.close() 