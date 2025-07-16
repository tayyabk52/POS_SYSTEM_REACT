@echo off
echo ============================================
echo POS System Server - Build Script
echo ============================================

echo.
echo [1/4] Cleaning previous builds...
if exist "dist" rmdir /s /q "dist"
if exist "build" rmdir /s /q "build"
if exist "*.spec" del "*.spec"
echo ✓ Cleaned previous builds

echo.
echo [2/4] Checking dependencies...
python -c "import fastapi, uvicorn, psycopg2, pydantic, requests, psutil" 2>nul
if %errorlevel% neq 0 (
    echo ✗ Missing dependencies. Installing...
    pip install -r requirements.txt
) else (
    echo ✓ All dependencies available
)

echo.
echo [3/4] Building console executable...
echo     - This may take several minutes...
pyinstaller --onefile ^
    --name "pos_server_console" ^
    --add-data "*.py;." ^
    --add-data "settings;settings" ^
    --add-data "inventory;inventory" ^
    --add-data "..\database\dataschema.sql;." ^
    --hidden-import "fastapi" ^
    --hidden-import "uvicorn" ^
    --hidden-import "pydantic" ^
    --hidden-import "starlette" ^
    --hidden-import "psycopg2" ^
    --hidden-import "requests" ^
    --hidden-import "psutil" ^
    --hidden-import "dotenv" ^
    --hidden-import "settings.crud" ^
    --hidden-import "settings.api" ^
    --hidden-import "settings.schemas" ^
    --hidden-import "inventory.crud" ^
    --hidden-import "inventory.api" ^
    --hidden-import "inventory.schemas" ^
    --hidden-import "database_exe" ^
    --hidden-import "main_exe" ^
    --hidden-import "database_setup" ^
    run_server.py

echo.
echo [4/4] Building GUI executable...
echo     - This may take several minutes...
pyinstaller --onefile ^
    --name "pos_server_gui" ^
    --add-data "*.py;." ^
    --add-data "settings;settings" ^
    --add-data "inventory;inventory" ^
    --add-data "..\database\dataschema.sql;." ^
    --hidden-import "fastapi" ^
    --hidden-import "uvicorn" ^
    --hidden-import "pydantic" ^
    --hidden-import "starlette" ^
    --hidden-import "psycopg2" ^
    --hidden-import "requests" ^
    --hidden-import "psutil" ^
    --hidden-import "dotenv" ^
    --hidden-import "tkinter" ^
    --hidden-import "settings.crud" ^
    --hidden-import "settings.api" ^
    --hidden-import "settings.schemas" ^
    --hidden-import "inventory.crud" ^
    --hidden-import "inventory.api" ^
    --hidden-import "inventory.schemas" ^
    --hidden-import "database_exe" ^
    --hidden-import "main_exe" ^
    --hidden-import "database_setup" ^
    launch_gui.py

echo.
echo [5/5] Creating startup scripts...
echo @echo off > "dist\start_console.bat"
echo echo Starting POS Server Console... >> "dist\start_console.bat"
echo pos_server_console.exe >> "dist\start_console.bat"
echo pause >> "dist\start_console.bat"

echo @echo off > "dist\start_gui.bat"
echo echo Starting POS Server GUI... >> "dist\start_gui.bat"
echo pos_server_gui.exe >> "dist\start_gui.bat"
echo pause >> "dist\start_gui.bat"

echo.
echo ============================================
echo Build completed successfully!
echo ============================================
echo.
echo Files created in dist\ folder:
echo   - pos_server_console.exe (Console version)
echo   - pos_server_gui.exe (GUI version with database setup)
echo   - start_console.bat (Console launcher)
echo   - start_gui.bat (GUI launcher)
echo.
echo To run:
echo   - Console: Double-click start_console.bat
echo   - GUI: Double-click start_gui.bat
echo.
echo The GUI version includes automatic database setup!
echo.
pause 