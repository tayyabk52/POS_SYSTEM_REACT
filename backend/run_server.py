#!/usr/bin/env python3
"""
POS System Server Runner
This script launches the FastAPI server with comprehensive error handling.
"""

import sys
import os
import logging
import traceback
from pathlib import Path

# Add the current directory to Python path for imports
current_dir = Path(__file__).parent
sys.path.insert(0, str(current_dir))

def setup_logging():
    """Setup logging configuration"""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.StreamHandler(sys.stdout),
            logging.FileHandler('server.log', mode='a')
        ]
    )

def check_dependencies():
    """Check if all required dependencies are available"""
    required_modules = [
        'fastapi',
        'uvicorn',
        'psycopg2',
        'pydantic',
        'requests',
        'psutil'
    ]
    
    missing_modules = []
    for module in required_modules:
        try:
            __import__(module)
            logging.info(f"✓ {module} is available")
        except ImportError as e:
            missing_modules.append(module)
            logging.error(f"✗ {module} is missing: {e}")
    
    if missing_modules:
        logging.error(f"Missing required modules: {missing_modules}")
        return False
    
    return True

def check_database_connection():
    """Check if database connection is available"""
    try:
        import psycopg2
        from dotenv import load_dotenv
        
        load_dotenv()
        
        DB_HOST = os.getenv('DB_HOST', 'localhost')
        DB_PORT = os.getenv('DB_PORT', '5432')
        DB_NAME = os.getenv('DB_NAME', 'POSSYSTEM')
        DB_USER = os.getenv('DB_USER', 'postgres')
        DB_PASS = os.getenv('DB_PASS', 'admin')
        
        logging.info(f"Attempting database connection to {DB_HOST}:{DB_PORT}/{DB_NAME}")
        
        conn = psycopg2.connect(
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASS,
            host=DB_HOST,
            port=DB_PORT
        )
        conn.close()
        logging.info("✓ Database connection successful")
        return True
        
    except Exception as e:
        logging.error(f"✗ Database connection failed: {e}")
        return False

def main():
    """Main entry point"""
    print("=" * 50)
    print("POS System Server Starting...")
    print("=" * 50)
    
    # Setup logging
    setup_logging()
    logging.info("POS System Server starting...")
    
    # Check dependencies
    logging.info("Checking dependencies...")
    if not check_dependencies():
        logging.error("Dependency check failed. Please install missing modules.")
        sys.exit(1)
    
    # Check database connection
    logging.info("Checking database connection...")
    if not check_database_connection():
        logging.warning("Database connection failed. Server may not function properly.")
    
    try:
        # Import the FastAPI app
        logging.info("Importing FastAPI application...")
        from main_exe import app
        logging.info("✓ FastAPI app imported successfully")
        
        # Import uvicorn
        import uvicorn
        logging.info("✓ Uvicorn imported successfully")
        
        # Configure and start server
        logging.info("Starting server on http://0.0.0.0:8000")
        
        uvicorn.run(
            app,
            host="0.0.0.0",
            port=8000,
            log_level="info",
            access_log=True,
            reload=False
        )
        
    except ImportError as e:
        logging.error(f"Import error: {e}")
        logging.error(f"Traceback: {traceback.format_exc()}")
        sys.exit(1)
        
    except Exception as e:
        logging.error(f"Server error: {e}")
        logging.error(f"Traceback: {traceback.format_exc()}")
        sys.exit(1)

if __name__ == "__main__":
    main() 