import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { Form, Input, Button, Card, Typography, Select } from "antd";
import React, { useEffect } from "react";

import { URL } from "./base-config";

const { Title } = Typography;

interface LoginFormValues {
  username: string;
  password: string;
}

export const LoginPage: React.FC = () => {
  const [branches, setBranches] = React.useState<string[]>([]);
  const [selectedBranch, setSelectedBranch] = React.useState<string | null>(
    null,
  );
  const [invalidLogin, setInvalidLogin] = React.useState<boolean>(false);
  const onFinish = (values: LoginFormValues) => {
    if (
      values.username === `admin_${selectedBranch}` &&
      values.password === `password_${selectedBranch}`
    ) {
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("branch", selectedBranch || "");
      window.location.href = "/";
    } else {
      setInvalidLogin(true);
    }
    // Here you would typically handle the login logic
  };

  const fetchSheetData = async () => {
    try {
      const response = await fetch(URL);
      const data = await response.json();

      const result: any[] = data.values
        .slice(1)
        .map((row: any, rowIndex: number) => {
          const result = data.values[0].reduce(
            (obj: any, key: any, index: any) => {
              obj[key] = row[index];
              obj.key = rowIndex + 1;

              return obj;
            },
            {},
          );

          return result;
        });

      const uniqueBranches = Array.from(
        new Set(result.map((item) => item.FILIAL)),
      );
      setBranches(uniqueBranches.filter((branch) => branch !== ""));
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchSheetData();
  }, []);

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
            name="branch"
            rules={[{ required: true, message: "Please select a branch!" }]}
          >
            <Select
              placeholder="Select a branch"
              allowClear
              onChange={setSelectedBranch}
            >
              {branches.map((branch) => (
                <Select.Option key={branch} value={branch}>
                  {branch}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="username"
            rules={[{ required: true, message: "Please input your Username!" }]}
          >
            <Input
              disabled={selectedBranch === null}
              prefix={<UserOutlined />}
              placeholder="Username"
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: "Please input your Password!" }]}
          >
            <Input
              disabled={selectedBranch === null}
              prefix={<LockOutlined />}
              type="password"
              placeholder="Password"
            />
          </Form.Item>
          <Form.Item>
            <Button
              disabled={selectedBranch === null}
              type="primary"
              htmlType="submit"
              style={{ width: "100%" }}
            >
              Log in
            </Button>
          </Form.Item>
          {invalidLogin && (
            <Typography.Text
              type="danger"
              style={{ display: "flex", justifyContent: "center" }}
            >
              Invalid username or password
            </Typography.Text>
          )}
        </Form>
      </Card>
    </div>
  );
};
