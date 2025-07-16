import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Space,
  Modal,
  Form,
  message,
  Tooltip,
  Badge,
  Tag,
  Row,
  Col,
  Statistic,
  Typography,
  Switch,
  Select,
  DatePicker,
  Drawer,
  Divider,
  Avatar,
  Progress,
  Tabs,
  List,
  Descriptions,
  Empty,
  Spin,
  Alert
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  GiftOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  StarOutlined,
  TrophyOutlined,
  ReloadOutlined,
  FilterOutlined,
  ExportOutlined,
  ImportOutlined,
  EyeOutlined,
  HistoryOutlined,
  CrownOutlined,
  IdcardOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { theme } from '../theme';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

const API_BASE = 'http://localhost:8000';

function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loyaltyFilter, setLoyaltyFilter] = useState('all');
  const [customerDrawerOpen, setCustomerDrawerOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [customerForm] = Form.useForm();
  const [stats, setStats] = useState({
    total_customers: 0,
    active_customers: 0,
    loyalty_members: 0,
    inactive_customers: 0
  });
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loyaltyHistory, setLoyaltyHistory] = useState([]);
  const [loyaltyHistoryLoading, setLoyaltyHistoryLoading] = useState(false);
  const [customerDetailDrawerOpen, setCustomerDetailDrawerOpen] = useState(false);

  // Fetch customers
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter !== 'all') params.is_active = statusFilter === 'active';

      const response = await axios.get(`${API_BASE}/customers/`, { params });
      setCustomers(response.data);
    } catch (error) {
      message.error('Failed to fetch customers');
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_BASE}/customers/stats/summary`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Fetch loyalty history
  const fetchLoyaltyHistory = async (customerId) => {
    setLoyaltyHistoryLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/customers/${customerId}/loyalty-history`);
      setLoyaltyHistory(response.data);
    } catch (error) {
      message.error('Failed to fetch loyalty history');
    } finally {
      setLoyaltyHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
    fetchStats();
  }, [search, statusFilter]);

  // Handle customer creation/update
  const handleCustomerSubmit = async (values) => {
    try {
      if (editingCustomer) {
        await axios.put(`${API_BASE}/customers/${editingCustomer.customer_id}`, values);
        message.success('Customer updated successfully');
      } else {
        await axios.post(`${API_BASE}/customers/`, values);
        message.success('Customer created successfully');
      }
      setCustomerDrawerOpen(false);
      setEditingCustomer(null);
      customerForm.resetFields();
      fetchCustomers();
      fetchStats();
    } catch (error) {
      if (error.response?.status === 409) {
        message.error(error.response.data.detail);
      } else {
        message.error('Failed to save customer');
      }
    }
  };

  // Handle customer deletion
  const handleDeleteCustomer = async (customerId) => {
    Modal.confirm({
      title: 'Delete Customer',
      content: 'Are you sure you want to delete this customer? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await axios.delete(`${API_BASE}/customers/${customerId}`);
          message.success('Customer deleted successfully');
          fetchCustomers();
          fetchStats();
        } catch (error) {
          message.error('Failed to delete customer');
        }
      },
    });
  };

  // Open customer detail drawer
  const openCustomerDetail = async (customer) => {
    setSelectedCustomer(customer);
    setCustomerDetailDrawerOpen(true);
    await fetchLoyaltyHistory(customer.customer_id);
  };

  // Table columns
  const columns = [
    {
      title: 'Customer',
      key: 'customer',
      width: window.innerWidth < 768 ? 200 : 250,
      fixed: 'left',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: window.innerWidth < 768 ? 8 : 12 }}>
          <Avatar
            size={window.innerWidth < 768 ? 32 : 40}
            style={{
              backgroundColor: record.is_active ? theme.primary : theme.textSecondary,
              fontWeight: theme.fontWeightBold
            }}
          >
            {record.first_name[0]}{record.last_name[0]}
          </Avatar>
          <div>
            <div style={{ 
              fontWeight: theme.fontWeightBold, 
              fontSize: window.innerWidth < 768 ? 13 : 15 
            }}>
              {record.first_name} {record.last_name}
            </div>
            <div style={{ 
              color: theme.textSecondary, 
              fontSize: window.innerWidth < 768 ? 11 : 13 
            }}>
              {record.loyalty_member_id ? (
                <span>
                  <CrownOutlined style={{ marginRight: 4 }} />
                  {record.loyalty_member_id}
                </span>
              ) : 'No Loyalty ID'}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Contact',
      key: 'contact',
      width: window.innerWidth < 768 ? 150 : 200,
      responsive: ['md'],
      render: (_, record) => (
        <div>
          {record.phone_number && (
            <div style={{ marginBottom: 4 }}>
              <PhoneOutlined style={{ marginRight: 6, color: theme.textSecondary }} />
              <Text style={{ fontSize: window.innerWidth < 768 ? 12 : 14 }}>{record.phone_number}</Text>
            </div>
          )}
          {record.email && (
            <div>
              <MailOutlined style={{ marginRight: 6, color: theme.textSecondary }} />
              <Text style={{ fontSize: window.innerWidth < 768 ? 12 : 14 }}>{record.email}</Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Location',
      key: 'location',
      width: window.innerWidth < 768 ? 120 : 180,
      responsive: ['lg'],
      render: (_, record) => (
        <div>
          {record.city && (
            <div style={{ marginBottom: 4 }}>
              <EnvironmentOutlined style={{ marginRight: 6, color: theme.textSecondary }} />
              <Text style={{ fontSize: window.innerWidth < 768 ? 12 : 14 }}>{record.city}</Text>
            </div>
          )}
          {record.province && (
            <div>
              <Text type="secondary" style={{ fontSize: window.innerWidth < 768 ? 11 : 13 }}>{record.province}</Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Loyalty Points',
      key: 'loyalty',
      width: window.innerWidth < 768 ? 100 : 150,
      align: 'center',
      render: (_, record) => (
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            fontSize: window.innerWidth < 768 ? 16 : 18, 
            fontWeight: theme.fontWeightBold, 
            color: theme.primary 
          }}>
            {record.total_loyalty_points}
          </div>
          <div style={{ 
            fontSize: window.innerWidth < 768 ? 10 : 12, 
            color: theme.textSecondary 
          }}>
            <GiftOutlined style={{ marginRight: 4 }} />
            Points
          </div>
        </div>
      ),
    },
    {
      title: 'Registration',
      key: 'registration',
      width: window.innerWidth < 768 ? 120 : 150,
      responsive: ['md'],
      render: (_, record) => (
        <div>
          <div style={{ 
            fontSize: window.innerWidth < 768 ? 11 : 13, 
            fontWeight: theme.fontWeightMedium 
          }}>
            {new Date(record.registration_date).toLocaleDateString()}
          </div>
          <div style={{ 
            fontSize: window.innerWidth < 768 ? 10 : 12, 
            color: theme.textSecondary 
          }}>
            <CalendarOutlined style={{ marginRight: 4 }} />
            Registered
          </div>
        </div>
      ),
    },
    {
      title: 'Last Purchase',
      key: 'last_purchase',
      width: window.innerWidth < 768 ? 120 : 150,
      responsive: ['lg'],
      render: (_, record) => (
        <div>
          {record.last_purchase_date ? (
            <>
              <div style={{ 
                fontSize: window.innerWidth < 768 ? 11 : 13, 
                fontWeight: theme.fontWeightMedium 
              }}>
                {new Date(record.last_purchase_date).toLocaleDateString()}
              </div>
              <div style={{ 
                fontSize: window.innerWidth < 768 ? 10 : 12, 
                color: theme.textSecondary 
              }}>
                <CalendarOutlined style={{ marginRight: 4 }} />
                Last Purchase
              </div>
            </>
          ) : (
            <Text type="secondary" style={{ fontSize: window.innerWidth < 768 ? 10 : 12 }}>No purchases</Text>
          )}
        </div>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      width: window.innerWidth < 768 ? 80 : 120,
      align: 'center',
      render: (_, record) => (
        <Badge
          status={record.is_active ? 'success' : 'default'}
          text={
            <Tag color={record.is_active ? theme.success : theme.textSecondary}>
              {record.is_active ? 'Active' : 'Inactive'}
            </Tag>
          }
        />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: window.innerWidth < 768 ? 120 : 200,
      fixed: 'right',
      responsive: ['sm'],
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => openCustomerDetail(record)}
              size={window.innerWidth < 768 ? 'small' : 'middle'}
            />
          </Tooltip>
          <Tooltip title="Edit Customer">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => {
                setEditingCustomer(record);
                customerForm.setFieldsValue(record);
                setCustomerDrawerOpen(true);
              }}
              size={window.innerWidth < 768 ? 'small' : 'middle'}
            />
          </Tooltip>
          <Tooltip title="Delete Customer">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteCustomer(record.customer_id)}
              size={window.innerWidth < 768 ? 'small' : 'middle'}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{
      background: theme.contentBg,
      minHeight: '100vh',
      padding: { xs: 16, sm: 24, md: 32 }[window.innerWidth < 768 ? 'xs' : window.innerWidth < 1024 ? 'sm' : 'md'],
      fontFamily: theme.fontFamily
    }}>
      {/* Header */}
      <div style={{ marginBottom: { xs: 24, sm: 28, md: 32 }[window.innerWidth < 768 ? 'xs' : window.innerWidth < 1024 ? 'sm' : 'md'] }}>
        <Title 
          level={2} 
          style={{ 
            margin: 0, 
            color: theme.text,
            fontSize: { xs: 24, sm: 28, md: 32 }[window.innerWidth < 768 ? 'xs' : window.innerWidth < 1024 ? 'sm' : 'md']
          }}
        >
          Customer Management
        </Title>
        <Text 
          type="secondary" 
          style={{ 
            fontSize: { xs: 14, sm: 15, md: 16 }[window.innerWidth < 768 ? 'xs' : window.innerWidth < 1024 ? 'sm' : 'md'],
            marginTop: 8
          }}
        >
          Manage customer information, loyalty programs, and customer relationships
        </Text>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: { xs: 24, sm: 28, md: 32 }[window.innerWidth < 768 ? 'xs' : window.innerWidth < 1024 ? 'sm' : 'md'] }}>
        <Col xs={24} sm={12} md={6}>
          <Card
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: theme.borderRadius,
              boxShadow: theme.cardShadow,
              height: '100%'
            }}
            styles={{ body: { padding: { xs: 16, sm: 20, md: 24 }[window.innerWidth < 768 ? 'xs' : window.innerWidth < 1024 ? 'sm' : 'md'] } }}
          >
            <Statistic
              title={<span style={{ color: 'white', opacity: 0.9, fontSize: { xs: 12, sm: 13, md: 14 }[window.innerWidth < 768 ? 'xs' : window.innerWidth < 1024 ? 'sm' : 'md'] }}>Total Customers</span>}
              value={stats.total_customers}
              valueStyle={{ 
                color: 'white', 
                fontSize: { xs: 24, sm: 28, md: 32 }[window.innerWidth < 768 ? 'xs' : window.innerWidth < 1024 ? 'sm' : 'md'], 
                fontWeight: 700 
              }}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            style={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              border: 'none',
              borderRadius: theme.borderRadius,
              boxShadow: theme.cardShadow,
              height: '100%'
            }}
            styles={{ body: { padding: { xs: 16, sm: 20, md: 24 }[window.innerWidth < 768 ? 'xs' : window.innerWidth < 1024 ? 'sm' : 'md'] } }}
          >
            <Statistic
              title={<span style={{ color: 'white', opacity: 0.9, fontSize: { xs: 12, sm: 13, md: 14 }[window.innerWidth < 768 ? 'xs' : window.innerWidth < 1024 ? 'sm' : 'md'] }}>Active Customers</span>}
              value={stats.active_customers}
              valueStyle={{ 
                color: 'white', 
                fontSize: { xs: 24, sm: 28, md: 32 }[window.innerWidth < 768 ? 'xs' : window.innerWidth < 1024 ? 'sm' : 'md'], 
                fontWeight: 700 
              }}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            style={{
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              border: 'none',
              borderRadius: theme.borderRadius,
              boxShadow: theme.cardShadow,
              height: '100%'
            }}
            styles={{ body: { padding: { xs: 16, sm: 20, md: 24 }[window.innerWidth < 768 ? 'xs' : window.innerWidth < 1024 ? 'sm' : 'md'] } }}
          >
            <Statistic
              title={<span style={{ color: 'white', opacity: 0.9, fontSize: { xs: 12, sm: 13, md: 14 }[window.innerWidth < 768 ? 'xs' : window.innerWidth < 1024 ? 'sm' : 'md'] }}>Loyalty Members</span>}
              value={stats.loyalty_members}
              valueStyle={{ 
                color: 'white', 
                fontSize: { xs: 24, sm: 28, md: 32 }[window.innerWidth < 768 ? 'xs' : window.innerWidth < 1024 ? 'sm' : 'md'], 
                fontWeight: 700 
              }}
              prefix={<CrownOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            style={{
              background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
              border: 'none',
              borderRadius: theme.borderRadius,
              boxShadow: theme.cardShadow,
              height: '100%'
            }}
            styles={{ body: { padding: { xs: 16, sm: 20, md: 24 }[window.innerWidth < 768 ? 'xs' : window.innerWidth < 1024 ? 'sm' : 'md'] } }}
          >
            <Statistic
              title={<span style={{ color: 'white', opacity: 0.9, fontSize: { xs: 12, sm: 13, md: 14 }[window.innerWidth < 768 ? 'xs' : window.innerWidth < 1024 ? 'sm' : 'md'] }}>Inactive Customers</span>}
              value={stats.inactive_customers}
              valueStyle={{ 
                color: 'white', 
                fontSize: { xs: 24, sm: 28, md: 32 }[window.innerWidth < 768 ? 'xs' : window.innerWidth < 1024 ? 'sm' : 'md'], 
                fontWeight: 700 
              }}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Customer Management Card */}
      <Card
        title={
          <div style={{ 
            fontSize: { xs: 16, sm: 18, md: 20 }[window.innerWidth < 768 ? 'xs' : window.innerWidth < 1024 ? 'sm' : 'md'],
            fontWeight: 600 
          }}>
            Customer Management
          </div>
        }
        style={{ 
          marginBottom: 24, 
          borderRadius: theme.borderRadius, 
          boxShadow: theme.cardShadow 
        }}
        size="large"
      >
        {/* Search and Filters - Responsive Layout */}
        <div style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]} style={{ width: '100%' }}>
            {/* Search Bar - Full width on mobile, partial on larger screens */}
            <Col xs={24} sm={24} md={12} lg={14} xl={16}>
              <Input
                placeholder="Search by name, phone, email, or loyalty ID"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                prefix={<SearchOutlined />}
                style={{ 
                  width: '100%',
                  fontSize: { xs: 14, sm: 14, md: 14 }[window.innerWidth < 768 ? 'xs' : window.innerWidth < 1024 ? 'sm' : 'md']
                }}
                size={window.innerWidth < 768 ? 'middle' : 'large'}
              />
            </Col>
            
            {/* Filters - Stack on mobile, inline on larger screens */}
            <Col xs={24} sm={12} md={6} lg={5} xl={4}>
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: '100%' }}
                placeholder="Status"
                size={window.innerWidth < 768 ? 'middle' : 'large'}
              >
                <Option value="all">All Status</Option>
                <Option value="active">Active</Option>
                <Option value="inactive">Inactive</Option>
              </Select>
            </Col>
            
            <Col xs={24} sm={12} md={6} lg={5} xl={4}>
              <Select
                value={loyaltyFilter}
                onChange={setLoyaltyFilter}
                style={{ width: '100%' }}
                placeholder="Loyalty"
                size={window.innerWidth < 768 ? 'middle' : 'large'}
              >
                <Option value="all">All Customers</Option>
                <Option value="loyalty">Loyalty Members</Option>
                <Option value="non-loyalty">Non-Loyalty</Option>
              </Select>
            </Col>
          </Row>
          
          {/* Action Buttons - Full width on mobile, right-aligned on larger screens */}
          <Row style={{ marginTop: 16 }}>
            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
              <div style={{ 
                display: 'flex', 
                justifyContent: window.innerWidth < 768 ? 'space-between' : 'flex-end',
                gap: 12,
                flexWrap: 'wrap'
              }}>
                <Tooltip title="Reload customer data">
                  <Button 
                    icon={<ReloadOutlined />} 
                    onClick={fetchCustomers}
                    size={window.innerWidth < 768 ? 'middle' : 'large'}
                  />
                </Tooltip>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setEditingCustomer(null);
                    customerForm.resetFields();
                    setCustomerDrawerOpen(true);
                  }}
                  size={window.innerWidth < 768 ? 'middle' : 'large'}
                  style={{ 
                    minWidth: window.innerWidth < 768 ? 'auto' : 120,
                    fontSize: { xs: 13, sm: 14, md: 14 }[window.innerWidth < 768 ? 'xs' : window.innerWidth < 1024 ? 'sm' : 'md']
                  }}
                >
                  {window.innerWidth < 768 ? 'Add' : 'Add Customer'}
                </Button>
              </div>
            </Col>
          </Row>
        </div>

        {/* Customer Table - Responsive */}
        <div style={{ overflowX: 'auto' }}>
          <Table
            columns={columns}
            dataSource={customers}
            rowKey="customer_id"
            scroll={{ 
              x: window.innerWidth < 768 ? 800 : window.innerWidth < 1024 ? 1200 : 1400 
            }}
            pagination={{
              pageSize: window.innerWidth < 768 ? 10 : 15,
              showSizeChanger: window.innerWidth >= 768,
              showQuickJumper: window.innerWidth >= 768,
              showTotal: window.innerWidth >= 768 ? (total, range) => `${range[0]}-${range[1]} of ${total} customers` : undefined,
              responsive: true,
              size: window.innerWidth < 768 ? 'small' : 'default'
            }}
            style={{ 
              fontSize: { xs: 13, sm: 14, md: 15 }[window.innerWidth < 768 ? 'xs' : window.innerWidth < 1024 ? 'sm' : 'md'], 
              fontFamily: 'inherit' 
            }}
            sticky
            size={window.innerWidth < 768 ? 'small' : 'middle'}
            loading={loading}
            locale={{
              emptyText: (
                <Empty
                  description="No customers found"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  style={{ padding: '40px 0' }}
                />
              )
            }}
          />
        </div>
      </Card>

      {/* Customer Form Drawer */}
      <Drawer
        title={editingCustomer ? "Edit Customer" : "Add New Customer"}
        width={window.innerWidth < 768 ? '100%' : window.innerWidth < 1024 ? 500 : 600}
        open={customerDrawerOpen}
        onClose={() => {
          setCustomerDrawerOpen(false);
          setEditingCustomer(null);
          customerForm.resetFields();
        }}
        bodyStyle={{ 
          paddingBottom: 80,
          padding: window.innerWidth < 768 ? 16 : 24
        }}
        styles={{
          header: {
            padding: window.innerWidth < 768 ? '16px 16px 0' : '24px 24px 0'
          }
        }}
        extra={
          <Space>
            <Button 
              onClick={() => setCustomerDrawerOpen(false)}
              size={window.innerWidth < 768 ? 'small' : 'default'}
            >
              Cancel
            </Button>
            <Button 
              type="primary" 
              onClick={() => customerForm.submit()}
              size={window.innerWidth < 768 ? 'small' : 'default'}
            >
              {editingCustomer ? 'Update' : 'Create'}
            </Button>
          </Space>
        }
      >
        <Form
          form={customerForm}
          layout="vertical"
          onFinish={handleCustomerSubmit}
          initialValues={{ is_active: true }}
          size={window.innerWidth < 768 ? 'small' : 'default'}
        >
          <Row gutter={window.innerWidth < 768 ? 12 : 16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="first_name"
                label="First Name"
                rules={[{ required: true, message: 'Please enter first name' }]}
              >
                <Input placeholder="Enter first name" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="last_name"
                label="Last Name"
                rules={[{ required: true, message: 'Please enter last name' }]}
              >
                <Input placeholder="Enter last name" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={window.innerWidth < 768 ? 12 : 16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="phone_number"
                label="Phone Number"
                rules={[
                  { pattern: /^[\+]?[1-9][\d]{0,15}$/, message: 'Please enter a valid phone number' }
                ]}
              >
                <Input placeholder="Enter phone number" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="email"
                label="Email Address"
                rules={[
                  { type: 'email', message: 'Please enter a valid email' }
                ]}
              >
                <Input placeholder="Enter email address" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="address"
            label="Address"
          >
            <TextArea rows={3} placeholder="Enter full address" />
          </Form.Item>

          <Row gutter={window.innerWidth < 768 ? 12 : 16}>
            <Col xs={24} sm={8}>
              <Form.Item
                name="city"
                label="City"
              >
                <Input placeholder="Enter city" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                name="province"
                label="Province/State"
              >
                <Input placeholder="Enter province" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                name="postal_code"
                label="Postal Code"
              >
                <Input placeholder="Enter postal code" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={window.innerWidth < 768 ? 12 : 16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="loyalty_member_id"
                label="Loyalty Member ID"
              >
                <Input placeholder="Enter loyalty member ID" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="is_active"
                label="Status"
                valuePropName="checked"
              >
                <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Drawer>

      {/* Customer Detail Drawer */}
      <Drawer
        title="Customer Details"
        width={window.innerWidth < 768 ? '100%' : window.innerWidth < 1024 ? 600 : 800}
        open={customerDetailDrawerOpen}
        onClose={() => {
          setCustomerDetailDrawerOpen(false);
          setSelectedCustomer(null);
        }}
        bodyStyle={{ 
          paddingBottom: 80,
          padding: window.innerWidth < 768 ? 16 : 24
        }}
        styles={{
          header: {
            padding: window.innerWidth < 768 ? '16px 16px 0' : '24px 24px 0'
          }
        }}
      >
        {selectedCustomer && (
          <Tabs defaultActiveKey="1" size={window.innerWidth < 768 ? 'small' : 'default'}>
            <TabPane tab="Profile" key="1">
              <Descriptions 
                bordered 
                column={window.innerWidth < 768 ? 1 : 2}
                size={window.innerWidth < 768 ? 'small' : 'default'}
              >
                <Descriptions.Item label="Full Name" span={window.innerWidth < 768 ? 1 : 2}>
                  {selectedCustomer.first_name} {selectedCustomer.last_name}
                </Descriptions.Item>
                <Descriptions.Item label="Phone Number">
                  {selectedCustomer.phone_number || 'Not provided'}
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                  {selectedCustomer.email || 'Not provided'}
                </Descriptions.Item>
                <Descriptions.Item label="Address" span={window.innerWidth < 768 ? 1 : 2}>
                  {selectedCustomer.address || 'Not provided'}
                </Descriptions.Item>
                <Descriptions.Item label="City">
                  {selectedCustomer.city || 'Not provided'}
                </Descriptions.Item>
                <Descriptions.Item label="Province">
                  {selectedCustomer.province || 'Not provided'}
                </Descriptions.Item>
                <Descriptions.Item label="Postal Code">
                  {selectedCustomer.postal_code || 'Not provided'}
                </Descriptions.Item>
                <Descriptions.Item label="Loyalty Member ID">
                  {selectedCustomer.loyalty_member_id || 'Not a loyalty member'}
                </Descriptions.Item>
                <Descriptions.Item label="Total Loyalty Points">
                  <Badge count={selectedCustomer.total_loyalty_points} showZero />
                </Descriptions.Item>
                <Descriptions.Item label="Registration Date">
                  {new Date(selectedCustomer.registration_date).toLocaleDateString()}
                </Descriptions.Item>
                <Descriptions.Item label="Last Purchase Date">
                  {selectedCustomer.last_purchase_date 
                    ? new Date(selectedCustomer.last_purchase_date).toLocaleDateString()
                    : 'No purchases yet'
                  }
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag color={selectedCustomer.is_active ? 'green' : 'red'}>
                    {selectedCustomer.is_active ? 'Active' : 'Inactive'}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            </TabPane>
            
            <TabPane tab="Loyalty History" key="2">
              {loyaltyHistoryLoading ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <Spin size="large" />
                  <div style={{ marginTop: 16 }}>Loading loyalty history...</div>
                </div>
              ) : loyaltyHistory.length > 0 ? (
                <List
                  dataSource={loyaltyHistory}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar icon={<GiftOutlined />} style={{ backgroundColor: theme.primary }} />}
                        title={`${item.points_earned} points earned`}
                        description={
                          <div>
                            <div>{item.description}</div>
                            <div style={{ fontSize: 12, color: theme.textSecondary, marginTop: 4 }}>
                              {new Date(item.earned_date).toLocaleDateString()}
                            </div>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <Empty
                  description="No loyalty history found"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  style={{ padding: '40px 0' }}
                />
              )}
            </TabPane>
          </Tabs>
        )}
      </Drawer>
    </div>
  );
}

export default CustomersPage; 