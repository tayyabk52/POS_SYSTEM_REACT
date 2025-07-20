import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Select, Space, Typography, Tooltip, Row, Col, Modal, message, Spin, Tag } from 'antd';
const { Text } = Typography;
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ReloadOutlined, FolderAddOutlined, TrademarkCircleOutlined, BarsOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { theme } from '../theme';
import { Card, SearchBar, StatusTag, ProductDrawer } from '../components';
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
  const [drawerError, setDrawerError] = useState(null);
  const [drawerErrorTip, setDrawerErrorTip] = useState(null);

  // Fetch all dropdowns and products on mount
  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      setError(null);
      try {
        const [prodRes, catRes, brandRes, suppRes, taxRes] = await Promise.all([
          axios.get(`${API_BASE}/products/`),
          axios.get(`${API_BASE}/dropdown/categories`),
          axios.get(`${API_BASE}/dropdown/brands`),
          axios.get(`${API_BASE}/dropdown/suppliers`),
          axios.get(`${API_BASE}/settings/tax-categories`),
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

  // Table columns with enhanced styling
  const columns = [
    { 
      title: 'Code', 
      dataIndex: 'product_code', 
      key: 'product_code', 
      width: 100, 
      fixed: 'left',
      render: text => <Text strong>{text}</Text>
    },
    { 
      title: 'Name', 
      dataIndex: 'product_name', 
      key: 'product_name', 
      width: 180, 
      render: text => <Text strong>{text}</Text> 
    },
    { 
      title: 'Category', 
      dataIndex: 'category_id', 
      key: 'category_id', 
      width: 120, 
      render: id => <Text>{categories.find(c => c.category_id === id)?.category_name || '-'}</Text> 
    },
    { 
      title: 'Brand', 
      dataIndex: 'brand_id', 
      key: 'brand_id', 
      width: 120, 
      render: id => <Text>{brands.find(b => b.brand_id === id)?.brand_name || '-'}</Text> 
    },
    { 
      title: 'Supplier', 
      dataIndex: 'supplier_id', 
      key: 'supplier_id', 
      width: 140, 
      render: id => <Text type="secondary">{suppliers.find(s => s.supplier_id === id)?.supplier_name || '-'}</Text> 
    },
    { 
      title: 'Retail Price', 
      dataIndex: 'retail_price', 
      key: 'retail_price', 
      width: 120, 
      align: 'right', 
      render: v => <Text strong>₨ {Number(v).toFixed(2)}</Text> 
    },
    { 
      title: 'Tax', 
      dataIndex: 'tax_category_id', 
      key: 'tax_category_id', 
      width: 100, 
      render: id => <Text>{taxCategories.find(t => t.tax_category_id === id)?.tax_category_name || '-'}</Text> 
    },
    { 
      title: 'Tax Amount', 
      dataIndex: 'tax_category_id', 
      key: 'tax_amount', 
      width: 120, 
      align: 'right',
      render: (id, record) => {
        const taxCategory = taxCategories.find(t => t.tax_category_id === id);
        if (!taxCategory || !record.retail_price) return <Text type="secondary">-</Text>;
        const taxAmount = (record.retail_price * taxCategory.tax_rate) / 100;
        return (
          <Tag color="orange" style={{ margin: 0 }}>
            ₨ {taxAmount.toFixed(2)}
          </Tag>
        );
      }
    },
    { 
      title: 'Barcode', 
      dataIndex: 'barcode', 
      key: 'barcode', 
      width: 140,
      render: text => <Text type="secondary">{text}</Text>
    },
    { 
      title: 'Unit', 
      dataIndex: 'unit_of_measure', 
      key: 'unit_of_measure', 
      width: 90,
      render: text => <Text>{text}</Text>
    },
    { 
      title: 'Weight', 
      dataIndex: 'weight', 
      key: 'weight', 
      width: 90, 
      render: w => w ? <Text>{`${w} kg`}</Text> : <Text type="secondary">-</Text> 
    },
    { 
      title: 'Active', 
      dataIndex: 'is_active', 
      key: 'is_active', 
      width: 90, 
      render: v => v ? <StatusTag status="active" /> : <StatusTag status="inactive" /> 
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Edit">
            <Button 
              type="text"
              icon={<EditOutlined />} 
              onClick={() => onEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button 
              type="text"
              icon={<DeleteOutlined />} 
              danger
              onClick={() => onDelete(record)}
            />
          </Tooltip>
          <Tooltip title="View Variants">
            <Button
              type="text"
              icon={<BarsOutlined />}
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
    setDrawerError(null);
    setDrawerErrorTip(null);
    try {
      if (editingProduct) {
        const res = await axios.put(`${API_BASE}/products/${editingProduct.product_id}`, values);
        setProducts(products.map(p => p.product_id === editingProduct.product_id ? res.data : p));
        message.success('Product updated');
      } else {
        const res = await axios.post(`${API_BASE}/products/`, values);
        setProducts([...products, res.data]);
        message.success('Product added');
      }
      setDrawerOpen(false);
    } catch (err) {
      let userMsg = 'کچھ غلط ہوگیا، براہ کرم دوبارہ کوشش کریں';
      let tip = 'براہ کرم یقینی بنائیں کہ آپ نے تمام معلومات درست طریقے سے بھری ہیں۔ اگر بارکوڈ یا کوڈ پہلے سے موجود ہے تو اسے تبدیل کریں۔';
      if (err.response && err.response.data && err.response.data.detail) {
        if (err.response.data.detail.includes('Barcode')) {
          userMsg = 'یہ بارکوڈ پہلے سے کسی اور ویریئنٹ میں موجود ہے۔';
          tip = 'ہر ویریئنٹ کے لیے بارکوڈ منفرد ہونا چاہیے۔ براہ کرم نیا بارکوڈ ڈالیں یا پہلے والے کو چیک کریں۔';
        } else if (err.response.data.detail.includes('already exists')) {
          userMsg = 'یہ معلومات پہلے سے موجود ہے۔';
          tip = 'آپ جو معلومات ڈال رہے ہیں وہ پہلے سے سسٹم میں ہے۔ براہ کرم مختلف معلومات ڈالیں۔';
        }
      }
      setDrawerError(userMsg);
      setDrawerErrorTip(tip);
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
      const res = await axios.post(`${API_BASE}/dropdown/categories`, { category_name: newCategoryName });
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
      const res = await axios.post(`${API_BASE}/dropdown/brands`, { brand_name: newBrandName });
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
      axios.get(`${API_BASE}/dropdown/categories`),
      axios.get(`${API_BASE}/dropdown/brands`),
      axios.get(`${API_BASE}/dropdown/suppliers`),
      axios.get(`${API_BASE}/settings/tax-categories`),
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
        {/* Header Card with Search and Filters */}
        <Card 
          title="Products"
          style={{ marginBottom: 32 }}
          size="large"
          actions={
            <Space>
              <SearchBar
                value={search}
                onChange={setSearch}
                placeholder="Search by name or code"
                width={220}
                filters={[
                  {
                    placeholder: "Category",
                    value: categoryFilter,
                    onChange: setCategoryFilter,
                    options: categories.map(c => ({ value: c.category_id, label: c.category_name })),
                    width: 140,
                    dropdownRender: menu => (
                      <>
                        {menu}
                        <div style={{ display: 'flex', alignItems: 'center', padding: 8 }}>
                          <Button type="link" icon={<FolderAddOutlined />} onClick={() => setCategoryModalOpen(true)} style={{ padding: 0, height: 24 }}>
                            Add Category
                          </Button>
                        </div>
                      </>
                    )
                  },
                  {
                    placeholder: "Brand",
                    value: brandFilter,
                    onChange: setBrandFilter,
                    options: brands.map(b => ({ value: b.brand_id, label: b.brand_name })),
                    width: 140,
                    dropdownRender: menu => (
                      <>
                        {menu}
                        <div style={{ display: 'flex', alignItems: 'center', padding: 8 }}>
                          <Button type="link" icon={<TrademarkCircleOutlined />} onClick={() => setBrandModalOpen(true)} style={{ padding: 0, height: 24 }}>
                            Add Brand
                          </Button>
                        </div>
                      </>
                    )
                  }
                ]}
              />
              <Button type="primary" icon={<PlusOutlined />} onClick={onAdd} style={{ fontWeight: theme.fontWeightBold, fontSize: 16 }}>Add Product</Button>
              <Tooltip title="Reload">
                <Button icon={<ReloadOutlined />} onClick={reloadAll} />
              </Tooltip>
            </Space>
          }
        />
        
        {/* Main Table Card */}
        <Card noPadding>
          {error && <div style={{ color: 'red', padding: 16 }}>{error}</div>}
          {loading ? (
            <Spin style={{ display: 'block', margin: '48px auto' }} size="large" />
          ) : (
            <Table
              columns={columns.map(col => {
                // Replace the Tag with StatusTag for the is_active column
                if (col.key === 'is_active') {
                  return {
                    ...col,
                    render: v => v ? <StatusTag status="active" /> : <StatusTag status="inactive" />
                  };
                }
                return col;
              })}
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
                        <Text strong>Description:</Text>
                        <div style={{ color: '#555', marginBottom: 8 }}>{record.description || <Text type="secondary">No description</Text>}</div>
                        <Text strong>Base Price:</Text> <Text>₨ {Number(record.base_price).toFixed(2)}</Text><br/>
                        <Text strong>Retail Price:</Text> <Text>₨ {Number(record.retail_price).toFixed(2)}</Text>
                      </Col>
                      <Col xs={24} sm={12} md={8}>
                        <Text strong>Reorder Level:</Text> <Text>{record.reorder_level ?? <Text type="secondary">-</Text>}</Text><br/>
                        <Text strong>Max Stock Level:</Text> <Text>{record.max_stock_level ?? <Text type="secondary">-</Text>}</Text><br/>
                        <Text strong>Unit of Measure:</Text> <Text>{record.unit_of_measure || <Text type="secondary">-</Text>}</Text><br/>
                        <Text strong>Weight:</Text> <Text>{record.weight ? `${record.weight} kg` : <Text type="secondary">-</Text>}</Text>
                      </Col>
                      <Col xs={24} sm={12} md={8}>
                        <Text strong>Created At:</Text> <Text>{record.created_at ? new Date(record.created_at).toLocaleString() : <Text type="secondary">-</Text>}</Text><br/>
                        <Text strong>Updated At:</Text> <Text>{record.updated_at ? new Date(record.updated_at).toLocaleString() : <Text type="secondary">-</Text>}</Text><br/>
                        <Text strong>Variants:</Text> <Text>{record.variants && record.variants.length > 0 ? `${record.variants.length} variant(s)` : <Text type="secondary">No variants</Text>}</Text>
                      </Col>
                    </Row>
                  </div>
                ),
                rowExpandable: record => true,
              }}
            />
          )}
        </Card>
        
        {/* Modals */}
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
              { title: 'Retail Price', dataIndex: 'retail_price', key: 'retail_price', align: 'right', render: v => v ? `₨${Number(v).toFixed(2)}` : '' },
              { title: 'Base Price', dataIndex: 'base_price', key: 'base_price', align: 'right', render: v => v ? `₨${Number(v).toFixed(2)}` : '' },
              { title: 'Active', dataIndex: 'is_active', key: 'is_active', render: v => v ? <StatusTag status="active" /> : <StatusTag status="inactive" /> },
            ]}
            dataSource={selectedVariants.map((v, i) => ({ ...v, key: v.variant_id || i }))}
            pagination={false}
            size="small"
            bordered
            locale={{ emptyText: 'No variants' }}
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
          drawerError={drawerError}
          drawerErrorTip={drawerErrorTip}
        />
      </div>
    );

  return renderContent();
}

export default ProductsPage;