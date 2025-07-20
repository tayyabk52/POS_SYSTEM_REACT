import React, { useState, useEffect, useRef } from 'react';
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
  Avatar,
  List,
  Descriptions,
  Empty,
  Spin,
  Alert,
  AutoComplete,
  Popconfirm,
  DatePicker,
  Radio,
  Tabs,
  Result
} from 'antd';
import {
  ShoppingCartOutlined,
  BarcodeOutlined,
  UserOutlined,
  DeleteOutlined,
  PlusOutlined,
  MinusOutlined,
  DollarOutlined,
  PrinterOutlined,
  SaveOutlined,
  CloseOutlined,
  SearchOutlined,
  CalculatorOutlined,
  CreditCardOutlined,
  WalletOutlined,
  BankOutlined,
  MobileOutlined,
  GiftOutlined,
  HistoryOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  SyncOutlined,
  ShoppingOutlined,
  TeamOutlined,
  CalendarOutlined,
  FilterOutlined,
  DownloadOutlined,
  EyeOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { theme } from '../theme';
import moment from 'moment';
import { useSettings } from '../contexts/SettingsContext';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const API_BASE = 'http://localhost:8000';

function SalesPage({ user }) {
  // Settings context
  const { getSetting } = useSettings();
  
  // POS State
  const [activeTab, setActiveTab] = useState('pos');
  const [cart, setCart] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  
  // Product Search
  const [productSearch, setProductSearch] = useState('');
  const [productSearchResults, setProductSearchResults] = useState([]);
  const [searchingProducts, setSearchingProducts] = useState(false);
  
  // Customer Search
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerSearchResults, setCustomerSearchResults] = useState([]);
  const [searchingCustomers, setSearchingCustomers] = useState(false);
  
  // Sales History
  const [salesHistory, setSalesHistory] = useState([]);
  const [loadingSales, setLoadingSales] = useState(false);
  const [salesFilters, setSalesFilters] = useState({
    startDate: null,
    endDate: null,
    paymentStatus: null,
    search: ''
  });
  
  // Sale Details
  const [selectedSale, setSelectedSale] = useState(null);
  const [saleDetailsDrawerOpen, setSaleDetailsDrawerOpen] = useState(false);
  const [loadingSaleDetails, setLoadingSaleDetails] = useState(false);
  
  // Statistics
  const [salesStats, setSalesStats] = useState({
    total_sales: 0,
    sales_count: 0,
    average_sale: 0,
    total_tax: 0,
    total_discount: 0
  });
  const [dailyReport, setDailyReport] = useState(null);
  
  // Store and Terminal
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null); // Will be auto-selected
  const [selectedTerminal, setSelectedTerminal] = useState(null); // Will be auto-selected
  const currentUser = user || { user_id: 1 }; // Use prop user or fallback
  
  // POS Terminals
  const [posTerminals, setPosTerminals] = useState([]);
  const [availableTerminals, setAvailableTerminals] = useState([]);
  
  // Refs
  const barcodeInputRef = useRef(null);
  const paymentInputRef = useRef(null);

  // Load initial data
  useEffect(() => {
    fetchPaymentMethods();
    fetchStores();
    fetchPosTerminals();
    if (activeTab === 'history') {
      fetchSalesHistory();
      fetchSalesStats();
    }
  }, [activeTab]);

  // Update available terminals when store changes
  useEffect(() => {
    if (selectedStore && posTerminals.length > 0) {
      const storeTerminals = posTerminals.filter(terminal => 
        terminal.store_id === selectedStore && terminal.is_active
      );
      setAvailableTerminals(storeTerminals);
      
      // Auto-select first available terminal
      if (storeTerminals.length > 0) {
        setSelectedTerminal(storeTerminals[0].terminal_id);
        } else {
        setSelectedTerminal(null);
      }
    }
  }, [selectedStore, posTerminals]);

  // Focus barcode input
  useEffect(() => {
    if (activeTab === 'pos' && barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, [activeTab]);

  // Fetch payment methods
  const fetchPaymentMethods = async () => {
    try {
      const response = await axios.get(`${API_BASE}/sales/payment-methods`, {
        params: { is_active: true }
      });
      setPaymentMethods(response.data);
      if (response.data.length > 0) {
        setSelectedPaymentMethod(response.data[0].payment_method_id);
      }
    } catch (error) {
      message.error('Failed to fetch payment methods');
    }
  };

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

  // Fetch POS terminals
  const fetchPosTerminals = async () => {
    try {
      const response = await axios.get(`${API_BASE}/settings/pos-terminals`);
      setPosTerminals(response.data);
    } catch (error) {
      console.error('Failed to fetch POS terminals:', error);
      message.error('Failed to fetch POS terminals');
    }
  };

  // Search products
  const searchProducts = async (searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) {
      setProductSearchResults([]);
      return;
    }

    setSearchingProducts(true);
    try {
      const response = await axios.get(`${API_BASE}/sales/products/search`, {
        params: {
          search: searchTerm,
          store_id: selectedStore,
          limit: 20
        }
      });
      setProductSearchResults(response.data);
    } catch (error) {
      message.error('Failed to search products');
    } finally {
      setSearchingProducts(false);
    }
  };

  // Search customers
  const searchCustomers = async (searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) {
      setCustomerSearchResults([]);
      return;
    }

    setSearchingCustomers(true);
    try {
      const response = await axios.get(`${API_BASE}/sales/customers/search`, {
        params: {
          search: searchTerm,
          limit: 20
        }
      });
      setCustomerSearchResults(response.data);
    } catch (error) {
      message.error('Failed to search customers');
    } finally {
      setSearchingCustomers(false);
    }
  };

  // Add product to cart
  const addToCart = (product) => {
    const existingItem = cart.find(item => item.product_id === product.product_id);
    
    if (existingItem) {
      // Update quantity
      setCart(cart.map(item =>
        item.product_id === product.product_id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      // Add new item
      setCart([...cart, {
        ...product,
        quantity: 1,
        discount_per_item: 0
      }]);
    }
    
    // Clear search
    setProductSearch('');
    setProductSearchResults([]);
    
    // Focus back to barcode input
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  };

  // Update cart item quantity
  const updateCartItemQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(cart.map(item =>
        item.product_id === productId
          ? { ...item, quantity }
          : item
      ));
    }
  };

  // Update cart item discount
  const updateCartItemDiscount = (productId, discount) => {
    setCart(cart.map(item =>
      item.product_id === productId
        ? { ...item, discount_per_item: discount }
        : item
    ));
  };

  // Remove from cart
  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.product_id !== productId));
  };

  // Clear cart
  const clearCart = () => {
    setCart([]);
    setSelectedCustomer(null);
    setDiscount(0);
    setNotes('');
  };

  // Calculate totals
  const calculateTotals = () => {
    let subtotal = 0;
    let totalTax = 0;
    let totalItemDiscount = 0;

    cart.forEach(item => {
      const itemSubtotal = item.quantity * item.retail_price;
      const itemDiscount = item.quantity * (item.discount_per_item || 0);
      const taxableAmount = itemSubtotal - itemDiscount;
      const itemTax = (taxableAmount * (item.tax_rate || 0)) / 100;
      
      subtotal += itemSubtotal;
      totalItemDiscount += itemDiscount;
      totalTax += itemTax;
    });

    const subtotalAfterDiscount = subtotal - totalItemDiscount - discount;
    const grandTotal = subtotalAfterDiscount + totalTax;

    return {
      subtotal,
      totalItemDiscount,
      discount,
      totalTax,
      grandTotal
    };
  };

  // Process sale
  const processSale = async (paymentAmount) => {
    if (cart.length === 0) {
      message.warning('Cart is empty');
      return;
    }

    if (!selectedStore) {
      message.warning('Please select a store');
      return;
    }

    if (!selectedTerminal) {
      message.warning('Please select a POS terminal');
      return;
    }

    if (!selectedPaymentMethod) {
      message.warning('Please select a payment method');
      return;
    }

    const totals = calculateTotals();
    
    if (paymentAmount < totals.grandTotal) {
      message.warning('Payment amount is insufficient');
      return;
    }

    setProcessing(true);
    try {
      // Prepare sale data
      const saleData = {
        store_id: selectedStore,
        pos_terminal_id: selectedTerminal,
        customer_id: selectedCustomer?.customer_id || null,
        discount_amount: discount,
        notes: notes,
        sale_items: cart.map(item => ({
          product_id: item.product_id,
          variant_id: null,
          quantity: item.quantity,
          unit_price: item.retail_price,
          discount_per_item: item.discount_per_item || 0
        })),
        payments: [{
          payment_method_id: selectedPaymentMethod,
          amount: paymentAmount
        }]
      };

      const response = await axios.post(
        `${API_BASE}/sales/`,
        saleData,
        { params: { user_id: currentUser.user_id } }
      );

      message.success('Sale completed successfully!');
      
      // Show receipt modal
      showReceipt(response.data);
      
      // Clear cart
      clearCart();
      
      // Refresh sales history if on history tab
      if (activeTab === 'history') {
        fetchSalesHistory();
        fetchSalesStats();
      }
    } catch (error) {
      console.error('Sale processing error:', error);
      let errorMessage = 'Failed to process sale';
      
      if (error.response?.data?.detail) {
        if (typeof error.response.data.detail === 'string') {
          errorMessage = error.response.data.detail;
        } else if (Array.isArray(error.response.data.detail)) {
          errorMessage = error.response.data.detail.map(err => 
            typeof err === 'string' ? err : err.msg || 'Validation error'
          ).join(', ');
        } else {
          errorMessage = 'Validation error occurred';
        }
      }
      
      message.error(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  // Show receipt
  const showReceipt = (sale) => {
    const ReceiptContent = () => {
      const storeName = getSetting('store_name', 'POS System');
      const storeAddress = getSetting('store_address', '');
      const storePhone = getSetting('store_phone', '');
      const storeEmail = getSetting('store_email', '');
      const taxNumber = getSetting('tax_number', '');
      const receiptHeader = getSetting('receipt_header', 'Thank you for shopping with us!');
      const receiptFooter = getSetting('receipt_footer', 'Please come again!');
      const showTaxOnReceipt = getSetting('show_tax_on_receipt', 'true') === 'true';
      const currencySymbol = getSetting('currency_symbol', '$');
      const dateFormat = getSetting('date_format', 'MM/DD/YYYY');
      const timeFormat = getSetting('time_format', '12');
      
      const formatDate = (date) => {
        if (dateFormat === 'MM/DD/YYYY') {
          return moment(date).format('MM/DD/YYYY');
        } else if (dateFormat === 'DD/MM/YYYY') {
          return moment(date).format('DD/MM/YYYY');
        } else {
          return moment(date).format('YYYY-MM-DD');
        }
      };
      
      const formatTime = (date) => {
        if (timeFormat === '12') {
          return moment(date).format('hh:mm A');
        } else {
          return moment(date).format('HH:mm');
        }
      };

  return (
        <div style={{ 
          fontFamily: 'monospace', 
          fontSize: '12px',
          lineHeight: '1.4',
          maxWidth: '400px',
          margin: '0 auto',
          padding: '20px',
          border: '1px solid #d9d9d9',
          borderRadius: '8px',
          background: '#fff'
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '4px' }}>
              {storeName}
            </div>
            {storeAddress && (
              <div style={{ fontSize: '10px', marginBottom: '2px' }}>
                {storeAddress}
              </div>
            )}
            {storePhone && (
              <div style={{ fontSize: '10px', marginBottom: '2px' }}>
                Tel: {storePhone}
              </div>
            )}
            {storeEmail && (
              <div style={{ fontSize: '10px', marginBottom: '4px' }}>
                {storeEmail}
              </div>
            )}
            {taxNumber && (
              <div style={{ fontSize: '10px', marginBottom: '4px' }}>
                Tax Reg: {taxNumber}
              </div>
            )}
            <Divider style={{ margin: '8px 0' }} />
          </div>

          {/* Receipt Header */}
          {receiptHeader && (
            <div style={{ textAlign: 'center', marginBottom: '12px', fontSize: '11px' }}>
              {receiptHeader}
            </div>
          )}

          {/* Sale Details */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
              <span>Invoice:</span>
              <span style={{ fontWeight: 'bold' }}>{sale.invoice_number}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
              <span>Date:</span>
              <span>{formatDate(sale.sale_date)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
              <span>Time:</span>
              <span>{formatTime(sale.sale_date)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
              <span>Customer:</span>
              <span>{sale.customer_name || 'Walk-in Customer'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
              <span>Cashier:</span>
              <span>{sale.cashier_name || 'Unknown'}</span>
            </div>
          </div>

          <Divider style={{ margin: '8px 0' }} />

          {/* Items */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ textAlign: 'center', marginBottom: '8px', fontWeight: 'bold' }}>
              ITEMS
            </div>
            {sale.sale_items?.map((item, index) => (
              <div key={index} style={{ marginBottom: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ flex: 1 }}>{item.product_name}</span>
                  <span>{item.quantity} x {currencySymbol}{item.unit_price}</span>
                </div>
                {item.discount_per_item > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#666' }}>
                    <span>Discount:</span>
                    <span>-{currencySymbol}{item.discount_per_item}</span>
                  </div>
                )}
                {showTaxOnReceipt && item.tax_per_item > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#666' }}>
                    <span>Tax:</span>
                    <span>{currencySymbol}{item.tax_per_item}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                  <span>Subtotal:</span>
                  <span>{currencySymbol}{item.line_total}</span>
                </div>
              </div>
            ))}
          </div>

          <Divider style={{ margin: '8px 0' }} />

          {/* Totals */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
              <span>Subtotal:</span>
              <span>{currencySymbol}{sale.sub_total}</span>
            </div>
            {sale.discount_amount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                <span>Discount:</span>
                <span>-{currencySymbol}{sale.discount_amount}</span>
              </div>
            )}
            {showTaxOnReceipt && sale.tax_amount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                <span>Tax:</span>
                <span>{currencySymbol}{sale.tax_amount}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px', fontWeight: 'bold' }}>
              <span>TOTAL:</span>
              <span>{currencySymbol}{sale.grand_total}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
              <span>Paid:</span>
              <span>{currencySymbol}{sale.amount_paid}</span>
            </div>
            {sale.change_given > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                <span>Change:</span>
                <span>{currencySymbol}{sale.change_given}</span>
              </div>
            )}
          </div>

          {/* Payment Method */}
          {sale.payments?.length > 0 && (
            <div style={{ marginBottom: '12px' }}>
              <div style={{ textAlign: 'center', marginBottom: '4px', fontWeight: 'bold' }}>
                PAYMENT
              </div>
              {sale.payments.map((payment, index) => (
                <div key={index} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{payment.method_name}:</span>
                  <span>{currencySymbol}{payment.amount}</span>
                </div>
              ))}
            </div>
          )}

          <Divider style={{ margin: '8px 0' }} />

          {/* Footer */}
          {receiptFooter && (
            <div style={{ textAlign: 'center', fontSize: '11px', marginBottom: '8px' }}>
              {receiptFooter}
            </div>
          )}

          {/* Additional Info */}
          <div style={{ textAlign: 'center', fontSize: '10px', color: '#666' }}>
            <div>Thank you for your purchase!</div>
            <div>Keep this receipt for your records</div>
            {sale.customer_id && (
              <div style={{ marginTop: '4px', fontWeight: 'bold', color: theme.primary }}>
                Loyalty Points Earned: {Math.floor(sale.grand_total / 100)}
              </div>
            )}
            <div style={{ marginTop: '4px' }}>
              {formatDate(sale.sale_date)} {formatTime(sale.sale_date)}
            </div>
          </div>
        </div>
      );
    };

    Modal.success({
      title: 'Sale Completed',
      width: 450,
      content: <ReceiptContent />,
      okText: 'Print Receipt',
      cancelText: 'Close',
      onOk: () => {
        printReceipt(sale);
        message.success('Receipt printed successfully!');
      }
    });
  };

  // Print receipt function
  const printReceipt = (sale) => {
    try {
      const storeName = getSetting('store_name', 'POS System');
      const storeAddress = getSetting('store_address', '');
      const storePhone = getSetting('store_phone', '');
      const storeEmail = getSetting('store_email', '');
      const taxNumber = getSetting('tax_number', '');
      const receiptHeader = getSetting('receipt_header', 'Thank you for shopping with us!');
      const receiptFooter = getSetting('receipt_footer', 'Please come again!');
      const showTaxOnReceipt = getSetting('show_tax_on_receipt', 'true') === 'true';
      const currencySymbol = getSetting('currency_symbol', '$');
      const dateFormat = getSetting('date_format', 'MM/DD/YYYY');
      const timeFormat = getSetting('time_format', '12');
      
      const formatDate = (date) => {
        if (dateFormat === 'MM/DD/YYYY') {
          return moment(date).format('MM/DD/YYYY');
        } else if (dateFormat === 'DD/MM/YYYY') {
          return moment(date).format('DD/MM/YYYY');
        } else {
          return moment(date).format('YYYY-MM-DD');
        }
      };
      
      const formatTime = (date) => {
        if (timeFormat === '12') {
          return moment(date).format('hh:mm A');
        } else {
          return moment(date).format('HH:mm');
        }
      };

      // Create print content
      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Receipt - ${sale.invoice_number}</title>
          <style>
            body {
              font-family: monospace;
              font-size: 12px;
              line-height: 1.4;
              margin: 0;
              padding: 20px;
              max-width: 400px;
              margin: 0 auto;
            }
            .header {
              text-align: center;
              margin-bottom: 16px;
            }
            .store-name {
              font-size: 16px;
              font-weight: bold;
              margin-bottom: 4px;
            }
            .store-info {
              font-size: 10px;
              margin-bottom: 2px;
            }
            .divider {
              border-top: 1px solid #000;
              margin: 8px 0;
            }
            .receipt-header {
              text-align: center;
              margin-bottom: 12px;
              font-size: 11px;
            }
            .sale-details {
              margin-bottom: 12px;
            }
            .detail-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 2px;
            }
            .items-section {
              margin-bottom: 12px;
            }
            .items-title {
              text-align: center;
              margin-bottom: 8px;
              font-weight: bold;
            }
            .item {
              margin-bottom: 4px;
            }
            .item-row {
              display: flex;
              justify-content: space-between;
            }
            .item-discount, .item-tax {
              font-size: 10px;
              color: #666;
            }
            .item-subtotal {
              font-weight: bold;
            }
            .totals-section {
              margin-bottom: 12px;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 2px;
            }
            .total-final {
              font-weight: bold;
            }
            .payment-section {
              margin-bottom: 12px;
            }
            .payment-title {
              text-align: center;
              margin-bottom: 4px;
              font-weight: bold;
            }
            .footer {
              text-align: center;
              font-size: 11px;
              margin-bottom: 8px;
            }
            .additional-info {
              text-align: center;
              font-size: 10px;
              color: #666;
            }
            @media print {
              body {
                margin: 0;
                padding: 10px;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="store-name">${storeName}</div>
            ${storeAddress ? `<div class="store-info">${storeAddress}</div>` : ''}
            ${storePhone ? `<div class="store-info">Tel: ${storePhone}</div>` : ''}
            ${storeEmail ? `<div class="store-info">${storeEmail}</div>` : ''}
            ${taxNumber ? `<div class="store-info">Tax Reg: ${taxNumber}</div>` : ''}
            <div class="divider"></div>
          </div>

          ${receiptHeader ? `<div class="receipt-header">${receiptHeader}</div>` : ''}

          <div class="sale-details">
            <div class="detail-row">
              <span>Invoice:</span>
              <span style="font-weight: bold;">${sale.invoice_number}</span>
            </div>
            <div class="detail-row">
              <span>Date:</span>
              <span>${formatDate(sale.sale_date)}</span>
            </div>
            <div class="detail-row">
              <span>Time:</span>
              <span>${formatTime(sale.sale_date)}</span>
            </div>
            <div class="detail-row">
              <span>Customer:</span>
              <span>${sale.customer_name || 'Walk-in Customer'}</span>
            </div>
            <div class="detail-row">
              <span>Cashier:</span>
              <span>${sale.cashier_name || 'Unknown'}</span>
            </div>
          </div>

          <div class="divider"></div>

          <div class="items-section">
            <div class="items-title">ITEMS</div>
            ${sale.sale_items?.map(item => `
              <div class="item">
                <div class="item-row">
                  <span style="flex: 1;">${item.product_name}</span>
                  <span>${item.quantity} x ${currencySymbol}${item.unit_price}</span>
                </div>
                ${item.discount_per_item > 0 ? `
                  <div class="item-row item-discount">
                    <span>Discount:</span>
                    <span>-${currencySymbol}${item.discount_per_item}</span>
                  </div>
                ` : ''}
                ${showTaxOnReceipt && item.tax_per_item > 0 ? `
                  <div class="item-row item-tax">
                    <span>Tax:</span>
                    <span>${currencySymbol}${item.tax_per_item}</span>
                  </div>
                ` : ''}
                <div class="item-row item-subtotal">
                  <span>Subtotal:</span>
                  <span>${currencySymbol}${item.line_total}</span>
                </div>
              </div>
            `).join('') || ''}
          </div>

          <div class="divider"></div>

          <div class="totals-section">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>${currencySymbol}${sale.sub_total}</span>
            </div>
            ${sale.discount_amount > 0 ? `
              <div class="total-row">
                <span>Discount:</span>
                <span>-${currencySymbol}${sale.discount_amount}</span>
              </div>
            ` : ''}
            ${showTaxOnReceipt && sale.tax_amount > 0 ? `
              <div class="total-row">
                <span>Tax:</span>
                <span>${currencySymbol}${sale.tax_amount}</span>
              </div>
            ` : ''}
            <div class="total-row total-final">
              <span>TOTAL:</span>
              <span>${currencySymbol}${sale.grand_total}</span>
            </div>
            <div class="total-row">
              <span>Paid:</span>
              <span>${currencySymbol}${sale.amount_paid}</span>
            </div>
            ${sale.change_given > 0 ? `
              <div class="total-row">
                <span>Change:</span>
                <span>${currencySymbol}${sale.change_given}</span>
              </div>
            ` : ''}
          </div>

          ${sale.payments?.length > 0 ? `
            <div class="payment-section">
              <div class="payment-title">PAYMENT</div>
              ${sale.payments.map(payment => `
                <div class="detail-row">
                  <span>${payment.method_name}:</span>
                  <span>${currencySymbol}${payment.amount}</span>
                </div>
              `).join('')}
            </div>
          ` : ''}

          <div class="divider"></div>

          ${receiptFooter ? `<div class="footer">${receiptFooter}</div>` : ''}

          <div class="additional-info">
            <div>Thank you for your purchase!</div>
            <div>Keep this receipt for your records</div>
            ${sale.customer_id ? `
            <div style="margin-top: 4px; font-weight: bold; color: #1890ff;">
              Loyalty Points Earned: ${Math.floor(sale.grand_total / 100)}
            </div>
            ` : ''}
            <div style="margin-top: 4px;">
              ${formatDate(sale.sale_date)} ${formatTime(sale.sale_date)}
            </div>
          </div>
        </body>
        </html>
      `;

      // Create a new window for printing
      const printWindow = window.open('', '_blank', 'width=600,height=800,scrollbars=yes,resizable=yes');
      
      if (printWindow) {
        printWindow.document.write(printContent);
        printWindow.document.close();
        
        // Wait for content to load then print
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print();
            // Don't close immediately, let user decide
            // printWindow.close();
          }, 500);
        };
        
        // Fallback if onload doesn't fire
        setTimeout(() => {
          if (printWindow.document.readyState === 'complete') {
            printWindow.print();
          }
        }, 1000);
        
        message.success('Print window opened successfully!');
      } else {
        // Fallback if popup is blocked
        message.error('Popup blocked! Please allow popups for this site to print receipts.');
        
        // Alternative: Show receipt in a modal
        Modal.info({
          title: 'Receipt (Popup Blocked)',
          width: 600,
          content: (
            <div>
        <Alert
                message="Popup Blocked"
                description="The print window was blocked by your browser. Please allow popups for this site or use the browser's print function (Ctrl+P) on this page."
                type="warning"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <div dangerouslySetInnerHTML={{ __html: printContent }} />
            </div>
          ),
          okText: 'Close'
        });
      }
    } catch (error) {
      console.error('Print error:', error);
      message.error('Failed to print receipt. Please try again.');
    }
  };

  // Fetch sales history
  const fetchSalesHistory = async () => {
    setLoadingSales(true);
    try {
      const params = {};
      if (salesFilters.startDate) params.start_date = salesFilters.startDate.toISOString();
      if (salesFilters.endDate) params.end_date = salesFilters.endDate.toISOString();
      if (salesFilters.paymentStatus) params.payment_status = salesFilters.paymentStatus;
      if (salesFilters.search) params.search = salesFilters.search;
      
      const response = await axios.get(`${API_BASE}/sales/`, { params });
      setSalesHistory(response.data);
    } catch (error) {
      message.error('Failed to fetch sales history');
    } finally {
      setLoadingSales(false);
    }
  };

  // Fetch sales statistics
  const fetchSalesStats = async () => {
    try {
      const params = {};
      if (salesFilters.startDate) params.start_date = salesFilters.startDate.toISOString();
      if (salesFilters.endDate) params.end_date = salesFilters.endDate.toISOString();
      
      const response = await axios.get(`${API_BASE}/sales/stats/summary`, { params });
      setSalesStats(response.data);
      
      // Fetch daily report for today
      const today = moment().format('YYYY-MM-DD');
      const dailyResponse = await axios.get(`${API_BASE}/sales/stats/daily-report`, {
        params: { report_date: today }
      });
      setDailyReport(dailyResponse.data);
    } catch (error) {
      console.error('Failed to fetch sales statistics:', error);
    }
  };

  // View sale details
  const viewSaleDetails = async (saleId) => {
    setLoadingSaleDetails(true);
    setSaleDetailsDrawerOpen(true);
    try {
      const response = await axios.get(`${API_BASE}/sales/${saleId}`);
      setSelectedSale(response.data);
    } catch (error) {
      message.error('Failed to fetch sale details');
    } finally {
      setLoadingSaleDetails(false);
    }
  };

  // Void sale
  const voidSale = async (saleId, reason) => {
    try {
      await axios.post(
        `${API_BASE}/sales/${saleId}/void`,
        reason,
        {
          params: { user_id: currentUser.user_id },
          headers: { 'Content-Type': 'text/plain' }
        }
      );
      message.success('Sale voided successfully');
      setSaleDetailsDrawerOpen(false);
      fetchSalesHistory();
      fetchSalesStats();
    } catch (error) {
      message.error(error.response?.data?.detail || 'Failed to void sale');
    }
  };

  // Render POS Tab
  const renderPOSTab = () => (
    <Row gutter={16}>
      {/* Left: Product Search and Cart */}
      <Col span={16}>
        <Card title="Shopping Cart" style={{ height: 'calc(100vh - 200px)' }}>
          {/* Product Search */}
          <div style={{ marginBottom: 16 }}>
            <AutoComplete
              style={{ width: '100%' }}
              value={productSearch}
              onChange={setProductSearch}
              onSearch={searchProducts}
              placeholder="Search products by name, code, or barcode..."
              options={productSearchResults.map(product => ({
                value: product.product_id.toString(),
                label: (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{product.product_name}</span>
                    <span>${product.retail_price}</span>
                  </div>
                ),
                product
              }))}
              onSelect={(value, option) => addToCart(option.product)}
              loading={searchingProducts}
              ref={barcodeInputRef}
            >
              <Input
                prefix={<BarcodeOutlined />}
                size="large"
                placeholder="Scan barcode or search products..."
              />
            </AutoComplete>
          </div>

          {/* Cart Items */}
          <div style={{ height: 'calc(100% - 200px)', overflowY: 'auto' }}>
            {cart.length === 0 ? (
              <Empty description="Cart is empty" />
            ) : (
              <List
                dataSource={cart}
                renderItem={item => (
                  <List.Item
                    actions={[
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => removeFromCart(item.product_id)}
                      />
                    ]}
                  >
                    <List.Item.Meta
                      title={item.product_name}
                      description={`Code: ${item.product_code} | Price: $${item.retail_price}`}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <InputNumber
                        min={1}
                        value={item.quantity}
                        onChange={(value) => updateCartItemQuantity(item.product_id, value)}
                        style={{ width: 80 }}
                      />
                      <InputNumber
                        min={0}
                        value={item.discount_per_item}
                        onChange={(value) => updateCartItemDiscount(item.product_id, value)}
                        formatter={value => `$ ${value}`}
                        parser={value => value.replace(/\$ \s?|(,*)/g, '')}
                        style={{ width: 100 }}
                        placeholder="Discount"
                      />
                      <Text strong>${((item.quantity * item.retail_price) - (item.quantity * item.discount_per_item)).toFixed(2)}</Text>
                    </div>
                  </List.Item>
                )}
              />
            )}
          </div>

          {/* Cart Summary */}
          <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
            {(() => {
              const totals = calculateTotals();
  return (
                <Row gutter={[16, 8]}>
                  <Col span={12}>Subtotal:</Col>
                  <Col span={12} style={{ textAlign: 'right' }}>${totals.subtotal.toFixed(2)}</Col>
                  <Col span={12}>Item Discounts:</Col>
                  <Col span={12} style={{ textAlign: 'right' }}>-${totals.totalItemDiscount.toFixed(2)}</Col>
                  <Col span={12}>Overall Discount:</Col>
                  <Col span={12} style={{ textAlign: 'right' }}>
                    <InputNumber
                      min={0}
                      value={discount}
                      onChange={setDiscount}
                      formatter={value => `$ ${value}`}
                      parser={value => value.replace(/\$ \s?|(,*)/g, '')}
                      style={{ width: 100 }}
                    />
                  </Col>
                  <Col span={12}>Tax:</Col>
                  <Col span={12} style={{ textAlign: 'right' }}>${totals.totalTax.toFixed(2)}</Col>
                  <Col span={24}><Divider style={{ margin: '8px 0' }} /></Col>
                  <Col span={12}><Text strong style={{ fontSize: 18 }}>Total:</Text></Col>
                  <Col span={12} style={{ textAlign: 'right' }}>
                    <Text strong style={{ fontSize: 18 }}>${totals.grandTotal.toFixed(2)}</Text>
                  </Col>
                </Row>
              );
            })()}
          </div>
        </Card>
      </Col>

      {/* Right: Customer and Payment */}
      <Col span={8}>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          {/* Store and Terminal Selection */}
          <Card title="Store & Terminal">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
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
              
              <div>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>POS Terminal</Text>
                <Select
                  style={{ width: '100%' }}
                  value={selectedTerminal}
                  onChange={setSelectedTerminal}
                  placeholder="Select terminal"
                  disabled={availableTerminals.length === 0}
                  loading={posTerminals.length === 0}
                >
                  {availableTerminals.map(terminal => (
                    <Option key={terminal.terminal_id} value={terminal.terminal_id}>
                      {terminal.terminal_name} ({terminal.ip_address})
                    </Option>
                  ))}
                </Select>
                {availableTerminals.length === 0 && selectedStore && (
        <Alert
                    message="No POS terminals found"
                    description="Please add a POS terminal for this store in Settings → POS Terminals"
                    type="warning"
                    showIcon
                    style={{ marginTop: 8, fontSize: 12 }}
                  />
                )}
              </div>
            </Space>
          </Card>

          {/* Customer Selection */}
          <Card title="Customer">
            <AutoComplete
              style={{ width: '100%' }}
              value={customerSearch}
              onChange={setCustomerSearch}
              onSearch={searchCustomers}
              placeholder="Search customers..."
              options={customerSearchResults.map(customer => ({
                value: customer.customer_id.toString(),
                label: (
                  <div>
                    <div>{customer.name}</div>
                    <div style={{ fontSize: 12, color: '#888' }}>
                      {customer.phone_number} | Points: {customer.total_loyalty_points}
                    </div>
                  </div>
                ),
                customer
              }))}
              onSelect={(value, option) => {
                setSelectedCustomer(option.customer);
                setCustomerSearch(option.customer.name);
              }}
              loading={searchingCustomers}
            >
              <Input prefix={<UserOutlined />} placeholder="Search customers..." />
            </AutoComplete>
            
            {selectedCustomer && (
        <div style={{ marginTop: 16 }}>
                <Descriptions size="small" column={1}>
                  <Descriptions.Item label="Name">{selectedCustomer.name}</Descriptions.Item>
                  <Descriptions.Item label="Phone">{selectedCustomer.phone_number}</Descriptions.Item>
                  <Descriptions.Item label="Loyalty Points">
                    <Badge count={selectedCustomer.total_loyalty_points} style={{ backgroundColor: theme.primary }} />
                  </Descriptions.Item>
                  {(() => {
                    const totals = calculateTotals();
                    const pointsToEarn = Math.floor(totals.grandTotal / 100);
                    return pointsToEarn > 0 ? (
                      <Descriptions.Item label="Points to Earn">
                        <Badge count={pointsToEarn} style={{ backgroundColor: theme.success }} />
                        <Text style={{ marginLeft: 8, fontSize: 12, color: theme.textSecondary }}>
                          (1 point per $100)
                        </Text>
                      </Descriptions.Item>
                    ) : null;
                  })()}
                </Descriptions>
                <Button
                  type="link"
                  danger
                  size="small"
                  onClick={() => {
                    setSelectedCustomer(null);
                    setCustomerSearch('');
                  }}
                >
                  Remove Customer
                </Button>
        </div>
            )}
      </Card>
      
          {/* Payment */}
          <Card title="Payment">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Select
                style={{ width: '100%' }}
                value={selectedPaymentMethod}
                onChange={setSelectedPaymentMethod}
                placeholder="Select payment method"
              >
                {paymentMethods.map(method => (
                  <Option key={method.payment_method_id} value={method.payment_method_id}>
                    {method.method_name}
                  </Option>
                ))}
              </Select>

              <Input.TextArea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Order notes..."
              />

              <Button
                type="primary"
                size="large"
                block
                icon={<DollarOutlined />}
                onClick={() => {
                  const totals = calculateTotals();
                  Modal.confirm({
                    title: 'Process Payment',
                    content: (
                      <div>
                        <div style={{ marginBottom: 16 }}>
                          <Text strong>Total Amount: ${totals.grandTotal.toFixed(2)}</Text>
                        </div>
                        <InputNumber
                          ref={paymentInputRef}
                          style={{ width: '100%' }}
                          size="large"
                          min={totals.grandTotal}
                          defaultValue={totals.grandTotal}
                          formatter={value => `$ ${value}`}
                          parser={value => value.replace(/\$ \s?|(,*)/g, '')}
                          placeholder="Enter payment amount"
                          autoFocus
                        />
                      </div>
                    ),
                    onOk: () => {
                      const paymentAmount = parseFloat(paymentInputRef.current?.value) || totals.grandTotal;
                      processSale(paymentAmount);
                    }
                  });
                }}
                disabled={cart.length === 0 || processing}
                loading={processing}
              >
                Process Sale
              </Button>

              <Button
                block
                danger
                icon={<CloseOutlined />}
                onClick={() => {
                  Modal.confirm({
                    title: 'Clear Cart',
                    content: 'Are you sure you want to clear the cart?',
                    onOk: clearCart
                  });
                }}
                disabled={cart.length === 0}
              >
                Clear Cart
              </Button>
            </Space>
          </Card>
        </Space>
      </Col>
    </Row>
  );

  // Render Sales History Tab
  const renderSalesHistoryTab = () => (
    <div>
      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
      <Card>
            <Statistic
              title="Total Sales"
              value={salesStats.total_sales}
              prefix="$"
              precision={2}
              valueStyle={{ color: theme.primary }}
            />
      </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Number of Sales"
              value={salesStats.sales_count}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Average Sale"
              value={salesStats.average_sale}
              prefix="$"
              precision={2}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
      <Card>
            <Statistic
              title="Total Tax Collected"
              value={salesStats.total_tax}
              prefix="$"
              precision={2}
              valueStyle={{ color: theme.success }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card title="Sales History" style={{ marginBottom: 24 }}>
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={8}>
            <RangePicker
              style={{ width: '100%' }}
              value={[salesFilters.startDate, salesFilters.endDate]}
              onChange={(dates) => {
                setSalesFilters({
                  ...salesFilters,
                  startDate: dates?.[0] || null,
                  endDate: dates?.[1] || null
                });
              }}
            />
          </Col>
          <Col span={6}>
            <Select
              style={{ width: '100%' }}
              placeholder="Payment Status"
              allowClear
              value={salesFilters.paymentStatus}
              onChange={(value) => setSalesFilters({ ...salesFilters, paymentStatus: value })}
            >
              <Option value="PAID">Paid</Option>
              <Option value="PARTIAL">Partial</Option>
              <Option value="REFUNDED">Refunded</Option>
              <Option value="VOID">Void</Option>
            </Select>
          </Col>
          <Col span={6}>
            <Input
              placeholder="Search by invoice..."
              value={salesFilters.search}
              onChange={(e) => setSalesFilters({ ...salesFilters, search: e.target.value })}
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col span={4}>
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={() => {
                fetchSalesHistory();
                fetchSalesStats();
              }}
              block
            >
              Search
            </Button>
          </Col>
        </Row>

        {/* Sales Table */}
        <Table
          loading={loadingSales}
          dataSource={salesHistory}
          rowKey="sale_id"
          columns={[
            {
              title: 'Invoice #',
              dataIndex: 'invoice_number',
              key: 'invoice_number',
              render: (text) => <Text strong>{text}</Text>
            },
            {
              title: 'Date',
              dataIndex: 'sale_date',
              key: 'sale_date',
              render: (date) => moment(date).format('YYYY-MM-DD HH:mm')
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
              title: 'Total',
              dataIndex: 'grand_total',
              key: 'grand_total',
              align: 'right',
              render: (amount) => `$${amount}`
            },
            {
              title: 'Status',
              dataIndex: 'payment_status',
              key: 'payment_status',
              render: (status) => {
                const statusConfig = {
                  PAID: { color: 'success', text: 'Paid' },
                  PARTIAL: { color: 'warning', text: 'Partial' },
                  REFUNDED: { color: 'processing', text: 'Refunded' },
                  VOID: { color: 'error', text: 'Void' }
                };
                const config = statusConfig[status] || { color: 'default', text: status };
                return <Tag color={config.color}>{config.text}</Tag>;
              }
            },
            {
              title: 'Cashier',
              dataIndex: 'cashier_name',
              key: 'cashier_name'
            },
            {
              title: 'Actions',
              key: 'actions',
              align: 'center',
              render: (_, record) => (
                <Space>
                  <Button
                    type="link"
                    icon={<EyeOutlined />}
                    onClick={() => viewSaleDetails(record.sale_id)}
                  >
                    View
                  </Button>
                  {record.payment_status === 'PAID' && (
                    <Popconfirm
                      title="Void Sale"
                      description="Please enter a reason for voiding this sale"
                      onConfirm={(e) => {
                        // Note: In a real app, you'd capture the reason from an input
                        voidSale(record.sale_id, 'Voided by user');
                      }}
                    >
                      <Button type="link" danger>
                        Void
                      </Button>
                    </Popconfirm>
                  )}
                </Space>
              )
            }
          ]}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} sales`
          }}
        />
      </Card>

      {/* Daily Report */}
      {dailyReport && (
        <Card title={`Daily Report - ${moment(dailyReport.date).format('YYYY-MM-DD')}`}>
          <Row gutter={16}>
            <Col span={6}>
              <Statistic
                title="Total Sales"
                value={dailyReport.total_sales}
                prefix="$"
                precision={2}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Cash Sales"
                value={dailyReport.cash_sales}
                prefix="$"
                precision={2}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Card Sales"
                value={dailyReport.card_sales}
                prefix="$"
                precision={2}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Other Sales"
                value={dailyReport.other_sales}
                prefix="$"
                precision={2}
              />
            </Col>
          </Row>
        </Card>
      )}
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
          <ShoppingCartOutlined /> Point of Sale
        </Title>
        {selectedStore && selectedTerminal && (
          <div style={{ marginTop: 8 }}>
            <Tag color="green" icon={<CheckCircleOutlined />}>
              {stores.find(s => s.store_id === selectedStore)?.store_name} - {availableTerminals.find(t => t.terminal_id === selectedTerminal)?.terminal_name}
            </Tag>
            <Tag color="blue">
              User: {currentUser.first_name || currentUser.username || 'Unknown'}
            </Tag>
          </div>
        )}
        {(!selectedStore || !selectedTerminal) && (
          <div style={{ marginTop: 8 }}>
            <Tag color="orange" icon={<ExclamationCircleOutlined />}>
              Setup Required: Please select store and terminal
            </Tag>
          </div>
        )}
      </div>

      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab} 
        size="large"
        items={[
          {
            key: 'pos',
            label: <span><ShoppingOutlined /> POS</span>,
            children: renderPOSTab()
          },
          {
            key: 'history', 
            label: <span><HistoryOutlined /> Sales History</span>,
            children: renderSalesHistoryTab()
          }
        ]}
      />

      {/* Sale Details Drawer */}
      <Drawer
        title="Sale Details"
        width={720}
        open={saleDetailsDrawerOpen}
        onClose={() => {
          setSaleDetailsDrawerOpen(false);
          setSelectedSale(null);
        }}
        extra={
          <Space>
            <Button 
              icon={<PrinterOutlined />}
              onClick={() => selectedSale && printReceipt(selectedSale)}
              disabled={!selectedSale}
            >
              Print Receipt
            </Button>
            <Button onClick={() => setSaleDetailsDrawerOpen(false)}>Close</Button>
          </Space>
        }
      >
        {loadingSaleDetails ? (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <Spin size="large" />
          </div>
        ) : selectedSale ? (
          <div>
            <Descriptions bordered column={2} style={{ marginBottom: 24 }}>
              <Descriptions.Item label="Invoice Number" span={2}>
                {selectedSale.invoice_number}
              </Descriptions.Item>
              <Descriptions.Item label="Date">
                {moment(selectedSale.sale_date).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={selectedSale.payment_status === 'PAID' ? 'success' : 'error'}>
                  {selectedSale.payment_status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Customer" span={2}>
                {selectedSale.customer_name || 'Walk-in Customer'}
              </Descriptions.Item>
              <Descriptions.Item label="Cashier">
                {selectedSale.cashier_name}
              </Descriptions.Item>
              <Descriptions.Item label="Store">
                {selectedSale.store_name}
              </Descriptions.Item>
            </Descriptions>

            <Title level={5}>Items</Title>
            <Table
              dataSource={selectedSale.sale_items}
              rowKey="sale_item_id"
              pagination={false}
              style={{ marginBottom: 24 }}
              columns={[
                {
                  title: 'Product',
                  dataIndex: 'product_name',
                  key: 'product_name'
                },
                {
                  title: 'Quantity',
                  dataIndex: 'quantity',
                  key: 'quantity',
                  align: 'center'
                },
                {
                  title: 'Unit Price',
                  dataIndex: 'unit_price',
                  key: 'unit_price',
                  align: 'right',
                  render: (price) => `$${price}`
                },
                {
                  title: 'Discount',
                  dataIndex: 'discount_per_item',
                  key: 'discount_per_item',
                  align: 'right',
                  render: (discount) => `$${discount}`
                },
                {
                  title: 'Tax',
                  dataIndex: 'tax_per_item',
                  key: 'tax_per_item',
                  align: 'right',
                  render: (tax) => `$${tax}`
                },
                {
                  title: 'Total',
                  dataIndex: 'line_total',
                  key: 'line_total',
                  align: 'right',
                  render: (total) => <Text strong>${total}</Text>
                }
              ]}
            />

            <Title level={5}>Payment Details</Title>
            <Table
              dataSource={selectedSale.payments}
              rowKey="payment_id"
              pagination={false}
              style={{ marginBottom: 24 }}
              columns={[
                {
                  title: 'Payment Method',
                  dataIndex: 'method_name',
                  key: 'method_name'
                },
                {
                  title: 'Amount',
                  dataIndex: 'amount',
                  key: 'amount',
                  align: 'right',
                  render: (amount) => `$${amount}`
                },
                {
                  title: 'Reference',
                  dataIndex: 'transaction_reference',
                  key: 'transaction_reference',
                  render: (ref) => ref || '-'
                }
              ]}
            />

            <Descriptions bordered column={2}>
              <Descriptions.Item label="Subtotal">
                ${selectedSale.sub_total}
              </Descriptions.Item>
              <Descriptions.Item label="Discount">
                ${selectedSale.discount_amount}
              </Descriptions.Item>
              <Descriptions.Item label="Tax">
                ${selectedSale.tax_amount}
              </Descriptions.Item>
              <Descriptions.Item label="Grand Total">
                <Text strong>${selectedSale.grand_total}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Amount Paid">
                ${selectedSale.amount_paid}
              </Descriptions.Item>
              <Descriptions.Item label="Change">
                ${selectedSale.change_given}
              </Descriptions.Item>
            </Descriptions>

            {selectedSale.notes && (
              <div style={{ marginTop: 24 }}>
                <Title level={5}>Notes</Title>
                <Paragraph>{selectedSale.notes}</Paragraph>
              </div>
            )}
          </div>
        ) : null}
      </Drawer>
    </div>
  );
}

export default SalesPage; 