#!/usr/bin/env python3
"""
Test script for intelligent PostgreSQL discovery functionality
"""

import logging
import sys
import os
from database_setup import DatabaseSetup

def test_intelligent_discovery():
    """Test the intelligent PostgreSQL discovery functionality"""
    
    # Setup logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    logger = logging.getLogger(__name__)
    
    logger.info("Starting intelligent PostgreSQL discovery test...")
    
    # Create database setup instance
    db_setup = DatabaseSetup(logger)
    
    # Test 1: Discover PostgreSQL installations
    logger.info("\n=== Test 1: Discovering PostgreSQL installations ===")
    installations = db_setup.discover_postgresql_installations()
    
    if installations:
        logger.info(f"Found {len(installations)} PostgreSQL installation(s):")
        for i, installation in enumerate(installations, 1):
            logger.info(f"  {i}. Version: {installation['version']}")
            logger.info(f"     Bin Path: {installation['bin_path']}")
            logger.info(f"     Base Path: {installation['base_path']}")
    else:
        logger.info("No PostgreSQL installations found")
    
    # Test 2: Get best installation
    logger.info("\n=== Test 2: Getting best PostgreSQL installation ===")
    best_installation = db_setup.get_best_postgresql_installation()
    
    if best_installation:
        logger.info(f"Best installation: PostgreSQL {best_installation['version']}")
        logger.info(f"Bin path: {best_installation['bin_path']}")
    else:
        logger.info("No best installation found")
    
    # Test 3: Find specific executables
    logger.info("\n=== Test 3: Finding PostgreSQL executables ===")
    executables = ['psql.exe', 'pg_ctl.exe', 'createdb.exe', 'pg_dump.exe']
    
    for executable in executables:
        path = db_setup.find_postgresql_executable(executable)
        if path:
            logger.info(f"Found {executable} at: {path}")
        else:
            logger.info(f"Could not find {executable}")
    
    # Test 4: Check PostgreSQL installation
    logger.info("\n=== Test 4: Checking PostgreSQL installation ===")
    is_installed = db_setup.check_postgresql_installed()
    logger.info(f"PostgreSQL installed: {is_installed}")
    
    # Test 5: Get latest version
    logger.info("\n=== Test 5: Getting latest PostgreSQL version ===")
    latest_version = db_setup._get_latest_postgresql_version()
    logger.info(f"Latest version: {latest_version}")
    
    logger.info("\nIntelligent PostgreSQL discovery test completed!")

def test_version_parsing():
    """Test version parsing functionality"""
    logger = logging.getLogger(__name__)
    
    logger.info("\n=== Test 6: Version parsing ===")
    db_setup = DatabaseSetup(logger)
    
    test_versions = ["15.5", "16.3", "17.2", "14.12", "unknown", "postgresql-15"]
    
    for version in test_versions:
        parsed = db_setup._parse_version(version)
        logger.info(f"Version '{version}' -> {parsed}")
    
    # Test path extraction
    logger.info("\n=== Test 7: Path version extraction ===")
    test_paths = [
        "C:\\Program Files\\PostgreSQL\\15\\bin",
        "C:\\Program Files\\PostgreSQL\\16.3\\bin",
        "C:\\PostgreSQL\\17\\bin",
        "C:\\Some\\Other\\Path"
    ]
    
    for path in test_paths:
        version = db_setup._extract_version_from_path(path)
        logger.info(f"Path '{path}' -> version '{version}'")

if __name__ == "__main__":
    test_intelligent_discovery()
    test_version_parsing() 