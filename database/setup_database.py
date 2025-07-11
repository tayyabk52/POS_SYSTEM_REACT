import psycopg2
import getpass
import os
import subprocess
import sys

# Prompt for connection details
host = input('PostgreSQL host (default: localhost): ') or 'localhost'
port = input('PostgreSQL port (default: 5432): ') or '5432'
superuser = input('PostgreSQL superuser (default: postgres): ') or 'postgres'
password = getpass.getpass(f'Password for {superuser}: ')
db_name = input('Database name to create/setup: ')
psql_path = input('Full path to psql executable (leave blank to use PATH): ').strip()

schema_path = os.path.join(os.path.dirname(__file__), 'dataschema.sql')

# Create the database if it doesn't exist
try:
    conn = psycopg2.connect(dbname='postgres', user=superuser, password=password, host=host, port=port)
    conn.autocommit = True
    cur = conn.cursor()
    cur.execute("SELECT 1 FROM pg_database WHERE datname = %s", (db_name,))
    exists = cur.fetchone()
    if not exists:
        print(f'Creating database {db_name}...')
        cur.execute(f'CREATE DATABASE "{db_name}"')
    else:
        print(f'Database {db_name} already exists.')
    cur.close()
    conn.close()
except Exception as e:
    print('Error connecting to PostgreSQL or creating database:', e)
    sys.exit(1)

# Use psql to run the schema
print(f'Running schema from {schema_path} using psql...')
psql_executable = psql_path if psql_path else 'psql'
psql_command = [
    psql_executable,
    f'-h{host}',
    f'-p{port}',
    f'-U{superuser}',
    '-d', db_name,
    '-f', schema_path
]
env = os.environ.copy()
env['PGPASSWORD'] = password

try:
    subprocess.run(psql_command, check=True, env=env)
    print('Database setup complete!')
except subprocess.CalledProcessError as e:
    print('Error running schema with psql:', e)
    sys.exit(1) 