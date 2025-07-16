# Intelligent PostgreSQL Discovery System

## Overview

The intelligent PostgreSQL discovery system automatically detects and manages PostgreSQL installations across different versions and installation locations. It handles version 17 and all previous versions, locates executables in subdirectories, and provides robust fallback mechanisms.

## Key Features

### 1. **Automatic Installation Discovery**
- **Multiple Search Paths**: Checks common installation directories
- **Version Detection**: Automatically identifies PostgreSQL versions
- **Subdirectory Scanning**: Finds executables in nested directories
- **PATH Integration**: Discovers installations from system PATH

### 2. **Version Agnostic Support**
- **PostgreSQL 17**: Full support for latest version
- **PostgreSQL 16**: Complete compatibility
- **PostgreSQL 15**: Full backward compatibility
- **PostgreSQL 14**: Legacy version support
- **Custom Installations**: Handles non-standard locations

### 3. **Intelligent Executable Location**
- **Primary Search**: Direct bin directory lookup
- **Subdirectory Scan**: Recursive search for executables
- **Multiple Locations**: Checks various installation patterns
- **Fallback Mechanisms**: Multiple discovery strategies

## Technical Implementation

### Discovery Algorithm

```python
def discover_postgresql_installations(self):
    """Intelligently discover PostgreSQL installations on the system"""
    
    # 1. Check common installation paths
    common_paths = [
        "C:\\Program Files\\PostgreSQL",
        "C:\\Program Files (x86)\\PostgreSQL", 
        "C:\\PostgreSQL",
        os.path.expanduser("~\\PostgreSQL"),
        os.path.expanduser("~\\AppData\\Local\\PostgreSQL")
    ]
    
    # 2. Scan for version subdirectories
    for base_path in common_paths:
        for item in os.listdir(base_path):
            version_path = os.path.join(base_path, item)
            bin_path = os.path.join(version_path, "bin")
            
            # 3. Verify valid PostgreSQL installation
            if self._verify_postgresql_installation(bin_path):
                installations.append({
                    'version': item,
                    'bin_path': bin_path,
                    'base_path': version_path
                })
    
    # 4. Check system PATH
    path_installations = self._discover_from_path()
    
    # 5. Sort by version (newest first)
    installations.sort(key=lambda x: self._parse_version(x['version']), reverse=True)
```

### Installation Verification

```python
def _verify_postgresql_installation(self, bin_path):
    """Verify that a directory contains a valid PostgreSQL installation"""
    
    required_files = ['psql.exe', 'pg_ctl.exe']
    optional_files = ['createdb.exe', 'dropdb.exe', 'pg_dump.exe']
    
    # Check for required files
    for file in required_files:
        if not os.path.exists(os.path.join(bin_path, file)):
            return False
    
    # Check for at least one optional file
    for file in optional_files:
        if os.path.exists(os.path.join(bin_path, file)):
            return True
    
    return False
```

### Executable Discovery

```python
def find_postgresql_executable(self, executable_name):
    """Find a PostgreSQL executable in discovered installations"""
    
    for installation in installations:
        bin_path = installation['bin_path']
        executable_path = os.path.join(bin_path, executable_name)
        
        # Direct lookup
        if os.path.exists(executable_path):
            return executable_path
        
        # Subdirectory search
        for root, dirs, files in os.walk(bin_path):
            if executable_name in files:
                return os.path.join(root, executable_name)
    
    return None
```

## Supported Installation Patterns

### Standard Installations
```
C:\Program Files\PostgreSQL\17\bin\
C:\Program Files\PostgreSQL\16\bin\
C:\Program Files\PostgreSQL\15\bin\
C:\Program Files\PostgreSQL\14\bin\
```

### Custom Installations
```
C:\PostgreSQL\17\bin\
C:\Custom\PostgreSQL\16\bin\
C:\Users\Username\PostgreSQL\15\bin\
```

### PATH-Based Installations
```
C:\Program Files\PostgreSQL\17\bin\ (in PATH)
C:\Custom\PostgreSQL\16\bin\ (in PATH)
```

## Version Detection

### Version Parsing
- **Numeric Versions**: "15.5", "16.3", "17.2"
- **Directory Names**: "15", "16", "17"
- **Path Extraction**: Extracts version from installation path
- **Fallback Handling**: "unknown" for unrecognized versions

### Version Comparison
```python
def _parse_version(self, version_str):
    """Parse PostgreSQL version string to comparable number"""
    
    import re
    version_match = re.search(r'(\d+(?:\.\d+)?)', version_str)
    if version_match:
        return float(version_match.group(1))
    return 0.0
```

## Service Management

### Intelligent Service Startup
1. **pg_ctl Method**: Uses pg_ctl.exe when available
2. **Windows Service**: Falls back to Windows service management
3. **Multiple Service Names**: Tries various service naming patterns
4. **Connection Testing**: Verifies service is actually running

