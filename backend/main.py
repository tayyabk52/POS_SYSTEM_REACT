from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Request
from pydantic import BaseModel
import psycopg2
import os
from dotenv import load_dotenv
from datetime import date, datetime, timedelta

# Load environment variables from .env file
load_dotenv()

app = FastAPI()

from backend.product.api import router as product_router
app.include_router(product_router)

from backend.product.dropdown_api import router as dropdown_router
app.include_router(dropdown_router)

from backend.inventory.api import router as inventory_router
app.include_router(inventory_router)

from backend.settings.api import router as settings_router
app.include_router(settings_router)

from backend.customer.api import router as customer_router
app.include_router(customer_router)


from backend.sales.api import router as sales_router
app.include_router(sales_router)

from backend.returns.api import router as returns_router
app.include_router(returns_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development only! Restrict in production.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database connection config (edit as needed)
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = os.getenv('DB_PORT', '5432')
DB_NAME = os.getenv('DB_NAME', 'POSSYSTEM')
DB_USER = os.getenv('DB_USER', 'postgres')
DB_PASS = os.getenv('DB_PASS', 'admin')

class LoginRequest(BaseModel):
    username: str
    password: str

@app.post("/login")
def login(data: LoginRequest):
    try:
        conn = psycopg2.connect(
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASS,
            host=DB_HOST,
            port=DB_PORT
        )
        cur = conn.cursor()
        cur.execute(
            "SELECT user_id, username, first_name, last_name, email, role_id FROM users WHERE username=%s AND password_hash=%s AND is_active=TRUE",
            (data.username, data.password)
        )
        user = cur.fetchone()
        cur.close()
        conn.close()
        if user:
            return {
                "user_id": user[0],
                "username": user[1],
                "first_name": user[2],
                "last_name": user[3],
                "email": user[4],
                "role_id": user[5],
                "success": True
            }
        else:
            raise HTTPException(status_code=401, detail="Invalid username or password")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
def read_root():
    return {"message": "Backend is running!"}

@app.get("/dashboard/sales-summary")
def sales_summary():
    try:
        conn = psycopg2.connect(
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASS,
            host=DB_HOST,
            port=DB_PORT
        )
        cur = conn.cursor()
        today = date.today()
        cur.execute("""
            SELECT COALESCE(SUM(grand_total), 0), COUNT(*)
            FROM sales_transactions
            WHERE sale_date::date = %s
        """, (today,))
        result = cur.fetchone()
        total_sales, num_sales = result if result else (0, 0)
        cur.close()
        conn.close()
        return {"total_sales": float(total_sales), "num_sales": num_sales, "date": str(today)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/dashboard/customer-count")
def customer_count():
    try:
        conn = psycopg2.connect(
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASS,
            host=DB_HOST,
            port=DB_PORT
        )
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM customers WHERE is_active=TRUE")
        result = cur.fetchone()
        count = result[0] if result else 0
        cur.close()
        conn.close()
        return {"customer_count": count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/dashboard/inventory-alerts")
def inventory_alerts():
    try:
        conn = psycopg2.connect(
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASS,
            host=DB_HOST,
            port=DB_PORT
        )
        cur = conn.cursor()
        cur.execute("""
            SELECT p.product_name, s.store_name, i.current_stock, p.reorder_level
            FROM inventory i
            JOIN products p ON i.product_id = p.product_id
            JOIN stores s ON i.store_id = s.store_id
            WHERE i.current_stock < p.reorder_level
            ORDER BY i.current_stock ASC
            LIMIT 5
        """)
        alerts = [
            {
                "product_name": row[0],
                "store_name": row[1],
                "current_stock": row[2],
                "reorder_level": row[3]
            } for row in cur.fetchall()
        ]
        cur.close()
        conn.close()
        return {"alerts": alerts}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/dashboard/recent-transactions")
def recent_transactions():
    try:
        conn = psycopg2.connect(
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASS,
            host=DB_HOST,
            port=DB_PORT
        )
        cur = conn.cursor()
        cur.execute("""
            SELECT st.sale_id, st.invoice_number, st.sale_date, u.username, st.grand_total
            FROM sales_transactions st
            JOIN users u ON st.user_id = u.user_id
            ORDER BY st.sale_date DESC
            LIMIT 10
        """)
        txns = [
            {
                "sale_id": row[0],
                "invoice_number": row[1],
                "sale_date": row[2].isoformat() if row[2] else None,
                "username": row[3],
                "grand_total": float(row[4])
            } for row in cur.fetchall()
        ]
        cur.close()
        conn.close()
        return {"transactions": txns}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 