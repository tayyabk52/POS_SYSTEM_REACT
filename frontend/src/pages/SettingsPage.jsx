import React, { useState, useEffect } from 'react';
import {
  Card,
  Tabs,
  Table,
  Button,
  Input,
  Select,
  Space,
  Typography,
  Modal,
  Form,
  InputNumber,
  DatePicker,
  Switch,
  Tag,
  Row,
  Col,
  Divider,
  Alert,
  message,
  Tooltip,
  Badge,
  Spin,
  Empty,
  Popconfirm
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SaveOutlined,
  ReloadOutlined,
  SettingOutlined,
  DollarOutlined,
  PercentageOutlined,
  CreditCardOutlined,
  UserOutlined,
  SafetyCertificateOutlined,
  BankOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { theme } from '../theme';
import { SearchBar, StatusTag, Card as CustomCard } from '../components';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;

// Dummy data for demonstration
const dummyTaxCategories = [
  { tax_category_id: 1, tax_category_name: 'Standard Sales Tax', tax_rate: 18.00, effective_date: '2024-01-01', is_active: true },
  { tax_category_id: 2, tax_category_name: 'Reduced Rate', tax_rate: 5.00, effective_date: '2024-01-01', is_active: true },
  { tax_category_id: 3, tax_category_name: 'Zero Rate', tax_rate: 0.00, effective_date: '2024-01-01', is_active: true },
  { tax_category_id: 4, tax_category_name: 'Exempt', tax_rate: 0.00, effective_date: '2024-01-01', is_active: false }
];

const dummyPaymentMethods = [
  { payment_method_id: 1, method_name: 'Cash', is_active: true },
  { payment_method_id: 2, method_name: 'Credit Card', is_active: true },
  { payment_method_id: 3, method_name: 'Debit Card', is_active: true },
  { payment_method_id: 4, method_name: 'Mobile Wallet', is_active: true },
  { payment_method_id: 5, method_name: 'Bank Transfer', is_active: false },
  { payment_method_id: 6, method_name: 'Cheque', is_active: false }
];

const dummyExpenseCategories = [
  { category_id: 1, category_name: 'Rent' },
  { category_id: 2, category_name: 'Utilities' },
  { category_id: 3, category_name: 'Salaries' },
  { category_id: 4, category_name: 'Maintenance' },
  { category_id: 5, category_name: 'Marketing' },
  { category_id: 6, category_name: 'Office Supplies' },
  { category_id: 7, category_name: 'Insurance' },
  { category_id: 8, category_name: 'Transportation' },
  { category_id: 9, category_name: 'Professional Services' },
  { category_id: 10, category_name: 'Other' }
];

const dummyRoles = [
  { role_id: 1, role_name: 'Administrator', description: 'Full system access' },
  { role_id: 2, role_name: 'Manager', description: 'Store management and reporting' },
  { role_id: 3, role_name: 'Cashier', description: 'Sales transactions and basic operations' },
  { role_id: 4, role_name: 'Stock Keeper', description: 'Inventory management' },
  { role_id: 5, role_name: 'Sales Associate', description: 'Customer service and sales support' }
];

const dummyPermissions = [
  { permission_id: 1, permission_name: 'create_sale', description: 'Create sales transactions' },
  { permission_id: 2, permission_name: 'void_transaction', description: 'Void sales transactions' },
  { permission_id: 3, permission_name: 'process_return', description: 'Process customer returns' },
  { permission_id: 4, permission_name: 'manage_inventory', description: 'Manage product inventory' },
  { permission_id: 5, permission_name: 'view_reports', description: 'View system reports' },
  { permission_id: 6, permission_name: 'manage_products', description: 'Create and edit products' },
  { permission_id: 7, permission_name: 'manage_customers', description: 'Manage customer information' },
  { permission_id: 8, permission_name: 'manage_users', description: 'Manage system users' },
  { permission_id: 9, permission_name: 'manage_settings', description: 'Modify system settings' },
  { permission_id: 10, permission_name: 'manage_suppliers', description: 'Manage supplier information' },
  { permission_id: 11, permission_name: 'create_purchase_order', description: 'Create purchase orders' },
  { permission_id: 12, permission_name: 'receive_goods', description: 'Process goods receipt' },
  { permission_id: 13, permission_name: 'manage_expenses', description: 'Record and manage expenses' },
  { permission_id: 14, permission_name: 'view_financial_reports', description: 'View financial reports' }
];

const dummySystemSettings = [
  { setting_id: 1, setting_key: 'company_name', setting_value: 'Candela POS System', store_id: null },
  { setting_id: 2, setting_key: 'invoice_prefix', setting_value: 'INV', store_id: null },
  { setting_id: 3, setting_key: 'default_currency', setting_value: 'PKR', store_id: null },
  { setting_id: 4, setting_key: 'decimal_places', setting_value: '2', store_id: null },
  { setting_id: 5, setting_key: 'auto_backup', setting_value: 'true', store_id: null },
  { setting_id: 6, setting_key: 'backup_frequency', setting_value: 'daily', store_id: null },
  { setting_id: 7, setting_key: 'session_timeout', setting_value: '30', store_id: null },
  { setting_id: 8, setting_key: 'enable_notifications', setting_value: 'true', store_id: null }
];

function SettingsPage() {
  const [activeTab, setActiveTab] = useState('tax');
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  
  // State for different sections
  const [taxCategories, setTaxCategories] = useState(dummyTaxCategories);
  const [paymentMethods, setPaymentMethods] = useState(dummyPaymentMethods);
  const [expenseCategories, setExpenseCategories] = useState(dummyExpenseCategories);
  const [roles, setRoles] = useState(dummyRoles);
  const [permissions, setPermissions] = useState(dummyPermissions);
  const [systemSettings, setSystemSettings] = useState(dummySystemSettings);
  
  // Modal states
  const [taxModal, setTaxModal] = useState({ open: false, editing: null });
  const [paymentModal, setPaymentModal] = useState({ open: false, editing: null });
  const [expenseModal, setExpenseModal] = useState({ open: false, editing: null });
  const [roleModal, setRoleModal] = useState({ open: false, editing: null });
  const [settingModal, setSettingModal] = useState({ open: false, editing: null });
  
  // Form instances
  const [taxForm] = Form.useForm();
  const [paymentForm] = Form.useForm();
  const [expenseForm] = Form.useForm();
  const [roleForm] = Form.useForm();
  const [settingForm] = Form.useForm();

  // Tax Categories Section
  const taxColumns = [
    {
      title: 'Tax Category',
      dataIndex: 'tax_category_name',
      key: 'tax_category_name',
      render: (text, record) => (
        <div>
          <Text strong>{text}</Text>
          {!record.is_active && <Tag color="red" style={{ marginLeft: 8 }}>Inactive</Tag>}
        </div>
      )
    },
    {
      title: 'Tax Rate',
      dataIndex: 'tax_rate',
      key: 'tax_rate',
      align: 'right',
      render: (rate) => (
        <Text strong style={{ color: theme.primary }}>
          {rate.toFixed(2)}%
        </Text>
      )
    },
    {
      title: 'Effective Date',
      dataIndex: 'effective_date',
      key: 'effective_date',
      render: (date) => new Date(date).toLocaleDateString()
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (active) => <StatusTag status={active ? 'active' : 'inactive'} />
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditTax(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Delete this tax category?"
            onConfirm={() => handleDeleteTax(record.tax_category_id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  // Payment Methods Section
  const paymentColumns = [
    {
      title: 'Method Name',
      dataIndex: 'method_name',
      key: 'method_name',
      render: (text, record) => (
        <div>
          <Text strong>{text}</Text>
          {!record.is_active && <Tag color="red" style={{ marginLeft: 8 }}>Inactive</Tag>}
        </div>
      )
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (active) => <StatusTag status={active ? 'active' : 'inactive'} />
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditPayment(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Delete this payment method?"
            onConfirm={() => handleDeletePayment(record.payment_method_id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  // Expense Categories Section
  const expenseColumns = [
    {
      title: 'Category Name',
      dataIndex: 'category_name',
      key: 'category_name',
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditExpense(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Delete this expense category?"
            onConfirm={() => handleDeleteExpense(record.category_id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  // Roles Section
  const roleColumns = [
    {
      title: 'Role Name',
      dataIndex: 'role_name',
      key: 'role_name',
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text) => <Text type="secondary">{text}</Text>
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditRole(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Delete this role?"
            onConfirm={() => handleDeleteRole(record.role_id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  // System Settings Section
  const settingColumns = [
    {
      title: 'Setting Key',
      dataIndex: 'setting_key',
      key: 'setting_key',
      render: (text) => <Text code>{text}</Text>
    },
    {
      title: 'Value',
      dataIndex: 'setting_value',
      key: 'setting_value',
      render: (text) => <Text>{text}</Text>
    },
    {
      title: 'Scope',
      dataIndex: 'store_id',
      key: 'store_id',
      render: (storeId) => (
        <Tag color={storeId ? 'blue' : 'green'}>
          {storeId ? 'Store Specific' : 'Global'}
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Tooltip title="Edit">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEditSetting(record)}
          />
        </Tooltip>
      )
    }
  ];

  // Handlers for Tax Categories
  const handleEditTax = (record) => {
    setTaxModal({ open: true, editing: record });
    taxForm.setFieldsValue({
      tax_category_name: record.tax_category_name,
      tax_rate: record.tax_rate,
      effective_date: record.effective_date ? new Date(record.effective_date) : null,
      is_active: record.is_active
    });
  };

  const handleDeleteTax = (id) => {
    setTaxCategories(taxCategories.filter(t => t.tax_category_id !== id));
    message.success('Tax category deleted');
  };

  const handleTaxSave = async (values) => {
    const newTax = {
      tax_category_id: taxModal.editing ? taxModal.editing.tax_category_id : Date.now(),
      tax_category_name: values.tax_category_name,
      tax_rate: values.tax_rate,
      effective_date: values.effective_date?.toISOString().split('T')[0],
      is_active: values.is_active
    };

    if (taxModal.editing) {
      setTaxCategories(taxCategories.map(t => t.tax_category_id === newTax.tax_category_id ? newTax : t));
      message.success('Tax category updated');
    } else {
      setTaxCategories([...taxCategories, newTax]);
      message.success('Tax category added');
    }
    setTaxModal({ open: false, editing: null });
    taxForm.resetFields();
  };

  // Handlers for Payment Methods
  const handleEditPayment = (record) => {
    setPaymentModal({ open: true, editing: record });
    paymentForm.setFieldsValue({
      method_name: record.method_name,
      is_active: record.is_active
    });
  };

  const handleDeletePayment = (id) => {
    setPaymentMethods(paymentMethods.filter(p => p.payment_method_id !== id));
    message.success('Payment method deleted');
  };

  const handlePaymentSave = async (values) => {
    const newPayment = {
      payment_method_id: paymentModal.editing ? paymentModal.editing.payment_method_id : Date.now(),
      method_name: values.method_name,
      is_active: values.is_active
    };

    if (paymentModal.editing) {
      setPaymentMethods(paymentMethods.map(p => p.payment_method_id === newPayment.payment_method_id ? newPayment : p));
      message.success('Payment method updated');
    } else {
      setPaymentMethods([...paymentMethods, newPayment]);
      message.success('Payment method added');
    }
    setPaymentModal({ open: false, editing: null });
    paymentForm.resetFields();
  };

  // Handlers for Expense Categories
  const handleEditExpense = (record) => {
    setExpenseModal({ open: true, editing: record });
    expenseForm.setFieldsValue({
      category_name: record.category_name
    });
  };

  const handleDeleteExpense = (id) => {
    setExpenseCategories(expenseCategories.filter(e => e.category_id !== id));
    message.success('Expense category deleted');
  };

  const handleExpenseSave = async (values) => {
    const newExpense = {
      category_id: expenseModal.editing ? expenseModal.editing.category_id : Date.now(),
      category_name: values.category_name
    };

    if (expenseModal.editing) {
      setExpenseCategories(expenseCategories.map(e => e.category_id === newExpense.category_id ? newExpense : e));
      message.success('Expense category updated');
    } else {
      setExpenseCategories([...expenseCategories, newExpense]);
      message.success('Expense category added');
    }
    setExpenseModal({ open: false, editing: null });
    expenseForm.resetFields();
  };

  // Handlers for Roles
  const handleEditRole = (record) => {
    setRoleModal({ open: true, editing: record });
    roleForm.setFieldsValue({
      role_name: record.role_name,
      description: record.description
    });
  };

  const handleDeleteRole = (id) => {
    setRoles(roles.filter(r => r.role_id !== id));
    message.success('Role deleted');
  };

  const handleRoleSave = async (values) => {
    const newRole = {
      role_id: roleModal.editing ? roleModal.editing.role_id : Date.now(),
      role_name: values.role_name,
      description: values.description
    };

    if (roleModal.editing) {
      setRoles(roles.map(r => r.role_id === newRole.role_id ? newRole : r));
      message.success('Role updated');
    } else {
      setRoles([...roles, newRole]);
      message.success('Role added');
    }
    setRoleModal({ open: false, editing: null });
    roleForm.resetFields();
  };

  // Handlers for System Settings
  const handleEditSetting = (record) => {
    setSettingModal({ open: true, editing: record });
    settingForm.setFieldsValue({
      setting_key: record.setting_key,
      setting_value: record.setting_value,
      store_id: record.store_id
    });
  };

  const handleSettingSave = async (values) => {
    const newSetting = {
      setting_id: settingModal.editing ? settingModal.editing.setting_id : Date.now(),
      setting_key: values.setting_key,
      setting_value: values.setting_value,
      store_id: values.store_id
    };

    if (settingModal.editing) {
      setSystemSettings(systemSettings.map(s => s.setting_id === newSetting.setting_id ? newSetting : s));
      message.success('Setting updated');
    } else {
      setSystemSettings([...systemSettings, newSetting]);
      message.success('Setting added');
    }
    setSettingModal({ open: false, editing: null });
    settingForm.resetFields();
  };

  return (
    <div style={{ 
      background: theme.contentBg, 
      minHeight: '100vh', 
      padding: 40, 
      animation: theme.fadeIn, 
      fontFamily: theme.fontFamily 
    }}>
      <div style={{ marginBottom: 32 }}>
        <Title level={2} style={{ margin: 0, color: theme.text }}>
          <SettingOutlined style={{ marginRight: 12, color: theme.primary }} />
          System Settings
        </Title>
        <Text type="secondary">
          Manage system configuration, tax rates, payment methods, and user permissions
        </Text>
      </div>

      <Card
        style={{
          borderRadius: theme.borderRadius,
          boxShadow: theme.cardShadow,
          background: theme.cardBg
        }}
        bodyStyle={{ padding: 0 }}
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          style={{ padding: '0 24px' }}
          items={[
            {
              key: 'tax',
              label: (
                <span>
                  <PercentageOutlined style={{ marginRight: 8 }} />
                  Tax Categories
                </span>
              ),
              children: (
                <div style={{ padding: '24px 0' }}>
                  <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <SearchBar
                      placeholder="Search tax categories..."
                      value={searchText}
                      onChange={setSearchText}
                      style={{ width: 300 }}
                    />
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => setTaxModal({ open: true, editing: null })}
                    >
                      Add Tax Category
                    </Button>
                  </div>
                  <Table
                    columns={taxColumns}
                    dataSource={taxCategories.filter(t => 
                      t.tax_category_name.toLowerCase().includes(searchText.toLowerCase())
                    )}
                    rowKey="tax_category_id"
                    pagination={{ pageSize: 10 }}
                    size="middle"
                  />
                </div>
              )
            },
            {
              key: 'payment',
              label: (
                <span>
                  <CreditCardOutlined style={{ marginRight: 8 }} />
                  Payment Methods
                </span>
              ),
              children: (
                <div style={{ padding: '24px 0' }}>
                  <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <SearchBar
                      placeholder="Search payment methods..."
                      value={searchText}
                      onChange={setSearchText}
                      style={{ width: 300 }}
                    />
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => setPaymentModal({ open: true, editing: null })}
                    >
                      Add Payment Method
                    </Button>
                  </div>
                  <Table
                    columns={paymentColumns}
                    dataSource={paymentMethods.filter(p => 
                      p.method_name.toLowerCase().includes(searchText.toLowerCase())
                    )}
                    rowKey="payment_method_id"
                    pagination={{ pageSize: 10 }}
                    size="middle"
                  />
                </div>
              )
            },
            {
              key: 'expense',
              label: (
                <span>
                  <DollarOutlined style={{ marginRight: 8 }} />
                  Expense Categories
                </span>
              ),
              children: (
                <div style={{ padding: '24px 0' }}>
                  <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <SearchBar
                      placeholder="Search expense categories..."
                      value={searchText}
                      onChange={setSearchText}
                      style={{ width: 300 }}
                    />
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => setExpenseModal({ open: true, editing: null })}
                    >
                      Add Expense Category
                    </Button>
                  </div>
                  <Table
                    columns={expenseColumns}
                    dataSource={expenseCategories.filter(e => 
                      e.category_name.toLowerCase().includes(searchText.toLowerCase())
                    )}
                    rowKey="category_id"
                    pagination={{ pageSize: 10 }}
                    size="middle"
                  />
                </div>
              )
            },
            {
              key: 'roles',
              label: (
                <span>
                  <UserOutlined style={{ marginRight: 8 }} />
                  Roles & Permissions
                </span>
              ),
              children: (
                <div style={{ padding: '24px 0' }}>
                  <Row gutter={[24, 24]}>
                    <Col span={12}>
                      <Card
                        title={
                          <span>
                            <UserOutlined style={{ marginRight: 8 }} />
                            Roles
                          </span>
                        }
                        extra={
                          <Button
                            type="primary"
                            size="small"
                            icon={<PlusOutlined />}
                            onClick={() => setRoleModal({ open: true, editing: null })}
                          >
                            Add Role
                          </Button>
                        }
                        style={{ borderRadius: theme.borderRadius }}
                      >
                        <Table
                          columns={roleColumns}
                          dataSource={roles}
                          rowKey="role_id"
                          pagination={false}
                          size="small"
                        />
                      </Card>
                    </Col>
                    <Col span={12}>
                      <Card
                        title={
                          <span>
                            <SafetyCertificateOutlined style={{ marginRight: 8 }} />
                            Available Permissions
                          </span>
                        }
                        style={{ borderRadius: theme.borderRadius }}
                      >
                        <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                          {permissions.map(permission => (
                            <div
                              key={permission.permission_id}
                              style={{
                                padding: '8px 12px',
                                border: '1px solid #f0f0f0',
                                borderRadius: 6,
                                marginBottom: 8,
                                background: '#fafafa'
                              }}
                            >
                              <Text strong style={{ fontSize: 13 }}>
                                {permission.permission_name}
                              </Text>
                              <br />
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                {permission.description}
                              </Text>
                            </div>
                          ))}
                        </div>
                      </Card>
                    </Col>
                  </Row>
                </div>
              )
            },
            {
              key: 'system',
              label: (
                <span>
                  <SettingOutlined style={{ marginRight: 8 }} />
                  System Settings
                </span>
              ),
              children: (
                <div style={{ padding: '24px 0' }}>
                  <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <SearchBar
                      placeholder="Search settings..."
                      value={searchText}
                      onChange={setSearchText}
                      style={{ width: 300 }}
                    />
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => setSettingModal({ open: true, editing: null })}
                    >
                      Add Setting
                    </Button>
                  </div>
                  <Table
                    columns={settingColumns}
                    dataSource={systemSettings.filter(s => 
                      s.setting_key.toLowerCase().includes(searchText.toLowerCase()) ||
                      s.setting_value.toLowerCase().includes(searchText.toLowerCase())
                    )}
                    rowKey="setting_id"
                    pagination={{ pageSize: 10 }}
                    size="middle"
                  />
                </div>
              )
            }
          ]}
        />
      </Card>

      {/* Tax Category Modal */}
      <Modal
        title={taxModal.editing ? 'Edit Tax Category' : 'Add Tax Category'}
        open={taxModal.open}
        onCancel={() => {
          setTaxModal({ open: false, editing: null });
          taxForm.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form
          form={taxForm}
          layout="vertical"
          onFinish={handleTaxSave}
        >
          <Form.Item
            name="tax_category_name"
            label="Tax Category Name"
            rules={[{ required: true, message: 'Please enter tax category name' }]}
          >
            <Input placeholder="e.g., Standard Sales Tax" />
          </Form.Item>
          <Form.Item
            name="tax_rate"
            label="Tax Rate (%)"
            rules={[{ required: true, message: 'Please enter tax rate' }]}
          >
            <InputNumber
              min={0}
              max={100}
              step={0.01}
              style={{ width: '100%' }}
              placeholder="18.00"
            />
          </Form.Item>
          <Form.Item
            name="effective_date"
            label="Effective Date"
            rules={[{ required: true, message: 'Please select effective date' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="is_active"
            label="Active"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                {taxModal.editing ? 'Update' : 'Add'}
              </Button>
              <Button onClick={() => {
                setTaxModal({ open: false, editing: null });
                taxForm.resetFields();
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Payment Method Modal */}
      <Modal
        title={paymentModal.editing ? 'Edit Payment Method' : 'Add Payment Method'}
        open={paymentModal.open}
        onCancel={() => {
          setPaymentModal({ open: false, editing: null });
          paymentForm.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form
          form={paymentForm}
          layout="vertical"
          onFinish={handlePaymentSave}
        >
          <Form.Item
            name="method_name"
            label="Method Name"
            rules={[{ required: true, message: 'Please enter method name' }]}
          >
            <Input placeholder="e.g., Credit Card" />
          </Form.Item>
          <Form.Item
            name="is_active"
            label="Active"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                {paymentModal.editing ? 'Update' : 'Add'}
              </Button>
              <Button onClick={() => {
                setPaymentModal({ open: false, editing: null });
                paymentForm.resetFields();
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Expense Category Modal */}
      <Modal
        title={expenseModal.editing ? 'Edit Expense Category' : 'Add Expense Category'}
        open={expenseModal.open}
        onCancel={() => {
          setExpenseModal({ open: false, editing: null });
          expenseForm.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form
          form={expenseForm}
          layout="vertical"
          onFinish={handleExpenseSave}
        >
          <Form.Item
            name="category_name"
            label="Category Name"
            rules={[{ required: true, message: 'Please enter category name' }]}
          >
            <Input placeholder="e.g., Rent" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                {expenseModal.editing ? 'Update' : 'Add'}
              </Button>
              <Button onClick={() => {
                setExpenseModal({ open: false, editing: null });
                expenseForm.resetFields();
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Role Modal */}
      <Modal
        title={roleModal.editing ? 'Edit Role' : 'Add Role'}
        open={roleModal.open}
        onCancel={() => {
          setRoleModal({ open: false, editing: null });
          roleForm.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form
          form={roleForm}
          layout="vertical"
          onFinish={handleRoleSave}
        >
          <Form.Item
            name="role_name"
            label="Role Name"
            rules={[{ required: true, message: 'Please enter role name' }]}
          >
            <Input placeholder="e.g., Manager" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <TextArea rows={3} placeholder="Describe the role's responsibilities" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                {roleModal.editing ? 'Update' : 'Add'}
              </Button>
              <Button onClick={() => {
                setRoleModal({ open: false, editing: null });
                roleForm.resetFields();
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* System Setting Modal */}
      <Modal
        title={settingModal.editing ? 'Edit System Setting' : 'Add System Setting'}
        open={settingModal.open}
        onCancel={() => {
          setSettingModal({ open: false, editing: null });
          settingForm.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form
          form={settingForm}
          layout="vertical"
          onFinish={handleSettingSave}
        >
          <Form.Item
            name="setting_key"
            label="Setting Key"
            rules={[{ required: true, message: 'Please enter setting key' }]}
          >
            <Input placeholder="e.g., company_name" />
          </Form.Item>
          <Form.Item
            name="setting_value"
            label="Setting Value"
            rules={[{ required: true, message: 'Please enter setting value' }]}
          >
            <TextArea rows={3} placeholder="Enter the setting value" />
          </Form.Item>
          <Form.Item
            name="store_id"
            label="Store ID (Optional)"
          >
            <InputNumber
              min={1}
              style={{ width: '100%' }}
              placeholder="Leave empty for global setting"
            />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                {settingModal.editing ? 'Update' : 'Add'}
              </Button>
              <Button onClick={() => {
                setSettingModal({ open: false, editing: null });
                settingForm.resetFields();
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default SettingsPage; 