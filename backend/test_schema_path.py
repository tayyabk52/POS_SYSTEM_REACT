#!/usr/bin/env python3
"""
Test script to verify schema file path detection
"""

import sys
from pathlib import Path

def test_schema_paths():
    """Test all possible schema file paths"""
    print("Testing schema file path detection...")
    
    # Try multiple possible paths for the schema file
    possible_paths = [
        # Development environment
        Path(__file__).parent.parent / "database" / "dataschema.sql",
        # Executable environment (PyInstaller)
        Path(sys._MEIPASS) / "dataschema.sql" if hasattr(sys, '_MEIPASS') else None,
        # Current directory
        Path.cwd() / "dataschema.sql",
        # Backend directory
        Path(__file__).parent / "dataschema.sql",
        # Parent directory
        Path(__file__).parent.parent / "dataschema.sql",
    ]
    
    print(f"Running in: {'PyInstaller' if hasattr(sys, '_MEIPASS') else 'Development'} environment")
    print(f"sys._MEIPASS: {getattr(sys, '_MEIPASS', 'Not available')}")
    print(f"Current working directory: {Path.cwd()}")
    print(f"Script location: {Path(__file__)}")
    
    # Filter out None values and check each path
    found_path = None
    for i, path in enumerate(possible_paths):
        if path:
            exists = path.exists()
            print(f"Path {i+1}: {path} - {'EXISTS' if exists else 'NOT FOUND'}")
            if exists and not found_path:
                found_path = path
        else:
            print(f"Path {i+1}: None (skipped)")
    
    if found_path:
        print(f"\n✓ Schema file found at: {found_path}")
        return True
    else:
        print(f"\n✗ Schema file not found. Tried paths: {[str(p) for p in possible_paths if p]}")
        return False

if __name__ == "__main__":
    success = test_schema_paths()
    sys.exit(0 if success else 1) 