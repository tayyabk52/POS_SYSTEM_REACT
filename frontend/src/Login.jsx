import React, { useState } from "react";
import { Form, Input, Button, Card, message } from "antd";

function Login({ onLogin }) {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    console.log("values", values);


    // Tayyab Khan's Code
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        message.success("Login successful!");
        onLogin(data);
      } else {
        message.error(data.detail || "Login failed");
      }
    } catch (e) {
      message.error("Server error");
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <Card title="POS Login" style={{ width: 350 }}>
        <Form name="login" onFinish={onFinish} layout="vertical">
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: "Please input your username!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Login
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default Login;
