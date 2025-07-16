# System Settings Usage Guide

## Overview

The System Settings feature allows you to configure various aspects of your POS system, including business information, receipt settings, display preferences, and invoice configurations. This guide explains how to use the system settings effectively.

## Accessing System Settings

1. **Navigate to Settings**: Go to the Settings page in your POS system
2. **Select System Settings Tab**: Click on the "System Settings" tab
3. **View Current Settings**: All existing settings are displayed in a table format

## Quick Add Settings Feature

The Quick Add Settings feature provides pre-configured templates for common settings categories:

### Available Templates

#### 1. Business Information
- **store_name**: Your store's name
- **store_address**: Physical store address
- **store_phone**: Store phone number
- **store_email**: Store email address
- **tax_number**: Tax registration number

#### 2. Receipt Settings
- **receipt_header**: Message at the top of receipts
- **receipt_footer**: Message at the bottom of receipts
- **show_tax_on_receipt**: Whether to display tax information (true/false)
- **receipt_print_copies**: Number of receipt copies to print

#### 3. Display Settings
- **currency_symbol**: Currency symbol to display ($, €, £, etc.)
- **date_format**: Date format (MM/DD/YYYY, DD/MM/YYYY, etc.)
- **time_format**: Time format (12 for 12-hour, 24 for 24-hour)

#### 4. Invoice Settings
- **invoice_prefix**: Prefix for invoice numbers (INV-, BILL-, etc.)
- **invoice_starting_number**: Starting number for invoices
- **invoice_terms**: Default payment terms (Net 30, COD, etc.)

## How to Use Quick Add Settings

1. **Access Quick Add**: Click the "Quick Add Settings" dropdown button
2. **Select Template**: Choose from Business Information, Receipt Settings, Display Settings, or Invoice Settings
3. **Fill in Values**: Enter your specific values for each setting
4. **Optional Store ID**: Leave blank for global settings, or specify a store ID for store-specific settings
5. **Save**: Click "Save All Settings" to apply the configuration

## Individual Setting Management

### Adding a Single Setting
1. Click "Add Setting" button
2. Enter setting key (e.g., "company_motto")
3. Enter setting value (e.g., "Customer satisfaction is our priority")
4. Optionally specify a store ID for store-specific settings
5. Click "Save"

### Editing Settings
1. Click the edit icon next to any setting
2. Modify the setting value
3. Click "Update" to save changes

### Setting Scope
- **Global Settings**: Leave store_id empty - applies to all stores
- **Store-Specific Settings**: Enter a store ID - applies only to that store

## Common Use Cases

### Setting Up a New Store
1. Use "Business Information" template to set basic store details
2. Use "Receipt Settings" template to configure receipt appearance
3. Use "Display Settings" template to set currency and date formats
4. Use "Invoice Settings" template to configure invoice numbering

### Customizing Receipt Messages
```
receipt_header: "Welcome to [Store Name]!"
receipt_footer: "Thank you for your business. Please come again!"
```

### Multi-Store Configuration
- Set global defaults first (store_id = null)
- Override specific settings per store (store_id = specific store ID)

### Currency and Localization
```
currency_symbol: "$"          # For US stores
currency_symbol: "€"          # For European stores
date_format: "MM/DD/YYYY"     # US format
date_format: "DD/MM/YYYY"     # European format
```

## Best Practices

### 1. Consistent Naming
- Use lowercase with underscores: `store_name`, `receipt_header`
- Be descriptive: `max_discount_percentage` instead of `max_disc`

### 2. Value Formatting
- **Boolean values**: Use "true" or "false" as strings
- **Numbers**: Store as strings but ensure they're valid numbers
- **Dates**: Use consistent format (YYYY-MM-DD recommended)

### 3. Store-Specific vs Global
- Use global settings for company-wide policies
- Use store-specific settings for location-specific information

### 4. Testing Changes
- Test settings in a development environment first
- Make backups before bulk changes
- Verify settings appear correctly in the UI

## Troubleshooting

### Common Issues

#### 1. Setting Not Appearing
- **Check spelling**: Ensure setting key is spelled correctly
- **Verify scope**: Check if it's global or store-specific
- **Refresh data**: Reload the settings page

#### 2. Quick Add Settings Failing
- **Check network connection**: Ensure API is accessible
- **Verify permissions**: Ensure user has settings management permissions
- **Check logs**: Look for error messages in browser console

#### 3. Duplicate Key Errors
- The system automatically handles duplicate keys by updating existing settings
- If you see errors, check that the setting key follows naming conventions

### Getting Help

1. **Check browser console**: Look for JavaScript errors
2. **Review server logs**: Check backend logs for API errors
3. **Verify database**: Ensure settings table is accessible

## API Reference

### Endpoints
- `GET /settings/system` - Retrieve all system settings
- `POST /settings/system` - Create or update a setting
- `PUT /settings/system/{setting_id}` - Update specific setting
- `DELETE /settings/system/{setting_id}` - Delete a setting

### Setting Object Structure
```json
{
  "setting_key": "store_name",
  "setting_value": "My Store",
  "store_id": null,
  "setting_id": 1,
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-01T00:00:00Z"
}
```

## Advanced Configuration

### Custom Setting Categories
You can create your own setting categories by grouping related settings:

```json
// Loyalty Program Settings
{
  "loyalty_points_per_dollar": "1",
  "loyalty_redemption_rate": "0.01",
  "loyalty_expiry_months": "12"
}

// Inventory Settings
{
  "low_stock_threshold": "10",
  "auto_reorder_enabled": "true",
  "reorder_quantity": "50"
}
```

### Environment-Specific Settings
Use different values for development, staging, and production:

```json
// Development
{
  "debug_mode": "true",
  "log_level": "debug"
}

// Production
{
  "debug_mode": "false",
  "log_level": "info"
}
```

## Security Considerations

1. **Sensitive Data**: Don't store passwords or API keys in settings
2. **Validation**: Settings are validated on the backend
3. **Permissions**: Only authorized users can modify settings
4. **Audit Trail**: All changes are logged with timestamps

## Conclusion

The System Settings feature provides a flexible way to configure your POS system. Use the Quick Add Settings for common configurations and individual settings for custom requirements. Always test changes in a safe environment before applying to production.

For additional support, refer to the API documentation or contact your system administrator. 