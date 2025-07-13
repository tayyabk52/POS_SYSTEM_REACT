import React, { useState, useEffect } from 'react';
import { 
  Table, Button, Modal, Input, Select, Space, Typography, Row, Col, 
  Tooltip, Switch, message, Form, Divider, Badge, Spin, Tag, Tabs,
  Card, InputNumber, DatePicker, Upload, Drawer, Alert, Statistic,
  Popconfirm, Avatar, Dropdown, Menu, Progress
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined,
  SettingOutlined, UserOutlined, ShopOutlined, TagsOutlined,
  CreditCardOutlined, FileTextOutlined, AuditOutlined,
  SaveOutlined, CloseOutlined, EyeOutlined, LockOutlined,
  GlobalOutlined, DollarOutlined, ShoppingOutlined, TeamOutlined,
  DatabaseOutlined, SecurityScanOutlined, BarChartOutlined
} from '@ant-design/icons';
import { PrimaryButton, SecondaryButton, DangerButton, IconButton, TextButton } from '../components/Button';
import CardComponent from '../components/Card';
import { theme } from '../theme';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

function SettingsPage() {
  const [activeTab, setActiveTab] = useState('stores');
  const [loading, setLoading] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [drawerType, setDrawerType] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();

  // Mock data - in real app, this would come from API
  const [stores, setStores] = useState([
    { store_id: 1, store_name: 'Main Store', address: '123 Main St', phone_number: '+1234567890', email: 'main@store.com', city: 'New York', province: 'NY', postal_code: '10001', is_active: true },
    { store_id: 2, store_name: 'Downtown Branch', address: '456 Downtown Ave', phone_number: '+1234567891', email: 'downtown@store.com', city: 'Los Angeles', province: 'CA', postal_code: '90210', is_active: true }
  ]);

  const [users, setUsers] = useState([
    { user_id: 1, username: 'admin', first_name: 'Admin', last_name: 'User', email: 'admin@store.com', role_id: 1, store_id: 1, is_active: true },
    { user_id: 2, username: 'manager', first_name: 'Store', last_name: 'Manager', email: 'manager@store.com', role_id: 2, store_id: 1, is_active: true }
  ]);

  const [categories, setCategories] = useState([
    { category_id: 1, category_name: 'Electronics', parent_category_id: null },
    { category_id: 2, category_name: 'Clothing', parent_category_id: null },
    { category_id: 3, category_name: 'Smartphones', parent_category_id: 1 }
  ]);

  const [brands, setBrands] = useState([
    { brand_id: 1, brand_name: 'Apple' },
    { brand_id: 2, brand_name: 'Samsung' },
    { brand_id: 3, brand_name: 'Nike' }
  ]);

  const [suppliers, setSuppliers] = useState([
    { supplier_id: 1, supplier_name: 'Tech Supplies Inc', contact_person: 'John Doe', phone_number: '+1234567890', email: 'john@techsupplies.com', address: '789 Supply St', ntn: '123456789', gst_number: 'GST123456', is_active: true }
  ]);

  const [taxCategories, setTaxCategories] = useState([
    { tax_category_id: 1, tax_category_name: 'Standard Sales Tax', tax_rate: 18.00, effective_date: '2024-01-01', is_active: true },
    { tax_category_id: 2, tax_category_name: 'Reduced Rate', tax_rate: 5.00, effective_date: '2024-01-01', is_active: true }
  ]);

  const [paymentMethods, setPaymentMethods] = useState([
    { payment_method_id: 1, method_name: 'Cash', is_active: true },
    { payment_method_id: 2, method_name: 'Credit Card', is_active: true },
    { payment_method_id: 3, method_name: 'Debit Card', is_active: true }
  ]);

  const [expenseCategories, setExpenseCategories] = useState([
    { category_id: 1, category_name: 'Rent' },
    { category_id: 2, category_name: 'Utilities' },
    { category_id: 3, category_name: 'Salaries' }
  ]);

  const [roles, setRoles] = useState([
    { role_id: 1, role_name: 'Administrator', description: 'Full system access' },
    { role_id: 2, role_name: 'Manager', description: 'Store management and reporting' },
    { role_id: 3, role_name: 'Cashier', description: 'Sales transactions and basic operations' }
  ]);

  const [auditLogs, setAuditLogs] = useState([
    { log_id: 1, user_id: 1, event_type: 'USER_LOGIN', event_details: 'User logged in', timestamp: '2024-01-15 10:30:00', ip_address: '192.168.1.100' },
    { log_id: 2, user_id: 1, event_type: 'SETTING_CHANGED', event_details: 'Store settings updated', timestamp: '2024-01-15 09:15:00', ip_address: '192.168.1.100' }
  ]);

  // Store table columns
  const storeColumns = [
    { title: 'Store Name', dataIndex: 'store_name', key: 'store_name', sorter: true },
    { title: 'Address', dataIndex: 'address', key: 'address', ellipsis: true },
    { title: 'Phone', dataIndex: 'phone_number', key: 'phone_number' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'City', dataIndex: 'city', key: 'city' },
    { 
      title: 'Status', 
      dataIndex: 'is_active', 
      key: 'is_active',
      render: (isActive) => (
        <Badge status={isActive ? 'success' : 'error'} text={isActive ? 'Active' : 'Inactive'} />
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <IconButton icon={<EditOutlined />} tooltip="Edit Store" onClick={() => openDrawer('store', record)} />
          <IconButton icon={<EyeOutlined />} tooltip="View Details" onClick={() => openDrawer('store', record, true)} />
          <Popconfirm title="Are you sure you want to delete this store?" onConfirm={() => deleteItem('store', record.store_id)}>
            <IconButton icon={<DeleteOutlined />} tooltip="Delete Store" danger />
          </Popconfirm>
        </Space>
      )
    }
  ];

  // User table columns
  const userColumns = [
    { title: 'Username', dataIndex: 'username', key: 'username' },
    { title: 'Name', key: 'name', render: (_, record) => `${record.first_name} ${record.last_name}` },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Role', dataIndex: 'role_id', key: 'role_id', render: (roleId) => roles.find(r => r.role_id === roleId)?.role_name },
    { title: 'Store', dataIndex: 'store_id', key: 'store_id', render: (storeId) => stores.find(s => s.store_id === storeId)?.store_name },
    { 
      title: 'Status', 
      dataIndex: 'is_active', 
      key: 'is_active',
      render: (isActive) => (
        <Badge status={isActive ? 'success' : 'error'} text={isActive ? 'Active' : 'Inactive'} />
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <IconButton icon={<EditOutlined />} tooltip="Edit User" onClick={() => openDrawer('user', record)} />
          <IconButton icon={<LockOutlined />} tooltip="Change Password" onClick={() => openDrawer('password', record)} />
          <Popconfirm title="Are you sure you want to delete this user?" onConfirm={() => deleteItem('user', record.user_id)}>
            <IconButton icon={<DeleteOutlined />} tooltip="Delete User" danger />
          </Popconfirm>
        </Space>
      )
    }
  ];

  // Category table columns
  const categoryColumns = [
    { title: 'Category Name', dataIndex: 'category_name', key: 'category_name' },
    { title: 'Parent Category', dataIndex: 'parent_category_id', key: 'parent_category_id', 
      render: (parentId) => parentId ? categories.find(c => c.category_id === parentId)?.category_name : 'None' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <IconButton icon={<EditOutlined />} tooltip="Edit Category" onClick={() => openDrawer('category', record)} />
          <Popconfirm title="Are you sure you want to delete this category?" onConfirm={() => deleteItem('category', record.category_id)}>
            <IconButton icon={<DeleteOutlined />} tooltip="Delete Category" danger />
          </Popconfirm>
        </Space>
      )
    }
  ];

  // Brand table columns
  const brandColumns = [
    { title: 'Brand Name', dataIndex: 'brand_name', key: 'brand_name' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <IconButton icon={<EditOutlined />} tooltip="Edit Brand" onClick={() => openDrawer('brand', record)} />
          <Popconfirm title="Are you sure you want to delete this brand?" onConfirm={() => deleteItem('brand', record.brand_id)}>
            <IconButton icon={<DeleteOutlined />} tooltip="Delete Brand" danger />
          </Popconfirm>
        </Space>
      )
    }
  ];

  // Supplier table columns
  const supplierColumns = [
    { title: 'Supplier Name', dataIndex: 'supplier_name', key: 'supplier_name' },
    { title: 'Contact Person', dataIndex: 'contact_person', key: 'contact_person' },
    { title: 'Phone', dataIndex: 'phone_number', key: 'phone_number' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'NTN', dataIndex: 'ntn', key: 'ntn' },
    { 
      title: 'Status', 
      dataIndex: 'is_active', 
      key: 'is_active',
      render: (isActive) => (
        <Badge status={isActive ? 'success' : 'error'} text={isActive ? 'Active' : 'Inactive'} />
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <IconButton icon={<EditOutlined />} tooltip="Edit Supplier" onClick={() => openDrawer('supplier', record)} />
          <IconButton icon={<EyeOutlined />} tooltip="View Details" onClick={() => openDrawer('supplier', record, true)} />
          <Popconfirm title="Are you sure you want to delete this supplier?" onConfirm={() => deleteItem('supplier', record.supplier_id)}>
            <IconButton icon={<DeleteOutlined />} tooltip="Delete Supplier" danger />
          </Popconfirm>
        </Space>
      )
    }
  ];

  // Tax category table columns
  const taxCategoryColumns = [
    { title: 'Category Name', dataIndex: 'tax_category_name', key: 'tax_category_name' },
    { title: 'Tax Rate (%)', dataIndex: 'tax_rate', key: 'tax_rate', render: (rate) => `${rate}%` },
    { title: 'Effective Date', dataIndex: 'effective_date', key: 'effective_date' },
    { 
      title: 'Status', 
      dataIndex: 'is_active', 
      key: 'is_active',
      render: (isActive) => (
        <Badge status={isActive ? 'success' : 'error'} text={isActive ? 'Active' : 'Inactive'} />
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <IconButton icon={<EditOutlined />} tooltip="Edit Tax Category" onClick={() => openDrawer('taxCategory', record)} />
          <Popconfirm title="Are you sure you want to delete this tax category?" onConfirm={() => deleteItem('taxCategory', record.tax_category_id)}>
            <IconButton icon={<DeleteOutlined />} tooltip="Delete Tax Category" danger />
          </Popconfirm>
        </Space>
      )
    }
  ];

  // Payment method table columns
  const paymentMethodColumns = [
    { title: 'Method Name', dataIndex: 'method_name', key: 'method_name' },
    { 
      title: 'Status', 
      dataIndex: 'is_active', 
      key: 'is_active',
      render: (isActive) => (
        <Badge status={isActive ? 'success' : 'error'} text={isActive ? 'Active' : 'Inactive'} />
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <IconButton icon={<EditOutlined />} tooltip="Edit Payment Method" onClick={() => openDrawer('paymentMethod', record)} />
          <Popconfirm title="Are you sure you want to delete this payment method?" onConfirm={() => deleteItem('paymentMethod', record.payment_method_id)}>
            <IconButton icon={<DeleteOutlined />} tooltip="Delete Payment Method" danger />
          </Popconfirm>
        </Space>
      )
    }
  ];

  // Expense category table columns
  const expenseCategoryColumns = [
    { title: 'Category Name', dataIndex: 'category_name', key: 'category_name' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <IconButton icon={<EditOutlined />} tooltip="Edit Expense Category" onClick={() => openDrawer('expenseCategory', record)} />
          <Popconfirm title="Are you sure you want to delete this expense category?" onConfirm={() => deleteItem('expenseCategory', record.category_id)}>
            <IconButton icon={<DeleteOutlined />} tooltip="Delete Expense Category" danger />
          </Popconfirm>
        </Space>
      )
    }
  ];

  // Role table columns
  const roleColumns = [
    { title: 'Role Name', dataIndex: 'role_name', key: 'role_name' },
    { title: 'Description', dataIndex: 'description', key: 'description', ellipsis: true },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <IconButton icon={<EditOutlined />} tooltip="Edit Role" onClick={() => openDrawer('role', record)} />
          <IconButton icon={<SecurityScanOutlined />} tooltip="Manage Permissions" onClick={() => openDrawer('permissions', record)} />
          <Popconfirm title="Are you sure you want to delete this role?" onConfirm={() => deleteItem('role', record.role_id)}>
            <IconButton icon={<DeleteOutlined />} tooltip="Delete Role" danger />
          </Popconfirm>
        </Space>
      )
    }
  ];

  // Audit log table columns
  const auditLogColumns = [
    { title: 'Timestamp', dataIndex: 'timestamp', key: 'timestamp', sorter: true },
    { title: 'User', dataIndex: 'user_id', key: 'user_id', render: (userId) => users.find(u => u.user_id === userId)?.username },
    { title: 'Event Type', dataIndex: 'event_type', key: 'event_type' },
    { title: 'Event Details', dataIndex: 'event_details', key: 'event_details', ellipsis: true },
    { title: 'IP Address', dataIndex: 'ip_address', key: 'ip_address' }
  ];

  const openDrawer = (type, item = null, viewOnly = false) => {
    setDrawerType(type);
    setEditingItem(item);
    setDrawerVisible(true);
    if (item && !viewOnly) {
      form.setFieldsValue(item);
    }
  };

  const closeDrawer = () => {
    setDrawerVisible(false);
    setEditingItem(null);
    setDrawerType('');
    form.resetFields();
  };

  const deleteItem = (type, id) => {
    message.success(`${type} deleted successfully`);
    // In real app, call API to delete
  };

  const handleSave = async (values) => {
    setLoading(true);
    try {
      // In real app, call API to save
      message.success(`${drawerType} saved successfully`);
      closeDrawer();
    } catch (error) {
      message.error('Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const renderDrawerContent = () => {
    switch (drawerType) {
      case 'store':
        return (
          <Form form={form} layout="vertical" onFinish={handleSave}>
            <Form.Item name="store_name" label="Store Name" rules={[{ required: true }]}>
              <Input placeholder="Enter store name" />
            </Form.Item>
            <Form.Item name="address" label="Address" rules={[{ required: true }]}>
              <Input.TextArea placeholder="Enter address" rows={3} />
            </Form.Item>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="phone_number" label="Phone Number">
                  <Input placeholder="Enter phone number" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="email" label="Email" rules={[{ type: 'email' }]}>
                  <Input placeholder="Enter email" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="city" label="City">
                  <Input placeholder="Enter city" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="province" label="Province">
                  <Input placeholder="Enter province" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="postal_code" label="Postal Code">
                  <Input placeholder="Enter postal code" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="is_active" label="Status" valuePropName="checked">
              <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
            </Form.Item>
          </Form>
        );

      case 'user':
        return (
          <Form form={form} layout="vertical" onFinish={handleSave}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="first_name" label="First Name" rules={[{ required: true }]}>
                  <Input placeholder="Enter first name" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="last_name" label="Last Name" rules={[{ required: true }]}>
                  <Input placeholder="Enter last name" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="username" label="Username" rules={[{ required: true }]}>
              <Input placeholder="Enter username" />
            </Form.Item>
            <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
              <Input placeholder="Enter email" />
            </Form.Item>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="role_id" label="Role" rules={[{ required: true }]}>
                  <Select placeholder="Select role">
                    {roles.map(role => (
                      <Option key={role.role_id} value={role.role_id}>{role.role_name}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="store_id" label="Store">
                  <Select placeholder="Select store">
                    {stores.map(store => (
                      <Option key={store.store_id} value={store.store_id}>{store.store_name}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="is_active" label="Status" valuePropName="checked">
              <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
            </Form.Item>
          </Form>
        );

      case 'category':
        return (
          <Form form={form} layout="vertical" onFinish={handleSave}>
            <Form.Item name="category_name" label="Category Name" rules={[{ required: true }]}>
              <Input placeholder="Enter category name" />
            </Form.Item>
            <Form.Item name="parent_category_id" label="Parent Category">
              <Select placeholder="Select parent category" allowClear>
                {categories.map(cat => (
                  <Option key={cat.category_id} value={cat.category_id}>{cat.category_name}</Option>
                ))}
              </Select>
            </Form.Item>
          </Form>
        );

      case 'brand':
        return (
          <Form form={form} layout="vertical" onFinish={handleSave}>
            <Form.Item name="brand_name" label="Brand Name" rules={[{ required: true }]}>
              <Input placeholder="Enter brand name" />
            </Form.Item>
          </Form>
        );

      case 'supplier':
        return (
          <Form form={form} layout="vertical" onFinish={handleSave}>
            <Form.Item name="supplier_name" label="Supplier Name" rules={[{ required: true }]}>
              <Input placeholder="Enter supplier name" />
            </Form.Item>
            <Form.Item name="contact_person" label="Contact Person">
              <Input placeholder="Enter contact person" />
            </Form.Item>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="phone_number" label="Phone Number">
                  <Input placeholder="Enter phone number" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="email" label="Email" rules={[{ type: 'email' }]}>
                  <Input placeholder="Enter email" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="address" label="Address">
              <Input.TextArea placeholder="Enter address" rows={3} />
            </Form.Item>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="ntn" label="NTN">
                  <Input placeholder="Enter NTN" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="gst_number" label="GST Number">
                  <Input placeholder="Enter GST number" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="is_active" label="Status" valuePropName="checked">
              <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
            </Form.Item>
          </Form>
        );

      case 'taxCategory':
        return (
          <Form form={form} layout="vertical" onFinish={handleSave}>
            <Form.Item name="tax_category_name" label="Tax Category Name" rules={[{ required: true }]}>
              <Input placeholder="Enter tax category name" />
            </Form.Item>
            <Form.Item name="tax_rate" label="Tax Rate (%)" rules={[{ required: true }]}>
              <InputNumber min={0} max={100} placeholder="Enter tax rate" style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="effective_date" label="Effective Date" rules={[{ required: true }]}>
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="is_active" label="Status" valuePropName="checked">
              <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
            </Form.Item>
          </Form>
        );

      case 'paymentMethod':
        return (
          <Form form={form} layout="vertical" onFinish={handleSave}>
            <Form.Item name="method_name" label="Method Name" rules={[{ required: true }]}>
              <Input placeholder="Enter payment method name" />
            </Form.Item>
            <Form.Item name="is_active" label="Status" valuePropName="checked">
              <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
            </Form.Item>
          </Form>
        );

      case 'expenseCategory':
        return (
          <Form form={form} layout="vertical" onFinish={handleSave}>
            <Form.Item name="category_name" label="Category Name" rules={[{ required: true }]}>
              <Input placeholder="Enter expense category name" />
            </Form.Item>
          </Form>
        );

      case 'role':
        return (
          <Form form={form} layout="vertical" onFinish={handleSave}>
            <Form.Item name="role_name" label="Role Name" rules={[{ required: true }]}>
              <Input placeholder="Enter role name" />
            </Form.Item>
            <Form.Item name="description" label="Description">
              <Input.TextArea placeholder="Enter role description" rows={3} />
            </Form.Item>
          </Form>
        );

      default:
        return <div>Select a type to edit</div>;
    }
  };

  const getDrawerTitle = () => {
    const titles = {
      store: 'Store Management',
      user: 'User Management',
      category: 'Category Management',
      brand: 'Brand Management',
      supplier: 'Supplier Management',
      taxCategory: 'Tax Category Management',
      paymentMethod: 'Payment Method Management',
      expenseCategory: 'Expense Category Management',
      role: 'Role Management',
      permissions: 'Permission Management',
      password: 'Change Password'
    };
    return titles[drawerType] || 'Settings';
  };

  return (
    <div style={{ padding: 24, background: theme.contentBg, minHeight: '100vh' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, color: theme.text }}>
          <SettingOutlined style={{ marginRight: 12 }} />
          System Settings
        </Title>
        <Text type="secondary">Manage all system configurations and master data</Text>
      </div>

      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        type="card"
        size="large"
        style={{ 
          background: 'white', 
          borderRadius: theme.borderRadius, 
          padding: 24,
          boxShadow: theme.cardShadow 
        }}
      >
        <TabPane 
          tab={
            <span>
              <ShopOutlined />
              Stores & Terminals
            </span>
          } 
          key="stores"
        >
          <CardComponent
            title="Store Management"
            subtitle="Manage store locations and POS terminals"
            actions={
              <PrimaryButton icon={<PlusOutlined />} onClick={() => openDrawer('store')}>
                Add Store
              </PrimaryButton>
            }
          >
            <Table
              columns={storeColumns}
              dataSource={stores}
              rowKey="store_id"
              pagination={{ 
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} stores`
              }}
              style={{ 
                fontSize: theme.fontSizeTable, 
                fontFamily: theme.fontFamily 
              }}
              scroll={{ x: 800 }}
            />
          </CardComponent>
        </TabPane>

        <TabPane 
          tab={
            <span>
              <TeamOutlined />
              Users & Roles
            </span>
          } 
          key="users"
        >
          <Row gutter={[24, 24]}>
            <Col span={16}>
              <CardComponent
                title="User Management"
                subtitle="Manage system users and their roles"
                actions={
                  <PrimaryButton icon={<PlusOutlined />} onClick={() => openDrawer('user')}>
                    Add User
                  </PrimaryButton>
                }
              >
                <Table
                  columns={userColumns}
                  dataSource={users}
                  rowKey="user_id"
                  pagination={{ pageSize: 10 }}
                  style={{ fontSize: theme.fontSizeTable, fontFamily: theme.fontFamily }}
                  scroll={{ x: 800 }}
                />
              </CardComponent>
            </Col>
            <Col span={8}>
              <CardComponent
                title="Role Management"
                subtitle="Manage user roles and permissions"
                actions={
                  <PrimaryButton icon={<PlusOutlined />} onClick={() => openDrawer('role')}>
                    Add Role
                  </PrimaryButton>
                }
              >
                <Table
                  columns={roleColumns}
                  dataSource={roles}
                  rowKey="role_id"
                  pagination={{ pageSize: 5 }}
                  style={{ fontSize: theme.fontSizeTable, fontFamily: theme.fontFamily }}
                />
              </CardComponent>
            </Col>
          </Row>
        </TabPane>

        <TabPane 
          tab={
            <span>
              <TagsOutlined />
              Products & Categories
            </span>
          } 
          key="products"
        >
          <Row gutter={[24, 24]}>
            <Col span={12}>
              <CardComponent
                title="Categories"
                subtitle="Manage product categories"
                actions={
                  <PrimaryButton icon={<PlusOutlined />} onClick={() => openDrawer('category')}>
                    Add Category
                  </PrimaryButton>
                }
              >
                <Table
                  columns={categoryColumns}
                  dataSource={categories}
                  rowKey="category_id"
                  pagination={{ pageSize: 10 }}
                  style={{ fontSize: theme.fontSizeTable, fontFamily: theme.fontFamily }}
                />
              </CardComponent>
            </Col>
            <Col span={12}>
              <CardComponent
                title="Brands"
                subtitle="Manage product brands"
                actions={
                  <PrimaryButton icon={<PlusOutlined />} onClick={() => openDrawer('brand')}>
                    Add Brand
                  </PrimaryButton>
                }
              >
                <Table
                  columns={brandColumns}
                  dataSource={brands}
                  rowKey="brand_id"
                  pagination={{ pageSize: 10 }}
                  style={{ fontSize: theme.fontSizeTable, fontFamily: theme.fontFamily }}
                />
              </CardComponent>
            </Col>
          </Row>
          
          <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
            <Col span={24}>
              <CardComponent
                title="Suppliers"
                subtitle="Manage product suppliers and vendors"
                actions={
                  <PrimaryButton icon={<PlusOutlined />} onClick={() => openDrawer('supplier')}>
                    Add Supplier
                  </PrimaryButton>
                }
              >
                <Table
                  columns={supplierColumns}
                  dataSource={suppliers}
                  rowKey="supplier_id"
                  pagination={{ pageSize: 10 }}
                  style={{ fontSize: theme.fontSizeTable, fontFamily: theme.fontFamily }}
                  scroll={{ x: 1000 }}
                />
              </CardComponent>
            </Col>
          </Row>
        </TabPane>

        <TabPane 
          tab={
            <span>
              <DollarOutlined />
              Financial Settings
            </span>
          } 
          key="financial"
        >
          <Row gutter={[24, 24]}>
            <Col span={12}>
              <CardComponent
                title="Tax Categories"
                subtitle="Manage tax rates and categories"
                actions={
                  <PrimaryButton icon={<PlusOutlined />} onClick={() => openDrawer('taxCategory')}>
                    Add Tax Category
                  </PrimaryButton>
                }
              >
                <Table
                  columns={taxCategoryColumns}
                  dataSource={taxCategories}
                  rowKey="tax_category_id"
                  pagination={{ pageSize: 10 }}
                  style={{ fontSize: theme.fontSizeTable, fontFamily: theme.fontFamily }}
                />
              </CardComponent>
            </Col>
            <Col span={12}>
              <CardComponent
                title="Payment Methods"
                subtitle="Manage payment methods"
                actions={
                  <PrimaryButton icon={<PlusOutlined />} onClick={() => openDrawer('paymentMethod')}>
                    Add Payment Method
                  </PrimaryButton>
                }
              >
                <Table
                  columns={paymentMethodColumns}
                  dataSource={paymentMethods}
                  rowKey="payment_method_id"
                  pagination={{ pageSize: 10 }}
                  style={{ fontSize: theme.fontSizeTable, fontFamily: theme.fontFamily }}
                />
              </CardComponent>
            </Col>
          </Row>
          
          <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
            <Col span={24}>
              <CardComponent
                title="Expense Categories"
                subtitle="Manage expense categories for financial tracking"
                actions={
                  <PrimaryButton icon={<PlusOutlined />} onClick={() => openDrawer('expenseCategory')}>
                    Add Expense Category
                  </PrimaryButton>
                }
              >
                <Table
                  columns={expenseCategoryColumns}
                  dataSource={expenseCategories}
                  rowKey="category_id"
                  pagination={{ pageSize: 10 }}
                  style={{ fontSize: theme.fontSizeTable, fontFamily: theme.fontFamily }}
                />
              </CardComponent>
            </Col>
          </Row>
        </TabPane>

        <TabPane 
          tab={
            <span>
              <AuditOutlined />
              System Logs
            </span>
          } 
          key="logs"
        >
          <CardComponent
            title="Audit Logs"
            subtitle="View system activity and security logs"
            actions={
              <Space>
                <SecondaryButton icon={<BarChartOutlined />}>
                  Export Logs
                </SecondaryButton>
                <PrimaryButton icon={<SecurityScanOutlined />}>
                  Security Report
                </PrimaryButton>
              </Space>
            }
          >
            <Table
              columns={auditLogColumns}
              dataSource={auditLogs}
              rowKey="log_id"
              pagination={{ pageSize: 20 }}
              style={{ fontSize: theme.fontSizeTable, fontFamily: theme.fontFamily }}
              scroll={{ x: 800 }}
            />
          </CardComponent>
        </TabPane>
      </Tabs>

      <Drawer
        title={getDrawerTitle()}
        width={600}
        open={drawerVisible}
        onClose={closeDrawer}
        footer={
          <div style={{ textAlign: 'right' }}>
            <Space>
              <SecondaryButton onClick={closeDrawer}>
                Cancel
              </SecondaryButton>
              <PrimaryButton 
                icon={<SaveOutlined />} 
                onClick={() => form.submit()}
                loading={loading}
              >
                Save
              </PrimaryButton>
            </Space>
          </div>
        }
        styles={{
          body: { paddingBottom: 80 }
        }}
      >
        {renderDrawerContent()}
      </Drawer>
    </div>
  );
}

export default SettingsPage; 