# POS System Server - Executable Build Guide

This guide explains how to build and deploy the POS System Server as standalone executables for Windows.

## Overview

The build process creates two versions of the server:
1. **Console Version** (`pos_server_console.exe`) - Command-line interface
2. **GUI Version** (`pos_server_gui.exe`) - Graphical user interface with real-time monitoring

## Prerequisites

### System Requirements
- Windows 10/11
- Python 3.9+ installed
- PostgreSQL database server running
- At least 2GB RAM available

### Python Dependencies
All dependencies are listed in `requirements.txt`:
- FastAPI 0.104.1
- Uvicorn 0.24.0
- psycopg2-binary 2.9.9
- python-dotenv 1.0.0
- pydantic 2.5.0
- requests 2.31.0
- psutil 5.9.6

## Building the Executables

### Quick Build
```bash
# Navigate to backend directory
cd backend

# Run the build script
build_exe.bat
```

### Manual Build
If the automated build fails, you can build manually:

```bash
# Install PyInstaller
pip install pyinstaller

# Build console version
pyinstaller --onefile --name "pos_server_console" run_server.py

# Build GUI version
pyinstaller --onefile --name "pos_server_gui" launch_gui.py
```

## Build Output

After successful build, you'll find these files in the `dist/` folder:

### Executables
- `pos_server_console.exe` - Console version
- `pos_server_gui.exe` - GUI version

### Launcher Scripts
- `start_console.bat` - Console launcher
- `start_gui.bat` - GUI launcher

## Running the Server

### Option 1: GUI Version (Recommended)
1. Double-click `start_gui.bat` or `pos_server_gui.exe`
2. Click "Start Server" in the GUI
3. Monitor server status and logs in real-time
4. Use "Open in Browser" to access the API

### Option 2: Console Version
1. Double-click `start_console.bat` or `pos_server_console.exe`
2. Server will start and show logs in the console window
3. Press Ctrl+C to stop the server

## Configuration

### Database Configuration
Create a `.env` file in the same directory as the executable:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=POSSYSTEM
DB_USER=postgres
DB_PASS=admin
```

### Default Configuration
If no `.env` file is found, the server uses these defaults:
- Host: localhost
- Port: 5432
- Database: POSSYSTEM
- User: postgres
- Password: admin

## Troubleshooting

### Common Issues

#### 1. "No module named 'fastapi'" Error
**Cause**: Missing dependencies in the executable
**Solution**: 
- Rebuild with `--hidden-import fastapi`
- Check that all dependencies are installed: `pip install -r requirements.txt`

#### 2. "Unable to configure formatter 'default'" Error
**Cause**: Logging configuration conflicts
**Solution**: 
- This has been fixed in the latest build
- Ensure you're using the updated `server_gui.py` and `settings/crud.py`

#### 3. Database Connection Failed
**Cause**: PostgreSQL not running or wrong credentials
**Solution**:
- Start PostgreSQL service
- Check database credentials in `.env` file
- Verify database exists and is accessible

#### 4. Port 8000 Already in Use
**Cause**: Another service is using port 8000
**Solution**:
- Stop other services on port 8000
- Or modify the port in the code (requires rebuild)

#### 5. "Access Denied" When Building
**Cause**: Antivirus or file permissions
**Solution**:
- Run as Administrator
- Temporarily disable antivirus
- Check file permissions

### Debug Information

#### Console Version Debug
The console version provides detailed logging:
- Dependency checks
- Database connection status
- Import errors
- Server startup progress

#### GUI Version Debug
The GUI version includes:
- Real-time health monitoring
- Detailed error messages
- Server status indicators
- Debug information panel

### Log Files
- Console version: Logs to console and `server.log`
- GUI version: Logs displayed in the GUI interface

## Performance Optimization

### For Production Use
1. **Database Optimization**:
   - Use connection pooling (already implemented)
   - Optimize database queries
   - Regular database maintenance

2. **Server Optimization**:
   - Run on dedicated server
   - Configure proper firewall rules
   - Use reverse proxy (nginx) for production

3. **Monitoring**:
   - Use the GUI version for monitoring
   - Check logs regularly
   - Monitor database performance

## Security Considerations

### For Production Deployment
1. **Database Security**:
   - Use strong passwords
   - Restrict database access
   - Regular security updates

2. **Network Security**:
   - Configure firewall rules
   - Use HTTPS in production
   - Restrict access to trusted IPs

3. **Application Security**:
   - Regular dependency updates
   - Input validation
   - Error handling

## Development vs Production

### Development
- Use `uvicorn` with `--reload` for development
- Enable debug logging
- Use local database

### Production
- Use the compiled executables
- Disable debug logging
- Use production database
- Implement proper monitoring

## File Structure

```
backend/
├── dist/                          # Build output
│   ├── pos_server_console.exe     # Console executable
│   ├── pos_server_gui.exe         # GUI executable
│   ├── start_console.bat          # Console launcher
│   └── start_gui.bat              # GUI launcher
├── settings/                      # Settings module
├── inventory/                     # Inventory module
├── main_exe.py                    # Main FastAPI app
├── run_server.py                  # Console server runner
├── launch_gui.py                  # GUI launcher
├── server_gui.py                  # GUI implementation
├── build_exe.bat                  # Build script
└── requirements.txt               # Dependencies
```

## Support

### Getting Help
1. Check the logs for error messages
2. Verify database connectivity
3. Ensure all dependencies are installed
4. Check firewall and antivirus settings

### Common Commands
```bash
# Check if server is running
netstat -an | findstr :8000

# Check database connection
psql -h localhost -U postgres -d POSSYSTEM

# View server logs
type server.log
```

## Updates and Maintenance

### Updating the Server
1. Stop the current server
2. Replace the executable with the new version
3. Restart the server
4. Verify functionality

### Backup Considerations
- Regular database backups
- Configuration file backups
- Log file rotation

---

**Note**: This build process creates standalone executables that include all necessary dependencies. The executables can be distributed to clients who don't have Python installed. 