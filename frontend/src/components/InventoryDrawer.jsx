import React from 'react';
import { Drawer, Form, Row, Col, InputNumber, Select, Divider, Button, Grid, message, Tooltip } from 'antd';
import { CloseOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { theme } from '../theme';
import axios from 'axios';

const { useBreakpoint } = Grid;
const API_BASE = 'http://localhost:8000';

// Help texts for inventory fields
const help = {
  store_id: 'Select the store where you want to add inventory for this product.',
  product_id: 'Choose the product to add to inventory. Only shows products not already in this store.',
  variant_id: 'Select a specific variant if the product has multiple options (size, color, etc.).',
  current_stock: 'Enter the initial stock quantity for this product/variant in this store.',
};

// Helper for label with tooltip
const labelWithHelp = (label, helpKey) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
    {label}
    <Tooltip title={<span style={{ fontSize: 13 }}>{help[helpKey]}</span>} color="#fff" overlayInnerStyle={{ color: '#222', fontWeight: 400, boxShadow: '0 2px 8px #eee', borderRadius: 8, padding: 8 }}>
      <InfoCircleOutlined style={{ color: '#1890ff', fontSize: 16, cursor: 'pointer', marginLeft: 2 }} />
    </Tooltip>
  </span>
);

function InventoryDrawer({
  open,
  onClose,
  onSave,
  stores = [],
  saving = false,
}) {
  const [form] = Form.useForm();
  const screens = useBreakpoint();
  
  // State for filtered products and variants
  const [selectedStore, setSelectedStore] = React.useState(null);
  const [availableProducts, setAvailableProducts] = React.useState([]);
  const [selectedProduct, setSelectedProduct] = React.useState(null);
  const [availableVariants, setAvailableVariants] = React.useState([]);
  const [existingInventory, setExistingInventory] = React.useState([]);
  const [allProducts, setAllProducts] = React.useState([]);
  // Add state for UI error and success
  const [uiError, setUiError] = React.useState(null);
  const [uiSuccess, setUiSuccess] = React.useState(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Fetch all products on component mount
  React.useEffect(() => {
    if (open) {
      fetchAllProducts();
    }
  }, [open]);

  // Fetch all products
  const fetchAllProducts = async () => {
    try {
      const response = await axios.get(`${API_BASE}/products`);
      setAllProducts(response.data);
      console.log('[InventoryDrawer] Fetched all products:', response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      message.error('Failed to load products');
    }
  };

  React.useEffect(() => {
    if (!open) {
      // Reset all state when drawer closes
      form.resetFields();
      setSelectedStore(null);
      setSelectedProduct(null);
      setAvailableProducts([]);
      setAvailableVariants([]);
      setExistingInventory([]);
      setUiError(null);
      setUiSuccess(null);
      setIsSubmitting(false);
    }
  }, [open, form]);

  // Add debug logs before rendering the product dropdown
  React.useEffect(() => {
    console.log('[InventoryDrawer][DEBUG] Selected Store:', selectedStore);
    console.log('[InventoryDrawer][DEBUG] All Products:', allProducts);
    console.log('[InventoryDrawer][DEBUG] Existing Inventory:', existingInventory);
    console.log('[InventoryDrawer][DEBUG] Available Products:', availableProducts);
  }, [selectedStore, allProducts, existingInventory, availableProducts]);

  // Fetch existing inventory for selected store
  const fetchExistingInventory = async (storeId) => {
    try {
      const response = await axios.get(`${API_BASE}/inventory/`, {
        params: { store_id: storeId }
      });
      console.log('[InventoryDrawer][DEBUG] Raw inventory API response:', response.data);
      response.data.forEach(item => {
        console.log('[InventoryDrawer][DEBUG] Inventory item:', item);
      });
      // Fix: Use nested product/variant if present, fallback to flat
      const existing = response.data.map(item => ({
        product_id: item.product?.product_id ?? item.product_id,
        variant_id: item.variant?.variant_id ?? item.variant_id ?? null
      }));
      setExistingInventory(existing);
      console.log('[InventoryDrawer] Existing inventory for store', storeId, existing);
      return existing;
    } catch (error) {
      console.error('Error fetching existing inventory:', error);
      // Don't show message.error here - let the caller handle it
      throw error;
    }
  };

  // Bulletproof filtering: Only show products/variants not already in inventory for the store
  const getAvailableProducts = (allProducts, existing) => {
    console.log('[InventoryDrawer] Filtering products:', { allProducts: allProducts.length, existing: existing.length });
    
    // Build a set of (product_id, variant_id) pairs in inventory
    const inventorySet = new Set(existing.map(e => `${e.product_id}:${e.variant_id ?? 'null'}`));
    console.log('[InventoryDrawer] Inventory set:', Array.from(inventorySet));
    
    const filtered = allProducts
      .map(product => {
        console.log('[InventoryDrawer] Checking product:', product.product_id, product.product_name);
        
        if (!product.variants || product.variants.length === 0) {
          // No variants: only show if (product_id, null) not in inventory
          const key = `${product.product_id}:null`;
          const isAvailable = !inventorySet.has(key);
          console.log('[InventoryDrawer] Product without variants:', product.product_name, 'key:', key, 'available:', isAvailable);
          if (isAvailable) {
            return product;
          }
          return null;
        } else {
          // Has variants: only show if at least one variant is not in inventory
          const availableVariants = product.variants.filter(variant => {
            const key = `${product.product_id}:${variant.variant_id}`;
            const isAvailable = !inventorySet.has(key);
            console.log('[InventoryDrawer] Variant:', variant.variant_id, 'key:', key, 'available:', isAvailable);
            return isAvailable;
          });
          console.log('[InventoryDrawer] Product with variants:', product.product_name, 'available variants:', availableVariants.length);
          if (availableVariants.length > 0) {
            return { ...product, variants: availableVariants };
          }
          return null;
        }
      })
      .filter(Boolean);
    
    console.log('[InventoryDrawer] Final filtered products:', filtered.length);
    console.log('[InventoryDrawer] Final filtered product names:', filtered.map(p => p.product_name));
    return filtered;
  };

  // Handle store selection
  const handleStoreChange = async (storeId) => {
    setSelectedStore(storeId);
    setSelectedProduct(null);
    setUiError(null);
    setUiSuccess(null);
    setIsSubmitting(false);
    form.setFieldsValue({ product_id: undefined, variant_id: undefined });
    
    if (storeId) {
      try {
      const existing = await fetchExistingInventory(storeId);
        console.log('[InventoryDrawer] All products before filtering:', allProducts.map(p => ({ id: p.product_id, name: p.product_name })));
      const filteredProducts = getAvailableProducts(allProducts, existing);
      setAvailableProducts(filteredProducts);
        
      if (filteredProducts.length === 0) {
        setUiError('All products/variants are already in inventory for this store.');
      }
        
      console.log('[InventoryDrawer] Filtered products for store', storeId, filteredProducts);
      } catch (error) {
        console.error('[InventoryDrawer] Error fetching existing inventory:', error);
        setUiError('Failed to load existing inventory for this store.');
        setAvailableProducts([]);
      }
    } else {
      setAvailableProducts([]);
    }
  };

  // Handle product selection
  const handleProductChange = (productId) => {
    const product = availableProducts.find(p => p.product_id === productId);
    setSelectedProduct(product);
    setUiError(null); // Clear any previous errors
    form.setFieldsValue({ variant_id: undefined });
    
    if (product && product.variants && product.variants.length > 0) {
      setAvailableVariants(product.variants);
      console.log('[InventoryDrawer] Available variants for product', productId, product.variants);
    } else {
      setAvailableVariants([]);
    }
  };

  function handleOk() {
    form.submit();
  }

  // Handle form submission
  const handleFormSubmit = async (values) => {
    console.log('[InventoryDrawer] Form values before cleaning:', values);
    
    const cleanedValues = {
      product_id: values.product_id,
      store_id: values.store_id,
      current_stock: values.current_stock || 0,
      variant_id: values.variant_id || null, // Convert undefined to null
    };
    
    console.log('[InventoryDrawer] Form values after cleaning:', cleanedValues);
    setUiError(null);
    setUiSuccess(null);
    setIsSubmitting(true);
    
    try {
      const result = await onSave(cleanedValues);
      console.log('[InventoryDrawer] Success - received result:', result);
      
      // Show success message and close drawer
      setUiSuccess('✅ Inventory added successfully!');
      message.success('Inventory record added successfully');
      
      // Close drawer after a brief delay
      setTimeout(() => {
        onClose();
        // Reset form after closing
        form.resetFields();
        setSelectedStore(null);
        setSelectedProduct(null);
        setAvailableProducts([]);
        setAvailableVariants([]);
        setExistingInventory([]);
        setUiError(null);
        setUiSuccess(null);
      }, 1500);
      
    } catch (err) {
      console.error('[InventoryDrawer] Error submitting form:', err);
      
      // Handle different error types
      if (err && err.response) {
        const status = err.response.status;
        const detail = err.response.data?.detail || '';
        
        switch (status) {
          case 409:
            setUiError(`⚠️ ${detail || 'Inventory record for this product/variant/store already exists.'}`);
            break;
          case 422:
            setUiError(`❌ ${detail || 'Invalid data provided. Please check your input.'}`);
            break;
          case 500:
            setUiError('❌ Server error occurred. Please try again.');
            break;
          default:
            setUiError(`❌ ${detail || `Error ${status}: Failed to add inventory.`}`);
        }
      } else if (err && err.message) {
        setUiError(`❌ Network error: ${err.message}`);
      } else {
        setUiError('❌ Failed to add inventory. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Drawer
      title="Add Inventory"
      placement="right"
      width={screens.xs ? '100%' : 500}
      open={open}
      onClose={onClose}
      closeIcon={<CloseOutlined style={{ fontSize: 22 }} />}
      styles={{
        body: {
          padding: screens.xs ? 16 : 32,
          background: theme.cardBg,
          borderRadius: theme.borderRadius,
          boxShadow: theme.cardShadow
        }
      }}
      footer={
        <div style={{ textAlign: 'right', padding: 16, background: 'transparent' }}>
          <Button onClick={onClose} style={{ marginRight: 12 }}>Cancel</Button>
          <Button 
            type="primary" 
            onClick={handleOk} 
            loading={saving || isSubmitting} 
            disabled={!selectedStore || availableProducts.length === 0 || isSubmitting}
            style={{ fontWeight: theme.fontWeightBold, fontSize: 16 }}
          >
            {isSubmitting ? 'Adding...' : 'Add Inventory'}
          </Button>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFormSubmit}
        preserve={false}
      >
        {uiError && (
          <div style={{ color: 'red', marginBottom: 16, fontWeight: 500, fontSize: 15 }}>{uiError}</div>
        )}
        {uiSuccess && (
          <div style={{ color: 'green', marginBottom: 16, fontWeight: 500, fontSize: 15 }}>{uiSuccess}</div>
        )}
        <Divider orientation="left" style={{ fontWeight: theme.fontWeightBold, color: theme.text, fontSize: 18 }}>Store Selection</Divider>
        
        <Form.Item 
          name="store_id" 
          label={labelWithHelp('Store', 'store_id')} 
          rules={[{ required: true, message: 'Store is required' }]}
        > 
          <Select 
            placeholder="Select store"
            options={stores.map(s => ({ value: s.store_id, label: s.store_name }))}
            onChange={handleStoreChange}
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
          />
        </Form.Item>

        <Divider orientation="left" style={{ fontWeight: theme.fontWeightBold, color: theme.text, fontSize: 18 }}>Product Selection</Divider>
        
        <Form.Item 
          name="product_id" 
          label={labelWithHelp('Product', 'product_id')} 
          rules={[{ required: true, message: 'Product is required' }]}
        > 
          <Select 
            placeholder={selectedStore ? (availableProducts.length === 0 ? 'No products available' : 'Select product') : 'Select store first'}
            options={availableProducts.map(p => ({ 
              value: p.product_id, 
              label: p.product_name,
              disabled: false
            }))}
            onChange={handleProductChange}
            disabled={!selectedStore || availableProducts.length === 0}
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
          />
        </Form.Item>

        {selectedProduct && availableVariants.length > 0 && (
          <Form.Item 
            name="variant_id" 
            label={labelWithHelp('Variant', 'variant_id')}
          > 
            <Select 
              placeholder="Select variant (optional)"
              options={availableVariants.map(v => ({ 
                value: v.variant_id, 
                label: `${v.size || ''} ${v.color || ''}`.trim() || `Variant ${v.variant_id}`
              }))}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              allowClear
            />
          </Form.Item>
        )}

        <Divider orientation="left" style={{ fontWeight: theme.fontWeightBold, color: theme.text, fontSize: 18 }}>Stock Information</Divider>
        
        <Form.Item 
          name="current_stock" 
          label={labelWithHelp('Initial Stock', 'current_stock')} 
          rules={[{ required: true, message: 'Initial stock is required' }]}
        >
          <InputNumber 
            min={0} 
            step={1}
            style={{ width: '100%' }} 
            placeholder="0"
            precision={0}
            disabled={availableProducts.length === 0}
          />
        </Form.Item>

        {selectedProduct && (
          <div style={{ 
            background: '#f6ffed', 
            border: '1px solid #b7eb8f', 
            borderRadius: 8, 
            padding: 16, 
            marginTop: 16 
          }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Product Details:</div>
            <div>Name: {selectedProduct.product_name}</div>
            <div>Code: {selectedProduct.product_code}</div>
            <div>Unit: {selectedProduct.unit_of_measure}</div>
            {selectedProduct.reorder_level && (
              <div>Reorder Level: {selectedProduct.reorder_level}</div>
            )}
          </div>
        )}
      </Form>
    </Drawer>
  );
}

export default InventoryDrawer; 