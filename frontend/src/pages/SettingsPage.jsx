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
  Popconfirm,
  Dropdown
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
  InfoCircleOutlined,
  ShopOutlined,
  DownOutlined
} from '@ant-design/icons';
import { theme } from '../theme';
import { SearchBar, StatusTag, Card as CustomCard } from '../components';
import StoreDrawer from '../components/StoreDrawer';
import dayjs from 'dayjs';
import { useSettings } from '../contexts/SettingsContext';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;

const API_BASE_URL = 'http://localhost:8000/settings';

function SettingsPage() {
  const [activeTab, setActiveTab] = useState('tax');
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const { refreshSettings } = useSettings();
  
  // State for different sections
  const [taxCategories, setTaxCategories] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [systemSettings, setSystemSettings] = useState([]);
  const [stores, setStores] = useState([]);
  const [posTerminals, setPosTerminals] = useState([]);
  const [rolePermissions, setRolePermissions] = useState([]);
  
  // Modal states
  const [taxModal, setTaxModal] = useState({ open: false, editing: null });
  const [paymentModal, setPaymentModal] = useState({ open: false, editing: null });
  const [expenseModal, setExpenseModal] = useState({ open: false, editing: null });
  const [roleModal, setRoleModal] = useState({ open: false, editing: null });
  const [settingModal, setSettingModal] = useState({ open: false, editing: null });
  const [posTerminalModal, setPosTerminalModal] = useState({ open: false, editing: null });
  const [rolePermissionModal, setRolePermissionModal] = useState({ open: false, editing: null });
  
  // Store management states
  const [storeDrawerOpen, setStoreDrawerOpen] = useState(false);
  const [savingStore, setSavingStore] = useState(false);
  const [editingStore, setEditingStore] = useState(null);
  
  // Form instances
  const [taxForm] = Form.useForm();
  const [paymentForm] = Form.useForm();
  const [expenseForm] = Form.useForm();
  const [roleForm] = Form.useForm();
  const [settingForm] = Form.useForm();
  const [posTerminalForm] = Form.useForm();
  const [rolePermissionForm] = Form.useForm();

  // Data fetching functions
  const fetchAllSettingsData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/bulk-data`);
      if (!response.ok) throw new Error('Failed to fetch settings data');
      const data = await response.json();
      
      // Set all data at once
      setTaxCategories(data.tax_categories || []);
      setPaymentMethods(data.payment_methods || []);
      setExpenseCategories(data.expense_categories || []);
      setRoles(data.roles || []);
      setPermissions(data.permissions || []);
      setSystemSettings(data.system_settings || []);
      setPosTerminals(data.pos_terminals || []);
      setRolePermissions(data.role_permissions || []);
      setStores(data.stores || []);
    } catch (error) {
      message.error('Failed to load settings data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Individual fetch functions for specific updates (keeping for compatibility)
  const fetchTaxCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/tax-categories`);
      if (!response.ok) throw new Error('Failed to fetch tax categories');
      const data = await response.json();
      setTaxCategories(data);
    } catch (error) {
      message.error('Failed to load tax categories');
      console.error(error);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/payment-methods`);
      if (!response.ok) throw new Error('Failed to fetch payment methods');
      const data = await response.json();
      setPaymentMethods(data);
    } catch (error) {
      message.error('Failed to load payment methods');
      console.error(error);
    }
  };

  const fetchExpenseCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/expense-categories`);
      if (!response.ok) throw new Error('Failed to fetch expense categories');
      const data = await response.json();
      setExpenseCategories(data);
    } catch (error) {
      message.error('Failed to load expense categories');
      console.error(error);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/roles`);
      if (!response.ok) throw new Error('Failed to fetch roles');
      const data = await response.json();
      setRoles(data);
    } catch (error) {
      message.error('Failed to load roles');
      console.error(error);
    }
  };

  const fetchPermissions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/permissions`);
      if (!response.ok) throw new Error('Failed to fetch permissions');
      const data = await response.json();
      setPermissions(data);
    } catch (error) {
      message.error('Failed to load permissions');
      console.error(error);
    }
  };

  const fetchSystemSettings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/system`);
      if (!response.ok) throw new Error('Failed to fetch system settings');
      const data = await response.json();
      setSystemSettings(data);
    } catch (error) {
      message.error('Failed to load system settings');
      console.error(error);
    }
  };

  const fetchPOSTerminals = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/pos-terminals`);
      if (!response.ok) throw new Error('Failed to fetch POS terminals');
      const data = await response.json();
      setPosTerminals(data);
    } catch (error) {
      message.error('Failed to load POS terminals');
      console.error(error);
    }
  };

  const fetchRolePermissions = async (roleId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/roles/${roleId}/permissions`);
      if (!response.ok) throw new Error('Failed to fetch role permissions');
      const data = await response.json();
      setRolePermissions(prev => [...prev, ...data]);
    } catch (error) {
      message.error('Failed to load role permissions');
      console.error(error);
    }
  };

  // Initial data loading - optimized to use bulk data
  useEffect(() => {
    fetchAllSettingsData();
  }, []);

  // Remove the separate role permissions fetching since it's now included in bulk data
  // useEffect(() => {
  //   // Fetch permissions for each role
  //   if (roles.length > 0) {
  //     setRolePermissions([]); // Clear existing permissions
  //     roles.forEach(role => {
  //       fetchRolePermissions(role.role_id);
  //     });
  //   }
  // }, [roles]);

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
      render: (rate) => {
        const numRate = parseFloat(rate);
        return (
        <Text strong style={{ color: theme.primary }}>
            {isNaN(numRate) ? '0.00' : numRate.toFixed(2)}%
        </Text>
        );
      }
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
      render: (text, record) => (
        <Tooltip title={record.help_text} placement="topLeft">
          <Text strong style={{ cursor: 'help' }}>{text}</Text>
        </Tooltip>
      )
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

  // Stores Section
  const storeColumns = [
    {
      title: 'Store Name',
      dataIndex: 'store_name',
      key: 'store_name',
      render: (text, record) => (
        <div>
          <Text strong>{text}</Text>
          {!record.is_active && <Tag color="red" style={{ marginLeft: 8 }}>Inactive</Tag>}
        </div>
      )
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
      render: (text) => <Text>{text}</Text>
    },
    {
      title: 'City',
      dataIndex: 'city',
      key: 'city',
      render: (text) => <Text>{text}</Text>
    },
    {
      title: 'Phone',
      dataIndex: 'phone_number',
      key: 'phone_number',
      render: (text) => <Text>{text}</Text>
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
              onClick={() => {
                setEditingStore(record);
                setStoreDrawerOpen(true);
              }}
            />
          </Tooltip>
          <Popconfirm
            title="Delete this store?"
            onConfirm={() => handleDeleteStore(record)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  // POS Terminals Section
  const posTerminalColumns = [
    {
      title: 'Terminal Name',
      dataIndex: 'terminal_name',
      key: 'terminal_name',
      render: (text, record) => (
        <div>
          <Text strong>{text}</Text>
          {!record.is_active && <Tag color="red" style={{ marginLeft: 8 }}>Inactive</Tag>}
        </div>
      )
    },
    {
      title: 'IP Address',
      dataIndex: 'ip_address',
      key: 'ip_address',
      render: (text) => <Text code>{text}</Text>
    },
    {
      title: 'Store',
      dataIndex: 'store_name',
      key: 'store_name',
      render: (text) => <Text>{text}</Text>
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
              onClick={() => handleEditPosTerminal(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Delete this POS terminal?"
            onConfirm={() => handleDeletePosTerminal(record.terminal_id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  // Handlers for Tax Categories
  const handleEditTax = (record) => {
    setTaxModal({ open: true, editing: record });
    taxForm.setFieldsValue({
      tax_category_name: record.tax_category_name,
      tax_rate: record.tax_rate,
      effective_date: dayjs(record.effective_date),
      is_active: record.is_active
    });
  };

  const handleDeleteTax = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tax-categories/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete tax category');
    message.success('Tax category deleted');
      // Use optimized refresh
      fetchAllSettingsData();
    } catch (error) {
      message.error('Failed to delete tax category');
      console.error(error);
    }
  };

  const handleTaxSave = async (values) => {
    try {
      const payload = {
        ...values,
        effective_date: values.effective_date.format('YYYY-MM-DD')
      };

      const url = taxModal.editing 
        ? `${API_BASE_URL}/tax-categories/${taxModal.editing.tax_category_id}`
        : `${API_BASE_URL}/tax-categories`;

      const response = await fetch(url, {
        method: taxModal.editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Failed to save tax category');
      
      message.success(`Tax category ${taxModal.editing ? 'updated' : 'added'}`);
    setTaxModal({ open: false, editing: null });
    taxForm.resetFields();
      // Use optimized refresh
      fetchAllSettingsData();
    } catch (error) {
      message.error('Failed to save tax category');
      console.error(error);
    }
  };

  // Handlers for Payment Methods
  const handleEditPayment = (record) => {
    setPaymentModal({ open: true, editing: record });
    paymentForm.setFieldsValue({
      method_name: record.method_name,
      is_active: record.is_active
    });
  };

  const handleDeletePayment = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/payment-methods/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete payment method');
    message.success('Payment method deleted');
      // Use optimized refresh
      fetchAllSettingsData();
    } catch (error) {
      message.error('Failed to delete payment method');
      console.error(error);
    }
  };

  const handlePaymentSave = async (values) => {
    try {
      const url = paymentModal.editing 
        ? `${API_BASE_URL}/payment-methods/${paymentModal.editing.payment_method_id}`
        : `${API_BASE_URL}/payment-methods`;

      const response = await fetch(url, {
        method: paymentModal.editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });

      if (!response.ok) throw new Error('Failed to save payment method');
      
      message.success(`Payment method ${paymentModal.editing ? 'updated' : 'added'}`);
    setPaymentModal({ open: false, editing: null });
    paymentForm.resetFields();
      // Use optimized refresh
      fetchAllSettingsData();
    } catch (error) {
      message.error('Failed to save payment method');
      console.error(error);
    }
  };

  // Handlers for Expense Categories
  const handleEditExpense = (record) => {
    setExpenseModal({ open: true, editing: record });
    expenseForm.setFieldsValue({
      category_name: record.category_name
    });
  };

  const handleDeleteExpense = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/expense-categories/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete expense category');
    message.success('Expense category deleted');
      // Use optimized refresh
      fetchAllSettingsData();
    } catch (error) {
      message.error('Failed to delete expense category');
      console.error(error);
    }
  };

  const handleExpenseSave = async (values) => {
    try {
      const url = expenseModal.editing 
        ? `${API_BASE_URL}/expense-categories/${expenseModal.editing.category_id}`
        : `${API_BASE_URL}/expense-categories`;

      const response = await fetch(url, {
        method: expenseModal.editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });

      if (!response.ok) throw new Error('Failed to save expense category');
      
      message.success(`Expense category ${expenseModal.editing ? 'updated' : 'added'}`);
    setExpenseModal({ open: false, editing: null });
    expenseForm.resetFields();
      // Use optimized refresh
      fetchAllSettingsData();
    } catch (error) {
      message.error('Failed to save expense category');
      console.error(error);
    }
  };

  // Handlers for Roles
  const handleEditRole = (record) => {
    setRoleModal({ open: true, editing: record });
    roleForm.setFieldsValue({
      role_name: record.role_name,
      description: record.description
    });
  };

  const handleDeleteRole = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/roles/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete role');
    message.success('Role deleted');
      // Use optimized refresh
      fetchAllSettingsData();
    } catch (error) {
      message.error('Failed to delete role');
      console.error(error);
    }
  };

  const handleRoleSave = async (values) => {
    try {
      const url = roleModal.editing 
        ? `${API_BASE_URL}/roles/${roleModal.editing.role_id}`
        : `${API_BASE_URL}/roles`;

      const response = await fetch(url, {
        method: roleModal.editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });

      if (!response.ok) throw new Error('Failed to save role');
      
      message.success(`Role ${roleModal.editing ? 'updated' : 'added'}`);
    setRoleModal({ open: false, editing: null });
    roleForm.resetFields();
      // Use optimized refresh
      fetchAllSettingsData();
    } catch (error) {
      message.error('Failed to save role');
      console.error(error);
    }
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
    try {
      const url = settingModal.editing 
        ? `${API_BASE_URL}/system/${settingModal.editing.setting_id}`
        : `${API_BASE_URL}/system`;

      const response = await fetch(url, {
        method: settingModal.editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });

      if (!response.ok) throw new Error('Failed to save setting');
      
      message.success(`Setting ${settingModal.editing ? 'updated' : 'added'}`);
      setSettingModal({ open: false, editing: null });
      settingForm.resetFields();
      // Use optimized refresh
      fetchAllSettingsData();
      // Refresh global settings context
      refreshSettings();
    } catch (error) {
      message.error('Failed to save setting');
      console.error(error);
    }
  };

  // Store management functions
  useEffect(() => {
    // Stores are now loaded with bulk data, no need for separate fetch
  }, []);

  function handleAddStore(values) {
    setSavingStore(true);
    const isEdit = !!editingStore;
    const url = isEdit ? `http://localhost:8000/inventory/stores/${editingStore.store_id}` : 'http://localhost:8000/inventory/stores';
    const method = isEdit ? 'PUT' : 'POST';
    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values)
    })
      .then(async r => {
        if (!r.ok) throw new Error(await r.text());
        return r.json();
      })
      .then(store => {
        setStoreDrawerOpen(false);
        setEditingStore(null);
        setSavingStore(false);
        message.success(isEdit ? 'Store updated' : 'Store added');
        // Use optimized refresh
        fetchAllSettingsData();
      })
      .catch(err => {
        setSavingStore(false);
        message.error(isEdit ? 'Failed to update store' : 'Failed to add store');
      });
  }

  function handleDeleteStore(store) {
    // Confirm before deleting
    window.confirm = window.confirm || ((msg) => true); // fallback for environments without confirm
    if (window.confirm(`Are you sure you want to delete store "${store.store_name}"?`)) {
      fetch(`http://localhost:8000/inventory/stores/${store.store_id}`, {
        method: 'DELETE',
      })
        .then(async r => {
          if (!r.ok) throw new Error(await r.text());
          message.success('Store deleted');
          // Use optimized refresh
          fetchAllSettingsData();
        })
        .catch(() => message.error('Failed to delete store'));
    }
  }

  // Handlers for POS Terminals
  const handleEditPosTerminal = (record) => {
    setPosTerminalModal({ open: true, editing: record });
    posTerminalForm.setFieldsValue({
      terminal_name: record.terminal_name,
      ip_address: record.ip_address,
      store_id: record.store_id,
      is_active: record.is_active
    });
  };

  const handleDeletePosTerminal = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/pos-terminals/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete POS terminal');
    message.success('POS terminal deleted');
      // Use optimized refresh
      fetchAllSettingsData();
    } catch (error) {
      message.error('Failed to delete POS terminal');
      console.error(error);
    }
  };

  const handlePosTerminalSave = async (values) => {
    try {
      const url = posTerminalModal.editing 
        ? `${API_BASE_URL}/pos-terminals/${posTerminalModal.editing.terminal_id}`
        : `${API_BASE_URL}/pos-terminals`;

      const response = await fetch(url, {
        method: posTerminalModal.editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });

      if (!response.ok) throw new Error('Failed to save POS terminal');
      
      message.success(`POS terminal ${posTerminalModal.editing ? 'updated' : 'added'}`);
    setPosTerminalModal({ open: false, editing: null });
    posTerminalForm.resetFields();
      // Use optimized refresh
      fetchAllSettingsData();
    } catch (error) {
      message.error('Failed to save POS terminal');
      console.error(error);
    }
  };

  // Handlers for Role Permissions
  const handleRoleClick = (role) => {
    // This could be used to highlight selected role or show role details
    console.log('Role clicked:', role);
  };

  const handleRemoveRolePermission = async (roleId, permissionId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/roles/${roleId}/permissions/${permissionId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to remove permission from role');
    message.success('Permission removed from role');
      // Use optimized refresh
      fetchAllSettingsData();
    } catch (error) {
      message.error('Failed to remove permission');
      console.error(error);
    }
  };

  const handleRemoveAllRolePermissions = async (roleId) => {
    const roleName = roles.find(r => r.role_id === roleId)?.role_name || 'Unknown Role';
    if (window.confirm(`Are you sure you want to remove all permissions from the "${roleName}" role?`)) {
      try {
        // Get all permissions for this role
        const rolePerms = rolePermissions.filter(rp => rp.role_id === roleId);
        // Remove each permission
        for (const rp of rolePerms) {
          await handleRemoveRolePermission(roleId, rp.permission_id);
        }
      message.success(`All permissions removed from ${roleName} role`);
      } catch (error) {
        message.error('Failed to remove all permissions');
        console.error(error);
      }
    }
  };

  const handleRolePermissionSave = async (values) => {
    try {
      const response = await fetch(`${API_BASE_URL}/roles/${values.role_id}/permissions/${values.permission_id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) throw new Error('Failed to assign permission to role');
      
      message.success('Permission assigned to role');
      setRolePermissionModal({ open: false, editing: null });
      rolePermissionForm.resetFields();
      
      // Use optimized refresh
      fetchAllSettingsData();
    } catch (error) {
      message.error('Failed to assign permission');
      console.error(error);
    }
  };

  // Predefined Settings Templates
  const settingTemplates = [
    {
      key: 'business_info',
      label: 'Business Information',
      settings: [
        { setting_key: 'store_name', setting_value: '', label: 'Store Name' },
        { setting_key: 'store_address', setting_value: '', label: 'Store Address' },
        { setting_key: 'store_phone', setting_value: '', label: 'Phone Number' },
        { setting_key: 'store_email', setting_value: '', label: 'Email' },
        { setting_key: 'tax_number', setting_value: '', label: 'Tax Registration Number' }
      ]
    },
    {
      key: 'receipt_settings',
      label: 'Receipt Settings',
      settings: [
        { setting_key: 'receipt_header', setting_value: 'Thank you for shopping with us!', label: 'Receipt Header' },
        { setting_key: 'receipt_footer', setting_value: 'Please come again!', label: 'Receipt Footer' },
        { setting_key: 'show_tax_on_receipt', setting_value: 'true', label: 'Show Tax on Receipt' },
        { setting_key: 'receipt_print_copies', setting_value: '1', label: 'Number of Receipt Copies' }
      ]
    },
    {
      key: 'display_settings',
      label: 'Display Settings',
      settings: [
        { setting_key: 'currency_symbol', setting_value: '$', label: 'Currency Symbol' },
        { setting_key: 'date_format', setting_value: 'MM/DD/YYYY', label: 'Date Format' },
        { setting_key: 'time_format', setting_value: '12', label: 'Time Format (12/24)' }
      ]
    },
    {
      key: 'invoice_settings',
      label: 'Invoice Settings',
      settings: [
        { setting_key: 'invoice_prefix', setting_value: 'INV-', label: 'Invoice Number Prefix' },
        { setting_key: 'invoice_starting_number', setting_value: '1001', label: 'Starting Invoice Number' },
        { setting_key: 'invoice_terms', setting_value: 'Net 30', label: 'Default Payment Terms' }
      ]
    }
  ];

  // Quick Add Settings Modal
  const [quickAddModal, setQuickAddModal] = useState({ open: false, template: null });

  const handleQuickAdd = (template) => {
    setQuickAddModal({ open: true, template });
  };

  const handleQuickAddSave = async (values) => {
    try {
      setLoading(true);
      const template = settingTemplates.find(t => t.key === quickAddModal.template);
      if (!template) {
        message.error('Template not found');
        return;
      }

      // Create all settings from the template
      const settingsToCreate = template.settings.map(setting => ({
        setting_key: setting.setting_key,
        setting_value: values[setting.setting_key] || setting.setting_value,
        store_id: values.store_id || null
      }));

      let successCount = 0;
      let failedSettings = [];

      for (const setting of settingsToCreate) {
        try {
          const response = await fetch(`${API_BASE_URL}/system`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(setting)
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
            throw new Error(errorData.detail || `Failed to create setting: ${setting.setting_key}`);
          }

          successCount++;
        } catch (settingError) {
          console.error(`Failed to create setting ${setting.setting_key}:`, settingError);
          failedSettings.push({
            key: setting.setting_key,
            error: settingError.message
          });
        }
      }

      // Show appropriate success/error messages
      if (successCount === settingsToCreate.length) {
        message.success(`${template.label} settings added successfully (${successCount} settings)`);
      } else if (successCount > 0) {
        message.warning(`Partially successful: ${successCount} settings added, ${failedSettings.length} failed`);
        console.warn('Failed settings:', failedSettings);
      } else {
        message.error(`Failed to add any settings from ${template.label}`);
        console.error('All settings failed:', failedSettings);
      }

      // Use optimized refresh
      fetchAllSettingsData();
      // Refresh global settings context
      refreshSettings();
      setQuickAddModal({ open: false, template: null });
    } catch (error) {
      message.error(`Failed to add settings: ${error.message}`);
      console.error('Quick Add Settings error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add Quick Settings button to the toolbar
  const settingsToolbar = (
    <Space>
      <Button type="primary" onClick={() => setSettingModal({ open: true, editing: null })} icon={<PlusOutlined />}>
        Add Setting
      </Button>
      <Dropdown
        menu={{
          items: settingTemplates.map(template => ({
            key: template.key,
            label: template.label,
            onClick: () => handleQuickAdd(template.key)
          }))
        }}
      >
        <Button icon={<SettingOutlined />}>
          Quick Add Settings <DownOutlined />
        </Button>
      </Dropdown>
    </Space>
  );

  // Quick Add Settings Modal Component
  const QuickAddSettingsModal = () => {
    const template = settingTemplates.find(t => t.key === quickAddModal.template);
    if (!template) return null;

    return (
      <Modal
        title={`Add ${template.label}`}
        open={quickAddModal.open}
        onCancel={() => setQuickAddModal({ open: false, template: null })}
        footer={null}
        width={600}
      >
        <Form
          layout="vertical"
          onFinish={handleQuickAddSave}
        >
          {template.settings.map(setting => (
            <Form.Item
              key={setting.setting_key}
              name={setting.setting_key}
              label={setting.label}
              initialValue={setting.setting_value}
            >
              <Input placeholder={`Enter ${setting.label.toLowerCase()}`} />
            </Form.Item>
          ))}
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
                Save All Settings
              </Button>
              <Button onClick={() => setQuickAddModal({ open: false, template: null })}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    );
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

      <Alert
        message="System Settings Guide"
        description={
          <div>
            <p><strong>Tax Categories:</strong> Set up different tax rates (e.g., 18% for regular items, 0% for food items)</p>
            <p><strong>Payment Methods:</strong> Configure how customers can pay (Cash, Credit Card, etc.)</p>
            <p><strong>Expense Categories:</strong> Organize business expenses (Rent, Utilities, etc.)</p>
            <p><strong>Roles & Permissions:</strong> Define what different types of users can do in the system</p>
            <p><strong>Stores:</strong> Manage different store locations</p>
            <p><strong>POS Terminals:</strong> Configure cash registers and payment devices</p>
            <p><strong>System Settings:</strong> General system configuration like company name, currency, etc.</p>
          </div>
        }
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Spin spinning={loading}>
      <Card
        style={{
          borderRadius: theme.borderRadius,
          boxShadow: theme.cardShadow,
          background: theme.cardBg
        }}
          styles={{ body: { padding: 0 } }}
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
                  <Tooltip title="Roles are like job titles (Manager, Cashier). Permissions are specific actions (create sales, view reports). Here you define what each role can do.">
                    <InfoCircleOutlined style={{ marginLeft: 4, color: theme.primary, cursor: 'help' }} />
                  </Tooltip>
                </span>
              ),
              children: (
                <div style={{ padding: '24px 0' }}>
                  <Alert
                    message="Understanding Roles and Permissions"
                    description={
                      <div>
                        <p><strong>Roles</strong> are like job titles (e.g., Manager, Cashier). Each role has specific permissions.</p>
                        <p><strong>Permissions</strong> are specific actions that can be done in the system (e.g., create sales, view reports).</p>
                        <p><strong>Example:</strong> A "Manager" role might have permissions to "create sales", "view reports", and "manage inventory".</p>
                        <p><strong>Note:</strong> You create roles and assign permissions here. You create actual users and assign them roles in the Users page.</p>
                      </div>
                    }
                    type="info"
                    showIcon
                    style={{ marginBottom: 24 }}
                  />
                  <Row gutter={[24, 24]}>
                    <Col span={8}>
                      <Card
                        title={
                          <span>
                            <UserOutlined style={{ marginRight: 8 }} />
                            Roles
                            <Tooltip title="Roles are like job titles. Each role defines what type of user someone is (e.g., Manager, Cashier, Stock Keeper).">
                              <InfoCircleOutlined style={{ marginLeft: 8, color: theme.primary, cursor: 'help' }} />
                            </Tooltip>
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
                          onRow={(record) => ({
                            onClick: () => handleRoleClick(record),
                            style: { cursor: 'pointer' }
                          })}
                        />
                      </Card>
                    </Col>
                    <Col span={8}>
                      <Card
                        title={
                          <span>
                            <SafetyCertificateOutlined style={{ marginRight: 8 }} />
                            Available Permissions
                            <Tooltip title="Permissions are specific actions that can be done in the system. Each permission allows a user to do one specific thing (e.g., create sales, view reports).">
                              <InfoCircleOutlined style={{ marginLeft: 8, color: theme.primary, cursor: 'help' }} />
                            </Tooltip>
                          </span>
                        }
                        style={{ borderRadius: theme.borderRadius }}
                      >
                        <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                          {permissions.map(permission => (
                            <Tooltip 
                              key={permission.permission_id}
                              title={permission.help_text} 
                              placement="topLeft"
                            >
                              <div
                                style={{
                                  padding: '8px 12px',
                                  border: '1px solid #f0f0f0',
                                  borderRadius: 6,
                                  marginBottom: 8,
                                  background: '#fafafa',
                                  cursor: 'help'
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
                            </Tooltip>
                          ))}
                        </div>
                      </Card>
                    </Col>
                    <Col span={8}>
                      <Card
                        title={
                          <span>
                            <CheckCircleOutlined style={{ marginRight: 8 }} />
                            Role Permissions
                            <Tooltip title="This shows what each role can do. Each role can have multiple permissions. For example, a Manager can create sales, view reports, and manage inventory.">
                              <InfoCircleOutlined style={{ marginLeft: 8, color: theme.primary, cursor: 'help' }} />
                            </Tooltip>
                          </span>
                        }
                        extra={
                          <Button
                            type="primary"
                            size="small"
                            icon={<PlusOutlined />}
                            onClick={() => setRolePermissionModal({ open: true, editing: null })}
                          >
                            Assign Permission
                          </Button>
                        }
                        style={{ borderRadius: theme.borderRadius }}
                      >
                        <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                          {(() => {
                            // Group permissions by role
                            const groupedPermissions = {};
                            rolePermissions.forEach(rp => {
                              if (!groupedPermissions[rp.role_id]) {
                                groupedPermissions[rp.role_id] = {
                                  role_name: rp.role_name,
                                  permissions: []
                                };
                              }
                              groupedPermissions[rp.role_id].permissions.push(rp.permission_name);
                            });

                            return Object.entries(groupedPermissions).map(([roleId, roleData]) => (
                              <div
                                key={roleId}
                                style={{
                                  padding: '12px',
                                  border: '1px solid #e6f7ff',
                                  borderRadius: 8,
                                  marginBottom: 12,
                                  background: '#f6ffed'
                                }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                  <Text strong style={{ fontSize: 14, color: theme.primary }}>
                                    {roleData.role_name}
                                  </Text>
                                  <Text type="secondary" style={{ fontSize: 11 }}>
                                    {roleData.permissions.length} permission{roleData.permissions.length !== 1 ? 's' : ''}
                                  </Text>
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                  {roleData.permissions.map((permission, index) => (
                                    <Tag
                                      key={index}
                                      color="blue"
                                      style={{ margin: 0, fontSize: 11 }}
                                    >
                                      {permission}
                                    </Tag>
                                  ))}
                                </div>
                                <div style={{ marginTop: 8, textAlign: 'right' }}>
                                  <Button
                                    type="text"
                                    size="small"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() => handleRemoveAllRolePermissions(parseInt(roleId))}
                                  >
                                    Remove All
                                  </Button>
                                </div>
                              </div>
                            ));
                          })()}
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
                    {settingsToolbar}
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
            },
            {
              key: 'stores',
              label: (
                <span>
                  <ShopOutlined style={{ marginRight: 8 }} />
                  Stores
                </span>
              ),
              children: (
                <div style={{ padding: '24px 0' }}>
                  <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <SearchBar
                      placeholder="Search stores..."
                      value={searchText}
                      onChange={setSearchText}
                      style={{ width: 300 }}
                    />
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => setStoreDrawerOpen(true)}
                    >
                      Add Store
                    </Button>
                  </div>
                  <Table
                    columns={storeColumns}
                    dataSource={stores.filter(s => 
                      s.store_name.toLowerCase().includes(searchText.toLowerCase()) ||
                      s.address.toLowerCase().includes(searchText.toLowerCase()) ||
                      s.city.toLowerCase().includes(searchText.toLowerCase())
                    )}
                    rowKey="store_id"
                    pagination={{ pageSize: 10 }}
                    size="middle"
                  />
                </div>
              )
            },
            {
              key: 'pos-terminals',
              label: (
                <span>
                  <BankOutlined style={{ marginRight: 8 }} />
                  POS Terminals
                </span>
              ),
              children: (
                <div style={{ padding: '24px 0' }}>
                  <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <SearchBar
                      placeholder="Search POS terminals..."
                      value={searchText}
                      onChange={setSearchText}
                      style={{ width: 300 }}
                    />
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => setPosTerminalModal({ open: true, editing: null })}
                    >
                      Add POS Terminal
                    </Button>
                  </div>
                  <Table
                    columns={posTerminalColumns}
                    dataSource={posTerminals.filter(t => 
                      t.terminal_name.toLowerCase().includes(searchText.toLowerCase()) ||
                      t.ip_address.toLowerCase().includes(searchText.toLowerCase()) ||
                      t.store_name.toLowerCase().includes(searchText.toLowerCase())
                    )}
                    rowKey="terminal_id"
                    pagination={{ pageSize: 10 }}
                    size="middle"
                  />
                </div>
              )
            }
          ]}
        />
      </Card>
      </Spin>

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

      {/* POS Terminal Modal */}
      <Modal
        title={posTerminalModal.editing ? 'Edit POS Terminal' : 'Add POS Terminal'}
        open={posTerminalModal.open}
        onCancel={() => {
          setPosTerminalModal({ open: false, editing: null });
          posTerminalForm.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form
          form={posTerminalForm}
          layout="vertical"
          onFinish={handlePosTerminalSave}
        >
          <Form.Item
            name="terminal_name"
            label="Terminal Name"
            rules={[{ required: true, message: 'Please enter terminal name' }]}
          >
            <Input placeholder="e.g., POS-001" />
          </Form.Item>
          <Form.Item
            name="ip_address"
            label="IP Address"
            rules={[{ required: true, message: 'Please enter IP address' }]}
          >
            <Input placeholder="e.g., 192.168.1.100" />
          </Form.Item>
          <Form.Item
            name="store_id"
            label="Store"
            rules={[{ required: true, message: 'Please select a store' }]}
          >
            <Select placeholder="Select a store">
              {stores.map(store => (
                <Select.Option key={store.store_id} value={store.store_id}>
                  {store.store_name}
                </Select.Option>
              ))}
            </Select>
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
                {posTerminalModal.editing ? 'Update' : 'Add'}
              </Button>
              <Button onClick={() => {
                setPosTerminalModal({ open: false, editing: null });
                posTerminalForm.resetFields();
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Role Permission Modal */}
      <Modal
        title="Assign Permission to Role"
        open={rolePermissionModal.open}
        onCancel={() => {
          setRolePermissionModal({ open: false, editing: null });
          rolePermissionForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Alert
          message="What does this do?"
          description="This allows you to give a specific role the ability to perform a specific action. For example, you can give the 'Manager' role the permission to 'view reports' so that all managers can see sales reports."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Form
          form={rolePermissionForm}
          layout="vertical"
          onFinish={handleRolePermissionSave}
        >
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
          <Form.Item
            name="permission_id"
            label="Permission"
            rules={[{ required: true, message: 'Please select a permission' }]}
          >
            <Select placeholder="Select a permission">
              {permissions.map(permission => (
                <Select.Option key={permission.permission_id} value={permission.permission_id}>
                  {permission.permission_name} - {permission.description}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                Assign Permission
              </Button>
              <Button onClick={() => {
                setRolePermissionModal({ open: false, editing: null });
                rolePermissionForm.resetFields();
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Store Drawer */}
      <StoreDrawer
        open={storeDrawerOpen}
        onClose={() => { setStoreDrawerOpen(false); setEditingStore(null); }}
        onSave={handleAddStore}
        saving={savingStore}
        initialValues={editingStore || {}}
        isEditing={!!editingStore}
      />

      {/* Add Quick Settings Modal */}
      <QuickAddSettingsModal />
    </div>
  );
}

export default SettingsPage; 