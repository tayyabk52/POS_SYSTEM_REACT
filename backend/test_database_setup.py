#!/usr/bin/env python3
"""
Test script for database setup functionality
"""

import logging
import sys
from database_setup import DatabaseSetup

def test_database_setup():
    """Test the database setup functionality"""
    
    # Setup logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    logger = logging.getLogger(__name__)
    
    logger.info("Starting database setup test...")
    
    # Create database setup instance
    db_setup = DatabaseSetup(logger)
    
    # Test password validation
    test_password = "test123"
    logger.info(f"Testing with password: {test_password}")
    
    # Test PostgreSQL check
    logger.info("Testing PostgreSQL installation check...")
    is_installed = db_setup.check_postgresql_installed()
    logger.info(f"PostgreSQL installed: {is_installed}")
    
    # Test service start
    logger.info("Testing PostgreSQL service start...")
    service_started = db_setup.start_postgresql_service()
    logger.info(f"Service started: {service_started}")
    
    # Test database creation
    logger.info("Testing database creation...")
    db_created = db_setup.create_database()
    logger.info(f"Database created: {db_created}")
    
    # Test schema application
    logger.info("Testing schema application...")
    schema_applied = db_setup.apply_schema()
    logger.info(f"Schema applied: {schema_applied}")
    
    # Test environment file creation
    logger.info("Testing environment file creation...")
    env_created = db_setup.create_env_file()
    logger.info(f"Environment file created: {env_created}")
    
    # Test connection
    logger.info("Testing database connection...")
    connection_ok = db_setup.test_connection()
    logger.info(f"Connection test: {connection_ok}")
    
    logger.info("Database setup test completed!")

if __name__ == "__main__":
    test_database_setup() 