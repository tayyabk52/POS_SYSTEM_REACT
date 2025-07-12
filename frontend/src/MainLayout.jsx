import React, { useEffect, useState } from "react";
import {
  Layout,
  Menu,
  Avatar,
  Typography,
  Badge,
  Button,
  Grid,
  Tooltip,
} from "antd";
import {
  DashboardOutlined,
  ShoppingCartOutlined,
  AppstoreOutlined,
  UserOutlined,
  BarChartOutlined,
  SettingOutlined,
  LogoutOutlined,
  ExclamationCircleOutlined,
  TeamOutlined,
  FileAddOutlined,
  UndoOutlined,
  DollarOutlined,
  PieChartOutlined,
  IdcardOutlined,
  MenuUnfoldOutlined,
  LineChartOutlined,
  AlertOutlined,
} from "@ant-design/icons";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { theme } from "./theme";

const { Header, Sider, Content } = Layout;
const { Title } = Typography;
const { useBreakpoint } = Grid;

const sidebarItems = [
  {
    key: "/dashboard",
    icon: <DashboardOutlined style={{ fontSize: 20 }} />,
    label: "Dashboard",
  },
  {
    key: "/products",
    icon: <AppstoreOutlined style={{ fontSize: 20 }} />,
    label: "Products",
  },
  {
    key: "/inventory",
    icon: <BarChartOutlined style={{ fontSize: 20 }} />,
    label: "Inventory",
  },
  {
    key: "/sales",
    icon: <ShoppingCartOutlined style={{ fontSize: 20 }} />,
    label: "Sales",
  },
  {
    key: "/returns",
    icon: <LineChartOutlined style={{ fontSize: 20 }} />,
    label: "Stats",
    children: [
      {
        key: "/returns",
        icon: <UndoOutlined style={{ fontSize: 18 }} />,
        label: "Returns",
      },
      {
        key: "/purchases",
        icon: <FileAddOutlined style={{ fontSize: 18 }} />,
        label: "Purchases",
      },
      {
        key: "/expenses",
        icon: <DollarOutlined style={{ fontSize: 18 }} />,
        label: "Expenses",
      },
      {
        key: "/reports",
        icon: <PieChartOutlined style={{ fontSize: 18 }} />,
        label: "Reports",
      },
    ],
  },
  {
    key: "/customers",
    icon: <UserOutlined style={{ fontSize: 20 }} />,
    label: "Users",
    children: [
      {
        key: "/customers",
        icon: <UserOutlined style={{ fontSize: 18 }} />,
        label: "Customers",
      },
      {
        key: "/suppliers",
        icon: <TeamOutlined style={{ fontSize: 18 }} />,
        label: "Suppliers",
      },
      {
        key: "/users",
        icon: <IdcardOutlined style={{ fontSize: 18 }} />,
        label: "Users & Roles",
      },
    ],
  },
  {
    key: "/settings",
    icon: <SettingOutlined style={{ fontSize: 20 }} />,
    label: "Settings",
  },
];

const buildMenuItems = (screens) =>
  sidebarItems.map((item) =>
    item.children
      ? {
          key: item.key,
          icon: item.icon,
          label: item.label,
          style: {
            borderRadius: theme.borderRadius,
            marginBottom: 4,
            fontSize: screens.xs ? 15 : 17,
          },
          children: item.children.map((c) => ({
            key: c.key,
            icon: c.icon,
            label: <NavLink to={c.key}>{c.label}</NavLink>,
            style: {
              paddingLeft: screens.xs ? 32 : 48,
              fontSize: screens.xs ? 14 : 16,
              borderRadius: theme.borderRadius,
              marginBottom: 2,
            },
          })),
        }
      : {
          key: item.key,
          icon: item.icon,
          label: <NavLink to={item.key}>{item.label}</NavLink>,
          style: {
            borderRadius: theme.borderRadius,
            marginBottom: 4,
            fontSize: screens.xs ? 15 : 17,
          },
        }
  );

