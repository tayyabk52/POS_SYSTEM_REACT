# POS System

A locally runnable Point of Sale (POS) system with:

- **Frontend:** Electron + React + Ant Design
- **Backend:** FastAPI (Python)
- **Database:** PostgreSQL
- **Packaging:** Electron Builder + PyInstaller

## Structure

- `backend/` - FastAPI backend
- `frontend/` - React + Ant Design + Electron frontend
- `database/` - SQL files and database scripts 

## Environment Setup

To configure the database connection, create a `.env` file in the `backend/` directory with the following content:

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=db_name
DB_USER=your_user
DB_PASS=your_password_here
```

Replace the above details as per your actual local psql setup. 