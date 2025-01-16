/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrinterOutlined } from "@ant-design/icons";
import { Button, Divider, Modal, Space, Table, Tag } from "antd";
import type { TableColumnsType, TableProps } from "antd";
import { AnyObject } from "antd/es/_util/type";
import Search from "antd/es/input/Search";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import QRCode from "react-qr-code";
import { Link } from "react-router-dom";
import generatePDF, { Resolution, Margin } from "react-to-pdf";

import "./main.css";
import { LogoSvg } from "./ui/logo-svg";

const DOMAIN = "http://employees.ccenter.uz:5001";
interface DataType {
  key: React.Key;
  name: string;
  ["BEDJIK STATUS"]: string | boolean;
  FIO: string;
  ID: string;
}

const columns: TableColumnsType<DataType> = [
  {
    title: "ID",
    dataIndex: "ID",
    render: (text: string) => <Link to={`/employees/${text}`}>{text}</Link>,
  },
  {
    title: "FIO",
    dataIndex: "FIO",
  },
  {
    title: "BEDJIK STATUS",
    dataIndex: "BEDJIK STATUS",
    render: (val: string) => (
      <Tag color={val === "TRUE" ? "green" : "red"}>
        {val === "TRUE" ? "Given" : "Not Given"}
      </Tag>
    ),
    filters: [
      {
        text: "Given",
        value: "TRUE",
      },
      {
        text: "Not Given",
        value: "FALSE",
      },
    ],
    onFilter: (value, record) => record["BEDJIK STATUS"] === value,
  },
];