function MainLayout({ user, onLogout, children, inventoryAlerts = [] }) {
  const location = useLocation();
  const navigate = useNavigate();
  const screens = useBreakpoint();

  const [openKeys, setOpenKeys] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState([location.pathname]);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setSelectedKeys([location.pathname]);
    const parent = sidebarItems.find((i) =>
      i.children?.some((c) => c.key === location.pathname)
    );
    if (parent) setOpenKeys([parent.key]);
  }, [location.pathname]);

  const handleOpenChange = (keys) => {
    const latest = keys.find((k) => !openKeys.includes(k));
    if (!latest) {
      // all closed
      setOpenKeys([]);
      return;
    }
    setOpenKeys([latest]);

    const parent = sidebarItems.find((i) => i.key === latest);
    if (parent?.children?.length) {
      const firstChild = parent.children[0].key;
      setSelectedKeys([firstChild]);
      navigate(firstChild);
    }
  };

  const items = buildMenuItems(screens);

  return (
    <Layout
      style={{
        minHeight: "100vh",
        background: theme.contentBg,
        fontFamily: theme.fontFamily,
      }}
    >
      <Sider
        width={260}
        style={{
          background: theme.sidebarBg,
          boxShadow: theme.sidebarShadow,
          backdropFilter: "blur(20px)",
          height: "100vh",
          position: "fixed",
          left: 0,
          zIndex: 100,
          paddingTop: 18,
          paddingLeft: !screens.lg ? 0 : 8,
          paddingRight: !screens.lg ? 0 : 8,
        }}
        breakpoint="lg"
        collapsedWidth={0}
        collapsible
        collapsed={collapsed && !screens.lg}
        onCollapse={(val) => setCollapsed(val)}
        trigger={null}
      >
        {/* logo */}
        <div
          style={{
            height: screens.lg ? 76 : "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: theme.fontWeightBold,
            fontSize: 32,
            color: theme.primary,
            letterSpacing: 1,
            marginBottom: 24,
            fontFamily: theme.fontFamily,
          }}
        >
          {!screens.lg && collapsed ? (
            <Avatar
              size={screens.xs ? 36 : 48}
              style={{
                background: theme.primary,
                fontWeight: theme.fontWeightBold,
                fontSize: screens.xs ? 18 : 26,
                fontFamily: theme.fontFamily,
                boxShadow: "0 2px 12px rgba(0, 122, 255, 0.2)",
              }}
            >
              {user.first_name[0]}
            </Avatar>
          ) : (
            <span style={{ letterSpacing: 2 }}>POS</span>
          )}
        </div>

        {/* ---------- MENU ---------- */}
        <Menu
          mode="inline"
          items={items}
          openKeys={openKeys}
          selectedKeys={selectedKeys}
          onOpenChange={handleOpenChange}
          onClick={({ key }) => {
            if (!sidebarItems.find(i => i.key === key && i.children)) {
              setSelectedKeys([key]);
            }
            if (!screens.lg) {
              setCollapsed(true);
            }
          }}
          style={{
            border: "none",
            fontSize: screens.xs ? 16 : 18,
            background: "transparent",
            marginTop: 8,
            fontFamily: theme.fontFamily,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        />
      </Sider>
      <Layout style={{ marginLeft: (collapsed && !screens.lg) || !screens.lg ? 0 : 260, transition: 'margin-left 0.2s' }}>
        <Header
          style={{
            background: theme.headerBg,
            backdropFilter: "blur(20px)",
            padding: screens.xs ? "0 16px" : "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: theme.headerShadow,
            height: theme.headerHeight,
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: screens.xs ? 12 : 16,
              height: "100%",
            }}
          >
            {!screens.lg && (
              <Button
                icon={<MenuUnfoldOutlined style={{ fontSize: 18 }} />}
                type="text"
                onClick={() => setCollapsed((c) => !c)}
                style={{ 
                  color: theme.primary,
                  border: "none",
                  padding: "6px",
                  height: "auto"
                }}
              />
            )}
            <div style={{ 
              borderLeft: screens.lg ? "1px solid rgba(0,0,0,0.06)" : "none", 
              height: "60%",
              marginLeft: screens.lg ? 0 : -8,
              paddingLeft: screens.lg ? 16 : 0
            }} />
            <Typography.Text
              style={{
                margin: 0,
                color: theme.text,
                fontWeight: theme.fontWeightBold,
                fontSize: theme.fontSizeTitle,
                fontFamily: theme.fontFamily,
                letterSpacing: -0.2,
              }}
            >
              {user.first_name}
            </Typography.Text>
            
            {inventoryAlerts?.length > 0 && (
              <div style={{ marginLeft: 8 }}>
                <Badge 
                  count={inventoryAlerts.length} 
                  size="small" 
                  style={{ 
                    backgroundColor: theme.warning,
                    boxShadow: "0 2px 4px rgba(255, 149, 0, 0.2)",
                  }}
                >
                  <Button
                    type="text"
                    style={{
                      padding: "4px 8px",
                      height: "auto",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                    icon={<AlertOutlined style={{ fontSize: 16, color: theme.warning }} />}
                  >
                    {screens.lg && (
                      <Typography.Text 
                        style={{ 
                          fontSize: 14, 
                          color: theme.warning,
                          fontWeight: theme.fontWeightMedium,
                        }}
                      >
                        Alerts
                      </Typography.Text>
                    )}
                  </Button>
                </Badge>
              </div>
            )}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <Button
              type="text"
              style={{
                padding: "6px 8px",
                height: "auto",
                borderRadius: theme.borderRadius,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Avatar
                size={screens.xs ? 28 : 32}
                style={{
                  background: theme.primary,
                  fontWeight: theme.fontWeightBold,
                  fontSize: screens.xs ? 14 : 16,
                  fontFamily: theme.fontFamily,
                  boxShadow: "0 2px 8px rgba(0, 122, 255, 0.2)",
                  border: "2px solid #fff",
                }}
              >
                {user.first_name[0]}
              </Avatar>
              {screens.lg && (
                <Typography.Text 
                  style={{ 
                    fontSize: 15, 
                    color: theme.text,
                    fontWeight: theme.fontWeightMedium,
                  }}
                >
                  Profile
                </Typography.Text>
              )}
            </Button>
            <div style={{ 
              borderLeft: "1px solid rgba(0,0,0,0.06)", 
              height: "60%", 
              margin: "0 4px" 
            }} />
            <Button
              type="text"
              onClick={onLogout}
              style={{
                color: "#FF3B30",
                fontWeight: theme.fontWeightMedium,
                fontSize: 15,
                height: "auto",
                padding: screens.lg ? '6px 12px' : '6px',
                display: "flex",
                alignItems: "center",
                gap: 6,
                borderRadius: theme.borderRadius,
              }}
              icon={<LogoutOutlined style={{ fontSize: 15 }} />}
            >
              {screens.lg && 'Logout'}
            </Button>
          </div>
        </Header>
        <Content
          style={{
            background: "none",
            minHeight: `calc(100vh - ${theme.headerHeight}px)`,
            animation: theme.fadeIn,
            padding: screens.xs ? 16 : 24,
            maxWidth: "100%",
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}

export default MainLayout;
