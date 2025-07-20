import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Space,
  Modal,
  Form,
  message,
  Tooltip,
  Badge,
  Tag,
  Row,
  Col,
  Statistic,
  Typography,
  Select,
  InputNumber,
  Drawer,
  Divider,
  List,
  Descriptions,
  Empty,
  Spin,
  Alert,
  AutoComplete,
  DatePicker,
  Tabs,
  Steps,
  Checkbox,
  Avatar
} from 'antd';
import {
  RollbackOutlined,
  SearchOutlined,
  DollarOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CalendarOutlined,
  FilterOutlined,
  EyeOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  BarcodeOutlined,
  HistoryOutlined,
  WarningOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { theme } from '../theme';
import moment from 'moment';
import { debounce } from 'lodash';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { Step } = Steps;
const { TextArea } = Input;

const API_BASE = 'http://localhost:8000';

function ReturnsPage() {
  // Active tab
  const [activeTab, setActiveTab] = useState('process');
  
  // Process Return State
  const [currentStep, setCurrentStep] = useState(0);
  const [saleSearch, setSaleSearch] = useState('');
  const [searchingSales, setSearchingSales] = useState(false);
  const [returnableSales, setReturnableSales] = useState([]);
  const [selectedSale, setSelectedSale] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [returnReason, setReturnReason] = useState('');
  const [returnNotes, setReturnNotes] = useState('');
  const [refundMethod, setRefundMethod] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [processing, setProcessing] = useState(false);
  
  // Returns History State
  const [returnsHistory, setReturnsHistory] = useState([]);
  const [loadingReturns, setLoadingReturns] = useState(false);
  const [returnsFilters, setReturnsFilters] = useState({
    startDate: null,
    endDate: null,
    search: '',
    storeId: null
  });
  
  // Return Details
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [returnDetailsDrawerOpen, setReturnDetailsDrawerOpen] = useState(false);
  const [loadingReturnDetails, setLoadingReturnDetails] = useState(false);
  
  // Statistics
  const [returnsStats, setReturnsStats] = useState({
    total_returns: 0,
    returns_count: 0,
    average_return: 0,
    most_returned_products: []
  });
  
  // Store
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null); // Will be auto-selected
  const [currentUser, setCurrentUser] = useState({ user_id: 1 }); // Mock user

  // Debounced search function
  const debouncedSearch = debounce((searchTerm) => {
    if (searchTerm && searchTerm.trim().length >= 2) {
      searchReturnableSales(searchTerm);
    } else {
      setReturnableSales([]);
    }
  }, 500);

  // Load initial data
  useEffect(() => {
    fetchStores();
    fetchPaymentMethods();
    if (activeTab === 'history') {
      fetchReturnsHistory();
      fetchReturnsStats();
    }
    
    // Cleanup debounced function on unmount
    return () => {
      debouncedSearch.cancel();
    };
  }, [activeTab]);

  // Fetch stores
  const fetchStores = async () => {
    try {
      const response = await axios.get(`${API_BASE}/inventory/stores`);
      setStores(response.data);
      
      // Auto-select first active store if none selected
      const activeStores = response.data.filter(store => store.is_active);
      if (activeStores.length > 0 && selectedStore === null) {
        setSelectedStore(activeStores[0].store_id);
      }
    } catch (error) {
      console.error('Failed to fetch stores:', error);
      message.error('Failed to fetch stores');
    }
  };

  // Fetch payment methods
  const fetchPaymentMethods = async () => {
    try {
      const response = await axios.get(`${API_BASE}/sales/payment-methods`, {
        params: { is_active: true }
      });
      setPaymentMethods(response.data);
      if (response.data.length > 0) {
        setRefundMethod(response.data[0].payment_method_id);
      }
    } catch (error) {
      message.error('Failed to fetch payment methods');
    }
  };

  // Search for returnable sales
  const searchReturnableSales = async (searchTerm) => {
    if (!searchTerm || searchTerm.trim().length < 2) {
      message.warning('Please enter at least 2 characters to search');
      setReturnableSales([]);
      return;
    }

    setSearchingSales(true);
    try {
      console.log('Searching for:', searchTerm); // Debug log
      const response = await axios.get(`${API_BASE}/returns/sales/returnable`, {
        params: {
          search: searchTerm.trim(),
          store_id: selectedStore,
          limit: 20
        }
      });
      console.log('Search response:', response.data); // Debug log
      setReturnableSales(response.data);
      
      if (response.data.length === 0) {
        message.info('No returnable sales found for your search');
      }
    } catch (error) {
      console.error('Search error:', error); // Debug log
      message.error('Failed to search sales: ' + (error.response?.data?.detail || error.message));
      setReturnableSales([]);
    } finally {
      setSearchingSales(false);
    }
  };

  // Select sale for return
  const selectSale = (sale) => {
    setSelectedSale(sale);
    setSelectedItems(
      sale.returnable_items.map(item => ({
        ...item,
        quantity_to_return: 0,
        refund_per_item: item.unit_price - item.discount_per_item + item.tax_per_item,
        selected: false
      }))
    );
    setCurrentStep(1);
  };

  // Update item selection
  const updateItemSelection = (index, field, value) => {
    const newItems = [...selectedItems];
    newItems[index][field] = value;
    
    // If quantity changed, ensure it doesn't exceed available
    if (field === 'quantity_to_return') {
      const maxQty = newItems[index].available_to_return;
      newItems[index].quantity_to_return = Math.min(value, maxQty);
    }
    
    setSelectedItems(newItems);
  };

  // Calculate refund total
  const calculateRefundTotal = () => {
    return selectedItems
      .filter(item => item.selected && item.quantity_to_return > 0)
      .reduce((total, item) => {
        return total + (item.quantity_to_return * item.refund_per_item);
      }, 0);
  };

  // Process return
  const processReturn = async () => {
    const itemsToReturn = selectedItems.filter(item => item.selected && item.quantity_to_return > 0);
    
    if (itemsToReturn.length === 0) {
      message.warning('Please select items to return');
      return;
    }

    if (!returnReason) {
      message.warning('Please provide a reason for return');
      return;
    }

    if (!refundMethod) {
      message.warning('Please select a refund method');
      return;
    }

    setProcessing(true);
    try {
      const returnData = {
        sale_id: selectedSale.sale_id,
        reason: returnReason,
        refund_method_id: refundMethod,
        notes: returnNotes,
        return_items: itemsToReturn.map(item => ({
          sale_item_id: item.sale_item_id,
          quantity_returned: item.quantity_to_return,
          refund_per_item: item.refund_per_item
        }))
      };

      const response = await axios.post(
        `${API_BASE}/returns/`,
        returnData,
        { params: { user_id: currentUser.user_id } }
      );

      message.success('Return processed successfully!');
      
      // Show success modal
      Modal.success({
        title: 'Return Processed',
        content: (
          <div>
            <Descriptions bordered size="small" column={1}>
              <Descriptions.Item label="Return ID">
                #{response.data.return_id}
              </Descriptions.Item>
              <Descriptions.Item label="Invoice">
                {response.data.invoice_number}
              </Descriptions.Item>
              <Descriptions.Item label="Refund Amount">
                ${response.data.refund_amount}
              </Descriptions.Item>
              <Descriptions.Item label="Refund Method">
                {response.data.refund_method_name}
              </Descriptions.Item>
            </Descriptions>
          </div>
        ),
        onOk: () => {
          // Reset form
          resetForm();
          
          // Refresh history if on history tab
          if (activeTab === 'history') {
            fetchReturnsHistory();
            fetchReturnsStats();
          }
        }
      });
    } catch (error) {
      message.error(error.response?.data?.detail || 'Failed to process return');
    } finally {
      setProcessing(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setCurrentStep(0);
    setSaleSearch('');
    setReturnableSales([]);
    setSelectedSale(null);
    setSelectedItems([]);
    setReturnReason('');
    setReturnNotes('');
  };

  // Fetch returns history
  const fetchReturnsHistory = async () => {
    setLoadingReturns(true);
    try {
      const params = {};
      if (returnsFilters.startDate) params.start_date = returnsFilters.startDate.toISOString();
      if (returnsFilters.endDate) params.end_date = returnsFilters.endDate.toISOString();
      if (returnsFilters.search) params.search = returnsFilters.search;
      if (returnsFilters.storeId) params.store_id = returnsFilters.storeId;
      
      const response = await axios.get(`${API_BASE}/returns/`, { params });
      setReturnsHistory(response.data);
    } catch (error) {
      message.error('Failed to fetch returns history');
    } finally {
      setLoadingReturns(false);
    }
  };

  // Fetch returns statistics
  const fetchReturnsStats = async () => {
    try {
      const params = {};
      if (returnsFilters.startDate) params.start_date = returnsFilters.startDate.toISOString();
      if (returnsFilters.endDate) params.end_date = returnsFilters.endDate.toISOString();
      if (returnsFilters.storeId) params.store_id = returnsFilters.storeId;
      
      const response = await axios.get(`${API_BASE}/returns/stats/summary`, { params });
      setReturnsStats(response.data);
    } catch (error) {
      console.error('Failed to fetch returns statistics:', error);
    }
  };

  // View return details
  const viewReturnDetails = async (returnId) => {
    setLoadingReturnDetails(true);
    setReturnDetailsDrawerOpen(true);
    try {
      const response = await axios.get(`${API_BASE}/returns/${returnId}`);
      setSelectedReturn(response.data);
    } catch (error) {
      message.error('Failed to fetch return details');
    } finally {
      setLoadingReturnDetails(false);
    }
  };

  // Render Process Return Tab
  const renderProcessTab = () => (
    <div>
      <Steps current={currentStep} style={{ marginBottom: 32 }}>
        <Step title="Find Sale" description="Search for the sale to return" />
        <Step title="Select Items" description="Choose items to return" />
        <Step title="Process Return" description="Complete the return" />
      </Steps>

      {currentStep === 0 && (
        <Card title="Search for Sale">
          <div style={{ maxWidth: 600, margin: '0 auto' }}>
            <Alert
              message="Search for a sale by invoice number or customer information"
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />
            
            {/* Store Selection */}
            <div style={{ marginBottom: 16 }}>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>Store</Text>
              <Select
                style={{ width: '100%' }}
                value={selectedStore}
                onChange={setSelectedStore}
                placeholder="Select store"
                loading={stores.length === 0}
              >
                {stores.filter(store => store.is_active).map(store => (
                  <Option key={store.store_id} value={store.store_id}>
                    {store.store_name}
                  </Option>
                ))}
              </Select>
              {stores.length === 0 && (
                <Alert
                  message="No stores found"
                  description="Please add a store in Settings → Stores"
                  type="error"
                  showIcon
                  style={{ marginTop: 8, fontSize: 12 }}
                />
              )}
            </div>
            
            <Input
              size="large"
              placeholder="Enter invoice number or customer name/phone..."
              value={saleSearch}
              onChange={(e) => {
                setSaleSearch(e.target.value);
                debouncedSearch(e.target.value);
              }}
              onPressEnter={() => debouncedSearch(saleSearch)}
              prefix={<SearchOutlined />}
              suffix={
                <Button
                  type="primary"
                  onClick={() => debouncedSearch(saleSearch)}
                  loading={searchingSales}
                  disabled={!selectedStore}
                >
                  Search
                </Button>
              }
            />

            {returnableSales.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <Title level={5}>Search Results ({returnableSales.length})</Title>
                <List
                  dataSource={returnableSales}
                  loading={searchingSales}
                  renderItem={sale => (
                    <List.Item
                      actions={[
                        <Button
                          type="primary"
                          onClick={() => selectSale(sale)}
                        >
                          Select
                        </Button>
                      ]}
                    >
                      <List.Item.Meta
                        avatar={<Avatar icon={<ShoppingCartOutlined />} />}
                        title={`Invoice: ${sale.invoice_number}`}
                        description={
                          <div>
                            <div>Date: {moment(sale.sale_date).format('YYYY-MM-DD HH:mm')}</div>
                            <div>Customer: {sale.customer_name || 'Walk-in Customer'}</div>
                            <div>Total: ${sale.grand_total}</div>
                            <div>
                              <Badge 
                                count={sale.returnable_items.length} 
                                style={{ backgroundColor: theme.primary }}
                              /> returnable items
                            </div>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              </div>
            )}

            {!searchingSales && saleSearch && saleSearch.trim().length >= 2 && returnableSales.length === 0 && (
              <div style={{ marginTop: 24, textAlign: 'center' }}>
                <Empty
                  description="No returnable sales found"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              </div>
            )}

            {searchingSales && (
              <div style={{ textAlign: 'center', marginTop: 24 }}>
                <Spin />
                <div style={{ marginTop: 8 }}>Searching...</div>
              </div>
            )}
          </div>
        </Card>
      )}

      {currentStep === 1 && selectedSale && (
        <Card 
          title={`Select Items to Return - Invoice: ${selectedSale.invoice_number}`}
          extra={
            <Button onClick={() => setCurrentStep(0)}>
              Back to Search
            </Button>
          }
        >
          <Alert
            message="Select the items you want to return and specify the quantity"
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />

          <Table
            dataSource={selectedItems}
            rowKey="sale_item_id"
            pagination={false}
            columns={[
              {
                title: 'Select',
                key: 'select',
                width: 80,
                align: 'center',
                render: (_, record, index) => (
                  <Checkbox
                    checked={record.selected}
                    onChange={(e) => updateItemSelection(index, 'selected', e.target.checked)}
                  />
                )
              },
              {
                title: 'Product',
                key: 'product',
                render: (_, record) => (
                  <div>
                    <div style={{ fontWeight: 500 }}>{record.product_name}</div>
                    <div style={{ fontSize: 12, color: theme.textSecondary }}>
                      Code: {record.product_code}
                    </div>
                  </div>
                )
              },
              {
                title: 'Sold',
                dataIndex: 'quantity_sold',
                key: 'quantity_sold',
                width: 80,
                align: 'center'
              },
              {
                title: 'Already Returned',
                dataIndex: 'quantity_returned',
                key: 'quantity_returned',
                width: 120,
                align: 'center',
                render: (value) => value || 0
              },
              {
                title: 'Available',
                dataIndex: 'available_to_return',
                key: 'available_to_return',
                width: 100,
                align: 'center',
                render: (value) => (
                  <Badge count={value} style={{ backgroundColor: theme.success }} />
                )
              },
              {
                title: 'Return Qty',
                key: 'return_qty',
                width: 120,
                render: (_, record, index) => (
                  <InputNumber
                    min={0}
                    max={record.available_to_return}
                    value={record.quantity_to_return}
                    onChange={(value) => updateItemSelection(index, 'quantity_to_return', value)}
                    disabled={!record.selected}
                  />
                )
              },
              {
                title: 'Unit Refund',
                key: 'unit_refund',
                width: 120,
                align: 'right',
                render: (_, record, index) => (
                  <InputNumber
                    min={0}
                    value={record.refund_per_item}
                    onChange={(value) => updateItemSelection(index, 'refund_per_item', value)}
                    formatter={value => `$ ${value}`}
                    parser={value => value.replace(/\$ \s?|(,*)/g, '')}
                    disabled={!record.selected}
                    precision={2}
                  />
                )
              },
              {
                title: 'Total Refund',
                key: 'total_refund',
                width: 120,
                align: 'right',
                render: (_, record) => (
                  <Text strong>
                    ${(record.quantity_to_return * record.refund_per_item).toFixed(2)}
                  </Text>
                )
              }
            ]}
          />

          <div style={{ marginTop: 24, textAlign: 'right' }}>
            <Statistic
              title="Total Refund Amount"
              value={calculateRefundTotal()}
              prefix="$"
              precision={2}
              valueStyle={{ color: theme.primary }}
            />
            <Button
              type="primary"
              size="large"
              onClick={() => setCurrentStep(2)}
              disabled={selectedItems.filter(item => item.selected && item.quantity_to_return > 0).length === 0}
              style={{ marginTop: 16 }}
            >
              Continue to Process Return
            </Button>
          </div>
        </Card>
      )}

      {currentStep === 2 && selectedSale && (
        <Card title="Process Return">
          <Row gutter={24}>
            <Col span={16}>
              <Form layout="vertical">
                <Form.Item
                  label="Reason for Return"
                  required
                >
                  <Select
                    size="large"
                    placeholder="Select a reason"
                    value={returnReason}
                    onChange={setReturnReason}
                  >
                    <Option value="Defective Product">Defective Product</Option>
                    <Option value="Wrong Item">Wrong Item</Option>
                    <Option value="Customer Changed Mind">Customer Changed Mind</Option>
                    <Option value="Damaged in Transit">Damaged in Transit</Option>
                    <Option value="Not as Described">Not as Described</Option>
                    <Option value="Other">Other</Option>
                  </Select>
                </Form.Item>

                <Form.Item label="Additional Notes">
                  <TextArea
                    rows={4}
                    value={returnNotes}
                    onChange={(e) => setReturnNotes(e.target.value)}
                    placeholder="Enter any additional notes..."
                  />
                </Form.Item>

                <Form.Item
                  label="Refund Method"
                  required
                >
                  <Select
                    size="large"
                    placeholder="Select refund method"
                    value={refundMethod}
                    onChange={setRefundMethod}
                  >
                    {paymentMethods.map(method => (
                      <Option key={method.payment_method_id} value={method.payment_method_id}>
                        {method.method_name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Form>
            </Col>

            <Col span={8}>
              <Card style={{ backgroundColor: theme.cardBg }}>
                <Title level={5}>Return Summary</Title>
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Invoice">
                    {selectedSale.invoice_number}
                  </Descriptions.Item>
                  <Descriptions.Item label="Customer">
                    {selectedSale.customer_name || 'Walk-in Customer'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Items to Return">
                    {selectedItems.filter(item => item.selected && item.quantity_to_return > 0).length}
                  </Descriptions.Item>
                  <Descriptions.Item label="Total Refund">
                    <Text strong style={{ fontSize: 18, color: theme.primary }}>
                      ${calculateRefundTotal().toFixed(2)}
                    </Text>
                  </Descriptions.Item>
                </Descriptions>

                <Divider />

                <Title level={5}>Items Being Returned</Title>
                <List
                  size="small"
                  dataSource={selectedItems.filter(item => item.selected && item.quantity_to_return > 0)}
                  renderItem={item => (
                    <List.Item>
                      <div style={{ width: '100%' }}>
                        <div>{item.product_name}</div>
                        <div style={{ fontSize: 12, color: theme.textSecondary }}>
                          Qty: {item.quantity_to_return} × ${item.refund_per_item} = ${(item.quantity_to_return * item.refund_per_item).toFixed(2)}
                        </div>
                      </div>
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>

          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <Space size="large">
              <Button
                size="large"
                onClick={() => setCurrentStep(1)}
              >
                Back
              </Button>
              <Button
                type="primary"
                size="large"
                icon={<CheckCircleOutlined />}
                onClick={processReturn}
                loading={processing}
                disabled={!returnReason || !refundMethod}
              >
                Process Return
              </Button>
              <Button
                danger
                size="large"
                onClick={() => {
                  Modal.confirm({
                    title: 'Cancel Return',
                    content: 'Are you sure you want to cancel this return?',
                    onOk: resetForm
                  });
                }}
              >
                Cancel
              </Button>
            </Space>
          </div>
        </Card>
      )}
    </div>
  );

  // Render Returns History Tab
  const renderHistoryTab = () => (
    <div>
      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Returns"
              value={returnsStats.total_returns}
              prefix="$"
              precision={2}
              valueStyle={{ color: theme.warning }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Number of Returns"
              value={returnsStats.returns_count}
              prefix={<RollbackOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Average Return"
              value={returnsStats.average_return}
              prefix="$"
              precision={2}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Return Rate"
              value={returnsStats.returns_count > 0 ? (returnsStats.returns_count / 100 * 100).toFixed(1) : 0}
              suffix="%"
              valueStyle={{ color: theme.error }}
            />
          </Card>
        </Col>
      </Row>

      {/* Most Returned Products */}
      {returnsStats.most_returned_products.length > 0 && (
        <Card title="Most Returned Products" style={{ marginBottom: 24 }}>
          <List
            grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4 }}
            dataSource={returnsStats.most_returned_products.slice(0, 8)}
            renderItem={product => (
              <List.Item>
                <Card size="small">
                  <div style={{ fontWeight: 500 }}>{product.product_name}</div>
                  <div style={{ fontSize: 12, color: theme.textSecondary }}>
                    Code: {product.product_code}
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <Badge count={product.total_returned} style={{ backgroundColor: theme.warning }} />
                    <Text style={{ marginLeft: 8, fontSize: 12 }}>items returned</Text>
                  </div>
                </Card>
              </List.Item>
            )}
          />
        </Card>
      )}

      {/* Returns History */}
      <Card title="Returns History">
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <RangePicker
              style={{ width: '100%' }}
              value={[returnsFilters.startDate, returnsFilters.endDate]}
              onChange={(dates) => {
                setReturnsFilters({
                  ...returnsFilters,
                  startDate: dates?.[0] || null,
                  endDate: dates?.[1] || null
                });
              }}
            />
          </Col>
          <Col span={6}>
            <Select
              style={{ width: '100%' }}
              placeholder="All Stores"
              allowClear
              value={returnsFilters.storeId}
              onChange={(value) => setReturnsFilters({ ...returnsFilters, storeId: value })}
            >
              {stores.filter(store => store.is_active).map(store => (
                <Option key={store.store_id} value={store.store_id}>
                  {store.store_name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={6}>
            <Input
              placeholder="Search by invoice..."
              value={returnsFilters.search}
              onChange={(e) => setReturnsFilters({ ...returnsFilters, search: e.target.value })}
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col span={6}>
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={() => {
                fetchReturnsHistory();
                fetchReturnsStats();
              }}
              block
            >
              Search
            </Button>
          </Col>
        </Row>

        <Table
          loading={loadingReturns}
          dataSource={returnsHistory}
          rowKey="return_id"
          columns={[
            {
              title: 'Return ID',
              dataIndex: 'return_id',
              key: 'return_id',
              render: (id) => `#${id}`
            },
            {
              title: 'Date',
              dataIndex: 'return_date',
              key: 'return_date',
              render: (date) => moment(date).format('YYYY-MM-DD HH:mm')
            },
            {
              title: 'Invoice',
              dataIndex: 'invoice_number',
              key: 'invoice_number',
              render: (text) => <Text strong>{text}</Text>
            },
            {
              title: 'Customer',
              dataIndex: 'customer_name',
              key: 'customer_name',
              render: (name) => name || 'Walk-in Customer'
            },
            {
              title: 'Items',
              dataIndex: 'items_count',
              key: 'items_count',
              align: 'center'
            },
            {
              title: 'Refund Amount',
              dataIndex: 'refund_amount',
              key: 'refund_amount',
              align: 'right',
              render: (amount) => (
                <Text strong style={{ color: theme.warning }}>
                  ${amount}
                </Text>
              )
            },
            {
              title: 'Reason',
              dataIndex: 'reason',
              key: 'reason',
              ellipsis: true
            },
            {
              title: 'Actions',
              key: 'actions',
              align: 'center',
              render: (_, record) => (
                <Button
                  type="link"
                  icon={<EyeOutlined />}
                  onClick={() => viewReturnDetails(record.return_id)}
                >
                  View
                </Button>
              )
            }
          ]}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} returns`
          }}
        />
      </Card>
    </div>
  );

  return (
    <div style={{
      background: theme.contentBg,
      minHeight: '100vh',
      padding: 24,
      fontFamily: theme.fontFamily
    }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>
          <RollbackOutlined /> Returns Management
        </Title>
        {selectedStore && (
          <div style={{ marginTop: 8 }}>
            <Tag color="green" icon={<CheckCircleOutlined />}>
              {stores.find(s => s.store_id === selectedStore)?.store_name}
            </Tag>
            <Tag color="blue">
              User: {currentUser.first_name || currentUser.username || 'Unknown'}
            </Tag>
          </div>
        )}
        {!selectedStore && (
          <div style={{ marginTop: 8 }}>
            <Tag color="orange" icon={<ExclamationCircleOutlined />}>
              Setup Required: Please select a store
            </Tag>
          </div>
        )}
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab} size="large">
        <TabPane tab={<span><RollbackOutlined /> Process Return</span>} key="process">
          {renderProcessTab()}
        </TabPane>
        <TabPane tab={<span><HistoryOutlined /> Returns History</span>} key="history">
          {renderHistoryTab()}
        </TabPane>
      </Tabs>

      {/* Return Details Drawer */}
      <Drawer
        title="Return Details"
        width={720}
        open={returnDetailsDrawerOpen}
        onClose={() => {
          setReturnDetailsDrawerOpen(false);
          setSelectedReturn(null);
        }}
      >
        {loadingReturnDetails ? (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <Spin size="large" />
          </div>
        ) : selectedReturn ? (
          <div>
            <Descriptions bordered column={2} style={{ marginBottom: 24 }}>
              <Descriptions.Item label="Return ID">
                #{selectedReturn.return_id}
              </Descriptions.Item>
              <Descriptions.Item label="Return Date">
                {moment(selectedReturn.return_date).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
              <Descriptions.Item label="Original Invoice">
                {selectedReturn.invoice_number}
              </Descriptions.Item>
              <Descriptions.Item label="Original Sale Date">
                {moment(selectedReturn.original_sale_date).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
              <Descriptions.Item label="Customer" span={2}>
                {selectedReturn.customer_name || 'Walk-in Customer'}
              </Descriptions.Item>
              <Descriptions.Item label="Processed By">
                {selectedReturn.returned_by_name}
              </Descriptions.Item>
              <Descriptions.Item label="Refund Method">
                {selectedReturn.refund_method_name}
              </Descriptions.Item>
              <Descriptions.Item label="Reason" span={2}>
                {selectedReturn.reason}
              </Descriptions.Item>
              {selectedReturn.notes && (
                <Descriptions.Item label="Notes" span={2}>
                  {selectedReturn.notes}
                </Descriptions.Item>
              )}
            </Descriptions>

            <Title level={5}>Returned Items</Title>
            <Table
              dataSource={selectedReturn.return_items}
              rowKey="return_item_id"
              pagination={false}
              style={{ marginBottom: 24 }}
              columns={[
                {
                  title: 'Product',
                  dataIndex: 'product_name',
                  key: 'product_name'
                },
                {
                  title: 'Code',
                  dataIndex: 'product_code',
                  key: 'product_code'
                },
                {
                  title: 'Quantity',
                  dataIndex: 'quantity_returned',
                  key: 'quantity_returned',
                  align: 'center'
                },
                {
                  title: 'Refund Per Item',
                  dataIndex: 'refund_per_item',
                  key: 'refund_per_item',
                  align: 'right',
                  render: (amount) => `$${amount}`
                },
                {
                  title: 'Total',
                  key: 'total',
                  align: 'right',
                  render: (_, record) => (
                    <Text strong>
                      ${(record.quantity_returned * record.refund_per_item).toFixed(2)}
                    </Text>
                  )
                }
              ]}
            />

            <div style={{ textAlign: 'right' }}>
              <Statistic
                title="Total Refund Amount"
                value={selectedReturn.refund_amount}
                prefix="$"
                precision={2}
                valueStyle={{ color: theme.warning, fontSize: 24 }}
              />
            </div>
          </div>
        ) : null}
      </Drawer>
    </div>
  );
}

export default ReturnsPage; 