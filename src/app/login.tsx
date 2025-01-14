import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { Form, Input, Button, Card, Typography } from "antd";
import React from "react";

const { Title } = Typography;

interface LoginFormValues {
  username: string;
  password: string;
}

export const LoginPage: React.FC = () => {
  const onFinish = (values: LoginFormValues) => {
    console.log("Success:", values);
    if (values.username === "admin" && values.password === "admin_password") {
      localStorage.setItem("isLoggedIn", "true");
      window.location.href = "/";
    }
    // Here you would typically handle the login logic
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "#f0f2f5",
      }}
    >
      <Card style={{ width: 300 }}>
        <Title level={2} style={{ textAlign: "center", marginBottom: 24 }}>
          Login
        </Title>
        <Form
          name="normal_login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: "Please input your Username!" }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Username" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: "Please input your Password!" }]}
          >
            <Input
              prefix={<LockOutlined />}
              type="password"
              placeholder="Password"
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: "100%" }}>
              Log in
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};
