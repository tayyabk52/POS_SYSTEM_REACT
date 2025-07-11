import React, { useState } from 'react';
import { Layout, Menu, Avatar, Typography, Badge, Button, Grid } from 'antd';
import {
  DashboardOutlined, ShoppingCartOutlined, AppstoreOutlined, UserOutlined, BarChartOutlined, SettingOutlined, LogoutOutlined, ExclamationCircleOutlined, TeamOutlined, FileAddOutlined, UndoOutlined, DollarOutlined, PieChartOutlined, IdcardOutlined, MenuUnfoldOutlined
} from '@ant-design/icons';
import { NavLink, useLocation } from 'react-router-dom';
import { theme } from './theme';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;
const { useBreakpoint } = Grid;

const sidebarItems = [
  { key: '/dashboard', icon: <DashboardOutlined style={{ fontSize: 22 }} />, label: 'Dashboard' },
  { key: '/sales', icon: <ShoppingCartOutlined style={{ fontSize: 22 }} />, label: 'Sales' },
  { key: '/products', icon: <AppstoreOutlined style={{ fontSize: 22 }} />, label: 'Products' },
  { key: '/inventory', icon: <BarChartOutlined style={{ fontSize: 22 }} />, label: 'Inventory' },
  { key: '/customers', icon: <UserOutlined style={{ fontSize: 22 }} />, label: 'Customers' },
  { key: '/suppliers', icon: <TeamOutlined style={{ fontSize: 22 }} />, label: 'Suppliers' },
  { key: '/purchases', icon: <FileAddOutlined style={{ fontSize: 22 }} />, label: 'Purchases' },
  { key: '/returns', icon: <UndoOutlined style={{ fontSize: 22 }} />, label: 'Returns' },
  { key: '/expenses', icon: <DollarOutlined style={{ fontSize: 22 }} />, label: 'Expenses' },
  { key: '/reports', icon: <PieChartOutlined style={{ fontSize: 22 }} />, label: 'Reports' },
  { key: '/users', icon: <IdcardOutlined style={{ fontSize: 22 }} />, label: 'Users & Roles' },
  { key: '/settings', icon: <SettingOutlined style={{ fontSize: 22 }} />, label: 'Settings' },
];

function MainLayout({ user, onLogout, children, inventoryAlerts = [] }) {
  const location = useLocation();
  const screens = useBreakpoint();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout style={{ minHeight: '100vh', background: theme.contentBg, fontFamily: theme.fontFamily }}>
      <Sider
        width={260}
        style={{
          background: theme.sidebarBg,
          boxShadow: theme.sidebarShadow,
          backdropFilter: 'blur(12px)',
          borderRight: '1px solid #eaeaea',
          position: 'relative',
          zIndex: 2,
          paddingTop: 18,
          paddingLeft: 8,
          paddingRight: 8,
        }}
        breakpoint="lg"
        collapsedWidth={screens.xs ? 0 : 64}
        collapsible
        collapsed={collapsed && !screens.lg}
        onCollapse={val => setCollapsed(val)}
        trigger={null}
      >
        <div style={{ height: 76, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: theme.fontWeightBold, fontSize: 32, color: theme.primary, letterSpacing: 1, marginBottom: 18, fontFamily: theme.fontFamily }}>
          <span style={{ fontFamily: 'inherit', letterSpacing: 2 }}>POS</span>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          style={{ border: 'none', fontSize: screens.xs ? 16 : 20, background: 'transparent', marginTop: 8, fontFamily: theme.fontFamily }}
        >
          {sidebarItems.map(item => (
            <Menu.Item key={item.key} icon={item.icon} style={{
              borderRadius: 32,
              margin: screens.xs ? '6px 0' : '10px 0',
              background: location.pathname === item.key ? theme.sidebarActive : 'none',
              fontWeight: location.pathname === item.key ? theme.fontWeightBold : theme.fontWeightMedium,
              transition: 'background 0.2s',
              paddingLeft: screens.xs ? 16 : 28,
              paddingRight: screens.xs ? 8 : 18,
              height: screens.xs ? 44 : 54,
              display: 'flex',
              alignItems: 'center',
              fontSize: screens.xs ? 16 : 20,
              boxShadow: location.pathname === item.key ? '0 2px 12px #eaf3ff' : 'none',
            }}>
              <NavLink to={item.key} style={({ isActive }) => ({ color: isActive ? theme.primary : theme.text, fontWeight: isActive ? theme.fontWeightBold : theme.fontWeightMedium, fontSize: screens.xs ? 15 : 19, fontFamily: theme.fontFamily, letterSpacing: 0.2 })}>{item.label}</NavLink>
            </Menu.Item>
          ))}
        </Menu>
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: screens.xs ? '0 12px' : '0 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: theme.headerShadow, minHeight: 72, position: 'sticky', top: 0, zIndex: 10 }}>
          {!screens.lg && (
            <Button
              icon={<MenuUnfoldOutlined style={{ fontSize: 24 }} />}
              type="text"
              onClick={() => setCollapsed(c => !c)}
              style={{ marginRight: 16 }}
            />
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: screens.xs ? 10 : 20 }}>
            <Title level={4} style={{ margin: 0, color: theme.text, fontWeight: theme.fontWeightBold, fontSize: screens.xs ? 20 : theme.fontSizeTitle, fontFamily: theme.fontFamily }}>Welcome, {user.first_name}</Title>
            <Badge count={inventoryAlerts.length} offset={[10, 0]}>
              <Button icon={<ExclamationCircleOutlined />} type="text" style={{ color: theme.warning, fontWeight: theme.fontWeightMedium, fontSize: screens.xs ? 15 : 18 }}>Inventory Alerts</Button>
            </Badge>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: screens.xs ? 10 : 20 }}>
            <Avatar size={screens.xs ? 36 : 48} style={{ background: theme.primary, fontWeight: theme.fontWeightBold, fontSize: screens.xs ? 18 : 26, fontFamily: theme.fontFamily }}>{user.first_name[0]}</Avatar>
            <Button icon={<LogoutOutlined />} onClick={onLogout} type="text" style={{ color: theme.text, fontWeight: theme.fontWeightMedium, fontSize: screens.xs ? 15 : 18 }}>Logout</Button>
          </div>
        </Header>
        <Content style={{ background: 'none', minHeight: 'calc(100vh - 72px)', animation: theme.fadeIn, padding: screens.xs ? 8 : 0 }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}

export default MainLayout; 