import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Input, Select, Tag, Space, Typography, Tooltip, Row, Col, Modal, message, Spin } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ReloadOutlined, FolderAddOutlined, TrademarkCircleOutlined } from '@ant-design/icons';
import { theme } from '../theme';
import ProductDrawer from '../components/ProductDrawer';
import axios from 'axios';

const { Title } = Typography;

const API_BASE = 'http://localhost:8000'; // Change if needed

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [taxCategories, setTaxCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [brandFilter, setBrandFilter] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [saving, setSaving] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [addingCategory, setAddingCategory] = useState(false);
  const [brandModalOpen, setBrandModalOpen] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [addingBrand, setAddingBrand] = useState(false);
  const [variantModalOpen, setVariantModalOpen] = useState(false);
  const [selectedVariants, setSelectedVariants] = useState([]);
  const [selectedProductName, setSelectedProductName] = useState("");

  // Fetch all dropdowns and products on mount
  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      setError(null);
      try {
        const [prodRes, catRes, brandRes, suppRes, taxRes] = await Promise.all([
          axios.get(`${API_BASE}/products/`),
          axios.get(`${API_BASE}/categories`),
          axios.get(`${API_BASE}/brands`),
          axios.get(`${API_BASE}/suppliers`),
          axios.get(`${API_BASE}/tax-categories`),
        ]);
        setProducts(prodRes.data);
        setCategories(catRes.data);
        setBrands(brandRes.data);
        setSuppliers(suppRes.data);
        setTaxCategories(taxRes.data);
      } catch (err) {
        setError('Failed to load data.');
      }
      setLoading(false);
    }
    fetchAll();
  }, []);

  // Filtered products
  const filteredProducts = products.filter(p => {
    const matchesSearch =
      p.product_name.toLowerCase().includes(search.toLowerCase()) ||
      p.product_code.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter ? p.category_id === categoryFilter : true;
    const matchesBrand = brandFilter ? p.brand_id === brandFilter : true;
    return matchesSearch && matchesCategory && matchesBrand;
  });

  // Table columns
  const columns = [
    { title: 'Code', dataIndex: 'product_code', key: 'product_code', width: 100, fixed: 'left' },
    { title: 'Name', dataIndex: 'product_name', key: 'product_name', width: 180, render: (text, record) => <b style={{ fontWeight: theme.fontWeightMedium }}>{text}</b> },
    { title: 'Category', dataIndex: 'category_id', key: 'category_id', width: 120, render: id => categories.find(c => c.category_id === id)?.category_name || '-' },
    { title: 'Brand', dataIndex: 'brand_id', key: 'brand_id', width: 120, render: id => brands.find(b => b.brand_id === id)?.brand_name || '-' },
    { title: 'Supplier', dataIndex: 'supplier_id', key: 'supplier_id', width: 140, render: id => suppliers.find(s => s.supplier_id === id)?.supplier_name || '-' },
    { title: 'Retail Price', dataIndex: 'retail_price', key: 'retail_price', width: 120, align: 'right', render: v => `PKR ${Number(v).toFixed(2)}` },
    { title: 'Tax', dataIndex: 'tax_category_id', key: 'tax_category_id', width: 100, render: id => taxCategories.find(t => t.tax_category_id === id)?.tax_category_name || '-' },
    { title: 'Barcode', dataIndex: 'barcode', key: 'barcode', width: 140 },
    { title: 'Unit', dataIndex: 'unit_of_measure', key: 'unit_of_measure', width: 90 },
    { title: 'Weight', dataIndex: 'weight', key: 'weight', width: 90, render: w => w ? `${w} kg` : '-' },
    { title: 'Active', dataIndex: 'is_active', key: 'is_active', width: 90, render: v => v ? <Tag color="green">Yes</Tag> : <Tag color="red">No</Tag> },
    {
      title: 'Actions',
      key: 'actions',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit">
            <Button icon={<EditOutlined />} shape="circle" onClick={() => onEdit(record)} />
          </Tooltip>
          <Tooltip title="Delete">
            <Button icon={<DeleteOutlined />} shape="circle" danger onClick={() => onDelete(record)} />
          </Tooltip>
          <Tooltip title="View Variants">
            <Button
              icon={<span style={{ fontWeight: 'bold' }}>V</span>}
              shape="circle"
              onClick={() => {
                setSelectedVariants(record.variants || []);
                setSelectedProductName(record.product_name);
                setVariantModalOpen(true);
              }}
              disabled={!record.variants || record.variants.length === 0}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  function onEdit(product) {
    setEditingProduct(product);
    setDrawerOpen(true);
  }

  async function onDelete(product) {
    Modal.confirm({
      title: 'Delete Product',
      content: `Are you sure you want to delete "${product.product_name}"?`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await axios.delete(`${API_BASE}/products/${product.product_id}`);
          setProducts(products.filter(p => p.product_id !== product.product_id));
          message.success('Product deleted');
        } catch {
          message.error('Failed to delete product');
        }
      },
    });
  }

  function onAdd() {
    setEditingProduct(null);
    setDrawerOpen(true);
  }

  async function handleDrawerSave(values) {
    setSaving(true);
    try {
      if (editingProduct) {
        // Update
        const res = await axios.put(`${API_BASE}/products/${editingProduct.product_id}`, values);
        setProducts(products.map(p => p.product_id === editingProduct.product_id ? res.data : p));
        message.success('Product updated');
      } else {
        // Create
        const res = await axios.post(`${API_BASE}/products/`, values);
        setProducts([...products, res.data]);
        message.success('Product added');
      }
      setDrawerOpen(false);
    } catch {
      message.error('Failed to save product');
    }
    setSaving(false);
  }

  async function handleAddCategory() {
    if (!newCategoryName.trim()) {
      message.warning('Please enter a category name');
      return;
    }
    setAddingCategory(true);
    try {
      const res = await axios.post(`${API_BASE}/categories`, { category_name: newCategoryName });
      setCategories([...categories, res.data]);
      setNewCategoryName('');
      setCategoryModalOpen(false);
      message.success('Category added');
    } catch (err) {
      if (err.response && err.response.status === 409) {
        message.error('Category already exists');
      } else {
        message.error('Failed to add category');
      }
    }
    setAddingCategory(false);
  }

  async function handleAddBrand() {
    if (!newBrandName.trim()) {
      message.warning('Please enter a brand name');
      return;
    }
    setAddingBrand(true);
    try {
      const res = await axios.post(`${API_BASE}/brands`, { brand_name: newBrandName });
      setBrands([...brands, res.data]);
      setNewBrandName('');
      setBrandModalOpen(false);
      message.success('Brand added');
    } catch (err) {
      if (err.response && err.response.status === 409) {
        message.error('Brand already exists');
      } else {
        message.error('Failed to add brand');
      }
    }
    setAddingBrand(false);
  }

  function reloadAll() {
    setLoading(true);
    setError(null);
    Promise.all([
      axios.get(`${API_BASE}/products/`),
      axios.get(`${API_BASE}/categories`),
      axios.get(`${API_BASE}/brands`),
      axios.get(`${API_BASE}/suppliers`),
      axios.get(`${API_BASE}/tax-categories`),
    ]).then(([prodRes, catRes, brandRes, suppRes, taxRes]) => {
      setProducts(prodRes.data);
      setCategories(catRes.data);
      setBrands(brandRes.data);
      setSuppliers(suppRes.data);
      setTaxCategories(taxRes.data);
      setLoading(false);
    }).catch(() => {
      setError('Failed to reload data.');
      setLoading(false);
    });
  }

  return (
    <div style={{ background: theme.contentBg, minHeight: '100vh', padding: 32, fontFamily: theme.fontFamily }}>
      <Card bordered={false} style={{ borderRadius: theme.borderRadius, boxShadow: theme.cardShadow, marginBottom: 32, background: theme.cardBg }} bodyStyle={{ padding: 32 }}>
        <Row align="middle" justify="space-between" gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Title level={4} style={{ margin: 0, fontWeight: theme.fontWeightBold, fontSize: theme.fontSizeTitle, color: theme.text }}>Products</Title>
          </Col>
          <Col xs={24} sm={12} md={16} style={{ textAlign: 'right' }}>
            <Space>
              <Input
                allowClear
                prefix={<SearchOutlined />}
                placeholder="Search by name or code"
                style={{ width: 220, fontSize: 16 }}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <Select
                allowClear
                placeholder="Category"
                style={{ width: 140 }}
                value={categoryFilter}
                onChange={setCategoryFilter}
                options={categories.map(c => ({ value: c.category_id, label: c.category_name }))}
                dropdownRender={menu => (
                  <>
                    {menu}
                    <div style={{ display: 'flex', alignItems: 'center', padding: 8 }}>
                      <Button type="link" icon={<FolderAddOutlined />} onClick={() => setCategoryModalOpen(true)} style={{ padding: 0, height: 24 }}>
                        Add Category
                      </Button>
                    </div>
                  </>
                )}
              />
              <Select
                allowClear
                placeholder="Brand"
                style={{ width: 140 }}
                value={brandFilter}
                onChange={setBrandFilter}
                options={brands.map(b => ({ value: b.brand_id, label: b.brand_name }))}
                dropdownRender={menu => (
                  <>
                    {menu}
                    <div style={{ display: 'flex', alignItems: 'center', padding: 8 }}>
                      <Button type="link" icon={<TrademarkCircleOutlined />} onClick={() => setBrandModalOpen(true)} style={{ padding: 0, height: 24 }}>
                        Add Brand
                      </Button>
                    </div>
                  </>
                )}
              />
              <Button type="primary" icon={<PlusOutlined />} onClick={onAdd} style={{ fontWeight: theme.fontWeightBold, fontSize: 16 }}>Add Product</Button>
              <Tooltip title="Reload">
                <Button icon={<ReloadOutlined />} onClick={reloadAll} />
              </Tooltip>
            </Space>
          </Col>
        </Row>
      </Card>
      <Card bordered={false} style={{ borderRadius: theme.borderRadius, boxShadow: theme.cardShadow, background: theme.cardBg }} bodyStyle={{ padding: 0 }}>
        {error && <div style={{ color: 'red', padding: 16 }}>{error}</div>}
        {loading ? <Spin style={{ display: 'block', margin: '48px auto' }} size="large" /> : (
          <Table
            columns={columns}
            dataSource={filteredProducts}
            rowKey="product_id"
            scroll={{ x: 1200 }}
            pagination={{ pageSize: 8 }}
            style={{ fontSize: theme.fontSizeTable, fontFamily: theme.fontFamily }}
            sticky
            expandable={{
              expandedRowRender: record => (
                <div style={{ background: '#fafbfc', padding: 24, borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                  <Row gutter={[24, 16]}>
                    <Col xs={24} sm={12} md={8}>
                      <b>Description:</b>
                      <div style={{ color: '#555', marginBottom: 8 }}>{record.description || <span style={{ color: '#bbb' }}>No description</span>}</div>
                      <b>Base Price:</b> <span style={{ marginLeft: 8 }}>PKR {Number(record.base_price).toFixed(2)}</span><br/>
                      <b>Retail Price:</b> <span style={{ marginLeft: 8 }}>PKR {Number(record.retail_price).toFixed(2)}</span>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <b>Reorder Level:</b> <span style={{ marginLeft: 8 }}>{record.reorder_level ?? '-'}</span><br/>
                      <b>Max Stock Level:</b> <span style={{ marginLeft: 8 }}>{record.max_stock_level ?? '-'}</span><br/>
                      <b>Unit of Measure:</b> <span style={{ marginLeft: 8 }}>{record.unit_of_measure || '-'}</span><br/>
                      <b>Weight:</b> <span style={{ marginLeft: 8 }}>{record.weight ? `${record.weight} kg` : '-'}</span>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <b>Created At:</b> <span style={{ marginLeft: 8 }}>{record.created_at ? new Date(record.created_at).toLocaleString() : '-'}</span><br/>
                      <b>Updated At:</b> <span style={{ marginLeft: 8 }}>{record.updated_at ? new Date(record.updated_at).toLocaleString() : '-'}</span><br/>
                      <b>Variants:</b> <span style={{ marginLeft: 8 }}>{record.variants && record.variants.length > 0 ? `${record.variants.length} variant(s)` : 'No variants'}</span>
                    </Col>
                  </Row>
                </div>
              ),
              rowExpandable: record => true,
            }}
          />
        )}
      </Card>
      <Modal
        title="Add Category"
        open={categoryModalOpen}
        onCancel={() => { setCategoryModalOpen(false); setNewCategoryName(''); }}
        onOk={handleAddCategory}
        confirmLoading={addingCategory}
        okText="Add"
        cancelText="Cancel"
      >
        <Input
          placeholder="Category name"
          value={newCategoryName}
          onChange={e => setNewCategoryName(e.target.value)}
          onPressEnter={handleAddCategory}
          autoFocus
        />
      </Modal>
      <Modal
        title="Add Brand"
        open={brandModalOpen}
        onCancel={() => { setBrandModalOpen(false); setNewBrandName(''); }}
        onOk={handleAddBrand}
        confirmLoading={addingBrand}
        okText="Add"
        cancelText="Cancel"
      >
        <Input
          placeholder="Brand name"
          value={newBrandName}
          onChange={e => setNewBrandName(e.target.value)}
          onPressEnter={handleAddBrand}
          autoFocus
        />
      </Modal>
      <ProductDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSave={handleDrawerSave}
        initialValues={editingProduct || {
          product_code: "",
          product_name: "",
          description: "",
          category_id: undefined,
          brand_id: undefined,
          supplier_id: undefined,
          base_price: null,
          retail_price: null,
          tax_category_id: undefined,
          barcode: "",
          unit_of_measure: "",
          weight: null,
          reorder_level: null,
          max_stock_level: null,
          is_active: true,
          variants: []
        }}
        categories={categories}
        brands={brands}
        suppliers={suppliers}
        taxCategories={taxCategories}
        isEditing={!!editingProduct}
        saving={saving}
        onAddCategory={() => setCategoryModalOpen(true)}
        onAddBrand={() => setBrandModalOpen(true)}
      />
      <Modal
        title={`Variants for ${selectedProductName}`}
        open={variantModalOpen}
        onCancel={() => setVariantModalOpen(false)}
        footer={<Button onClick={() => setVariantModalOpen(false)}>Close</Button>}
        width={800}
      >
        <Table
          columns={[
            { title: 'Size', dataIndex: 'size', key: 'size' },
            { title: 'Color', dataIndex: 'color', key: 'color' },
            { title: 'SKU Suffix', dataIndex: 'sku_suffix', key: 'sku_suffix' },
            { title: 'Barcode', dataIndex: 'barcode', key: 'barcode' },
            { title: 'Retail Price', dataIndex: 'retail_price', key: 'retail_price', render: v => v ? `₨${v}` : '' },
            { title: 'Base Price', dataIndex: 'base_price', key: 'base_price', render: v => v ? `₨${v}` : '' },
            { title: 'Active', dataIndex: 'is_active', key: 'is_active', render: v => v ? 'Yes' : 'No' },
          ]}
          dataSource={selectedVariants.map((v, i) => ({ ...v, key: v.variant_id || i }))}
          pagination={false}
          size="small"
          bordered
          locale={{ emptyText: 'No variants' }}
        />
      </Modal>
    </div>
  );
}

export default ProductsPage; 