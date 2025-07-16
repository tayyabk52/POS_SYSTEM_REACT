# POS System - Database Setup Guide

This guide explains the automated database setup functionality integrated into the POS System Server GUI.

## Overview

The POS System now includes an automated database setup wizard that handles:
- PostgreSQL installation (if not present)
- Database creation
- Schema application
- Configuration setup

## Features

### 🔧 **Automated PostgreSQL Installation**
- Downloads PostgreSQL 15.5 installer
- Silent installation with user-provided password
- Automatic service configuration
- Support for both 32-bit and 64-bit systems

### 🗄️ **Database Management**
- Creates `POSSYSTEM` database
- Applies complete database schema
- Sets up all required tables and relationships
- Configures initial data (tax categories, payment methods, roles, etc.)

### ⚙️ **Configuration Management**
- Creates `.env` file with database settings
- Configures server connection parameters
- Sets up environment variables

### 🔍 **Monitoring & Debugging**
- Real-time setup progress logging
- Database connection testing
- Status indicators in GUI
- Comprehensive error reporting

## Usage

### **For End Users**

1. **Launch the GUI**:
   ```bash
   # Double-click the executable or run:
   pos_server_gui.exe
   ```

2. **Setup Database**:
   - Click "Setup Database" button
   - Enter PostgreSQL superuser password
   - Click "Start Setup"
   - Monitor progress in the GUI

3. **Verify Setup**:
   - Check "Database Status" indicator
   - Use "Test Connection" button
   - Review logs for any issues

### **Setup Process**

The setup wizard performs these steps automatically:

1. **PostgreSQL Check**: Verifies if PostgreSQL is installed
2. **Installation**: Downloads and installs PostgreSQL if needed
3. **Service Start**: Starts PostgreSQL service
4. **Database Creation**: Creates `POSSYSTEM` database
5. **Schema Application**: Applies complete database schema
6. **Configuration**: Creates `.env` file with settings
7. **Verification**: Tests database connection

## Database Schema

The setup applies a comprehensive schema including:

### **Core Tables**
- `categories` - Product categories
- `brands` - Product brands
- `suppliers` - Supplier information
- `products` - Product catalog
- `product_variants` - Product variations

### **Store Management**
- `stores` - Store locations
- `pos_terminals` - POS terminals
- `users` - System users
- `roles` - User roles
- `permissions` - System permissions

### **Inventory Management**
- `inventory` - Stock levels
- `inventory_movements` - Stock movements
- `purchase_orders` - Purchase orders
- `goods_receipt_notes` - Goods receipts

### **Sales & Transactions**
- `sales_transactions` - Sales records
- `sale_items` - Sale line items
- `customers` - Customer information
- `returns` - Return transactions
- `payments` - Payment records

### **Financial Management**
- `expenses` - Expense tracking
- `expense_categories` - Expense categories
- `tax_categories` - Tax configurations
- `payment_methods` - Payment methods

## Configuration

### **Environment Variables**

The setup creates a `.env` file with:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=POSSYSTEM
DB_USER=postgres
DB_PASS=<user_provided_password>

# Server Configuration
SERVER_HOST=0.0.0.0
SERVER_PORT=8000
```

### **PostgreSQL Settings**

- **Version**: PostgreSQL 15.5
- **Port**: 5432 (default)
- **Superuser**: postgres
- **Database**: POSSYSTEM
- **Service**: postgresql-x64-15

## Troubleshooting

### **Common Issues**

#### 1. **PostgreSQL Installation Fails**
**Symptoms**: Installation error messages
**Solutions**:
- Run as Administrator
- Check internet connection
- Disable antivirus temporarily
- Ensure sufficient disk space

#### 2. **Database Connection Fails**
**Symptoms**: "Database Status: Error"
**Solutions**:
- Verify PostgreSQL service is running
- Check password is correct
- Ensure port 5432 is not blocked
- Test connection manually

#### 3. **Schema Application Fails**
**Symptoms**: Schema error messages
**Solutions**:
- Check if database exists
- Verify user permissions
- Review schema file path
- Check PostgreSQL logs

#### 4. **Service Won't Start**
**Symptoms**: PostgreSQL service errors
**Solutions**:
- Run `net start postgresql-x64-15`
- Check Windows Event Logs
- Verify service account permissions
- Reinstall PostgreSQL if needed

### **Debug Information**

The GUI provides comprehensive debugging:

- **Real-time Logs**: All setup activities logged
- **Status Indicators**: Visual status updates
- **Error Messages**: Detailed error reporting
- **Connection Testing**: Built-in connection verification

### **Manual Verification**

You can manually verify the setup:

```bash
# Check PostgreSQL service
sc query postgresql-x64-15

# Test database connection
psql -h localhost -U postgres -d POSSYSTEM

# Check database tables
\dt

# Verify initial data
SELECT * FROM tax_categories;
SELECT * FROM payment_methods;
SELECT * FROM roles;
```

## Security Considerations

### **Password Management**
- Store PostgreSQL password securely
- Use strong passwords
- Consider password rotation
- Backup password information

### **Network Security**
- PostgreSQL runs on localhost only
- No external network access by default
- Configure firewall rules if needed
- Use SSL for production deployments

### **User Permissions**
- Limit database user permissions
- Use role-based access control
- Audit user activities
- Regular security updates

## Performance Optimization

### **Database Optimization**
- Regular database maintenance
- Index optimization
- Query performance monitoring
- Connection pooling (already implemented)

### **System Requirements**
- **Minimum**: 2GB RAM, 1GB free disk space
- **Recommended**: 4GB RAM, 5GB free disk space
- **OS**: Windows 10/11 (64-bit recommended)

## Backup & Recovery

### **Database Backup**
```bash
# Create backup
pg_dump -h localhost -U postgres POSSYSTEM > backup.sql

# Restore backup
psql -h localhost -U postgres POSSYSTEM < backup.sql
```

### **Configuration Backup**
- Backup `.env` file
- Backup PostgreSQL configuration
- Document custom settings
- Regular backup schedule

## Development vs Production

### **Development Setup**
- Use GUI for easy setup
- Enable debug logging
- Test with sample data
- Local database only

### **Production Setup**
- Automated deployment scripts
- Secure password management
- Network security configuration
- Monitoring and alerting
- Regular backup procedures

## Support

### **Getting Help**
1. Check the GUI logs for error messages
2. Verify PostgreSQL installation
3. Test database connectivity
4. Review this documentation
5. Check system requirements

### **Log Files**
- GUI logs: Displayed in the application
- PostgreSQL logs: `C:\Program Files\PostgreSQL\15\data\pg_log`
- Windows Event Logs: Application and System logs

---

**Note**: The automated database setup significantly reduces deployment complexity and ensures consistent database configuration across all installations. 