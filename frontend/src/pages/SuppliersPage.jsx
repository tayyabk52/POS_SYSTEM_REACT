import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Space,
  Modal,
  message,
  Tooltip,
  Tag,
  Row,
  Col,
  Statistic,
  Typography,
  Select,
  Drawer,
  Avatar,
  Descriptions,
  Empty,
  Badge
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  IdcardOutlined,
  ReloadOutlined,
  FilterOutlined,
  ExportOutlined,
  ImportOutlined,
  EyeOutlined,
  HistoryOutlined,
  CrownOutlined,
  BankOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { theme } from '../theme';
import { SupplierDrawer } from '../components';

const { Title, Text } = Typography;
const { Option } = Select;

const API_BASE = 'http://localhost:8000';

function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [supplierDrawerOpen, setSupplierDrawerOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);

  const [stats, setStats] = useState({
    total_suppliers: 0,
    active_suppliers: 0,
    inactive_suppliers: 0,
    suppliers_with_products: 0
  });
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [supplierDetailDrawerOpen, setSupplierDetailDrawerOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch suppliers
  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter !== 'all') params.is_active = statusFilter === 'active';

      const response = await axios.get(`${API_BASE}/suppliers/`, { params });
      setSuppliers(response.data);
    } catch (error) {
      message.error('Failed to fetch suppliers');
      console.error('Error fetching suppliers:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_BASE}/suppliers/stats/summary`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchSuppliers();
    fetchStats();
  }, [search, statusFilter]);

  // Handle supplier creation/update
  const handleSupplierSubmit = async (values) => {
    setSaving(true);
    try {
      if (editingSupplier) {
        await axios.put(`${API_BASE}/suppliers/${editingSupplier.supplier_id}`, values);
        message.success('Supplier updated successfully');
      } else {
        await axios.post(`${API_BASE}/suppliers/`, values);
        message.success('Supplier created successfully');
      }
      setSupplierDrawerOpen(false);
      setEditingSupplier(null);
      fetchSuppliers();
      fetchStats();
    } catch (error) {
      if (error.response?.status === 409) {
        message.error(error.response.data.detail);
      } else {
        message.error('Failed to save supplier');
      }
    } finally {
      setSaving(false);
    }
  };

  // Handle supplier deletion
  const handleDeleteSupplier = async (supplierId) => {
    Modal.confirm({
      title: 'Delete Supplier',
      content: 'Are you sure you want to delete this supplier? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await axios.delete(`${API_BASE}/suppliers/${supplierId}`);
          message.success('Supplier deleted successfully');
          fetchSuppliers();
          fetchStats();
        } catch (error) {
          message.error('Failed to delete supplier');
        }
      },
    });
  };

  // Open supplier detail drawer
  const openSupplierDetail = async (supplier) => {
    setSelectedSupplier(supplier);
    setSupplierDetailDrawerOpen(true);
  };

  // Table columns
  const columns = [
    {
      title: 'Supplier',
      key: 'supplier',
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
            {record.supplier_name[0]}
          </Avatar>
          <div>
            <div style={{ 
              fontWeight: theme.fontWeightBold, 
              fontSize: window.innerWidth < 768 ? 13 : 15 
            }}>
              {record.supplier_name}
            </div>
            {record.contact_person && (
              <div style={{ 
                color: theme.textSecondary, 
                fontSize: window.innerWidth < 768 ? 11 : 13 
              }}>
                <UserOutlined style={{ marginRight: 4 }} />
                {record.contact_person}
              </div>
            )}
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
      title: 'Tax Info',
      key: 'tax',
      width: window.innerWidth < 768 ? 120 : 180,
      responsive: ['lg'],
      render: (_, record) => (
        <div>
          {record.ntn && (
            <div style={{ marginBottom: 4 }}>
              <IdcardOutlined style={{ marginRight: 6, color: theme.textSecondary }} />
              <Text style={{ fontSize: window.innerWidth < 768 ? 12 : 14 }}>{record.ntn}</Text>
            </div>
          )}
          {record.gst_number && (
            <div>
              <BankOutlined style={{ marginRight: 6, color: theme.textSecondary }} />
              <Text style={{ fontSize: window.innerWidth < 768 ? 12 : 14 }}>{record.gst_number}</Text>
            </div>
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
              onClick={() => openSupplierDetail(record)}
              size={window.innerWidth < 768 ? 'small' : 'middle'}
            />
          </Tooltip>
          <Tooltip title="Edit Supplier">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => {
                setEditingSupplier(record);
                setSupplierDrawerOpen(true);
              }}
              size={window.innerWidth < 768 ? 'small' : 'middle'}
            />
          </Tooltip>
          <Tooltip title="Delete Supplier">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteSupplier(record.supplier_id)}
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
          Supplier Management
        </Title>
        <Text 
          type="secondary" 
          style={{ 
            fontSize: { xs: 14, sm: 15, md: 16 }[window.innerWidth < 768 ? 'xs' : window.innerWidth < 1024 ? 'sm' : 'md'],
            marginTop: 8
          }}
        >
          Manage your suppliers and vendor information
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
              title={<span style={{ color: 'white', opacity: 0.9, fontSize: { xs: 12, sm: 13, md: 14 }[window.innerWidth < 768 ? 'xs' : window.innerWidth < 1024 ? 'sm' : 'md'] }}>Total Suppliers</span>}
              value={stats.total_suppliers}
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
              title={<span style={{ color: 'white', opacity: 0.9, fontSize: { xs: 12, sm: 13, md: 14 }[window.innerWidth < 768 ? 'xs' : window.innerWidth < 1024 ? 'sm' : 'md'] }}>Active Suppliers</span>}
              value={stats.active_suppliers}
              valueStyle={{ 
                color: 'white', 
                fontSize: { xs: 24, sm: 28, md: 32 }[window.innerWidth < 768 ? 'xs' : window.innerWidth < 1024 ? 'sm' : 'md'], 
                fontWeight: 700 
              }}
              prefix={<CheckCircleOutlined />}
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
              title={<span style={{ color: 'white', opacity: 0.9, fontSize: { xs: 12, sm: 13, md: 14 }[window.innerWidth < 768 ? 'xs' : window.innerWidth < 1024 ? 'sm' : 'md'] }}>Inactive Suppliers</span>}
              value={stats.inactive_suppliers}
              valueStyle={{ 
                color: 'white', 
                fontSize: { xs: 24, sm: 28, md: 32 }[window.innerWidth < 768 ? 'xs' : window.innerWidth < 1024 ? 'sm' : 'md'], 
                fontWeight: 700 
              }}
              prefix={<CloseCircleOutlined />}
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
              title={<span style={{ color: 'white', opacity: 0.9, fontSize: { xs: 12, sm: 13, md: 14 }[window.innerWidth < 768 ? 'xs' : window.innerWidth < 1024 ? 'sm' : 'md'] }}>With Products</span>}
              value={stats.suppliers_with_products}
              valueStyle={{ 
                color: 'white', 
                fontSize: { xs: 24, sm: 28, md: 32 }[window.innerWidth < 768 ? 'xs' : window.innerWidth < 1024 ? 'sm' : 'md'], 
                fontWeight: 700 
              }}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Supplier Management Card */}
      <Card
        title={
          <div style={{ 
            fontSize: { xs: 16, sm: 18, md: 20 }[window.innerWidth < 768 ? 'xs' : window.innerWidth < 1024 ? 'sm' : 'md'],
            fontWeight: 600 
          }}>
            Supplier Management
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
                placeholder="Search suppliers by name, contact person, phone, or email"
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
              <Space>
                <Button icon={<FilterOutlined />} size={window.innerWidth < 768 ? 'middle' : 'large'}>Filters</Button>
                <Button icon={<ExportOutlined />} size={window.innerWidth < 768 ? 'middle' : 'large'}>Export</Button>
              </Space>
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
                <Tooltip title="Reload supplier data">
                  <Button 
                    icon={<ReloadOutlined />} 
                    onClick={() => {
                      fetchSuppliers();
                      fetchStats();
                    }}
                    size={window.innerWidth < 768 ? 'middle' : 'large'}
                  />
                </Tooltip>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setEditingSupplier(null);
                    setSupplierDrawerOpen(true);
                  }}
                  size={window.innerWidth < 768 ? 'middle' : 'large'}
                  style={{ 
                    minWidth: window.innerWidth < 768 ? 'auto' : 120,
                    fontSize: { xs: 13, sm: 14, md: 14 }[window.innerWidth < 768 ? 'xs' : window.innerWidth < 1024 ? 'sm' : 'md']
                  }}
                >
                  {window.innerWidth < 768 ? 'Add' : 'Add Supplier'}
                </Button>
              </div>
            </Col>
          </Row>
        </div>

        {/* Supplier Table - Responsive */}
        <div style={{ overflowX: 'auto' }}>
          <Table
            columns={columns}
            dataSource={suppliers}
            rowKey="supplier_id"
            scroll={{ 
              x: window.innerWidth < 768 ? 800 : window.innerWidth < 1024 ? 1200 : 1400 
            }}
            pagination={{
              pageSize: window.innerWidth < 768 ? 10 : 15,
              showSizeChanger: window.innerWidth >= 768,
              showQuickJumper: window.innerWidth >= 768,
              showTotal: window.innerWidth >= 768 ? (total, range) => `${range[0]}-${range[1]} of ${total} suppliers` : undefined,
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
                  description="No suppliers found"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  style={{ padding: '40px 0' }}
                />
              )
            }}
          />
        </div>
      </Card>

      {/* Supplier Form Drawer */}
      <SupplierDrawer
        open={supplierDrawerOpen}
        onClose={() => {
          setSupplierDrawerOpen(false);
          setEditingSupplier(null);
        }}
        onSave={handleSupplierSubmit}
        initialValues={editingSupplier}
        isEditing={!!editingSupplier}
        saving={saving}
      />

      {/* Supplier Detail Drawer */}
      <Drawer
        title="Supplier Details"
        width={window.innerWidth < 768 ? '100%' : window.innerWidth < 1024 ? 600 : 800}
        open={supplierDetailDrawerOpen}
        onClose={() => {
          setSupplierDetailDrawerOpen(false);
          setSelectedSupplier(null);
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
        {selectedSupplier && (
          <div>
            <Descriptions 
              title="Basic Information" 
              bordered
              column={window.innerWidth < 768 ? 1 : 2}
              size={window.innerWidth < 768 ? 'small' : 'default'}
            >
              <Descriptions.Item label="Supplier Name" span={window.innerWidth < 768 ? 1 : 2}>
                {selectedSupplier.supplier_name}
              </Descriptions.Item>
              <Descriptions.Item label="Contact Person" span={window.innerWidth < 768 ? 1 : 2}>
                {selectedSupplier.contact_person || 'Not specified'}
              </Descriptions.Item>
              <Descriptions.Item label="Phone Number" span={window.innerWidth < 768 ? 1 : 2}>
                {selectedSupplier.phone_number || 'Not specified'}
              </Descriptions.Item>
              <Descriptions.Item label="Email" span={window.innerWidth < 768 ? 1 : 2}>
                {selectedSupplier.email || 'Not specified'}
              </Descriptions.Item>
              <Descriptions.Item label="Address" span={window.innerWidth < 768 ? 1 : 2}>
                {selectedSupplier.address || 'Not specified'}
              </Descriptions.Item>
              <Descriptions.Item label="NTN" span={window.innerWidth < 768 ? 1 : 2}>
                {selectedSupplier.ntn || 'Not specified'}
              </Descriptions.Item>
              <Descriptions.Item label="GST Number" span={window.innerWidth < 768 ? 1 : 2}>
                {selectedSupplier.gst_number || 'Not specified'}
              </Descriptions.Item>
              <Descriptions.Item label="Status" span={window.innerWidth < 768 ? 1 : 2}>
                <Tag color={selectedSupplier.is_active ? 'green' : 'red'}>
                  {selectedSupplier.is_active ? 'Active' : 'Inactive'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Created" span={window.innerWidth < 768 ? 1 : 2}>
                {selectedSupplier.created_at ? new Date(selectedSupplier.created_at).toLocaleDateString() : 'Not available'}
              </Descriptions.Item>
              <Descriptions.Item label="Last Updated" span={window.innerWidth < 768 ? 1 : 2}>
                {selectedSupplier.updated_at ? new Date(selectedSupplier.updated_at).toLocaleDateString() : 'Not available'}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Drawer>
    </div>
  );
}

export default SuppliersPage; 