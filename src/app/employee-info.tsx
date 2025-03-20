/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, Row, Col, Typography, Divider, Skeleton, Image } from "antd";
import { AnyObject } from "antd/es/_util/type";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { URL as sheetUrl } from "./base-config";
import { LogoSvg } from "./ui/logo-svg";
import "./main.css";

const { Title, Text } = Typography;

const PersonCard: React.FC<{ data: AnyObject }> = ({ data }) => {
  return (
    <Card
      style={{
        width: "100%",
        marginBottom: "20px",
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
      }}
      cover={
        <div
          style={{
            textAlign: "center",
            marginBottom: "20px",
            width: "100%",
            backgroundColor: "#3D6394",
            padding: "10px",
          }}
        >
          <LogoSvg width={260} height={40} />
        </div>
      }
    >
      <Row style={{ position: "relative" }} gutter={[25, 25]}>
        <div className="stamp"></div>
        <Col span={6}>
          {data["PHOTO"] ? (
            <Image width={100} src={data["PHOTO"]} />
          ) : (
            <Image width={100} src="../../assets/avatar.png" />
          )}
        </Col>
        <Col span={18}>
          <Title level={4}>F.I.Sh: {data["FIO"]}</Title>
          <Text strong>ID: </Text>
          <Text>{data["ID"]}</Text>
          <br />
          <Text strong>Phone: </Text>
          <Text>{data["Telefon Raqamlar"] || "---"}</Text>
        </Col>
      </Row>
      <Divider />
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Text strong>{"Bo'linma"}: </Text>
          <Text>{data["BO'LIM NOMI"]}</Text>
        </Col>
        <Col span={12}>
          <Text strong>Lavozim: </Text>
          <Text>{data["Lavozim"]}</Text>
        </Col>
      </Row>
    </Card>
  );
};

export const EmployeeInfo: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<AnyObject>({});
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const fetchData = async (id: string | undefined) => {
    const url = sheetUrl;

    try {
      setLoading(true);
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();

      const result: AnyObject[] = data.values
        .slice(1)
        .map((row: any, rowIndex: number) => {
          return data.values[0].reduce((obj: any, key: any, index: any) => {
            obj[key] = row[index];
            obj.key = rowIndex + 1;
            return obj;
          }, {});
        });

      const findeddData = result.find((item: AnyObject) => item["ID"] === id);

      if (findeddData) {
        setData(findeddData);
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const disableRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (
      e.ctrlKey ||
      e.keyCode === 44 ||
      (e.ctrlKey && e.key === "c") || // Disable Ctrl+C
      (e.ctrlKey && e.key === "u") || // Disable Ctrl+U (View Source)
      (e.ctrlKey && e.shiftKey && e.key === "I") || // Disable Ctrl+Shift+I (DevTools)
      e.key === "F12" // Disable F12
    ) {
      e.preventDefault();
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div
      style={{ width: "100%", minHeight: "100vh", display: "flex" }}
      onContextMenu={disableRightClick}
      className="noselect"
    >
      <div
        style={{
          minWidth: "210mm",
          maxWidth: "210mm",
          minHeight: "297mm",
          padding: "20mm",
          margin: "auto",
          backgroundColor: "white",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        }}
      >
        <Title level={2} style={{ textAlign: "center", marginBottom: "20px" }}>
          Xodim haqida ma’lumot
        </Title>
        {loading ? (
          <Skeleton avatar paragraph={{ rows: 6 }} />
        ) : (
          <PersonCard data={data} />
        )}
      </div>
    </div>
  );
};