const App: React.FC = () => {
  const [selectedRowsLength, setSelectedRowsLength] = useState(0);
  const [selectedRows, setSelectedRows] = useState<AnyObject[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [data, setData] = useState<DataType[]>([]);
  const [constData, setConstData] = useState<DataType[]>([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const targetRef = useRef(null);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    if (targetRef.current) {
      setPdfLoading(true);
      generatePDF(targetRef, {
        filename: "employees.pdf",
        method: "open",
        resolution: Resolution.HIGH,
        page: {
          margin: Margin.SMALL,
        },
        canvas: {
          mimeType: "image/png",
          qualityRatio: 1,
        },
        overrides: {
          pdf: {
            compress: false,
          },
          canvas: {
            useCORS: true,
          },
        },
      })
        .then((pdfBlob) => {
          console.log(pdfBlob, "pdfBlob");
        })
        .catch((err) => {
          console.error(err);
        })
        .finally(() => {
          setPdfLoading(false);
          setIsModalOpen(false);
        });
    }

    const data = localStorage.getItem("selectedRows");
    if (data) {
      statusWriter(JSON.parse(data).map((item: any) => item.ID));
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const splitArray = (arr: any, size: number) => {
    const result = [];
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size));
    }
    return result;
  };

  const rowSelection: TableProps<DataType>["rowSelection"] = {
    onChange: (selectedRowKeys: React.Key[], selectedRows: AnyObject[]) => {
      const localStorageData = localStorage.getItem("selectedRows");
      const parsedData = localStorageData ? JSON.parse(localStorageData) : [];

      const newData = [...parsedData, ...selectedRows]; // Add new data to parsedData.

      const data = newData.filter(
        (item: AnyObject, index: number) =>
          newData.findIndex((i: AnyObject) => i.ID === item.ID) === index,
      );
      localStorage.setItem("selectedRows", JSON.stringify(data));

      const result = splitArray(data, 10);
      setSelectedRowsLength(data.length);
      setSelectedRows(result);
    },
    getCheckboxProps: (record: any) => ({
      disabled: record["ID"] === "",
    }),
  };

  const fetchData = async () => {
    const sheetId = "1VXyaHhX1QOqak1YRs5nss_Uv9UCbll3FbX5iQyS_4Os";
    const apiKey = "AIzaSyBSWX8JyvcZeGr0XiSgofYVdpITUjsviaw";
    const range = "baza-sotrudnikov!A1:V100000";
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;

    try {
      setTableLoading(true);
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();

      const result: DataType[] = data.values
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

      const filteredData = result.filter((item: any) => !!item["ID"]);
      setData(filteredData);
      setConstData(filteredData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setTableLoading(false);
    }
  };

  const fullNameFormater = (name: string) => {
    const splitName = name.split(" ");

    return (
      <span>
        <span style={{ textWrap: "nowrap" }}>
          {splitName[0]} {splitName[1]}
        </span>{" "}
        <br /> {splitName.splice(2).join(" ")}
      </span>
    );
  };

  const resetSelection = () => {
    setSelectedRows([]);
    setSelectedRowsLength(0);
    localStorage.removeItem("selectedRows");
  };

  const statusWriter = (idsToUpdate: string[]) => {
    fetch(
      `https://script.google.com/macros/s/AKfycbzQGbJVrImSnPcSPlLV-gz9MNu7laoJmVW7KYA9l_pUqqOMoECwS16SUcXiioOJI9mE/exec?callback=handleResponse&ids=${idsToUpdate.join(
        ",",
      )}`,
      {
        method: "GET",
      },
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          console.log(`Successfully updated ${data.result} rows`);
        } else {
          console.error(`Error: ${data.message}`);
        }
      })
      .catch((error) => console.error("Request failed", error));
  };

  useLayoutEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");

    if (!isLoggedIn) {
      window.location.replace("/log-in");
    }
  }, []);

  useEffect(() => {
    if (searchText === "") {
      fetchData();
    }
  }, [searchText]);

  useEffect(() => {
    if (searchText) {
      const filteredData = constData?.filter((item: any) => {
        const id = item?.ID?.toLowerCase() || "";
        const fio = item?.FIO?.toLowerCase() || "";
        const search = searchText.toLowerCase();
        return fio.includes(search) || id.includes(search);
      });

      setData(filteredData);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  useEffect(() => {
    const localStorageData = localStorage.getItem("selectedRows");
    const parsedData = localStorageData ? JSON.parse(localStorageData) : [];
    setSelectedRowsLength(parsedData.length);
    setSelectedRows(splitArray(parsedData, 10));
  }, []);

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "1800px",
        minWidth: "800px",
        margin: "0 auto ",
      }}
    >
      <Space
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Search
          placeholder="Search by ID"
          allowClear
          onSearch={(value) => setSearchText(value)}
          style={{ width: 250 }}
        />
        <br />
        <div>
          <Button
            style={{ width: "200px" }}
            type="primary"
            size="large"
            disabled={selectedRowsLength === 0}
            icon={<PrinterOutlined />}
            onClick={showModal}
          >
            Print ({selectedRowsLength} selected)
          </Button>
          <Button
            style={{ marginLeft: "8px" }}
            danger
            size="large"
            onClick={resetSelection}
          >
            Reset
          </Button>
        </div>
      </Space>
      <Divider />
      <Table
        rowSelection={{ ...rowSelection }}
        columns={columns}
        dataSource={data}
        loading={tableLoading}
        bordered
        pagination={{ pageSize: 30 }}
      />
      <Modal
        title="Print"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        style={{
          display: "flex",
          justifyContent: "center",
        }}
        confirmLoading={pdfLoading}
        cancelButtonProps={{ disabled: pdfLoading }}
      >
        <div
          style={{
            display: "inline-flex",
            boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
            padding: "10px",
          }}
        >
          <div
            ref={targetRef}
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            {Array.from({ length: Math.ceil(selectedRows.length) }).map(
              (item, index) => (
                <div className="a4" key={index}>
                  <div className="cards-container">
                    {selectedRows[index].map((row: AnyObject) => (
                      <div key={row.key}>
                        <div className="card">
                          <div className="card-header">
                            <LogoSvg />
                          </div>

                          <div className="card-body">
                            <h1>{fullNameFormater(row["FIO"])}</h1>
                            <div className="card-inner-container">
                              <div className="card-qr">
                                <QRCode
                                  size={256}
                                  fgColor="#3D6394"
                                  value={DOMAIN + "/employees/" + row["ID"]}
                                  viewBox={`0 0 256 256`}
                                />
                              </div>
                              <div className="card-info">
                                <p>
                                  {" "}
                                  <strong>ID:</strong> {row["ID"]}
                                </p>
                                <p>
                                  <strong>EXP:</strong> 12/
                                  {new Date().getFullYear()}
                                </p>
                              </div>
                              <div
                                style={{
                                  width: "100px",
                                  height: "100px",
                                  overflow: "hidden",
                                  position: "relative",
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "flex-start",
                                  alignSelf: "flex-start",
                                  backgroundColor: `${
                                    row["PHOTO"] ? "#fff" : "#f0f0f0"
                                  }`, // Fallback background
                                }}
                              >
                                <img
                                  className="card-image"
                                  src={row["PHOTO"]}
                                  alt="user-image"
                                  width="100"
                                  height="100"
                                  style={{
                                    position: "absolute",
                                    minWidth: "100%",
                                    minHeight: "100%",
                                    top: "-6px",
                                    left: 0,
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default App;
