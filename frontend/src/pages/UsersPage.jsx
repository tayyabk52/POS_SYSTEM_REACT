import React, { useState, useEffect } from 'react';
import { Card, SearchBar, StatusTag } from '../components';
import { Table, Button, Modal, Input, Select, Space, Typography, Row, Col, Tooltip, Switch, message, Form, Tag, Alert, Badge, Spin, Popconfirm } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SaveOutlined,
  ReloadOutlined,
  UserOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  ShopOutlined,
  SafetyCertificateOutlined,
  InfoCircleOutlined,
  EyeOutlined,
  EyeInvisibleOutlined
} from '@ant-design/icons';
import { theme } from '../theme';

const { Title, Text } = Typography;
const { TextArea } = Input;

// Dummy data for demonstration
const dummyUsers = [
  {
    user_id: 1,
    username: 'admin',
    first_name: 'John',
    last_name: 'Smith',
    email: 'john.smith@candela.com',
    phone_number: '+92-300-1234567',
    role_id: 1,
    role_name: 'Administrator',
    store_id: 1,
    store_name: 'Main Store',
    is_active: true,
    last_login_at: '2024-01-15T10:30:00Z',
    created_at: '2024-01-01T09:00:00Z'
  },
  {
    user_id: 2,
    username: 'manager1',
    first_name: 'Sarah',
    last_name: 'Johnson',
    email: 'sarah.johnson@candela.com',
    phone_number: '+92-301-2345678',
    role_id: 2,
    role_name: 'Manager',
    store_id: 1,
    store_name: 'Main Store',
    is_active: true,
    last_login_at: '2024-01-15T14:20:00Z',
    created_at: '2024-01-02T10:00:00Z'
  },
  {
    user_id: 3,
    username: 'cashier1',
    first_name: 'Ahmed',
    last_name: 'Khan',
    email: 'ahmed.khan@candela.com',
    phone_number: '+92-302-3456789',
    role_id: 3,
    role_name: 'Cashier',
    store_id: 2,
    store_name: 'Branch Store',
    is_active: true,
    last_login_at: '2024-01-15T16:45:00Z',
    created_at: '2024-01-03T11:00:00Z'
  },
  {
    user_id: 4,
    username: 'stockkeeper1',
    first_name: 'Fatima',
    last_name: 'Ali',
    email: 'fatima.ali@candela.com',
    phone_number: '+92-303-4567890',
    role_id: 4,
    role_name: 'Stock Keeper',
    store_id: 1,
    store_name: 'Main Store',
    is_active: true,
    last_login_at: '2024-01-14T08:15:00Z',
    created_at: '2024-01-04T12:00:00Z'
  },
  {
    user_id: 5,
    username: 'sales1',
    first_name: 'Muhammad',
    last_name: 'Hassan',
    email: 'muhammad.hassan@candela.com',
    phone_number: '+92-304-5678901',
    role_id: 5,
    role_name: 'Sales Associate',
    store_id: 3,
    store_name: 'Downtown Store',
    is_active: false,
    last_login_at: '2024-01-10T15:30:00Z',
    created_at: '2024-01-05T13:00:00Z'
  }
];

const dummyRoles = [
  { role_id: 1, role_name: 'Administrator', description: 'Full system access' },
  { role_id: 2, role_name: 'Manager', description: 'Store management and reporting' },
  { role_id: 3, role_name: 'Cashier', description: 'Sales transactions and basic operations' },
  { role_id: 4, role_name: 'Stock Keeper', description: 'Inventory management' },
  { role_id: 5, role_name: 'Sales Associate', description: 'Customer service and sales support' }
];

const dummyStores = [
  { store_id: 1, store_name: 'Main Store', city: 'Karachi' },
  { store_id: 2, store_name: 'Branch Store', city: 'Lahore' },
  { store_id: 3, store_name: 'Downtown Store', city: 'Islamabad' }
];

