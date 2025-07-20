import React from 'react';
import { Drawer, Form, Row, Col, Input, Switch, Button, Tooltip } from 'antd';
import { CloseOutlined, InfoCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { theme } from '../theme';

const { TextArea } = Input;

// Help texts for each field
const help = {
  supplier_name: 'The name of the supplier or company. This should be unique.',
  contact_person: 'The main contact person at this supplier.',
  phone_number: 'Phone number for contacting the supplier.',
  email: 'Email address for the supplier contact.',
  address: 'Full address of the supplier.',
  ntn: 'National Tax Number (NTN) for tax purposes.',
  gst_number: 'GST (Goods and Services Tax) number.',
  is_active: 'If enabled, this supplier is active and can be used for products and purchases.',
};

// Helper for label with tooltip
const labelWithHelp = (label, helpKey) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
    {label}
    <Tooltip title={<span style={{ fontSize: 13 }}>{help[helpKey]}</span>} color="#fff" overlayInnerStyle={{ color: '#222', fontWeight: 400, boxShadow: '0 2px 8px #eee', borderRadius: 8, padding: 8 }}>
      <InfoCircleOutlined style={{ color: '#1890ff', fontSize: 16, cursor: 'pointer', marginLeft: 2 }} />
    </Tooltip>
  </span>
);

function SupplierDrawer({
  open,
  onClose,
  onSave,
  initialValues = {},
  isEditing = false,
  saving = false,
  drawerError,
  drawerErrorTip,
}) {
  const [form] = Form.useForm();
  
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

  // Handle form submission
  const handleFormSubmit = (values) => {
    // Clean up the values before sending
    const cleanedValues = {
      ...values,
      // Ensure boolean fields are properly handled
      is_active: values.is_active !== undefined ? values.is_active : true,
    };
    
    onSave(cleanedValues);
  };

  return (
    <Drawer
      title={isEditing ? 'Edit Supplier' : 'Add Supplier'}
      placement="right"
      width={600}
      open={open}
      onClose={onClose}
      closeIcon={<CloseOutlined style={{ fontSize: 22 }} />}
      styles={{
        body: {
          padding: 32,
          background: theme.cardBg,
          borderRadius: theme.borderRadius,
          boxShadow: theme.cardShadow
        }
      }}
      footer={
        <div style={{ textAlign: 'right', padding: 16, background: 'transparent', position: 'relative' }}>
          {drawerError && (
            <div style={{ position: 'absolute', left: 0, top: 0, display: 'flex', alignItems: 'center', color: '#d4380d', fontWeight: 500, fontSize: 15 }}>
              <Tooltip title={<span style={{ fontSize: 14 }}>{drawerErrorTip || ''}</span>} color="#fff" overlayInnerStyle={{ color: '#222', fontWeight: 400, borderRadius: 8, padding: 8 }}>
                <ExclamationCircleOutlined style={{ fontSize: 22, marginRight: 8, color: '#d4380d', cursor: 'pointer' }} />
              </Tooltip>
              <span>{drawerError}</span>
            </div>
          )}
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
        onFinish={handleFormSubmit}
        initialValues={{ is_active: true }}
      >
        <Form.Item
          name="supplier_name"
          label={labelWithHelp('Supplier Name', 'supplier_name')}
          rules={[{ required: true, message: 'Please enter supplier name' }]}
        >
          <Input placeholder="Enter supplier name" />
        </Form.Item>

        <Form.Item
          name="contact_person"
          label={labelWithHelp('Contact Person', 'contact_person')}
        >
          <Input placeholder="Enter contact person name" />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="phone_number"
              label={labelWithHelp('Phone Number', 'phone_number')}
            >
              <Input placeholder="Enter phone number" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="email"
              label={labelWithHelp('Email', 'email')}
              rules={[
                { type: 'email', message: 'Please enter a valid email' }
              ]}
            >
              <Input placeholder="Enter email address" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="address"
          label={labelWithHelp('Address', 'address')}
        >
          <TextArea rows={3} placeholder="Enter full address" />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="ntn"
              label={labelWithHelp('NTN', 'ntn')}
            >
              <Input placeholder="Enter NTN" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="gst_number"
              label={labelWithHelp('GST Number', 'gst_number')}
            >
              <Input placeholder="Enter GST number" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="is_active"
          label={labelWithHelp('Status', 'is_active')}
          valuePropName="checked"
        >
          <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
        </Form.Item>
      </Form>
    </Drawer>
  );
}

export default SupplierDrawer; 