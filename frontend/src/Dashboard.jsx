import React, { useEffect, useState } from 'react';
import { Layout, Menu, Card, Row, Col, Statistic, Table, Avatar, Typography, Badge, Button } from 'antd';
import {
  DashboardOutlined, ShoppingCartOutlined, AppstoreOutlined, UserOutlined, BarChartOutlined, SettingOutlined, LogoutOutlined, ExclamationCircleOutlined, TeamOutlined, FileAddOutlined, UndoOutlined, DollarOutlined, PieChartOutlined, IdcardOutlined
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

const sidebarItems = [
  { key: 'dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
  { key: 'sales', icon: <ShoppingCartOutlined />, label: 'Sales' },
  { key: 'products', icon: <AppstoreOutlined />, label: 'Products' },
  { key: 'inventory', icon: <BarChartOutlined />, label: 'Inventory' },
  { key: 'customers', icon: <UserOutlined />, label: 'Customers' },
  { key: 'suppliers', icon: <TeamOutlined />, label: 'Suppliers' },
  { key: 'purchases', icon: <FileAddOutlined />, label: 'Purchases' },
  { key: 'returns', icon: <UndoOutlined />, label: 'Returns' },
  { key: 'expenses', icon: <DollarOutlined />, label: 'Expenses' },
  { key: 'reports', icon: <PieChartOutlined />, label: 'Reports' },
  { key: 'users', icon: <IdcardOutlined />, label: 'Users & Roles' },
  { key: 'settings', icon: <SettingOutlined />, label: 'Settings' },
];

function Dashboard({ user, onLogout }) {
  const [salesSummary, setSalesSummary] = useState({ total_sales: 0, num_sales: 0, date: '' });
  const [customerCount, setCustomerCount] = useState(0);
  const [inventoryAlerts, setInventoryAlerts] = useState([]);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8000/dashboard/sales-summary').then(r => r.json()).then(setSalesSummary);
    fetch('http://localhost:8000/dashboard/customer-count').then(r => r.json()).then(d => setCustomerCount(d.customer_count));
    fetch('http://localhost:8000/dashboard/inventory-alerts').then(r => r.json()).then(d => setInventoryAlerts(d.alerts));
    fetch('http://localhost:8000/dashboard/recent-transactions').then(r => r.json()).then(d => setTransactions(d.transactions));
  }, []);

  const columns = [
    { title: 'Order ID', dataIndex: 'sale_id', key: 'sale_id' },
    { title: 'Invoice', dataIndex: 'invoice_number', key: 'invoice_number' },
    { title: 'Date', dataIndex: 'sale_date', key: 'sale_date', render: d => d ? new Date(d).toLocaleString() : '' },
    { title: 'User', dataIndex: 'username', key: 'username' },
    { title: 'Amount', dataIndex: 'grand_total', key: 'grand_total', render: v => `$${v.toFixed(2)}` },
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f6fa', fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif` }}>
      <Sider width={240} style={{
        background: 'rgba(255,255,255,0.95)',
        boxShadow: '2px 0 16px #e0e2e8',
        backdropFilter: 'blur(8px)',
        borderRight: '1px solid #eaeaea',
        position: 'relative',
        zIndex: 2
      }}>
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 26, color: '#007aff', letterSpacing: 1, marginBottom: 8 }}>
          <span style={{ fontFamily: 'inherit', letterSpacing: 2 }}>POS</span>
        </div>
        <Menu
          mode="inline"
          defaultSelectedKeys={['dashboard']}
          style={{ border: 'none', fontSize: 17, background: 'transparent' }}
          items={sidebarItems}
          itemSelectedBg={'#eaf3ff'}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 8px #f0f1f6', minHeight: 64 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Title level={4} style={{ margin: 0, color: '#222', fontWeight: 600 }}>Welcome, {user.first_name}</Title>
            <Badge count={inventoryAlerts.length} offset={[10, 0]}>
              <Button icon={<ExclamationCircleOutlined />} type="text" style={{ color: '#faad14', fontWeight: 500 }}>Inventory Alerts</Button>
            </Badge>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Avatar size={44} style={{ background: '#007aff', fontWeight: 600, fontSize: 22 }}>{user.first_name[0]}</Avatar>
            <Button icon={<LogoutOutlined />} onClick={onLogout} type="text" style={{ color: '#222', fontWeight: 500 }}>Logout</Button>
          </div>
        </Header>
        <Content style={{ margin: '32px', background: 'none' }}>
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12} md={6}>
              <Card bordered={false} style={{ borderRadius: 20, boxShadow: '0 4px 16px #eaeaea', minHeight: 120 }}>
                <Statistic title={<span style={{ fontWeight: 500 }}>Today's Sales</span>} value={salesSummary.total_sales} prefix="$" precision={2} valueStyle={{ color: '#007aff', fontWeight: 700, fontSize: 28 }} />
                <Text type="secondary">{salesSummary.num_sales} sales</Text>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card bordered={false} style={{ borderRadius: 20, boxShadow: '0 4px 16px #eaeaea', minHeight: 120 }}>
                <Statistic title={<span style={{ fontWeight: 500 }}>Customers</span>} value={customerCount} valueStyle={{ color: '#222', fontWeight: 700, fontSize: 28 }} />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card bordered={false} style={{ borderRadius: 20, boxShadow: '0 4px 16px #eaeaea', minHeight: 120 }}>
                <Statistic title={<span style={{ fontWeight: 500 }}>Inventory Alerts</span>} value={inventoryAlerts.length} valueStyle={{ color: '#faad14', fontWeight: 700, fontSize: 28 }} />
                {inventoryAlerts.length > 0 && <ul style={{ margin: 0, padding: 0, listStyle: 'none', fontSize: 13, marginTop: 8 }}>
                  {inventoryAlerts.map(a => <li key={a.product_name + a.store_name}>{a.product_name} ({a.store_name}): <b style={{ color: '#faad14' }}>{a.current_stock}</b> / {a.reorder_level}</li>)}
                </ul>}
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card bordered={false} style={{ borderRadius: 20, boxShadow: '0 4px 16px #eaeaea', minHeight: 120 }}>
                <Statistic title={<span style={{ fontWeight: 500 }}>Date</span>} value={salesSummary.date} valueStyle={{ color: '#222', fontWeight: 700, fontSize: 28 }} />
              </Card>
            </Col>
          </Row>
          <div style={{ marginTop: 32 }}>
            <Card bordered={false} style={{ borderRadius: 20, boxShadow: '0 4px 16px #eaeaea' }}>
              <Title level={5} style={{ marginBottom: 16, fontWeight: 600 }}>Recent Transactions</Title>
              <Table columns={columns} dataSource={transactions} rowKey="sale_id" pagination={{ pageSize: 5 }}
                style={{ borderRadius: 16, overflow: 'hidden' }}
                rowClassName={() => 'apple-row'}
              />
            </Card>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}

export default Dashboard; 