function UsersPage() {
  const [users, setUsers] = useState(dummyUsers);
  const [roles, setRoles] = useState(dummyRoles);
  const [stores, setStores] = useState(dummyStores);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [roleFilter, setRoleFilter] = useState(null);
  const [storeFilter, setStoreFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  
  // Modal states
  const [userModal, setUserModal] = useState({ open: false, editing: null });
  const [passwordModal, setPasswordModal] = useState({ open: false, userId: null });
  
  // Form instances
  const [userForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  
  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Table columns
  const columns = [
    {
      title: 'User',
      key: 'user_info',
      width: 220,
      fixed: 'left',
      render: (_, record) => (
        <div style={{ padding: '8px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
            <div style={{ 
              width: 32, 
              height: 32, 
              borderRadius: '50%', 
              background: theme.primary, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              marginRight: 12
            }}>
              <UserOutlined style={{ color: 'white', fontSize: 16 }} />
            </div>
            <div>
              <Text strong style={{ fontSize: 14, display: 'block' }}>
                {record.first_name} {record.last_name}
              </Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                @{record.username}
              </Text>
            </div>
          </div>
          {!record.is_active && (
            <Tag color="red" style={{ marginTop: 4, fontSize: 11 }}>
              Inactive
            </Tag>
          )}
        </div>
      )
    },
    {
      title: 'Contact Information',
      key: 'contact',
      width: 200,
      render: (_, record) => (
        <div style={{ padding: '8px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
            <MailOutlined style={{ marginRight: 8, color: theme.primary, fontSize: 14 }} />
            <Text style={{ fontSize: 13, color: theme.text }}>
              {record.email}
            </Text>
          </div>
          {record.phone_number && (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <PhoneOutlined style={{ marginRight: 8, color: theme.primary, fontSize: 14 }} />
              <Text style={{ fontSize: 13, color: theme.text }}>
                {record.phone_number}
              </Text>
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Role & Store',
      key: 'role_store',
      width: 180,
      render: (_, record) => (
        <div style={{ padding: '8px 0' }}>
          <div style={{ marginBottom: 8 }}>
            <Tooltip title={`${record.role_name} - ${roles.find(r => r.role_id === record.role_id)?.description || ''}`}>
              <Tag color="blue" style={{ margin: 0, fontSize: 12, padding: '4px 8px' }}>
                <SafetyCertificateOutlined style={{ marginRight: 4 }} />
                {record.role_name}
              </Tag>
            </Tooltip>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <ShopOutlined style={{ marginRight: 6, color: theme.textSecondary, fontSize: 12 }} />
            <Text style={{ fontSize: 12, color: theme.textSecondary }}>
              {record.store_name || 'Not Assigned'}
            </Text>
          </div>
        </div>
      )
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 100,
      align: 'center',
      render: (active) => (
        <div style={{ padding: '8px 0' }}>
          <StatusTag status={active ? 'active' : 'inactive'} />
        </div>
      )
    },
    {
      title: 'Last Login',
      dataIndex: 'last_login_at',
      key: 'last_login_at',
      width: 140,
      render: (date) => (
        <div style={{ padding: '8px 0' }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {date ? new Date(date).toLocaleDateString() : 'Never'}
          </Text>
          {date && (
            <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 2 }}>
              {new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          )}
        </div>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      fixed: 'right',
      align: 'center',
      render: (_, record) => (
        <div style={{ padding: '8px 0' }}>
          <Space size="small">
            <Tooltip title="Edit User">
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={() => handleEditUser(record)}
                style={{ color: theme.primary }}
              />
            </Tooltip>
            <Tooltip title="Change Password">
              <Button
                type="text"
                size="small"
                icon={<LockOutlined />}
                onClick={() => setPasswordModal({ open: true, userId: record.user_id })}
                style={{ color: theme.warning }}
              />
            </Tooltip>
            <Popconfirm
              title={`${record.is_active ? 'Deactivate' : 'Activate'} this user?`}
              onConfirm={() => handleToggleUserStatus(record)}
              okText="Yes"
              cancelText="No"
            >
              <Button
                type="text"
                size="small"
                icon={record.is_active ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                style={{ color: record.is_active ? theme.warning : theme.success }}
              />
            </Popconfirm>
            <Popconfirm
              title="Delete this user?"
              onConfirm={() => handleDeleteUser(record.user_id)}
              okText="Yes"
              cancelText="No"
            >
              <Button 
                type="text" 
                size="small"
                danger 
                icon={<DeleteOutlined />} 
              />
            </Popconfirm>
          </Space>
        </div>
      )
    }
  ];

  // Filtered users
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.first_name.toLowerCase().includes(searchText.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchText.toLowerCase()) ||
      user.username.toLowerCase().includes(searchText.toLowerCase()) ||
      user.email.toLowerCase().includes(searchText.toLowerCase());
    const matchesRole = roleFilter ? user.role_id === roleFilter : true;
    const matchesStore = storeFilter ? user.store_id === storeFilter : true;
    const matchesStatus = statusFilter !== null ? user.is_active === statusFilter : true;
    return matchesSearch && matchesRole && matchesStore && matchesStatus;
  });

  // Handlers
  const handleEditUser = (record) => {
    setUserModal({ open: true, editing: record });
    userForm.setFieldsValue({
      username: record.username,
      first_name: record.first_name,
      last_name: record.last_name,
      email: record.email,
      phone_number: record.phone_number,
      role_id: record.role_id,
      store_id: record.store_id,
      is_active: record.is_active
    });
  };

  const handleDeleteUser = (userId) => {
    setUsers(users.filter(u => u.user_id !== userId));
    message.success('User deleted');
  };

  const handleToggleUserStatus = (user) => {
    const updatedUser = { ...user, is_active: !user.is_active };
    setUsers(users.map(u => u.user_id === user.user_id ? updatedUser : u));
    message.success(`User ${user.is_active ? 'deactivated' : 'activated'}`);
  };

  const handleUserSave = async (values) => {
    const role = roles.find(r => r.role_id === values.role_id);
    const store = stores.find(s => s.store_id === values.store_id);
    
    const newUser = {
      user_id: userModal.editing ? userModal.editing.user_id : Date.now(),
      username: values.username,
      first_name: values.first_name,
      last_name: values.last_name,
      email: values.email,
      phone_number: values.phone_number,
      role_id: values.role_id,
      role_name: role?.role_name || 'Unknown',
      store_id: values.store_id,
      store_name: store?.store_name || null,
      is_active: values.is_active,
      last_login_at: userModal.editing ? userModal.editing.last_login_at : null,
      created_at: userModal.editing ? userModal.editing.created_at : new Date().toISOString()
    };

    if (userModal.editing) {
      setUsers(users.map(u => u.user_id === newUser.user_id ? newUser : u));
      message.success('User updated');
    } else {
      setUsers([...users, newUser]);
      message.success('User added');
    }
    setUserModal({ open: false, editing: null });
    userForm.resetFields();
  };

  const handlePasswordChange = async (values) => {
    if (values.password !== values.confirm_password) {
      message.error('Passwords do not match');
      return;
    }
    
    // In a real app, this would make an API call to change the password
    message.success('Password changed successfully');
    setPasswordModal({ open: false, userId: null });
    passwordForm.resetFields();
  };

  return (
    <div style={{ background: '#f7f8fa', minHeight: '100vh', padding: 32, fontFamily: 'SF Pro Display, Roboto, Arial, sans-serif' }}>
      {/* Add User Button */}
      <Button type="primary" icon={<PlusOutlined />} style={{ marginBottom: 24 }} onClick={() => setUserModal({ open: true, editing: null })}>
        Add User
      </Button>

      {/* Search and Filters */}
      <Card 
        title="User Management"
        style={{ marginBottom: 24, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }} 
        size="large" 
        actions={
          <Space>
            <SearchBar
              value={searchText}
              onChange={setSearchText}
              placeholder="Search by name, username, or email"
              width={250}
              filters={[
                {
                  placeholder: 'Role',
                  value: roleFilter,
                  onChange: setRoleFilter,
                  options: roles.map(r => ({ value: r.role_id, label: r.role_name })),
                  width: 140,
                },
                {
                  placeholder: 'Store',
                  value: storeFilter,
                  onChange: setStoreFilter,
                  options: stores.map(s => ({ value: s.store_id, label: s.store_name })),
                  width: 140,
                },
                {
                  placeholder: 'Status',
                  value: statusFilter,
                  onChange: setStatusFilter,
                  options: [
                    { value: true, label: 'Active' },
                    { value: false, label: 'Inactive' }
                  ],
                  width: 140,
                },
              ]}
            />
            <Tooltip title="Reload user data to reflect recent changes.">
              <Button icon={<ReloadOutlined />} onClick={() => {}} />
            </Tooltip>
          </Space>
        }
      />

      {/* Users Table */}
      <div style={{ margin: '16px 0 8px 0', fontSize: 18, fontWeight: 500 }}>
        Showing {filteredUsers.length} users
      </div>
      <Card 
        noPadding 
        style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
      >
        {loading ? (
          <Spin style={{ display: 'block', margin: '48px auto' }} size="large" />
        ) : (
          <Table
            columns={columns}
            dataSource={filteredUsers}
            rowKey="user_id"
            scroll={{ x: 1200 }}
            pagination={{ 
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} users`
            }}
            size="middle"
            style={{ fontSize: 15, fontFamily: 'inherit' }}
            sticky
            rowClassName={(record) => {
              if (!record.is_active) return 'inactive-user-row';
              return 'user-row';
            }}
            onRow={(record) => ({
              style: {
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }
            })}
          />
        )}
      </Card>

      {/* User Modal */}
      <Modal
        title={userModal.editing ? 'Edit User' : 'Add User'}
        open={userModal.open}
        onCancel={() => {
          setUserModal({ open: false, editing: null });
          userForm.resetFields();
        }}
        footer={null}
        width={600}
        style={{ borderRadius: 12 }}
      >
        <Alert
          message="User Information"
          description="Fill in the user's personal information, assign a role, and select their store location."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Form
          form={userForm}
          layout="vertical"
          onFinish={handleUserSave}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="first_name"
                label="First Name"
                rules={[{ required: true, message: 'Please enter first name' }]}
              >
                <Input placeholder="Enter first name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="last_name"
                label="Last Name"
                rules={[{ required: true, message: 'Please enter last name' }]}
              >
                <Input placeholder="Enter last name" />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="username"
                label="Username"
                rules={[{ required: true, message: 'Please enter username' }]}
              >
                <Input placeholder="Enter username" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Please enter email' },
                  { type: 'email', message: 'Please enter a valid email' }
                ]}
              >
                <Input placeholder="Enter email" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="phone_number"
            label="Phone Number"
          >
            <Input placeholder="Enter phone number" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="role_id"
                label="Role"
                rules={[{ required: true, message: 'Please select a role' }]}
              >
                <Select placeholder="Select a role">
                  {roles.map(role => (
                    <Select.Option key={role.role_id} value={role.role_id}>
                      {role.role_name} - {role.description}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="store_id"
                label="Store"
              >
                <Select placeholder="Select a store (optional)">
                  {stores.map(store => (
                    <Select.Option key={store.store_id} value={store.store_id}>
                      {store.store_name} ({store.city})
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

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
                {userModal.editing ? 'Update' : 'Add'}
              </Button>
              <Button onClick={() => {
                setUserModal({ open: false, editing: null });
                userForm.resetFields();
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Password Change Modal */}
      <Modal
        title="Change Password"
        open={passwordModal.open}
        onCancel={() => {
          setPasswordModal({ open: false, userId: null });
          passwordForm.resetFields();
        }}
        footer={null}
        width={500}
        style={{ borderRadius: 12 }}
      >
        <Alert
          message="Password Requirements"
          description="Password must be at least 8 characters long and contain a mix of letters, numbers, and special characters."
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handlePasswordChange}
        >
          <Form.Item
            name="password"
            label="New Password"
            rules={[
              { required: true, message: 'Please enter new password' },
              { min: 8, message: 'Password must be at least 8 characters' }
            ]}
          >
            <Input.Password
              placeholder="Enter new password"
              iconRender={(visible) => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
            />
          </Form.Item>
          
          <Form.Item
            name="confirm_password"
            label="Confirm Password"
            rules={[
              { required: true, message: 'Please confirm password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match'));
                },
              }),
            ]}
          >
            <Input.Password
              placeholder="Confirm new password"
              iconRender={(visible) => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<LockOutlined />}>
                Change Password
              </Button>
              <Button onClick={() => {
                setPasswordModal({ open: false, userId: null });
                passwordForm.resetFields();
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <style>{`
        .inactive-user-row {
          background-color: #fafafa;
          opacity: 0.7;
        }
        .inactive-user-row:hover {
          background-color: #f5f5f5;
          opacity: 0.8;
        }
        .user-row:hover {
          background-color: #f0f9ff;
          box-shadow: 0 2px 8px rgba(24, 144, 255, 0.1);
        }
        .ant-table-thead > tr > th {
          background-color: #f8f9fa;
          border-bottom: 2px solid #e9ecef;
          font-weight: 600;
          color: #495057;
        }
        .ant-table-tbody > tr > td {
          border-bottom: 1px solid #f0f0f0;
          padding: 12px 16px;
        }
        .ant-table-tbody > tr:hover > td {
          background-color: transparent !important;
        }
        .ant-tag {
          border-radius: 4px;
          font-weight: 500;
        }
        .ant-btn-text {
          border-radius: 4px;
          transition: all 0.2s ease;
        }
        .ant-btn-text:hover {
          background-color: rgba(24, 144, 255, 0.1);
        }
      `}</style>
    </div>
  );
}

export default UsersPage; 