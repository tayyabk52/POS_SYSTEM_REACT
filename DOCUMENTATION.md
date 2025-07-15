# POS System - Comprehensive Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Prerequisites](#prerequisites)
3. [Database Setup](#database-setup)
4. [Backend Setup](#backend-setup)
5. [Frontend Setup](#frontend-setup)
6. [API Documentation](#api-documentation)
7. [Component Documentation](#component-documentation)
8. [Usage Instructions](#usage-instructions)
9. [Troubleshooting](#troubleshooting)

## System Overview

This POS (Point of Sale) system is a complete solution for managing retail operations. It consists of:

- **Frontend**: Electron application with React and Ant Design
- **Backend**: FastAPI (Python) REST API
- **Database**: PostgreSQL for data storage
- **Features**: Sales, inventory, products, customers, users, settings management

## Prerequisites

Before starting the setup, ensure you have the following installed:

### Required Software
- **Python 3.8+**: Download from [python.org](https://python.org)
- **Node.js 16+**: Download from [nodejs.org](https://nodejs.org)
- **PostgreSQL 12+**: Download from [postgresql.org](https://postgresql.org)
- **Git**: For cloning the repository

### System Requirements
- **Operating System**: Windows 10/11, macOS, or Linux
- **RAM**: Minimum 4GB, recommended 8GB
- **Storage**: At least 2GB free space
- **Network**: Internet connection for package downloads

## Database Setup

### Step 1: Install PostgreSQL

**For Windows:**
1. Download PostgreSQL installer from [postgresql.org](https://postgresql.org/download/windows/)
2. Run the installer as Administrator
3. Choose installation directory (default: `C:\Program Files\PostgreSQL\17\`)
4. Set superuser password (remember this!)
5. Keep default port (5432)
6. Complete installation

**For macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**For Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Step 2: Configure Database

1. **Open SQL Shell (Windows)** or **Terminal (macOS/Linux)**
2. **Connect to PostgreSQL:**
   ```bash
   # Windows (in SQL Shell)
   Server [localhost]: localhost
   Database [postgres]: postgres
   Port [5432]: 5432
   Username [postgres]: postgres
   Password for user postgres: [your_password]

   # macOS/Linux
   sudo -u postgres psql
   ```

3. **Create Database and User:**
   ```sql
   CREATE DATABASE POSSYSTEM;
   CREATE USER posuser WITH PASSWORD 'your_password_here';
   GRANT ALL PRIVILEGES ON DATABASE POSSYSTEM TO posuser;
   \q
   ```

### Step 3: Run Database Setup Script

1. **Navigate to database directory:**
   ```bash
   cd database
   ```

2. **Run setup script:**
   ```bash
   python setup_database.py
   ```

3. **Follow prompts:**
   - Host: `localhost`
   - Port: `5432`
   - Database: `POSSYSTEM`
   - Username: `posuser`
   - Password: `your_password_here`
   - psql path: `C:\Program Files\PostgreSQL\17\bin\psql.exe` (Windows) or `/usr/bin/psql` (macOS/Linux)

4. **Verify setup:**
   ```bash
   psql -h localhost -U posuser -d POSSYSTEM -c "\dt"
   ```

## Backend Setup

### Step 1: Install Python Dependencies

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   ```

3. **Activate virtual environment:**
   ```bash
   # Windows
   venv\Scripts\activate

   # macOS/Linux
   source venv/bin/activate
   ```

4. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

### Step 2: Configure Environment

1. **Create .env file in backend directory:**
   ```bash
   touch .env
   ```

2. **Add database configuration:**
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=POSSYSTEM
   DB_USER=posuser
   DB_PASS=your_password_here
   ```

### Step 3: Start Backend Server

1. **Run the FastAPI server:**
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

2. **Verify server is running:**
   - Open browser: `http://localhost:8000`
   - Should see: `{"message": "Backend is running!"}`

3. **Access API documentation:**
   - Swagger UI: `http://localhost:8000/docs`
   - ReDoc: `http://localhost:8000/redoc`

## Frontend Setup

### Step 1: Install Node.js Dependencies

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

### Step 2: Start Development Server

1. **Start development server:**
   ```bash
   npm run dev
   ```

2. **Start Electron application:**
   ```bash
   npm run electron
   ```

3. **Build for production:**
   ```bash
   npm run build
   npm run pack
   ```

## API Documentation

### Authentication Endpoints

#### POST /login
Authenticate user and return user information.

**Request Body:**
```json
{
  "username": "admin",
  "password": "password123"
}
```

**Response:**
```json
{
  "user_id": 1,
  "username": "admin",
  "first_name": "Admin",
  "last_name": "User",
  "email": "admin@example.com",
  "role_id": 1,
  "success": true
}
```

### Dashboard Endpoints

#### GET /dashboard/sales-summary
Get today's sales summary.

**Response:**
```json
{
  "total_sales": 1250.50,
  "num_sales": 15,
  "date": "2024-01-15"
}
```

#### GET /dashboard/customer-count
Get total number of active customers.

**Response:**
```json
{
  "customer_count": 150
}
```

#### GET /dashboard/inventory-alerts
Get low stock alerts.

**Response:**
```json
{
  "alerts": [
    {
      "product_name": "Product A",
      "store_name": "Main Store",
      "current_stock": 5,
      "reorder_level": 10
    }
  ]
}
```

#### GET /dashboard/recent-transactions
Get recent sales transactions.

**Response:**
```json
{
  "transactions": [
    {
      "sale_id": 1,
      "invoice_number": "INV-001",
      "sale_date": "2024-01-15T10:30:00",
      "username": "admin",
      "grand_total": 125.50
    }
  ]
}
```

### Product Management Endpoints

#### GET /products/
Get all products with pagination.

**Query Parameters:**
- `skip` (int): Number of records to skip
- `limit` (int): Maximum number of records to return

**Response:**
```json
[
  {
    "product_id": 1,
    "product_name": "Sample Product",
    "product_code": "SP001",
    "description": "Product description",
    "category_id": 1,
    "brand_id": 1,
    "unit_price": 25.99,
    "cost_price": 15.00,
    "reorder_level": 10,
    "is_active": true
  }
]
```

#### POST /products/
Create new product.

**Request Body:**
```json
{
  "product_name": "New Product",
  "product_code": "NP001",
  "description": "New product description",
  "category_id": 1,
  "brand_id": 1,
  "unit_price": 29.99,
  "cost_price": 18.00,
  "reorder_level": 5
}
```

#### PUT /products/{product_id}
Update existing product.

#### DELETE /products/{product_id}
Delete product by ID.

### Inventory Management Endpoints

#### GET /inventory/
Get inventory items with filtering.

**Query Parameters:**
- `store_id` (int): Filter by store ID
- `category_id` (int): Filter by category ID
- `brand_id` (int): Filter by brand ID
- `search` (string): Search by product name/code
- `low_stock_only` (bool): Show only low stock items
- `out_of_stock_only` (bool): Show only out of stock items

#### POST /inventory/
Create new inventory record.

#### POST /inventory/adjust-stock
Adjust stock for inventory item.

**Request Body:**
```json
{
  "inventory_id": 1,
  "new_stock": 50,
  "user_id": 1,
  "reason": "Stock adjustment"
}
```

#### POST /inventory/transfer
Transfer stock between stores.

**Request Body:**
```json
{
  "from_inventory_id": 1,
  "to_store_id": 2,
  "quantity": 10,
  "user_id": 1,
  "notes": "Transfer to branch store"
}
```

### Settings Management Endpoints

#### GET /settings/tax-categories
Get tax categories.

#### POST /settings/tax-categories
Create new tax category.

#### GET /settings/payment-methods
Get payment methods.

#### POST /settings/payment-methods
Create new payment method.

#### GET /settings/roles
Get user roles.

#### POST /settings/roles
Create new role.

## Component Documentation

### Frontend Components

#### Login Component (`Login.jsx`)
Handles user authentication.

**Props:**
- `onLogin` (function): Callback when login is successful

**Features:**
- Username/password input
- Form validation
- Error handling
- Remember login state

#### MainLayout Component (`MainLayout.jsx`)
Main application layout with navigation.

**Props:**
- `user` (object): Current user information
- `onLogout` (function): Logout callback
- `children` (React elements): Page content

**Features:**
- Sidebar navigation
- Header with user info
- Responsive design
- Route management

#### Dashboard Component (`DashboardPage.jsx`)
Main dashboard with statistics and charts.

**Features:**
- Sales summary cards
- Recent transactions table
- Inventory alerts
- Customer count
- Revenue charts

#### ProductDrawer Component (`ProductDrawer.jsx`)
Modal for creating/editing products.

**Props:**
- `visible` (boolean): Show/hide drawer
- `product` (object): Product data for editing
- `onClose` (function): Close callback
- `onSave` (function): Save callback

**Features:**
- Product form with validation
- Category/brand selection
- Image upload
- Price management

#### InventoryDrawer Component (`InventoryDrawer.jsx`)
Modal for inventory management.

**Props:**
- `visible` (boolean): Show/hide drawer
- `inventory` (object): Inventory data
- `onClose` (function): Close callback
- `onSave` (function): Save callback

**Features:**
- Stock adjustment
- Store selection
- Movement tracking
- Stock take functionality

### Backend Components

#### Database Connection (`database.py`)
Handles PostgreSQL database connections.

**Functions:**
- `get_db()`: Get database session
- Connection pooling
- Error handling

#### CRUD Operations
Each module contains CRUD operations:

**Product CRUD (`product/crud.py`):**
- `get_products()`: Retrieve products
- `create_product()`: Create new product
- `update_product()`: Update existing product
- `delete_product()`: Delete product

**Inventory CRUD (`inventory/crud.py`):**
- `get_inventory_with_details()`: Get inventory with product details
- `create_inventory()`: Create inventory record
- `update_inventory_stock()`: Adjust stock levels
- `transfer_stock()`: Transfer between stores

**Settings CRUD (`settings/crud.py`):**
- Tax category management
- Payment method management
- Role and permission management
- System settings

## Usage Instructions

### Starting the Application

1. **Start Database:**
   ```bash
   # Ensure PostgreSQL is running
   # Windows: Check Services app
   # macOS: brew services start postgresql
   # Linux: sudo systemctl start postgresql
   ```

2. **Start Backend:**
   ```bash
   cd backend
   source venv/bin/activate  # or venv\Scripts\activate on Windows
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

3. **Start Frontend:**
   ```bash
   cd frontend
   npm run dev
   npm run electron
   ```

### Using the Application

1. **Login:**
   - Open the application
   - Enter username and password
   - Click "Login"

2. **Dashboard:**
   - View sales summary
   - Check inventory alerts
   - Monitor recent transactions

3. **Product Management:**
   - Navigate to "Products" menu
   - Click "Add Product" to create new product
   - Edit existing products
   - Manage product categories and brands

4. **Inventory Management:**
   - Navigate to "Inventory" menu
   - View stock levels
   - Adjust stock quantities
   - Transfer stock between stores
   - Perform stock takes

5. **Settings:**
   - Navigate to "Settings" menu
   - Configure tax categories
   - Set up payment methods
   - Manage user roles and permissions
   - Configure system settings

### Common Operations

#### Adding a New Product
1. Go to Products page
2. Click "Add Product" button
3. Fill in product details
4. Select category and brand
5. Set pricing information
6. Click "Save"

#### Adjusting Inventory Stock
1. Go to Inventory page
2. Find the product
3. Click "Adjust Stock" button
4. Enter new quantity
5. Add reason for adjustment
6. Click "Save"

#### Creating a Sale
1. Go to Sales page
2. Select products
3. Set quantities
4. Apply discounts if needed
5. Choose payment method
6. Complete transaction

## Troubleshooting

### Database Connection Issues

**Error: "server closed the connection unexpectedly"**
- Check PostgreSQL service is running
- Verify connection details in .env file
- Restart PostgreSQL service

**Error: "Permission denied"**
- Run terminal as Administrator (Windows)
- Check file permissions
- Verify psql path is correct

### Backend Issues

**Error: "Module not found"**
- Ensure virtual environment is activated
- Reinstall dependencies: `pip install -r requirements.txt`

**Error: "Port already in use"**
- Change port: `uvicorn main:app --port 8001`
- Kill existing process using port 8000

### Frontend Issues

**Error: "Cannot find module"**
- Reinstall dependencies: `npm install`
- Clear node_modules and reinstall

**Error: "Electron failed to start"**
- Check Node.js version (16+ required)
- Reinstall Electron: `npm install electron`

### General Issues

**Application not loading**
- Check all services are running
- Verify network connectivity
- Check browser console for errors

**Data not saving**
- Verify database connection
- Check API endpoints are accessible
- Review server logs for errors

### Performance Issues

**Slow application**
- Check database performance
- Optimize queries
- Increase server resources

**Memory issues**
- Restart application
- Check for memory leaks
- Monitor system resources

## Support and Maintenance

### Regular Maintenance
- Backup database regularly
- Update dependencies monthly
- Monitor system logs
- Check for security updates

### Backup Procedures
```bash
# Database backup
pg_dump -h localhost -U posuser POSSYSTEM > backup.sql

# Restore database
psql -h localhost -U posuser POSSYSTEM < backup.sql
```

### Log Files
- Backend logs: Check terminal output
- Frontend logs: Browser developer tools
- Database logs: PostgreSQL log files

This documentation provides comprehensive information for setting up, using, and maintaining the POS system. For additional support, refer to the individual component documentation or contact the development team.