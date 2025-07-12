import React, { useState, useEffect } from 'react';
import { Card, Typography, Alert, Button } from 'antd';

const { Title, Paragraph } = Typography;

function SalesPage() {
  const [backendStatus, setBackendStatus] = useState('checking');

  useEffect(() => {
    // Test backend connectivity
    fetch('http://localhost:8000/dashboard/sales-summary')
      .then(response => {
        if (response.ok) {
          setBackendStatus('connected');
        } else {
          setBackendStatus('error');
        }
      })
      .catch(() => {
        setBackendStatus('error');
      });
  }, []);

  return (
    <div style={{ padding: 32, background: '#f5f5f5', minHeight: '100vh' }}>
      <Card style={{ marginBottom: 16 }}>
        <Title level={2}>Sales Page</Title>
        <Paragraph>This is the Sales page content. If you can see this, the routing is working correctly.</Paragraph>
        
        <Alert
          message={`Backend Status: ${backendStatus}`}
          type={backendStatus === 'connected' ? 'success' : backendStatus === 'checking' ? 'info' : 'error'}
          style={{ marginTop: 16 }}
        />
        
        <div style={{ marginTop: 16 }}>
          <Button type="primary">Create Sale</Button>
          <Button style={{ marginLeft: 8 }}>View Sales History</Button>
        </div>
      </Card>
      
      <Card>
        <Title level={3}>Sales Features Coming Soon</Title>
        <ul>
          <li>Create new sales transactions</li>
          <li>Process payments</li>
          <li>Generate invoices</li>
          <li>Sales reports and analytics</li>
        </ul>
      </Card>
    </div>
  );
}

export default SalesPage; 