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
    icon: <DashboardOutlined style={{ fontSize: 22 }} />,
    label: "Dashboard",
  },
  {
    key: "/products",
    icon: <AppstoreOutlined style={{ fontSize: 22 }} />,
    label: "Products",
  },
  {
    key: "/inventory",
    icon: <BarChartOutlined style={{ fontSize: 22 }} />,
    label: "Inventory",
  },
  {
    key: "/sales",
    icon: <ShoppingCartOutlined style={{ fontSize: 20 }} />,
    label: "Sales",
  },
  {
    key: "/returns",
    icon: <LineChartOutlined style={{ fontSize: 22 }} />,
    label: "Stats",
    children: [
      {
        key: "/returns",
        icon: <UndoOutlined style={{ fontSize: 20 }} />,
        label: "Returns",
      },
      {
        key: "/purchases",
        icon: <FileAddOutlined style={{ fontSize: 20 }} />,
        label: "Purchases",
      },
      {
        key: "/expenses",
        icon: <DollarOutlined style={{ fontSize: 20 }} />,
        label: "Expenses",
      },
      {
        key: "/reports",
        icon: <PieChartOutlined style={{ fontSize: 20 }} />,
        label: "Reports",
      },
    ],
  },
  {
    key: "/customers",
    icon: <UserOutlined style={{ fontSize: 22 }} />,
    label: "Users",
    children: [
      {
        key: "/customers",
        icon: <UserOutlined style={{ fontSize: 20 }} />,
        label: "Customers",
      },
      {
        key: "/suppliers",
        icon: <TeamOutlined style={{ fontSize: 22 }} />,
        label: "Suppliers",
      },
      {
        key: "/users",
        icon: <IdcardOutlined style={{ fontSize: 20 }} />,
        label: "Users & Roles",
      },
    ],
  },
  {
    key: "/settings",
    icon: <SettingOutlined style={{ fontSize: 22 }} />,
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
          children: item.children.map((c) => ({
            key: c.key,
            icon: c.icon,
            label: <NavLink to={c.key}>{c.label}</NavLink>,
            style: {
              paddingLeft: screens.xs ? 32 : 48,
              fontSize: screens.xs ? 14 : 18,
            },
          })),
        }
      : {
          key: item.key,
          icon: item.icon,
          label: <NavLink to={item.key}>{item.label}</NavLink>,
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
      {/* <Sider
        width={260}
        style={{
          background: theme.sidebarBg,
          boxShadow: theme.sidebarShadow,
          backdropFilter: "blur(12px)",
          borderRight: "1px solid #eaeaea",
          position: "relative",
          zIndex: 2,
          paddingTop: 18,
          paddingLeft: 8,
          paddingRight: 8,
        }}
        breakpoint="lg"
        collapsedWidth={screens.xs ? 0 : 64}
        collapsible
        collapsed={collapsed && !screens.lg}
        onCollapse={(val) => setCollapsed(val)}
        trigger={null}
      >
        <div
          style={{
            height: 76,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: theme.fontWeightBold,
            fontSize: 32,
            color: theme.primary,
            letterSpacing: 1,
            marginBottom: 18,
            fontFamily: theme.fontFamily,
          }}
        >
          <span style={{ fontFamily: "inherit", letterSpacing: 2 }}>POS</span>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          style={{
            border: "none",
            fontSize: screens.xs ? 16 : 20,
            background: "transparent",
            marginTop: 8,
            fontFamily: theme.fontFamily,
          }}
        >
          {sidebarItems.map((item) => (
            <Menu.Item
              key={item.key}
              icon={item.icon}
              style={{
                borderRadius: 32,
                margin: screens.xs ? "6px 0" : "10px 0",
                background:
                  location.pathname === item.key ? theme.sidebarActive : "none",
                fontWeight:
                  location.pathname === item.key
                    ? theme.fontWeightBold
                    : theme.fontWeightMedium,
                transition: "background 0.2s",
                paddingLeft: screens.xs ? 16 : 28,
                paddingRight: screens.xs ? 8 : 18,
                height: screens.xs ? 44 : 54,
                display: "flex",
                alignItems: "center",
                fontSize: screens.xs ? 16 : 20,
                boxShadow:
                  location.pathname === item.key
                    ? "0 2px 12px #eaf3ff"
                    : "none",
              }}
            >
              <NavLink
                to={item.key}
                style={({ isActive }) => ({
                  color: isActive ? theme.primary : theme.text,
                  fontWeight: isActive
                    ? theme.fontWeightBold
                    : theme.fontWeightMedium,
                  fontSize: screens.xs ? 15 : 19,
                  fontFamily: theme.fontFamily,
                  letterSpacing: 0.2,
                })}
              >
                {item.label}
              </NavLink>
            </Menu.Item>
          ))}
        </Menu>
      </Sider> */}
      <Sider
        width={260}
        style={{
          background: theme.sidebarBg,
          boxShadow: theme.sidebarShadow,
          backdropFilter: "blur(12px)",
          // borderRight: "1px solid #eaeaea",
          height: screens.lg ? "auto" : "100%",
          position: screens.lg ? "relative" : "fixed",
          zIndex: 2,
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
            marginBottom: 18,
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
          onClick={({ key }) => setSelectedKeys([key])}
          style={{
            border: "none",
            fontSize: screens.xs ? 16 : 20,
            background: "transparent",
            marginTop: 8,
            fontFamily: theme.fontFamily,
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            background: "#fff",
            padding: screens.xs ? "0 12px" : "0 40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: screens.lg ? theme.headerShadow : "none",
            minHeight: 72,
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: screens.xs ? 10 : 20,
            }}
          >
            <Title
              level={4}
              style={{
                margin: 0,
                color: theme.text,
                fontWeight: theme.fontWeightBold,
                fontSize: screens.xs ? 20 : theme.fontSizeTitle,
                fontFamily: theme.fontFamily,
              }}
            >
              Welcome, {user.first_name}
            </Title>
            {inventoryAlerts?.length < 1 && (
              <Tooltip
                title={"Inventory Storage low"}
                style={{
                  background: "#fff !important",
                  color: "#000 !important",
                  boxShadow: "0 2px 10px #00000020 !important",
                }}
              >
                <Badge count={inventoryAlerts.length} offset={[10, 0]}>
                  <AlertOutlined style={{ color: "orange", fontSize: 20 }} />
                </Badge>
              </Tooltip>
            )}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: screens.xs ? 10 : 20,
            }}
          >
            {screens.lg && (
              <Avatar
                size={screens.xs ? 28 : 38}
                style={{
                  background: theme.primary,
                  fontWeight: theme.fontWeightBold,
                  fontSize: screens.xs ? 18 : 26,
                  fontFamily: theme.fontFamily,
                }}
              >
                {user.first_name[0]}
              </Avatar>
            )}
            {screens.lg && (
              <Button
                icon={<LogoutOutlined />}
                onClick={onLogout}
                type="text"
                style={{
                  color: theme.text,
                  fontWeight: theme.fontWeightMedium,
                  fontSize: screens.xs ? 15 : 18,
                  color: "#FF0000",
                  padding: 0,
                }}
              >
                Logout
              </Button>
            )}
          </div>
          {!screens.lg && (
            <Button
              icon={<MenuUnfoldOutlined style={{ fontSize: 24 }} />}
              type="text"
              onClick={() => setCollapsed((c) => !c)}
              style={{ marginRight: 16 }}
            />
          )}
        </Header>
        <Content
          style={{
            background: "none",
            minHeight: "calc(100vh - 72px)",
            animation: theme.fadeIn,
            padding: screens.xs ? 8 : 0,
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}

export default MainLayout;
