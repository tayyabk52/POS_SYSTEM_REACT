import React from 'react';
import { Drawer, Form, Row, Col, Input, Switch, Divider, Button, Grid } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { theme } from '../theme';

const { useBreakpoint } = Grid;

function StoreDrawer({
  open,
  onClose,
  onSave,
  initialValues = {},
  isEditing = false,
  saving = false,
}) {
  const [form] = Form.useForm();
  const screens = useBreakpoint();

  React.useEffect(() => {
    if (!open) {
      form.resetFields();
    } else {
      form.setFieldsValue(initialValues);
    }
  }, [open, initialValues, form]);

  function handleOk() {
    form.submit();
  }

  const handleFormSubmit = (values) => {
    onSave(values);
  };

  return (
    <Drawer
      title={isEditing ? 'Edit Store' : 'Add Store'}
      placement="right"
      width={screens.xs ? '100%' : 500}
      open={open}
      onClose={onClose}
      closeIcon={<CloseOutlined style={{ fontSize: 22 }} />}
      bodyStyle={{ padding: screens.xs ? 16 : 32, background: theme.cardBg, borderRadius: theme.borderRadius, boxShadow: theme.cardShadow }}
      footer={
        <div style={{ textAlign: 'right', padding: 16, background: 'transparent' }}>
          <Button onClick={onClose} style={{ marginRight: 12 }}>Cancel</Button>
          <Button type="primary" onClick={handleOk} loading={saving} style={{ fontWeight: theme.fontWeightBold, fontSize: 16 }}>
            {isEditing ? 'Save' : 'Add'}
          </Button>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ is_active: true, ...initialValues }}
        onFinish={handleFormSubmit}
        preserve={false}
      >
        <Divider orientation="left" style={{ fontWeight: theme.fontWeightBold, color: theme.text, fontSize: 18 }}>Store Info</Divider>
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item name="store_name" label="Store Name" rules={[{ required: true, message: 'Store name is required' }]}> 
              <Input placeholder="Enter store name" /> 
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="phone_number" label="Phone Number"> 
              <Input placeholder="Enter phone number" /> 
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col xs={24} sm={24}>
            <Form.Item name="address" label="Address" rules={[{ required: true, message: 'Address is required' }]}> 
              <Input placeholder="Enter address" /> 
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item name="email" label="Email"> 
              <Input placeholder="Enter email" /> 
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="city" label="City"> 
              <Input placeholder="Enter city" /> 
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item name="province" label="Province"> 
              <Input placeholder="Enter province" /> 
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="postal_code" label="Postal Code"> 
              <Input placeholder="Enter postal code" /> 
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col xs={24} sm={12} style={{ display: 'flex', alignItems: 'center' }}>
            <Form.Item name="is_active" label="Active" valuePropName="checked" style={{ marginBottom: 0 }}>
              <Switch checkedChildren="Yes" unCheckedChildren="No" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Drawer>
  );
}

export default StoreDrawer; 