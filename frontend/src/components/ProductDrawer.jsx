import React from 'react';
import { Drawer, Form, Row, Col, Input, InputNumber, Select, Divider, Button, Grid, Switch, Table, Space, Modal, message, Tooltip } from 'antd';
import { CloseOutlined, InfoCircleOutlined, TrademarkCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { theme } from '../theme';

const { useBreakpoint } = Grid;

// Help texts for each field
const help = {
  product_code: 'A unique code for this product. Use numbers or letters. Example: SHOE123',
  product_name: 'The name of the product. Example: Running Shoes',
  description: 'Write some details about the product. Example: Color, material, or features.',
  category_id: 'Choose the group for this product. Example: Shoes, Clothes, Electronics.',
  brand_id: 'Select the brand or company name. Example: Nike, Samsung.',
  supplier_id: 'Pick the supplier who gives you this product.',
  base_price: 'The cost you pay to get this product (not for customer).',
  retail_price: 'The price you sell this product to customers.',
  tax_category_id: 'Choose the tax type for this product. Example: Standard, Zero.',
  barcode: 'Barcode for scanning. You can type or scan it.',
  unit_of_measure: 'How you count this product. Example: piece, box, kg.',
  weight: 'Weight of one product. Example: 0.5 (kg).',
  reorder_level: 'When stock is this low, system will warn you to buy more.',
  max_stock_level: 'The most you want to keep in stock.',
  is_active: 'If Yes, product is available for sale. If No, it is hidden.',
  // Variant fields
  size: 'Size of the variant. Example: S, M, L, 42.',
  color: 'Color of the variant. Example: Red, Blue.',
  sku_suffix: 'Extra code to make this variant unique. Example: RED42.',
  v_barcode: 'Barcode for this variant.',
  v_retail_price: 'Sell price for this variant.',
  v_base_price: 'Cost price for this variant.',
  v_is_active: 'If Yes, this variant is available.',
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

function ProductDrawer({
  open,
  onClose,
  onSave,
  initialValues = {},
  categories = [],
  brands = [],
  suppliers = [],
  taxCategories = [],
  isEditing = false,
  saving = false,
  onAddCategory,
  onAddBrand,
  drawerError,
  drawerErrorTip,
}) {
  const [form] = Form.useForm();
  const screens = useBreakpoint();
  const [variants, setVariants] = React.useState(initialValues.variants || []);
  const [variantDrawerOpen, setVariantDrawerOpen] = React.useState(false);
  const [editingVariant, setEditingVariant] = React.useState(null);
  const [variantForm] = Form.useForm();
  
  React.useEffect(() => {
    if (!open) {
      form.resetFields();
      setVariants([]);
    } else {
      // Set initial values properly
      form.setFieldsValue(initialValues);
      setVariants(initialValues.variants || []);
    }
  }, [open, initialValues, form]);

  function handleOk() {
    form.submit();
  }

  // Handle form submission
  const handleFormSubmit = (values) => {
    // Clean up the values before sending
    const cleanedValues = {
      ...values,
      variants,
      // Ensure numeric fields are properly handled
      base_price: values.base_price || null,
      retail_price: values.retail_price || null,
      weight: values.weight || null,
      reorder_level: values.reorder_level || null,
      max_stock_level: values.max_stock_level || null,
    };
    
    onSave(cleanedValues);
  };

  // Variant management
  const openAddVariant = () => {
    setEditingVariant(null);
    variantForm.resetFields();
    setVariantDrawerOpen(true);
  };
  
  const openEditVariant = (record, idx) => {
    setEditingVariant({ ...record, idx });
    variantForm.setFieldsValue(record);
    setVariantDrawerOpen(true);
  };
  
  const handleVariantSave = () => {
    variantForm.validateFields().then(values => {
      if (editingVariant) {
        // Edit: preserve variant_id
        const newVariants = [...variants];
        newVariants[editingVariant.idx] = { ...values, variant_id: editingVariant.variant_id };
        setVariants(newVariants);
        message.success('Variant updated');
      } else {
        // Add
        setVariants([...variants, values]);
        message.success('Variant added');
      }
      setVariantDrawerOpen(false);
      setEditingVariant(null);
      variantForm.resetFields();
    });
  };
  
  const handleVariantDelete = idx => {
    Modal.confirm({
      title: 'Delete Variant?',
      content: 'Are you sure you want to delete this variant?',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => {
        setVariants(variants.filter((_, i) => i !== idx));
        message.success('Variant deleted');
      },
    });
  };

  const variantColumns = [
    { title: 'Size', dataIndex: 'size', key: 'size' },
    { title: 'Color', dataIndex: 'color', key: 'color' },
    { title: 'SKU Suffix', dataIndex: 'sku_suffix', key: 'sku_suffix' },
    { title: 'Barcode', dataIndex: 'barcode', key: 'barcode' },
    { title: 'Retail Price', dataIndex: 'retail_price', key: 'retail_price', render: v => v ? `₨${v}` : '' },
    { title: 'Base Price', dataIndex: 'base_price', key: 'base_price', render: v => v ? `₨${v}` : '' },
    { title: 'Active', dataIndex: 'is_active', key: 'is_active', render: v => v ? 'Yes' : 'No' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record, idx) => (
        <Space>
          <Button size="small" onClick={() => openEditVariant(record, idx)}>Edit</Button>
          <Button size="small" danger onClick={() => handleVariantDelete(idx)}>Delete</Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Drawer
        title={isEditing ? 'Edit Product' : 'Add Product'}
        placement="right"
        width={screens.xs ? '100%' : 600}
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
          <div style={{ textAlign: 'right', padding: 16, background: 'transparent', position: 'relative' }}>
            {drawerError && (
              <div style={{ position: 'absolute', left: 0, top: 0, display: 'flex', alignItems: 'center', color: '#d4380d', fontWeight: 500, fontSize: 15 }}>
                <Tooltip title={<span style={{ fontSize: 14 }}>{drawerErrorTip || ''}</span>} color="#fff" overlayInnerStyle={{ color: '#222', fontWeight: 400, borderRadius: 8, padding: 8 }}>
                  <ExclamationCircleOutlined style={{ fontSize: 22, marginRight: 8, color: '#d4380d', cursor: 'pointer' }} />
                </Tooltip>
                <span>{drawerError}</span>
              </div>
            )}
            <Button onClick={onClose} style={{ marginRight: 12 }}>Cancel</Button>
            <Button type="primary" onClick={handleOk} loading={saving} style={{ fontWeight: theme.fontWeightBold, fontSize: 16 }}>
              {isEditing ? 'Save' : 'Add'}
            </Button>
          </div>
        }
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={initialValues}
          onFinish={handleFormSubmit}
          preserve={false}
        >
          <Divider orientation="left" style={{ fontWeight: theme.fontWeightBold, color: theme.text, fontSize: 18 }}>General Info</Divider>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item 
                name="product_code" 
                label={labelWithHelp('Product Code', 'product_code')} 
                rules={[{ required: true, message: 'Product code is required' }]}
              > 
                <Input placeholder="Enter product code" /> 
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item 
                name="product_name" 
                label={labelWithHelp('Product Name', 'product_name')} 
                rules={[{ required: true, message: 'Product name is required' }]}
              > 
                <Input placeholder="Enter product name" /> 
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={24}>
              <Form.Item name="description" label={labelWithHelp('Description', 'description')}> 
                <Input.TextArea autoSize={{ minRows: 2, maxRows: 4 }} placeholder="Enter product description" /> 
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item 
                name="category_id" 
                label={labelWithHelp('Category', 'category_id')} 
                rules={[{ required: true, message: 'Category is required' }]}
              > 
                <Select 
                  placeholder="Select category"
                  options={categories.map(c => ({ value: c.category_id, label: c.category_name }))}
                  dropdownRender={menu => (
                    <>
                      {menu}
                      <div style={{ display: 'flex', alignItems: 'center', padding: 8 }}>
                        <Button type="link" icon={<InfoCircleOutlined />} onClick={onAddCategory} style={{ padding: 0, height: 24 }}>
                          Add Category
                        </Button>
                      </div>
                    </>
                  )}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item 
                name="brand_id" 
                label={labelWithHelp('Brand', 'brand_id')} 
                rules={[{ required: true, message: 'Brand is required' }]}
              > 
                <Select 
                  placeholder="Select brand"
                  options={brands.map(b => ({ value: b.brand_id, label: b.brand_name }))}
                  dropdownRender={menu => (
                    <>
                      {menu}
                      <div style={{ display: 'flex', alignItems: 'center', padding: 8 }}>
                        <Button type="link" icon={<TrademarkCircleOutlined />} onClick={onAddBrand} style={{ padding: 0, height: 24 }}>
                          Add Brand
                        </Button>
                      </div>
                    </>
                  )}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="supplier_id" label={labelWithHelp('Supplier', 'supplier_id')}> 
                <Select 
                  placeholder="Select supplier"
                  options={suppliers.map(s => ({ value: s.supplier_id, label: s.supplier_name }))} 
                  allowClear 
                /> 
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="tax_category_id" label={labelWithHelp('Tax Category', 'tax_category_id')}> 
                <Select 
                  placeholder="Select tax category"
                  options={taxCategories.map(t => ({ value: t.tax_category_id, label: t.tax_category_name }))} 
                  allowClear 
                /> 
              </Form.Item>
            </Col>
          </Row>
          <Divider orientation="left" style={{ fontWeight: theme.fontWeightBold, color: theme.text, fontSize: 18 }}>Pricing & Inventory</Divider>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item 
                name="base_price" 
                label={labelWithHelp('Base Price (PKR)', 'base_price')} 
                rules={[{ required: true, message: 'Base price is required' }]}
              >
                <InputNumber 
                  min={0} 
                  step={0.01} 
                  style={{ width: '100%' }} 
                  placeholder="0.00"
                  precision={2}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item 
                name="retail_price" 
                label={labelWithHelp('Retail Price (PKR)', 'retail_price')} 
                rules={[{ required: true, message: 'Retail price is required' }]}
              >
                <InputNumber 
                  min={0} 
                  step={0.01} 
                  style={{ width: '100%' }} 
                  placeholder="0.00"
                  precision={2}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="unit_of_measure" label={labelWithHelp('Unit of Measure', 'unit_of_measure')}> 
                <Input placeholder="e.g., piece, box, kg" /> 
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="weight" label={labelWithHelp('Weight (kg)', 'weight')}>
                <InputNumber 
                  min={0} 
                  step={0.01} 
                  style={{ width: '100%' }} 
                  placeholder="0.00"
                  precision={2}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="barcode" label={labelWithHelp('Barcode', 'barcode')}> 
                <Input placeholder="Enter barcode" /> 
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="reorder_level" label={labelWithHelp('Reorder Level', 'reorder_level')}>
                <InputNumber 
                  min={0} 
                  style={{ width: '100%' }} 
                  placeholder="0"
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="max_stock_level" label={labelWithHelp('Max Stock Level', 'max_stock_level')}>
                <InputNumber 
                  min={0} 
                  style={{ width: '100%' }} 
                  placeholder="0"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} style={{ display: 'flex', alignItems: 'center' }}>
              <Form.Item name="is_active" label={labelWithHelp('Active', 'is_active')} valuePropName="checked" style={{ marginBottom: 0 }}>
                <Switch checkedChildren="Yes" unCheckedChildren="No" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
        <Divider orientation="left" style={{ fontWeight: theme.fontWeightBold, color: theme.text, fontSize: 18 }}>Variants <span style={{ fontWeight: 400, fontSize: 14, color: '#888' }}>(optional)</span></Divider>
        <div style={{ marginBottom: 16 }}>
          <Button type="dashed" onClick={openAddVariant} style={{ marginBottom: 8 }}>Add Variant</Button>
          <Table
            columns={variantColumns}
            dataSource={variants.map((v, i) => ({ ...v, key: i }))}
            pagination={false}
            size="small"
            bordered
            locale={{ emptyText: 'No variants added' }}
          />
        </div>
      </Drawer>
      
      {/* Variant Drawer */}
      <Drawer
        title={editingVariant ? 'Edit Variant' : 'Add Variant'}
        placement="right"
        width={screens.xs ? '100%' : 400}
        open={variantDrawerOpen}
        onClose={() => { setVariantDrawerOpen(false); setEditingVariant(null); }}
        destroyOnClose
        bodyStyle={{ padding: 24 }}
        footer={
          <div style={{ textAlign: 'right' }}>
            <Button onClick={() => { setVariantDrawerOpen(false); setEditingVariant(null); }} style={{ marginRight: 12 }}>Cancel</Button>
            <Button type="primary" onClick={handleVariantSave}>{editingVariant ? 'Save' : 'Add'}</Button>
          </div>
        }
      >
        <Form form={variantForm} layout="vertical" initialValues={{ is_active: true }}>
          <Form.Item name="size" label={labelWithHelp('Size', 'size')}> 
            <Input placeholder="e.g., S, M, L, 42" /> 
          </Form.Item>
          <Form.Item name="color" label={labelWithHelp('Color', 'color')}> 
            <Input placeholder="e.g., Red, Blue" /> 
          </Form.Item>
          <Form.Item name="sku_suffix" label={labelWithHelp('SKU Suffix', 'sku_suffix')}> 
            <Input placeholder="e.g., RED42" /> 
          </Form.Item>
          <Form.Item name="barcode" label={labelWithHelp('Barcode', 'v_barcode')}> 
            <Input placeholder="Enter barcode" /> 
          </Form.Item>
          <Form.Item name="retail_price" label={labelWithHelp('Retail Price (PKR)', 'v_retail_price')}> 
            <InputNumber 
              min={0} 
              step={0.01} 
              style={{ width: '100%' }} 
              placeholder="0.00"
              precision={2}
            /> 
          </Form.Item>
          <Form.Item name="base_price" label={labelWithHelp('Base Price (PKR)', 'v_base_price')}> 
            <InputNumber 
              min={0} 
              step={0.01} 
              style={{ width: '100%' }} 
              placeholder="0.00"
              precision={2}
            /> 
          </Form.Item>
          <Form.Item name="is_active" label={labelWithHelp('Active', 'v_is_active')} valuePropName="checked" style={{ marginBottom: 0 }}>
            <Switch checkedChildren="Yes" unCheckedChildren="No" />
          </Form.Item>
        </Form>
      </Drawer>
    </>
  );
}

export default ProductDrawer;