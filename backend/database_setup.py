#!/usr/bin/env python3
"""
Database Setup Module for POS System
Handles PostgreSQL database creation and schema setup using provided psql path
"""

import os
import sys
import subprocess
import psycopg2
import logging
import platform
from pathlib import Path
from dotenv import load_dotenv

class DatabaseSetup:
    def __init__(self, logger=None):
        self.logger = logger or logging.getLogger(__name__)
        self.psql_path = None
        self.postgres_port = 5432
        self.postgres_user = "postgres"
        self.postgres_password = None
        self.database_name = "POSSYSTEM"
        
    def setup_database(self, superuser_password, psql_path):
        """Main setup function that orchestrates the entire database setup process"""
        try:
            self.logger.info("Starting database setup process...")
            self.postgres_password = superuser_password
            self.psql_path = psql_path
            
            # Validate psql path
            if not self.validate_psql_path():
                return False, "Invalid psql path provided"
            
            # Step 1: Test PostgreSQL connection
            if not self.test_postgresql_connection():
                return False, "Cannot connect to PostgreSQL. Please check if PostgreSQL is running and the password is correct."
            
            # Step 2: Create database
            if not self.create_database():
                return False, "Failed to create database"
            
            # Step 3: Apply schema
            if not self.apply_schema():
                return False, "Failed to apply database schema"
            
            # Step 4: Create .env file
            if not self.create_env_file():
                return False, "Failed to create environment configuration"
            
            self.logger.info("Database setup completed successfully!")
            return True, "Database setup completed successfully"
            
        except Exception as e:
            error_msg = f"Database setup failed: {str(e)}"
            self.logger.error(error_msg)
            return False, error_msg
    
    def validate_psql_path(self):
        """Validate that the provided psql path exists and is executable"""
        try:
            psql_file = Path(self.psql_path)
            if not psql_file.exists():
                self.logger.error(f"psql not found at: {self.psql_path}")
                return False
            
            if not psql_file.is_file():
                self.logger.error(f"Path is not a file: {self.psql_path}")
                return False
            
            # Test if psql is executable
            try:
                result = subprocess.run([str(psql_file), "--version"], 
                                      capture_output=True, text=True, timeout=10)
                if result.returncode == 0:
                    self.logger.info(f"psql validated: {result.stdout.strip()}")
                    return True
                else:
                    self.logger.error(f"psql test failed: {result.stderr}")
                    return False
            except subprocess.TimeoutExpired:
                self.logger.error("psql version check timed out")
                return False
            except Exception as e:
                self.logger.error(f"Error testing psql: {e}")
                return False
                
        except Exception as e:
            self.logger.error(f"Error validating psql path: {e}")
            return False
    
    def test_postgresql_connection(self):
        """Test connection to PostgreSQL using psql"""
        try:
            self.logger.info("Testing PostgreSQL connection...")
            
            # Test connection using psql
            test_cmd = [
                str(Path(self.psql_path)),
                "-h", "localhost",
                "-p", str(self.postgres_port),
                "-U", self.postgres_user,
                "-d", "postgres",
                "-c", "SELECT version();"
            ]
            
            # Set password environment variable
            env = os.environ.copy()
            env['PGPASSWORD'] = self.postgres_password
            
            result = subprocess.run(test_cmd, capture_output=True, text=True, 
                                  env=env, timeout=30)
            
            if result.returncode == 0:
                self.logger.info("PostgreSQL connection successful")
                return True
            else:
                self.logger.error(f"PostgreSQL connection failed: {result.stderr}")
                return False
                
        except subprocess.TimeoutExpired:
            self.logger.error("PostgreSQL connection test timed out")
            return False
        except Exception as e:
            self.logger.error(f"Error testing PostgreSQL connection: {e}")
            return False
    
    def create_database(self):
        """Create the POS database using createdb"""
        try:
            self.logger.info("Creating database...")
            
            # Get createdb path (same directory as psql)
            psql_dir = Path(self.psql_path).parent
            createdb_path = psql_dir / "createdb.exe"
            
            if not createdb_path.exists():
                self.logger.error(f"createdb not found at: {createdb_path}")
                return False
            
            # Create database
            create_cmd = [
                str(createdb_path),
                "-h", "localhost",
                "-p", str(self.postgres_port),
                "-U", self.postgres_user,
                "-O", self.postgres_user,
                self.database_name
            ]
            
            # Set password environment variable
            env = os.environ.copy()
            env['PGPASSWORD'] = self.postgres_password
            
            result = subprocess.run(create_cmd, capture_output=True, text=True, 
                                  env=env, timeout=60)
            
            if result.returncode == 0:
                self.logger.info(f"Database '{self.database_name}' created successfully")
                return True
            elif "already exists" in result.stderr.lower():
                self.logger.info(f"Database '{self.database_name}' already exists")
                return True
            else:
                self.logger.error(f"Database creation failed: {result.stderr}")
                return False
                
        except subprocess.TimeoutExpired:
            self.logger.error("Database creation timed out")
            return False
        except Exception as e:
            self.logger.error(f"Error creating database: {e}")
            return False
    
    def apply_schema(self):
        """Apply the database schema using psql"""
        try:
            self.logger.info("Applying database schema...")
            
            # Get schema file path - handle both development and executable environments
            schema_file = None
            
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
            
            # Filter out None values and check each path
            for path in possible_paths:
                if path and path.exists():
                    schema_file = path
                    self.logger.info(f"Found schema file at: {schema_file}")
                    break
            
            if not schema_file or not schema_file.exists():
                self.logger.error(f"Schema file not found. Tried paths: {[str(p) for p in possible_paths if p]}")
                return False
            
            # Apply schema using psql
            apply_cmd = [
                str(Path(self.psql_path)),
                "-h", "localhost",
                "-p", str(self.postgres_port),
                "-U", self.postgres_user,
                "-d", self.database_name,
                "-f", str(schema_file)
            ]
            
            # Set password environment variable
            env = os.environ.copy()
            env['PGPASSWORD'] = self.postgres_password
            
            result = subprocess.run(apply_cmd, capture_output=True, text=True, 
                                  env=env, timeout=120)
            
            if result.returncode == 0:
                self.logger.info("Database schema applied successfully")
                return True
            else:
                self.logger.error(f"Schema application failed: {result.stderr}")
                return False
                
        except subprocess.TimeoutExpired:
            self.logger.error("Schema application timed out")
            return False
        except Exception as e:
            self.logger.error(f"Error applying schema: {e}")
            return False
    
    def create_env_file(self):
        """Create .env file with database configuration"""
        try:
            self.logger.info("Creating environment configuration...")
            
            # Get the backend directory
            backend_dir = Path(__file__).parent
            env_file = backend_dir / ".env"
            
            # Create .env content
            env_content = f"""# Database Configuration
DB_HOST=localhost
DB_PORT={self.postgres_port}
DB_NAME={self.database_name}
DB_USER={self.postgres_user}
DB_PASSWORD={self.postgres_password}

# Server Configuration
HOST=0.0.0.0
PORT=8000
DEBUG=True
"""
            
            # Write .env file
            with open(env_file, 'w') as f:
                f.write(env_content)
            
            self.logger.info(f"Environment file created: {env_file}")
            return True
            
        except Exception as e:
            self.logger.error(f"Error creating .env file: {e}")
            return False
    
    def test_connection(self):
        """Test database connection after setup"""
        try:
            self.logger.info("Testing database connection...")
            
            # Load environment variables
            load_dotenv()
            
            # Test connection
            conn = psycopg2.connect(
                host=os.getenv('DB_HOST', 'localhost'),
                port=int(os.getenv('DB_PORT', 5432)),
                database=os.getenv('DB_NAME', self.database_name),
                user=os.getenv('DB_USER', self.postgres_user),
                password=os.getenv('DB_PASSWORD', self.postgres_password)
            )
            
            # Test a simple query
            cursor = conn.cursor()
            cursor.execute("SELECT version();")
            version = cursor.fetchone()
            cursor.close()
            conn.close()
            
            self.logger.info(f"Database connection successful: {version[0]}")
            return True
            
        except Exception as e:
            self.logger.error(f"Database connection test failed: {e}")
            return False 