import React, { useState, useEffect } from 'react';
import { Card, SearchBar, StatusTag } from '../components';
import { InventoryDrawer } from '../components';
import { Table, Button, Modal, InputNumber, Select, Space, Typography, Row, Col, Tooltip, Switch, message, Input, DatePicker, Form, Divider, Badge, Spin, Tag } from 'antd';
import { ReloadOutlined, BarsOutlined, EditOutlined, ExclamationCircleOutlined, PlusOutlined, FileTextOutlined, SwapOutlined, CalculatorOutlined, InfoCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';
const { Title, Text } = Typography;
const { TextArea } = Input;

const API_BASE = 'http://localhost:8000'; // Change if needed

const inventoryData = [
  {
    inventory_id: 1,
    product: {
      product_id: 1,
      product_name: 'Coke 500ml',
      product_code: 'COKE500',
      category_id: 1,
      brand_id: 1,
      reorder_level: 10,
      max_stock_level: 100,
      unit_of_measure: 'Bottle',
      is_active: true,
    },
    variant: null,
    store_id: 1,
    current_stock: 8,
    last_reorder_date: '2024-06-01T10:00:00Z',
    last_stock_take_date: '2024-06-10T09:00:00Z',
    updated_at: '2024-06-10T09:00:00Z',
  },
  {
    inventory_id: 2,
    product: {
      product_id: 2,
      product_name: 'Lays Classic',
      product_code: 'LAYSCL',
      category_id: 2,
      brand_id: 2,
      reorder_level: 20,
      max_stock_level: 200,
      unit_of_measure: 'Pack',
      is_active: true,
    },
    variant: null,
    store_id: 1,
    current_stock: 50,
    last_reorder_date: '2024-06-05T12:00:00Z',
    last_stock_take_date: '2024-06-10T09:00:00Z',
    updated_at: '2024-06-10T09:00:00Z',
  },
  {
    inventory_id: 3,
    product: {
      product_id: 1,
      product_name: 'Coke 500ml',
      product_code: 'COKE500',
      category_id: 1,
      brand_id: 1,
      reorder_level: 10,
      max_stock_level: 100,
      unit_of_measure: 'Bottle',
      is_active: true,
    },
    variant: null,
    store_id: 2,
    current_stock: 0,
    last_reorder_date: '2024-05-28T10:00:00Z',
    last_stock_take_date: '2024-06-10T09:00:00Z',
    updated_at: '2024-06-10T09:00:00Z',
  },
  {
    inventory_id: 4,
    product: {
      product_id: 3,
      product_name: 'Nike T-Shirt',
      product_code: 'NIKETS',
      category_id: 3,
      brand_id: 3,
      reorder_level: 5,
      max_stock_level: 50,
      unit_of_measure: 'Piece',
      is_active: true,
    },
    variant: {
      variant_id: 1,
      size: 'M',
      color: 'Blue',
      sku_suffix: 'M-BLUE',
    },
    store_id: 1,
    current_stock: 3,
    last_reorder_date: '2024-06-03T14:00:00Z',
    last_stock_take_date: '2024-06-10T09:00:00Z',
    updated_at: '2024-06-10T09:00:00Z',
  },
];

const movementTypes = [
  { value: 'SALE', label: 'Sale', color: 'red' },
  { value: 'RETURN', label: 'Return', color: 'green' },
  { value: 'PURCHASE', label: 'Purchase', color: 'blue' },
  { value: 'ADJUSTMENT', label: 'Adjustment', color: 'orange' },
  { value: 'TRANSFER_OUT', label: 'Transfer Out', color: 'purple' },
  { value: 'TRANSFER_IN', label: 'Transfer In', color: 'cyan' },
  { value: 'WASTE', label: 'Waste', color: 'volcano' },
];

function InventoryPage() {
  // State for movements
  const [movements, setMovements] = useState([]);
  // State for data
  const [inventoryData, setInventoryData] = useState([]);
  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [users, setUsers] = useState([]);
  const [summary, setSummary] = useState({ total_skus: 0, total_stock: 0, low_stock_count: 0, out_of_stock_count: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for filters
  const [search, setSearch] = useState('');
  const [storeFilter, setStoreFilter] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [brandFilter, setBrandFilter] = useState(null);
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [outOfStockOnly, setOutOfStockOnly] = useState(false);
  const [movementModal, setMovementModal] = useState({ open: false, record: null });
  const [adjustModal, setAdjustModal] = useState({ open: false, record: null, value: 0, reason: '' });
  const [stockTakeModal, setStockTakeModal] = useState({ open: false, record: null, value: 0, notes: '' });
  // Transfer Modal State and helpers are declared below (do not redeclare here)
  const [inventoryDrawerOpen, setInventoryDrawerOpen] = useState(false);
  const [adding, setAdding] = useState(false);

  // Fetch data on mount or when storeFilter changes
  useEffect(() => {
    fetchAllData();
  }, [storeFilter]);

  async function fetchAllData() {
    setLoading(true);
    setError(null);
    try {
      // Use the new bulk data endpoint for optimized loading
      const params = {};
      if (storeFilter) params.store_id = storeFilter;
      
      const response = await axios.get(`${API_BASE}/inventory/bulk-data`, { params });
      const data = response.data;
      
      setInventoryData(data.inventory || []);
      setStores(data.stores || []);
      setProducts(data.products || []);
      setCategories(data.categories || []);
      setBrands(data.brands || []);
      setUsers(data.users || []);
      setSummary(data.summary || { total_skus: 0, total_stock: 0, low_stock_count: 0, out_of_stock_count: 0 });
    } catch (err) {
      setError('Failed to load data.');
      console.error('Error fetching data:', err);
    }
    setLoading(false);
  }

  // Individual fetch functions for specific updates (keeping for compatibility)
  async function fetchInventoryData() {
    try {
      const inventoryParams = storeFilter ? { params: { store_id: storeFilter } } : {};
      const response = await axios.get(`${API_BASE}/inventory/`, inventoryParams);
      setInventoryData(response.data);
    } catch (err) {
      console.error('Error fetching inventory:', err);
    }
  }

  async function fetchStores() {
    try {
      const response = await axios.get(`${API_BASE}/inventory/stores`);
      setStores(response.data);
    } catch (err) {
      console.error('Error fetching stores:', err);
    }
  }

  async function fetchProducts() {
    try {
      const response = await axios.get(`${API_BASE}/products`);
      setProducts(response.data);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  }

  async function fetchCategories() {
    try {
      const response = await axios.get(`${API_BASE}/dropdown/categories`);
      setCategories(response.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  }

  async function fetchBrands() {
    try {
      const response = await axios.get(`${API_BASE}/dropdown/brands`);
      setBrands(response.data);
    } catch (err) {
      console.error('Error fetching brands:', err);
    }
  }

  async function fetchUsers() {
    try {
      const response = await axios.get(`${API_BASE}/inventory/users`);
      setUsers(response.data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  }

  async function fetchSummary() {
    try {
      const response = await axios.get(`${API_BASE}/inventory/summary`);
      setSummary(response.data);
    } catch (err) {
      console.error('Error fetching summary:', err);
    }
  }

  // Remove JS store filtering from filtered data
  const filtered = inventoryData.filter(row => {
    const matchesSearch =
      row.product.product_name.toLowerCase().includes(search.toLowerCase()) ||
      row.product.product_code.toLowerCase().includes(search.toLowerCase()) ||
      (row.variant && `${row.variant.size} ${row.variant.color}`.toLowerCase().includes(search.toLowerCase()));
    // const matchesStore = storeFilter ? row.store_id === storeFilter : true; // REMOVE
    const matchesCategory = categoryFilter ? row.product.category_id === categoryFilter : true;
    const matchesBrand = brandFilter ? row.product.brand_id === brandFilter : true;
    const matchesLowStock = lowStockOnly ? row.current_stock <= row.product.reorder_level : true;
    const matchesOutOfStock = outOfStockOnly ? row.current_stock === 0 : true;
    return matchesSearch && matchesCategory && matchesBrand && matchesLowStock && matchesOutOfStock;
  });

  // Get stock status for a record
  const getStockStatus = (record) => {
    if (record.current_stock === 0) return { status: 'error', text: 'Out of Stock' };
    if (record.current_stock <= record.product.reorder_level) return { status: 'warning', text: 'Low Stock' };
    if (record.product.max_stock_level && record.current_stock > record.product.max_stock_level) return { status: 'processing', text: 'Over Stock' };
    return { status: 'success', text: 'In Stock' };
  };

  // Table columns
  const columns = [
    {
      title: 'Product',
      dataIndex: 'product',
      key: 'product',
      render: (p, record) => (
        <div>
          <Text strong>{p.product_name}</Text>
          <br />
          <Text type="secondary">{p.product_code}</Text>
          {record.variant && (
            <div style={{ marginTop: 4 }}>
              <Badge 
                count={`${record.variant.size} | ${record.variant.color}`} 
                style={{ backgroundColor: '#1890ff', fontSize: 11 }}
              />
            </div>
          )}
          {/* Store Tag/Tooltip for All Branches */}
          {(!storeFilter || storeFilter === null) && (
            <div style={{ marginTop: 4 }}>
              <Tooltip title={`Branch: ${record.store?.store_name || 'Unknown'}`}>
                <Tag color="blue" style={{ fontWeight: 500 }}>
                  {record.store?.store_name || 'Unknown'}
                </Tag>
              </Tooltip>
            </div>
          )}
        </div>
      ),
      width: 220,
      fixed: 'left',
    },
    {
      title: 'Category',
      dataIndex: ['product', 'category_id'],
      key: 'category',
      render: id => categories.find(c => c.category_id === id)?.category_name || '-',
      width: 120,
    },
    {
      title: 'Brand',
      dataIndex: ['product', 'brand_id'],
      key: 'brand',
      render: id => brands.find(b => b.brand_id === id)?.brand_name || '-',
      width: 120,
    },
    {
      title: 'Stock Status',
      key: 'stock_status',
      width: 120,
      render: (_, record) => {
        const status = getStockStatus(record);
        const helpText = {
            'error': 'Out of Stock: There is no stock left for this item. You cannot sell or transfer it until you add more. This means the quantity is zero.',
            'warning': 'Low Stock: The stock is low and may run out soon. Consider reordering. This means the quantity is at or below the minimum safe level.',
            'processing': 'Over Stock: You have more stock than the allowed maximum for this product. This usually means you received too much, made a mistake in stock entry, or forgot to update stock after sales. To fix this, check your recent stock movements, adjust the stock to the correct amount, or transfer extra stock to another store.',
            'success': 'In Stock: The stock level is healthy. You can sell or use this item as normal.'
        };
        return (
          <Tooltip title={helpText[status.status]} color="#fff" overlayInnerStyle={{ color: '#222', fontWeight: 400, borderRadius: 8, padding: 8 }}>
            <StatusTag status={status.status} text={status.text} />
          </Tooltip>
        );
      },
    },
    {
      title: 'Current Stock',
      dataIndex: 'current_stock',
      key: 'current_stock',
      align: 'right',
      width: 120,
      render: (v, record) => (
        <div>
          <Text strong style={{ fontSize: 16 }}>{v}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.product.unit_of_measure}
          </Text>
        </div>
      ),
    },
    {
      title: 'Stock Levels',
      key: 'stock_levels',
      width: 150,
      render: (_, record) => (
        <div style={{ textAlign: 'right' }}>
          <div>
            <Text type="secondary" style={{ fontSize: 11 }}>Reorder: </Text>
            <Text strong style={{ fontSize: 12 }}>{record.product.reorder_level}</Text>
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 11 }}>Max: </Text>
            <Text strong style={{ fontSize: 12 }}>{record.product.max_stock_level || '-'}</Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Last Stock Take',
      dataIndex: 'last_stock_take_date',
      key: 'last_stock_take_date',
      width: 150,
      render: d => d ? new Date(d).toLocaleDateString() : '-',
    },
    {
      title: 'Last Reorder',
      dataIndex: 'last_reorder_date',
      key: 'last_reorder_date',
      width: 150,
      render: d => d ? new Date(d).toLocaleDateString() : '-',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title={<span><b>View Movements</b><br/>See all stock changes for this item (sales, returns, purchases, adjustments, transfers, waste).<br/><br/>Summary: This shows a history of every time the stock changed for this product in this store. Useful for tracking mistakes or understanding why stock changed.</span>} color="#fff" overlayInnerStyle={{ color: '#222', fontWeight: 400, borderRadius: 8, padding: 8 }}>
            <Button 
              type="text" 
              icon={<BarsOutlined />} 
              onClick={async () => {
                try {
                  const res = await axios.get(`${API_BASE}/inventory/movements`, {
                    params: {
                      product_id: record.product_id,
                      variant_id: record.variant_id,
                      store_id: record.store_id,
                      limit: 20
                    }
                  });
                  setMovements(res.data);
                  setMovementModal({ open: true, record });
                } catch (err) {
                  message.error('Failed to load movements');
                }
              }}
            />
          </Tooltip>
          <Tooltip title={<span><b>Adjust Stock</b><br/>Change the current stock for this item (e.g. after a correction or audit).<br/><br/>Summary: Use this if you find a mistake in the stock count or after a manual check. It lets you set the correct number directly.</span>} color="#fff" overlayInnerStyle={{ color: '#222', fontWeight: 400, borderRadius: 8, padding: 8 }}>
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => setAdjustModal({ open: true, record, value: record.current_stock })}
            />
          </Tooltip>
          <Tooltip title={<span><b>Stock Take</b><br/>Record a physical count of this item to match system and real stock.<br/><br/>Summary: Use this when you count the items in real life and want to update the system to match. Helps keep records accurate.</span>} color="#fff" overlayInnerStyle={{ color: '#222', fontWeight: 400, borderRadius: 8, padding: 8 }}>
            <Button 
              type="text" 
              icon={<CalculatorOutlined />} 
              onClick={() => setStockTakeModal({ open: true, record, value: record.current_stock })}
            />
          </Tooltip>
          <Tooltip title={<span><b>Transfer Stock</b><br/>Move stock from this store to another store.<br/><br/>Summary: Use this to send some of this product to another branch or location. Helps balance stock between stores.</span>} color="#fff" overlayInnerStyle={{ color: '#222', fontWeight: 400, borderRadius: 8, padding: 8 }}>
            <Button 
              type="text" 
              icon={<SwapOutlined />} 
              onClick={() => openTransferModal(record)}
            />
          </Tooltip>
          <Tooltip title={<span><b>Delete Inventory</b><br/>Remove this inventory record and all its transfer logs from the database.</span>} color="#fff" overlayInnerStyle={{ color: '#222', fontWeight: 400, borderRadius: 8, padding: 8 }}>
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => {
                Modal.confirm({
                  title: 'Delete Inventory',
                  content: 'Are you sure you want to delete this inventory record? This will also delete all related transfer logs.',
                  okText: 'Delete',
                  okType: 'danger',
                  cancelText: 'Cancel',
                  onOk: async () => {
                    try {
                      await axios.delete(`${API_BASE}/inventory/${record.inventory_id}`);
                      message.success('Inventory record deleted successfully');
                      // Use optimized refresh
                      await fetchAllData();
                    } catch (err) {
                      console.error('Error deleting inventory:', err);
                      message.error('Failed to delete inventory record. Please try again.');
                    }
                  },
                });
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Add Inventory handler
  async function handleAddInventory(values) {
    console.log('[InventoryPage] Adding inventory with values:', values);
    setAdding(true);
    try {
      const response = await axios.post(`${API_BASE}/inventory/`, values);
      console.log('[InventoryPage] Inventory added successfully:', response.data);
      // Use optimized refresh
      await fetchAllData();
      setAdding(false);
      // Don't show success message here - let the drawer handle it
      return response.data; // Return the response for the drawer
    } catch (err) {
      console.error('[InventoryPage] Error adding inventory:', err);
      setAdding(false);
      // Always re-throw errors so the drawer can handle them
        throw err;
    }
  }

  // Transfer Modal State
  const [transferModal, setTransferModal] = useState({ open: false, record: null, fromStore: null, toStore: null, quantity: 0, notes: '', error: '' });

  // Helper: Get available store options for dropdowns
  const getStoreOptions = () => stores.map(s => ({ value: s.store_id, label: s.store_name }));

  // Helper: Get To Store options (removes selected fromStore)
  const getToStoreOptions = (fromStoreId) => stores
    .filter(s => s.store_id !== fromStoreId)
    .map(s => ({ value: s.store_id, label: s.store_name }));

  // When opening modal, set fromStore to record.store_id by default
  const openTransferModal = (record) => {
    setTransferModal({
      open: true,
      record,
      fromStore: record.store_id,
      toStore: null,
      quantity: 0,
      notes: '',
      error: ''
    });
  };

  // Auto-select toStore if only one option
  useEffect(() => {
    if (transferModal.open && transferModal.fromStore) {
      const toOptions = getToStoreOptions(transferModal.fromStore);
      if (toOptions.length === 1 && transferModal.toStore !== toOptions[0].value) {
        setTransferModal(a => ({ ...a, toStore: toOptions[0].value }));
      }
    }
    // eslint-disable-next-line
  }, [transferModal.open, transferModal.fromStore, stores.length]);

  // Validate transfer quantity and toStore
  const validateTransfer = () => {
    if (!transferModal.toStore) return 'Please select a destination store.';
    if (transferModal.toStore === transferModal.record?.store_id) return 'Cannot transfer to the same store.';
    if (!transferModal.quantity || transferModal.quantity < 1) return 'Transfer quantity must be at least 1.';
    if (transferModal.quantity > (transferModal.record?.current_stock || 0)) return `Transfer quantity cannot exceed available stock (${transferModal.record?.current_stock || 0}).`;
    return '';
  };

  // Update error on relevant field change
  useEffect(() => {
    if (transferModal.open) {
      setTransferModal(a => ({ ...a, error: validateTransfer() }));
    }
    // eslint-disable-next-line
  }, [transferModal.toStore, transferModal.quantity, transferModal.fromStore]);

  return (
    <div style={{ background: '#f7f8fa', minHeight: '100vh', padding: 32, fontFamily: 'SF Pro Display, Roboto, Arial, sans-serif' }}>
      {/* Add Inventory Button */}
      <Button type="primary" icon={<PlusOutlined />} style={{ marginBottom: 24 }} onClick={() => setInventoryDrawerOpen(true)}>
        Add Inventory
      </Button>
      {/* Summary Cards */}
      <Row gutter={24} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={12} md={6}>
          <Card 
            style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: 12,
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)'
            }}
            styles={{ body: { padding: 24 } }}
          >
            <Title level={4} style={{ margin: 0, color: 'white', opacity: 0.9 }}>Total SKUs</Title>
            <Text style={{ fontSize: 32, fontWeight: 700, color: 'white' }}>{summary.total_skus}</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card 
            style={{ 
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              border: 'none',
              borderRadius: 12,
              boxShadow: '0 4px 12px rgba(240, 147, 251, 0.15)'
            }}
            styles={{ body: { padding: 24 } }}
          >
            <Title level={4} style={{ margin: 0, color: 'white', opacity: 0.9 }}>Total Stock</Title>
            <Text style={{ fontSize: 32, fontWeight: 700, color: 'white' }}>{summary.total_stock}</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card 
            style={{ 
              background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
              border: 'none',
              borderRadius: 12,
              boxShadow: '0 4px 12px rgba(252, 182, 159, 0.15)'
            }}
            styles={{ body: { padding: 24 } }}
          >
            <Title level={4} style={{ margin: 0, color: '#d46b08' }}>Low Stock</Title>
            <Text style={{ fontSize: 32, fontWeight: 700, color: '#d46b08' }}>{summary.low_stock_count}</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card 
            style={{ 
              background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
              border: 'none',
              borderRadius: 12,
              boxShadow: '0 4px 12px rgba(255, 154, 158, 0.15)'
            }}
            styles={{ body: { padding: 24 } }}
          >
            <Title level={4} style={{ margin: 0, color: '#cf1322' }}>Out of Stock</Title>
            <Text style={{ fontSize: 32, fontWeight: 700, color: '#cf1322' }}>{summary.out_of_stock_count}</Text>
          </Card>
        </Col>
      </Row>

      {/* Search and Filters */}
      <Card 
        title="Inventory Management"
        style={{ marginBottom: 24, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }} 
        size="large" 
        actions={
          <Space>
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search by product name, code, or variant"
              width={250}
              filters={[
                {
                  placeholder: 'Store',
                  value: storeFilter,
                  onChange: setStoreFilter,
                  options: stores.map(s => ({ value: s.store_id, label: s.store_name })),
                  width: 140,
                },
                {
                  placeholder: 'Category',
                  value: categoryFilter,
                  onChange: setCategoryFilter,
                  options: categories.map(c => ({ value: c.category_id, label: c.category_name })),
                  width: 140,
                },
                {
                  placeholder: 'Brand',
                  value: brandFilter,
                  onChange: setBrandFilter,
                  options: brands.map(b => ({ value: b.brand_id, label: b.brand_name })),
                  width: 140,
                },
                {
                  placeholder: 'Low Stock',
                  onChange: setLowStockOnly,
                  custom: (
                    <Space>
                      <Switch checked={lowStockOnly} onChange={setLowStockOnly} size="small" />
                      <Text style={{ fontSize: 14 }}>Low Stock</Text>
                    </Space>
                  ),
                },
                {
                  placeholder: 'Out of Stock',
                  onChange: setOutOfStockOnly,
                  custom: (
                    <Space>
                      <Switch checked={outOfStockOnly} onChange={setOutOfStockOnly} size="small" />
                      <Text style={{ fontSize: 14 }}>Out of Stock</Text>
                    </Space>
                  ),
                },
              ]}
            />
            <Tooltip title="Reload inventory data to reflect recent changes.">
              <Button icon={<ReloadOutlined />} onClick={fetchAllData} />
            </Tooltip>
          </Space>
        }
      />

      {/* Inventory Table */}
      <div style={{ margin: '16px 0 8px 0', fontSize: 18, fontWeight: 500 }}>
        Showing inventory for: {storeFilter ? (stores.find(s => s.store_id === storeFilter)?.store_name || 'Selected Store') : 'All Stores'}
      </div>
      <Card 
        noPadding 
        style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
      >
        {error && <div style={{ color: 'red', padding: 16 }}>{error}</div>}
        {loading ? (
          <Spin style={{ display: 'block', margin: '48px auto' }} size="large" />
        ) : (
          <Table
            columns={columns}
            dataSource={filtered}
            rowKey="inventory_id"
            scroll={{ x: 1400 }}
            pagination={{ pageSize: 10 }}
            style={{ fontSize: 15, fontFamily: 'inherit' }}
            sticky
            rowClassName={(record) => {
              if (record.current_stock === 0) return 'out-of-stock-row';
              if (record.current_stock <= record.product.reorder_level) return 'low-stock-row';
              return '';
            }}
          />
        )}
      </Card>

      {/* Stock Movement Modal */}
      <Modal
        title={
          <div>
            <FileTextOutlined style={{ marginRight: 8 }} />
            {movementModal.record ? `Stock Movements for ${movementModal.record.product.product_name}` : 'Stock Movements'}
          </div>
        }
        open={movementModal.open}
        onCancel={() => setMovementModal({ open: false, record: null })}
        footer={<Button onClick={() => setMovementModal({ open: false, record: null })}>Close</Button>}
        width={800}
        style={{ borderRadius: 12 }}
      >
        <Table
          columns={[
            { 
              title: 'Type', 
              dataIndex: 'movement_type', 
              key: 'type', 
              render: t => {
                const type = movementTypes.find(mt => mt.value === t);
                return <StatusTag status={{ color: type?.color, text: type?.label }} />;
              }
            },
            { 
              title: 'Quantity', 
              dataIndex: 'quantity', 
              key: 'qty', 
              align: 'right', 
              render: v => <Text strong style={{ color: v > 0 ? '#52c41a' : '#ff4d4f' }}>{v > 0 ? '+' : ''}{v}</Text> 
            },
            { title: 'Date', dataIndex: 'movement_date', key: 'date', render: d => new Date(d).toLocaleString() },
            { 
              title: 'User', 
              dataIndex: 'user', 
              key: 'user', 
              render: user => user ? `${user.first_name} ${user.last_name}` : '-',
            },
            { title: 'Notes', dataIndex: 'notes', key: 'notes' },
          ]}
          dataSource={movements}
          pagination={false}
          size="small"
          variant="bordered"
          locale={{ emptyText: 'No movements' }}
        />
      </Modal>

      {/* Stock Adjustment Modal */}
      <Modal
        title={
          <div>
            <EditOutlined style={{ marginRight: 8 }} />
            {adjustModal.record ? `Adjust Stock for ${adjustModal.record.product.product_name}` : 'Adjust Stock'}
          </div>
        }
        open={adjustModal.open}
        onCancel={() => setAdjustModal({ open: false, record: null, value: 0 })}
        onOk={async () => {
          try {
            await axios.post(`${API_BASE}/inventory/adjust-stock`, {
              inventory_id: adjustModal.record.inventory_id,
              new_stock: adjustModal.value,
              reason: adjustModal.reason,
              user_id: 1 // TODO: Get from auth context
            });
            message.success('Stock adjusted successfully');
            setAdjustModal({ open: false, record: null, value: 0, reason: '' });
            // Use optimized refresh
            await fetchAllData();
          } catch (err) {
            console.error('Error adjusting stock:', err);
            if (err.response && err.response.data && err.response.data.detail) {
              message.error(`Failed to adjust stock: ${err.response.data.detail}`);
            } else {
              message.error('Failed to adjust stock. Please try again.');
            }
          }
        }}
        okText="Adjust"
        cancelText="Cancel"
        width={500}
        style={{ borderRadius: 12 }}
      >
        <Form layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Current Stock">
                <Text strong style={{ fontSize: 16 }}>{adjustModal.record?.current_stock}</Text>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Unit">
                <Text>{adjustModal.record?.product.unit_of_measure}</Text>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="New Stock Quantity">
            <InputNumber
              min={0}
              max={10000}
              value={adjustModal.value}
              onChange={v => setAdjustModal(a => ({ ...a, value: v }))}
              style={{ width: '100%' }}
              size="large"
            />
          </Form.Item>
          <Form.Item label="Adjustment Reason">
            <TextArea 
              rows={3} 
              placeholder="Enter reason for stock adjustment..." 
              value={adjustModal.reason}
              onChange={e => setAdjustModal(a => ({ ...a, reason: e.target.value }))}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Stock Take Modal */}
      <Modal
        title={
          <div>
            <CalculatorOutlined style={{ marginRight: 8 }} />
            {stockTakeModal.record ? `Stock Take for ${stockTakeModal.record.product.product_name}` : 'Stock Take'}
          </div>
        }
        open={stockTakeModal.open}
        onCancel={() => setStockTakeModal({ open: false, record: null, value: 0 })}
        onOk={async () => {
          try {
            await axios.post(`${API_BASE}/inventory/stock-take`, {
              inventory_id: stockTakeModal.record.inventory_id,
              actual_count: stockTakeModal.value,
              notes: stockTakeModal.notes,
              user_id: 1 // TODO: Get from auth context
            });
            message.success('Stock take completed successfully');
            setStockTakeModal({ open: false, record: null, value: 0, notes: '' });
            // Use optimized refresh
            await fetchAllData();
          } catch (err) {
            console.error('Error completing stock take:', err);
            if (err.response && err.response.data && err.response.data.detail) {
              message.error(`Failed to complete stock take: ${err.response.data.detail}`);
            } else {
              message.error('Failed to complete stock take. Please try again.');
            }
          }
        }}
        okText="Complete Stock Take"
        cancelText="Cancel"
        width={500}
        style={{ borderRadius: 12 }}
      >
        <Form layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="System Stock">
                <Text strong style={{ fontSize: 16 }}>{stockTakeModal.record?.current_stock}</Text>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Unit">
                <Text>{stockTakeModal.record?.product.unit_of_measure}</Text>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="Actual Count">
            <InputNumber
              min={0}
              max={10000}
              value={stockTakeModal.value}
              onChange={v => setStockTakeModal(a => ({ ...a, value: v }))}
              style={{ width: '100%' }}
              size="large"
            />
          </Form.Item>
          <Form.Item label="Notes">
            <TextArea 
              rows={3} 
              placeholder="Any notes about the stock take..." 
              value={stockTakeModal.notes}
              onChange={e => setStockTakeModal(a => ({ ...a, notes: e.target.value }))}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Transfer Stock Modal */}
      <Modal
        title={
          <div>
            <SwapOutlined style={{ marginRight: 8 }} />
            {transferModal.record ? `Transfer Stock for ${transferModal.record.product.product_name}` : 'Transfer Stock'}
          </div>
        }
        open={transferModal.open}
        onCancel={() => setTransferModal({ open: false, record: null, fromStore: null, toStore: null, quantity: 0, notes: '', error: '' })}
        onOk={async () => {
          const error = validateTransfer();
          if (error) {
            setTransferModal(a => ({ ...a, error }));
            return;
          }
          try {
            await axios.post(
              `${API_BASE}/inventory/transfer`,
              {
                from_inventory_id: transferModal.record.inventory_id,
                to_store_id: transferModal.toStore,
                quantity: transferModal.quantity,
                notes: transferModal.notes,
                user_id: 1 // TODO: Get from auth context
              },
              { headers: { 'Content-Type': 'application/json' } }
            );
            message.success('Stock transfer completed successfully');
            setTransferModal({ open: false, record: null, fromStore: null, toStore: null, quantity: 0, notes: '', error: '' });
            // Use optimized refresh
            await fetchAllData();
          } catch (err) {
            console.error('Error transferring stock:', err);
            if (err.response && err.response.data && err.response.data.detail) {
              setTransferModal(a => ({ ...a, error: `Failed to transfer stock: ${err.response.data.detail}` }));
            } else {
            setTransferModal(a => ({ ...a, error: 'Failed to transfer stock. Please try again.' }));
            }
          }
        }}
        okText="Transfer"
        cancelText="Cancel"
        width={500}
        style={{ borderRadius: 12 }}
        okButtonProps={{ disabled: !!transferModal.error }}
      >
        {(() => {
          console.log('Transfer Modal Record:', transferModal.record);
          console.log('Available Stores:', stores);
          console.log('To Store Options:', stores.filter(s => s.store_id !== transferModal.record?.store_id));
        })()}
        {transferModal.record && (
          <div style={{ marginBottom: 16, fontWeight: 500, color: '#555' }}>
            <span style={{ color: '#595959' }}>Transferring from: </span>
            <b>{transferModal.record?.store?.store_name || 'From Store'}</b>
            <span style={{ color: '#595959', margin: '0 8px' }}>to</span>
            <b>{transferModal.toStore ? (stores.find(s => s.store_id === transferModal.toStore)?.store_name || 'To Store') : '...'}</b>
            <Tooltip title="You are moving stock from the selected store to another branch. Select the destination store and quantity to transfer.">
              <InfoCircleOutlined style={{ color: '#1890ff', marginLeft: 8 }} />
            </Tooltip>
          </div>
        )}
        <Form layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="From Store" required>
                <Input
                  value={transferModal.record?.store?.store_name || ''}
                  disabled
                  style={{ fontWeight: 600 }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Available Stock">
                <Text strong style={{ fontSize: 16 }}>{transferModal.record?.current_stock}</Text>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="To Store" required>
            <Select
              placeholder="Select destination store"
              value={transferModal.toStore}
              onChange={v => setTransferModal(a => ({ ...a, toStore: v, error: '' }))}
              options={stores
                .filter(s => s.store_id !== transferModal.record?.store?.store_id)
                .map(s => ({ value: s.store_id, label: s.store_name }))}
              showSearch
              filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
            />
          </Form.Item>
          <Form.Item label={<span>Transfer Quantity <Tooltip title="Enter a quantity between 1 and available stock."><InfoCircleOutlined /></Tooltip></span>} required validateStatus={transferModal.error && transferModal.error.toLowerCase().includes('quantity') ? 'error' : ''} help={transferModal.error && transferModal.error.toLowerCase().includes('quantity') ? transferModal.error : ''}>
            <InputNumber
              min={1}
              max={transferModal.record?.current_stock || 0}
              value={transferModal.quantity}
              onChange={v => {
                const max = transferModal.record?.current_stock || 0;
                let value = v;
                if (v > max) value = max;
                if (v < 1) value = 1;
                console.log('Transfer Quantity Changed:', value, 'Max:', max);
                setTransferModal(a => ({ ...a, quantity: value, error: '' }));
              }}
              style={{ width: '100%' }}
              size="large"
            />
          </Form.Item>
          <Form.Item label="Transfer Notes">
            <TextArea 
              rows={3} 
              placeholder="Reason for transfer..." 
              value={transferModal.notes}
              onChange={e => setTransferModal(a => ({ ...a, notes: e.target.value }))}
            />
          </Form.Item>
          {transferModal.error && (
            <div style={{ color: 'red', marginTop: 8, fontWeight: 500 }}>{transferModal.error}</div>
          )}
        </Form>
      </Modal>

      {/* Add Inventory Drawer */}
      <InventoryDrawer
        open={inventoryDrawerOpen}
        onClose={() => setInventoryDrawerOpen(false)}
        onSave={handleAddInventory}
        stores={stores}
        saving={adding}
      />

      <style>{`
        .out-of-stock-row {
          background-color: #fff2f0;
        }
        .low-stock-row {
          background-color: #fffbe6;
        }
      `}</style>
    </div>
  );
}

export default InventoryPage; 