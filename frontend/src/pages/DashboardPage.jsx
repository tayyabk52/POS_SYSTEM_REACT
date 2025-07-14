import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Table, Typography, Alert, Button, message, Spin, Badge } from 'antd';
import { DollarOutlined, UserOutlined, ExclamationCircleOutlined, CalendarOutlined, ShopOutlined, PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { theme } from '../theme';
import StoreDrawer from '../components/StoreDrawer';

const { Title } = Typography;

const cardIconStyle = {
  fontSize: 38,
  marginRight: 20,
  color: theme.primary,
  verticalAlign: 'middle',
  filter: 'drop-shadow(0 2px 8px #eaf3ff)'
};

function DashboardPage() {
  const [salesSummary, setSalesSummary] = useState({ total_sales: 0, num_sales: 0, date: '' });
  const [customerCount, setCustomerCount] = useState(0);
  const [inventoryAlerts, setInventoryAlerts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [stores, setStores] = useState([]);
  const [storeDrawerOpen, setStoreDrawerOpen] = useState(false);
  const [savingStore, setSavingStore] = useState(false);
  const [editingStore, setEditingStore] = useState(null);

  useEffect(() => {
    console.log('DashboardPage mounted - routing is working!');
    
    // Test backend connectivity
    fetch('http://localhost:8000/dashboard/sales-summary')
      .then(response => {
        if (response.ok) {
          setBackendStatus('connected');
          return response.json();
        } else {
          setBackendStatus('error');
          throw new Error('Backend error');
        }
      })
      .then(setSalesSummary)
      .catch(() => {
        setBackendStatus('error');
        setSalesSummary({ total_sales: 0, num_sales: 0, date: 'No data' });
      });

    fetch('http://localhost:8000/dashboard/customer-count').then(r => r.json()).then(d => setCustomerCount(d.customer_count)).catch(() => setCustomerCount(0));
    fetch('http://localhost:8000/dashboard/inventory-alerts').then(r => r.json()).then(d => setInventoryAlerts(d.alerts)).catch(() => setInventoryAlerts([]));
    fetch('http://localhost:8000/dashboard/recent-transactions').then(r => r.json()).then(d => setTransactions(d.transactions)).catch(() => setTransactions([]));
    fetchStores();
  }, []);

  function fetchStores() {
    fetch('http://localhost:8000/inventory/stores')
      .then(r => r.json())
      .then(data => setStores(data))
      .catch(() => setStores([]));
  }

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
        fetchStores();
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
          fetchStores();
        })
        .catch(() => message.error('Failed to delete store'));
    }
  }

  const columns = [
    { title: 'Order ID', dataIndex: 'sale_id', key: 'sale_id', width: 110 },
    { title: 'Invoice', dataIndex: 'invoice_number', key: 'invoice_number', width: 120 },
    { title: 'Date', dataIndex: 'sale_date', key: 'sale_date', render: d => d ? new Date(d).toLocaleString() : '', width: 180 },
    { title: 'User', dataIndex: 'username', key: 'username', width: 120 },
    { title: 'Amount', dataIndex: 'grand_total', key: 'grand_total', render: v => `PKR ${v.toFixed(2)}`, width: 120 },
  ];

  const storeColumns = [
    { title: 'Name', dataIndex: 'store_name', key: 'store_name' },
    { title: 'Address', dataIndex: 'address', key: 'address' },
    { title: 'City', dataIndex: 'city', key: 'city' },
    { title: 'Phone', dataIndex: 'phone_number', key: 'phone_number' },
    { title: 'Active', dataIndex: 'is_active', key: 'is_active', render: v => v ? <Badge status="success" text="Active" /> : <Badge status="default" text="Inactive" /> },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <span>
          <Button size="small" icon={<EditOutlined />} style={{ marginRight: 8 }} onClick={() => { setEditingStore(record); setStoreDrawerOpen(true); }} />
          <Button size="small" icon={<DeleteOutlined />} danger onClick={() => handleDeleteStore(record)} />
        </span>
      ),
    },
  ];

  return (
    <div style={{ background: theme.contentBg, minHeight: '100vh', padding: 40, animation: theme.fadeIn, fontFamily: theme.fontFamily }}>
      <Alert
        message={`Dashboard Page Loaded Successfully! Backend Status: ${backendStatus}`}
        type={backendStatus === 'connected' ? 'success' : backendStatus === 'checking' ? 'info' : 'error'}
        style={{ marginBottom: 24 }}
        showIcon
      />
      
      <Row gutter={[32, 32]}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} hoverable style={{ borderRadius: theme.borderRadius, boxShadow: theme.cardShadow, minHeight: 140, background: theme.cardBg, transition: 'box-shadow 0.2s, transform 0.2s', marginBottom: 8 }} bodyStyle={{ padding: theme.cardPadding, display: 'flex', alignItems: 'center' }}>
            <DollarOutlined style={cardIconStyle} />
            <div>
              <div style={{ fontWeight: theme.fontWeightMedium, fontSize: theme.fontSizeCardTitle, color: theme.text, marginBottom: 2 }}>Today's Sales</div>
              <div style={{ fontWeight: theme.fontWeightBold, fontSize: theme.fontSizeCardNumber, color: theme.primary, lineHeight: 1.1 }}>PKR {salesSummary.total_sales.toFixed(2)}</div>
              <div style={{ color: theme.textSecondary, fontWeight: theme.fontWeightRegular, fontSize: theme.fontSizeCardSub, marginTop: 2 }}>{salesSummary.num_sales} sales</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} hoverable style={{ borderRadius: theme.borderRadius, boxShadow: theme.cardShadow, minHeight: 140, background: theme.cardBg, transition: 'box-shadow 0.2s, transform 0.2s', marginBottom: 8 }} bodyStyle={{ padding: theme.cardPadding, display: 'flex', alignItems: 'center' }}>
            <UserOutlined style={cardIconStyle} />
            <div>
              <div style={{ fontWeight: theme.fontWeightMedium, fontSize: theme.fontSizeCardTitle, color: theme.text, marginBottom: 2 }}>Customers</div>
              <div style={{ fontWeight: theme.fontWeightBold, fontSize: theme.fontSizeCardNumber, color: theme.text, lineHeight: 1.1 }}>{customerCount}</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} hoverable style={{ borderRadius: theme.borderRadius, boxShadow: theme.cardShadow, minHeight: 140, background: theme.cardBg, transition: 'box-shadow 0.2s, transform 0.2s', marginBottom: 8 }} bodyStyle={{ padding: theme.cardPadding, display: 'flex', alignItems: 'center' }}>
            <ExclamationCircleOutlined style={{ ...cardIconStyle, color: theme.warning }} />
            <div>
              <div style={{ fontWeight: theme.fontWeightMedium, fontSize: theme.fontSizeCardTitle, color: theme.text, marginBottom: 2 }}>Inventory Alerts</div>
              <div style={{ fontWeight: theme.fontWeightBold, fontSize: theme.fontSizeCardNumber, color: theme.warning, lineHeight: 1.1 }}>{inventoryAlerts.length}</div>
              {inventoryAlerts.length > 0 && <ul style={{ margin: 0, padding: 0, listStyle: 'none', fontSize: theme.fontSizeCardSub, marginTop: 6 }}>
                {inventoryAlerts.map(a => <li key={a.product_name + a.store_name}>{a.product_name} ({a.store_name}): <b style={{ color: theme.warning }}>{a.current_stock}</b> / {a.reorder_level}</li>)}
              </ul>}
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} hoverable style={{ borderRadius: theme.borderRadius, boxShadow: theme.cardShadow, minHeight: 140, background: theme.cardBg, transition: 'box-shadow 0.2s, transform 0.2s', marginBottom: 8 }} bodyStyle={{ padding: theme.cardPadding, display: 'flex', alignItems: 'center' }}>
            <CalendarOutlined style={{ ...cardIconStyle, color: theme.text }} />
            <div>
              <div style={{ fontWeight: theme.fontWeightMedium, fontSize: theme.fontSizeCardTitle, color: theme.text, marginBottom: 2 }}>Date</div>
              <div style={{ fontWeight: theme.fontWeightBold, fontSize: theme.fontSizeCardNumber, color: theme.text, lineHeight: 1.1 }}>{salesSummary.date}</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} hoverable style={{ borderRadius: theme.borderRadius, boxShadow: theme.cardShadow, minHeight: 140, background: theme.cardBg, transition: 'box-shadow 0.2s, transform 0.2s', marginBottom: 8 }} bodyStyle={{ padding: theme.cardPadding, display: 'flex', alignItems: 'center' }}>
            <ShopOutlined style={cardIconStyle} />
            <div>
              <div style={{ fontWeight: theme.fontWeightMedium, fontSize: theme.fontSizeCardTitle, color: theme.text, marginBottom: 2 }}>Stores</div>
              <div style={{ fontWeight: theme.fontWeightBold, fontSize: theme.fontSizeCardNumber, color: theme.primary, lineHeight: 1.1 }}>{stores.length}</div>
              <Button type="primary" icon={<PlusOutlined />} size="small" style={{ marginTop: 8 }} onClick={() => setStoreDrawerOpen(true)}>
                Add Store
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
      {/* Store Table */}
      <Card
        title="Stores List"
        style={{ marginTop: 32, borderRadius: theme.borderRadius, boxShadow: theme.cardShadow }}
        styles={{
          body: { padding: 24 }
        }}
      >
        <Table
          columns={storeColumns}
          dataSource={stores}
          rowKey="store_id"
          pagination={{ pageSize: 5 }}
          size="middle"
        />
      </Card>
      <div style={{ marginTop: 48 }}>
        <Card bordered={false} style={{ borderRadius: theme.borderRadius, boxShadow: theme.cardShadow, background: theme.cardBg, transition: 'box-shadow 0.2s, transform 0.2s' }} bodyStyle={{ padding: theme.cardPadding + 4 }}>
          <Title level={5} style={{ marginBottom: 18, fontWeight: theme.fontWeightBold, fontSize: theme.fontSizeTitle, color: theme.text }}>Recent Transactions</Title>
          <Table columns={columns} dataSource={transactions} rowKey="sale_id" pagination={{ pageSize: 5 }}
            style={{ borderRadius: 18, overflow: 'hidden', fontSize: theme.fontSizeTable, fontFamily: theme.fontFamily }}
            rowClassName={() => 'apple-row'}
          />
        </Card>
      </div>
      <StoreDrawer
        open={storeDrawerOpen}
        onClose={() => { setStoreDrawerOpen(false); setEditingStore(null); }}
        onSave={handleAddStore}
        saving={savingStore}
        initialValues={editingStore || {}}
        isEditing={!!editingStore}
      />
      <style>{`
        .ant-card:hover {
          box-shadow: 0 16px 40px 0 rgba(31,38,135,0.14) !important;
          transform: translateY(-2px) scale(1.025);
        }
        .ant-table-tbody > tr.apple-row:hover > td {
          background: #f0f6ff !important;
          transition: background 0.2s;
        }
        @keyframes fadein {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: none; }
        }
      `}</style>
    </div>
  );
}

export default DashboardPage; 