### Service Name Patterns
```python
service_names = [
    "postgresql-x64-17",  # Latest version
    "postgresql-x64-16", 
    "postgresql-x64-15",
    "postgresql-x64-14",
    "postgresql-x64-13",
    "postgresql-x64-12",
    "postgresql"           # Generic fallback
]
```

## Installation Process

### Latest Version Detection
```python
def _get_latest_postgresql_version(self):
    """Try to get the latest stable PostgreSQL version"""
    
    # 1. Try to fetch from EnterpriseDB website
    response = requests.get("https://www.enterprisedb.com/downloads/postgres-postgresql-downloads")
    
    # 2. Extract version patterns
    version_pattern = r'PostgreSQL\s+(\d+\.\d+)'
    versions = re.findall(version_pattern, response.text)
    
    # 3. Return highest version
    latest = max(versions, key=lambda v: [int(x) for x in v.split('.')])
    
    # 4. Fallback to known stable versions
    stable_versions = ["17.2", "16.3", "15.7", "14.12"]
    return stable_versions[0]
```

### Installation Steps
1. **Version Detection**: Determine latest stable version
2. **Download**: Fetch installer from EnterpriseDB
3. **Silent Installation**: Install with minimal UI
4. **Service Configuration**: Set up Windows service
5. **Path Configuration**: Update system PATH if needed

## Error Handling

### Discovery Failures
- **Permission Errors**: Graceful handling of access denied
- **Network Issues**: Fallback to known versions
- **Corrupted Installations**: Skip invalid installations
- **Timeout Handling**: Configurable timeouts for operations

### Service Startup Failures
- **Multiple Methods**: pg_ctl, Windows service, direct connection
- **Version-Specific**: Different approaches for different versions
- **Data Directory Detection**: Automatic data directory discovery
- **Connection Verification**: Confirm service is actually running

### Installation Failures
- **Download Timeout**: 5-minute timeout for downloads
- **Installation Timeout**: 5-minute timeout for installation
- **Already Installed**: Handle existing installations gracefully
- **Cleanup**: Remove temporary files even on failure

## Testing

### Test Script Usage
```bash
# Test intelligent discovery
python backend/test_intelligent_discovery.py

# Test specific functionality
python backend/test_database_setup.py
```

### Test Coverage
- **Installation Discovery**: All common paths and patterns
- **Version Detection**: Various version formats
- **Executable Location**: Direct and subdirectory search
- **Service Management**: Multiple startup methods
- **Error Scenarios**: Network, permission, timeout issues

## Compatibility Matrix

| PostgreSQL Version | Discovery | Installation | Service Management |
|-------------------|-----------|--------------|-------------------|
| 17.x              | ✅        | ✅           | ✅                |
| 16.x              | ✅        | ✅           | ✅                |
| 15.x              | ✅        | ✅           | ✅                |
| 14.x              | ✅        | ✅           | ✅                |
| 13.x              | ✅        | ✅           | ✅                |
| Custom Location   | ✅        | ✅           | ✅                |

## Performance Optimizations

### Caching
- **Installation Cache**: Remember discovered installations
- **Version Cache**: Cache version parsing results
- **Path Cache**: Cache executable locations

### Lazy Loading
- **On-Demand Discovery**: Only discover when needed
- **Selective Scanning**: Focus on likely locations first
- **Early Termination**: Stop when valid installation found

## Future Enhancements

### Planned Features
- **Remote Discovery**: Network PostgreSQL installations
- **Container Support**: Docker PostgreSQL containers
- **Cloud Integration**: AWS RDS, Azure Database
- **Configuration Profiles**: Save/load discovery settings

### Technical Improvements
- **Parallel Discovery**: Multi-threaded installation search
- **Machine Learning**: Predict installation locations
- **Health Monitoring**: Real-time service status
- **Auto-Update**: Automatic version updates

## Troubleshooting

### Common Issues

#### No Installations Found
- Check common installation paths
- Verify PATH environment variable
- Ensure PostgreSQL is actually installed
- Check for permission issues

#### Service Won't Start
- Verify service name patterns
- Check data directory permissions
- Ensure port 5432 is available
- Review Windows Event Logs

#### Version Detection Issues
- Check installation directory structure
- Verify version naming conventions
- Review version parsing logic
- Check for custom installations

### Debug Information
```python
# Enable debug logging
logging.getLogger().setLevel(logging.DEBUG)

# Test specific functionality
db_setup = DatabaseSetup(logger)
installations = db_setup.discover_postgresql_installations()
print(f"Found {len(installations)} installations")
```

## Support

For issues with intelligent PostgreSQL discovery:
1. Run the test script to verify discovery
2. Check logs for detailed error information
3. Verify PostgreSQL installation structure
4. Test with different PostgreSQL versions
5. Review system permissions and PATH settings 