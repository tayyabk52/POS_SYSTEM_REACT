import React, { useState, useEffect } from 'react';
import { 
  Form, Input, Switch, Select, InputNumber, Button, Card, Row, Col, 
  Typography, Divider, Space, Alert, message, Spin, Tabs, Upload,
  ColorPicker, Slider, Radio, Checkbox, DatePicker, TimePicker,
  Tooltip, Badge, Tag, Progress, Statistic, Avatar, Drawer
} from 'antd';
import { 
  SettingOutlined, SaveOutlined, ReloadOutlined, SecurityScanOutlined,
  GlobalOutlined, PrinterOutlined, BellOutlined, UserOutlined,
  LockOutlined, DatabaseOutlined, CloudOutlined, MonitorOutlined,
  FileTextOutlined, BarChartOutlined, ShoppingOutlined, DollarOutlined,
  CheckCircleOutlined, ExclamationCircleOutlined, InfoCircleOutlined
} from '@ant-design/icons';
import { PrimaryButton, SecondaryButton, IconButton } from '../components/Button';
import CardComponent from '../components/Card';
import { theme } from '../theme';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [form] = Form.useForm();
  const [backupForm] = Form.useForm();

  // Mock settings data - in real app, this would come from API
  const [settings, setSettings] = useState({
    // General Settings
    company_name: 'Candela POS',
    company_address: '123 Business Street, City, Country',
    company_phone: '+1234567890',
    company_email: 'info@candela.com',
    timezone: 'UTC+5',
    date_format: 'DD/MM/YYYY',
    time_format: '24',
    currency: 'PKR',
    language: 'en',
    
    // POS Settings
    receipt_header: 'Candela POS System',
    receipt_footer: 'Thank you for your business!',
    auto_print_receipt: true,
    show_tax_on_receipt: true,
    allow_negative_stock: false,
    require_customer_info: false,
    default_payment_method: 'cash',
    rounding_method: 'nearest',
    
    // Security Settings
    session_timeout: 30,
    require_password_change: 90,
    max_login_attempts: 5,
    enable_audit_log: true,
    backup_frequency: 'daily',
    encryption_enabled: true,
    
    // Notification Settings
    email_notifications: true,
    sms_notifications: false,
    low_stock_alerts: true,
    sales_reports: true,
    system_alerts: true,
    
    // Backup Settings
    auto_backup: true,
    backup_retention_days: 30,
    cloud_backup: false,
    backup_time: '02:00',
    
    // Display Settings
    theme_mode: 'light',
    primary_color: '#007aff',
    font_size: 'medium',
    show_animations: true,
    compact_mode: false
  });

  const [backupStatus, setBackupStatus] = useState({
    last_backup: '2024-01-15 02:00:00',
    next_backup: '2024-01-16 02:00:00',
    backup_size: '2.5 GB',
    status: 'success'
  });

  const handleSave = async (values) => {
    setLoading(true);
    try {
      // In real app, call API to save settings
      setSettings({ ...settings, ...values });
      message.success('Settings saved successfully');
    } catch (error) {
      message.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    form.resetFields();
    message.info('Settings reset to default values');
  };

  const handleBackup = async () => {
    setLoading(true);
    try {
      // In real app, call API to create backup
      message.success('Backup created successfully');
    } catch (error) {
      message.error('Failed to create backup');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    setLoading(true);
    try {
      // In real app, call API to restore backup
      message.success('Backup restored successfully');
    } catch (error) {
      message.error('Failed to restore backup');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    form.setFieldsValue(settings);
  }, [settings, form]);

  return (
    <div style={{ padding: 24, background: theme.contentBg, minHeight: '100vh' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, color: theme.text }}>
          <SettingOutlined style={{ marginRight: 12 }} />
          System Settings
        </Title>
        <Text type="secondary">Configure system preferences and behavior</Text>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={18}>
          <CardComponent
            title="Configuration Settings"
            subtitle="Manage system preferences and behavior"
            actions={
              <Space wrap>
                <SecondaryButton icon={<ReloadOutlined />} onClick={handleReset}>
                  Reset to Default
                </SecondaryButton>
                <PrimaryButton 
                  icon={<SaveOutlined />} 
                  onClick={() => form.submit()}
                  loading={loading}
                >
                  Save Settings
                </PrimaryButton>
              </Space>
            }
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSave}
              initialValues={settings}
            >
              <Tabs 
                activeKey={activeTab} 
                onChange={setActiveTab}
                type="card"
                size="large"
                style={{
                  '& .ant-tabs-tab': {
                    fontSize: '14px',
                    padding: '8px 16px'
                  }
                }}
              >
                <TabPane 
                  tab={
                    <span>
                      <GlobalOutlined />
                      <span style={{ marginLeft: 8 }}>General</span>
                    </span>
                  } 
                  key="general"
                >
                  <Row gutter={[24, 16]}>
                    <Col xs={24} md={12}>
                      <Form.Item name="company_name" label="Company Name" rules={[{ required: true }]}>
                        <Input placeholder="Enter company name" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item name="company_phone" label="Company Phone">
                        <Input placeholder="Enter phone number" />
                      </Form.Item>
                    </Col>
                  </Row>
                  
                  <Form.Item name="company_address" label="Company Address">
                    <TextArea placeholder="Enter company address" rows={3} />
                  </Form.Item>
                  
                  <Form.Item name="company_email" label="Company Email" rules={[{ type: 'email' }]}>
                        <Input placeholder="Enter company email" />
                      </Form.Item>
                  
                  <Row gutter={[24, 16]}>
                    <Col xs={24} sm={8}>
                      <Form.Item name="timezone" label="Timezone">
                        <Select placeholder="Select timezone">
                          <Option value="UTC+5">UTC+5 (Pakistan)</Option>
                          <Option value="UTC+0">UTC+0 (GMT)</Option>
                          <Option value="UTC-5">UTC-5 (EST)</Option>
                          <Option value="UTC-8">UTC-8 (PST)</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={8}>
                      <Form.Item name="date_format" label="Date Format">
                        <Select placeholder="Select date format">
                          <Option value="DD/MM/YYYY">DD/MM/YYYY</Option>
                          <Option value="MM/DD/YYYY">MM/DD/YYYY</Option>
                          <Option value="YYYY-MM-DD">YYYY-MM-DD</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={8}>
                      <Form.Item name="currency" label="Currency">
                        <Select placeholder="Select currency">
                          <Option value="PKR">PKR (Pakistani Rupee)</Option>
                          <Option value="USD">USD (US Dollar)</Option>
                          <Option value="EUR">EUR (Euro)</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                </TabPane>

                <TabPane 
                  tab={
                    <span>
                      <ShoppingOutlined />
                      <span style={{ marginLeft: 8 }}>POS Settings</span>
                    </span>
                  } 
                  key="pos"
                >
                  <Row gutter={[24, 16]}>
                    <Col xs={24} md={12}>
                      <Form.Item name="receipt_header" label="Receipt Header">
                        <Input placeholder="Enter receipt header text" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item name="receipt_footer" label="Receipt Footer">
                        <Input placeholder="Enter receipt footer text" />
                      </Form.Item>
                    </Col>
                  </Row>
                  
                  <Row gutter={[24, 16]}>
                    <Col xs={24} md={12}>
                      <Form.Item name="auto_print_receipt" label="Auto Print Receipt" valuePropName="checked">
                        <Switch checkedChildren="Enabled" unCheckedChildren="Disabled" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item name="show_tax_on_receipt" label="Show Tax on Receipt" valuePropName="checked">
                        <Switch checkedChildren="Enabled" unCheckedChildren="Disabled" />
                      </Form.Item>
                    </Col>
                  </Row>
                  
                  <Row gutter={[24, 16]}>
                    <Col xs={24} md={12}>
                      <Form.Item name="allow_negative_stock" label="Allow Negative Stock" valuePropName="checked">
                        <Switch checkedChildren="Enabled" unCheckedChildren="Disabled" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item name="require_customer_info" label="Require Customer Info" valuePropName="checked">
                        <Switch checkedChildren="Enabled" unCheckedChildren="Disabled" />
                      </Form.Item>
                    </Col>
                  </Row>
                  
                  <Row gutter={[24, 16]}>
                    <Col xs={24} md={12}>
                      <Form.Item name="default_payment_method" label="Default Payment Method">
                        <Select placeholder="Select default payment method">
                          <Option value="cash">Cash</Option>
                          <Option value="card">Card</Option>
                          <Option value="mobile">Mobile Wallet</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item name="rounding_method" label="Rounding Method">
                        <Select placeholder="Select rounding method">
                          <Option value="nearest">Nearest</Option>
                          <Option value="up">Round Up</Option>
                          <Option value="down">Round Down</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                </TabPane>

                <TabPane 
                  tab={
                    <span>
                      <SecurityScanOutlined />
                      <span style={{ marginLeft: 8 }}>Security</span>
                    </span>
                  } 
                  key="security"
                >
                  <Row gutter={[24, 16]}>
                    <Col xs={24} md={12}>
                      <Form.Item name="session_timeout" label="Session Timeout (minutes)">
                        <InputNumber min={5} max={480} style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item name="require_password_change" label="Password Change (days)">
                        <InputNumber min={30} max={365} style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                  </Row>
                  
                  <Row gutter={[24, 16]}>
                    <Col xs={24} md={12}>
                      <Form.Item name="max_login_attempts" label="Max Login Attempts">
                        <InputNumber min={3} max={10} style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item name="backup_frequency" label="Backup Frequency">
                        <Select placeholder="Select backup frequency">
                          <Option value="daily">Daily</Option>
                          <Option value="weekly">Weekly</Option>
                          <Option value="monthly">Monthly</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                  
                  <Row gutter={[24, 16]}>
                    <Col xs={24} md={12}>
                      <Form.Item name="enable_audit_log" label="Enable Audit Log" valuePropName="checked">
                        <Switch checkedChildren="Enabled" unCheckedChildren="Disabled" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item name="encryption_enabled" label="Enable Encryption" valuePropName="checked">
                        <Switch checkedChildren="Enabled" unCheckedChildren="Disabled" />
                      </Form.Item>
                    </Col>
                  </Row>
                </TabPane>

                <TabPane 
                  tab={
                    <span>
                      <BellOutlined />
                      <span style={{ marginLeft: 8 }}>Notifications</span>
                    </span>
                  } 
                  key="notifications"
                >
                  <Title level={4}>Email Notifications</Title>
                  <Row gutter={[24, 16]}>
                    <Col xs={24} md={12}>
                      <Form.Item name="email_notifications" label="Enable Email Notifications" valuePropName="checked">
                        <Switch checkedChildren="Enabled" unCheckedChildren="Disabled" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item name="sales_reports" label="Sales Reports" valuePropName="checked">
                        <Switch checkedChildren="Enabled" unCheckedChildren="Disabled" />
                      </Form.Item>
                    </Col>
                  </Row>
                  
                  <Title level={4}>System Alerts</Title>
                  <Row gutter={[24, 16]}>
                    <Col xs={24} md={12}>
                      <Form.Item name="low_stock_alerts" label="Low Stock Alerts" valuePropName="checked">
                        <Switch checkedChildren="Enabled" unCheckedChildren="Disabled" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item name="system_alerts" label="System Alerts" valuePropName="checked">
                        <Switch checkedChildren="Enabled" unCheckedChildren="Disabled" />
                      </Form.Item>
                    </Col>
                  </Row>
                  
                  <Form.Item name="sms_notifications" label="SMS Notifications" valuePropName="checked">
                    <Switch checkedChildren="Enabled" unCheckedChildren="Disabled" />
                  </Form.Item>
                </TabPane>

                <TabPane 
                  tab={
                    <span>
                      <MonitorOutlined />
                      <span style={{ marginLeft: 8 }}>Display</span>
                    </span>
                  } 
                  key="display"
                >
                  <Row gutter={[24, 16]}>
                    <Col xs={24} md={12}>
                      <Form.Item name="theme_mode" label="Theme Mode">
                        <Radio.Group>
                          <Radio value="light">Light</Radio>
                          <Radio value="dark">Dark</Radio>
                          <Radio value="auto">Auto</Radio>
                        </Radio.Group>
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item name="font_size" label="Font Size">
                        <Select placeholder="Select font size">
                          <Option value="small">Small</Option>
                          <Option value="medium">Medium</Option>
                          <Option value="large">Large</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                  
                  <Row gutter={[24, 16]}>
                    <Col xs={24} md={12}>
                      <Form.Item name="show_animations" label="Show Animations" valuePropName="checked">
                        <Switch checkedChildren="Enabled" unCheckedChildren="Disabled" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item name="compact_mode" label="Compact Mode" valuePropName="checked">
                        <Switch checkedChildren="Enabled" unCheckedChildren="Disabled" />
                      </Form.Item>
                    </Col>
                  </Row>
                  
                  <Form.Item name="primary_color" label="Primary Color">
                    <ColorPicker />
                  </Form.Item>
                </TabPane>
              </Tabs>
            </Form>
          </CardComponent>
        </Col>

        <Col xs={24} lg={6}>
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            {/* Backup Status Card */}
            <CardComponent
              title="Backup Status"
              subtitle="System backup information"
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text type="secondary">Last Backup</Text>
                  <div style={{ fontWeight: 500 }}>{backupStatus.last_backup}</div>
                </div>
                <div>
                  <Text type="secondary">Next Backup</Text>
                  <div style={{ fontWeight: 500 }}>{backupStatus.next_backup}</div>
                </div>
                <div>
                  <Text type="secondary">Backup Size</Text>
                  <div style={{ fontWeight: 500 }}>{backupStatus.backup_size}</div>
                </div>
                <div>
                  <Text type="secondary">Status</Text>
                  <Badge status={backupStatus.status} text="Success" />
                </div>
                
                <Divider />
                
                <PrimaryButton 
                  icon={<CloudOutlined />} 
                  onClick={handleBackup}
                  style={{ width: '100%' }}
                >
                  Create Backup
                </PrimaryButton>
                
                <SecondaryButton 
                  icon={<ReloadOutlined />} 
                  onClick={handleRestore}
                  style={{ width: '100%' }}
                >
                  Restore Backup
                </SecondaryButton>
              </Space>
            </CardComponent>

            {/* System Info Card */}
            <CardComponent
              title="System Information"
              subtitle="Current system status"
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text type="secondary">Version</Text>
                  <div style={{ fontWeight: 500 }}>v2.1.0</div>
                </div>
                <div>
                  <Text type="secondary">Database</Text>
                  <div style={{ fontWeight: 500 }}>PostgreSQL 14</div>
                </div>
                <div>
                  <Text type="secondary">Uptime</Text>
                  <div style={{ fontWeight: 500 }}>15 days, 8 hours</div>
                </div>
                <div>
                  <Text type="secondary">Storage</Text>
                  <div style={{ fontWeight: 500 }}>75% used</div>
                  <Progress percent={75} size="small" />
                </div>
                
                <Divider />
                
                <Alert
                  message="System Healthy"
                  description="All systems are running normally"
                  type="success"
                  showIcon
                  icon={<CheckCircleOutlined />}
                />
              </Space>
            </CardComponent>

            {/* Quick Actions Card */}
            <CardComponent
              title="Quick Actions"
              subtitle="Common system tasks"
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <SecondaryButton 
                  icon={<DatabaseOutlined />} 
                  style={{ width: '100%' }}
                >
                  Database Maintenance
                </SecondaryButton>
                
                <SecondaryButton 
                  icon={<BarChartOutlined />} 
                  style={{ width: '100%' }}
                >
                  Generate Reports
                </SecondaryButton>
                
                <SecondaryButton 
                  icon={<FileTextOutlined />} 
                  style={{ width: '100%' }}
                >
                  Export Data
                </SecondaryButton>
                
                <SecondaryButton 
                  icon={<SecurityScanOutlined />} 
                  style={{ width: '100%' }}
                >
                  Security Scan
                </SecondaryButton>
              </Space>
            </CardComponent>
          </Space>
        </Col>
      </Row>

      <style jsx>{`
        @media (max-width: 768px) {
          .ant-tabs-tab {
            font-size: 12px !important;
            padding: 6px 12px !important;
          }
          
          .ant-form-item-label > label {
            font-size: 14px;
          }
          
          .ant-input, .ant-select, .ant-input-number {
            font-size: 14px;
          }
          
          .ant-switch {
            transform: scale(0.9);
          }
        }
        
        @media (max-width: 480px) {
          .ant-tabs-tab {
            font-size: 11px !important;
            padding: 4px 8px !important;
          }
          
          .ant-form-item-label > label {
            font-size: 13px;
          }
          
          .ant-input, .ant-select, .ant-input-number {
            font-size: 13px;
          }
          
          .ant-switch {
            transform: scale(0.8);
          }
        }
      `}</style>
    </div>
  );
}

export default SettingsPage; 