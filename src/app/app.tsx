/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  PrinterOutlined,
  ReloadOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import {
  Button,
  Divider,
  Modal,
  notification,
  Space,
  Table,
  Tag,
  Typography,
  FloatButton,
} from "antd";
import type { TableColumnsType, TableProps } from "antd";
import { AnyObject } from "antd/es/_util/type";
import Search from "antd/es/input/Search";
import {
  createContext,
  MutableRefObject,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import QRCode from "react-qr-code";
import { Link } from "react-router-dom";
import generatePDF, { Resolution, Margin } from "react-to-pdf";

import "./main.css";
import { URL, URL_UPDATE, DOMAIN } from "./base-config";
import { LogoSvg } from "./ui/logo-svg";

const url = URL;
const SPLIT_SIZE = 4;

const { Text, Title } = Typography;
interface DataType {
  key: React.Key;
  name: string;
  ["BEDJIK STATUS"]: string | boolean;
  FIO: string;
  ID: string;
  ["BO'LIM NOMI"]: string;
  Lavozim: string;
}
const Context = createContext({ name: "Default" });

const App: React.FC = () => {
  const [selectedRowsLength, setSelectedRowsLength] = useState(0);
  const [selectedRows, setSelectedRows] = useState<AnyObject[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [data, setData] = useState<DataType[]>([]);
  const [constData, setConstData] = useState<DataType[]>([]);
  const [branch, setBranch] = useState<null | string>(null);
  const [tableLoading, setTableLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const targetRef = useRef(null);
  const [api, contextHolder] = notification.useNotification();
  const contextValue = useMemo(() => ({ name: "API FETCHING" }), []);

  const [departments, setDepartments] = useState<string[]>([]);
  const [positions, setPositions] = useState<string[]>([]);
  const [columns, setColumns] = useState<TableColumnsType<DataType>>([
    {
      title: "ID",
      dataIndex: "ID",
      render: (text: string) => <Link to={`/employee/${text}`}>{text}</Link>,
    },
    {
      title: "FIO",
      dataIndex: "FIO",
    },
    {
      title: "BO'LIM NOMI",
      dataIndex: "BO'LIM NOMI",
      width: "600px",
      render: (text: string) => <Text>{text}</Text>,
      filters: [],
      filterSearch: true,
      onFilter: (value, record) => record.name.startsWith(value as string),
    },
    {
      title: "LAVOZIM",
      width: "300px",
      dataIndex: "Lavozim",
      render: (text: string) => <Text>{text}</Text>,
      filters: [],
      filterSearch: true,
      onFilter: (value, record) => record.name.startsWith(value as string),
    },
    {
      title: "BEDJIK STATUS",
      dataIndex: "BEDJIK STATUS",
      width: "100px",
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
  ]);
  const showModal = () => {
    setIsModalOpen(true);
  };

  type TargetElementFinder = MutableRefObject<any> | (() => HTMLElement | null);
  const pdfGenerator = (targetFinder: TargetElementFinder, filename: string) =>
    generatePDF(targetFinder, {
      filename: `${filename}.pdf`,
      method: "open",
      resolution: Resolution.HIGH,
      page: {
        margin: Margin.SMALL,
        format: "a4",
        // orientation: "portrait",
      },
      canvas: {
        mimeType: "image/jpeg",
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
    });

  const handleOk = async () => {
    if (targetRef.current) {
      setPdfLoading(true);
      console.log(targetRef.current, "targetRef");

      const target = targetRef.current as HTMLDivElement;

      // Use 'children' instead of 'childNodes' to avoid text nodes
      const pdfPromises = Array.from(target.children).map((item, index) => {
        console.log(item, "item");

        const targetFinder = () => item as HTMLElement;

        // Ensure '.card-info' elements exist and avoid out-of-bound access
        const cardInfoElements = target.querySelectorAll(".card-info");
        if (cardInfoElements.length > index) {
          const itemId =
            cardInfoElements[index].children[0]?.textContent?.split(" ")[2] ||
            "employee";
          return pdfGenerator(targetFinder, itemId);
        } else {
          console.warn(`No card-info found for index ${index}`);
          return Promise.resolve(); // Resolve to prevent breaking the promise chain
        }
      });

      try {
        await Promise.all(pdfPromises); // Wait for all PDF generation to complete
        console.log("All PDFs generated successfully");
      } catch (err) {
        console.error("Error generating PDFs:", err);
      } finally {
        setPdfLoading(false); // Set loading state to false when done
        setIsModalOpen(false); // Close modal after processing
      }
    } else {
      console.error("Target element is not found");
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
    selectedRowKeys,
    onChange: (selectedRowKeys: React.Key[], selectedRows: AnyObject[]) => {
      const newData = [...selectedRows]; // Add new data to parsedData.

      const data = newData.filter(
        (item: AnyObject, index: number) =>
          newData.findIndex((i: AnyObject) => i.ID === item.ID) === index,
      );
      localStorage.setItem("selectedRows", JSON.stringify(data));
      localStorage.setItem("selectedRowKeys", JSON.stringify(selectedRowKeys));

      const result = splitArray(data, SPLIT_SIZE);
      setSelectedRowsLength(data.length);
      setSelectedRows(result);
      setSelectedRowKeys(selectedRowKeys);
    },
    getCheckboxProps: (record: any) => ({
      disabled: record["ID"] === "",
    }),
  };

  const fetchData = async () => {
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

      const aviableData = result.filter((item: any) => !!item["ID"]);

      const filteredData = aviableData.filter(
        (item: any) => item["FILIAL"] === branch,
      );

      const departmentsData = filteredData.map(
        (item: any) => item["BO'LIM NOMI"],
      );
      const positionsData = filteredData.map((item: any) => item["Lavozim"]);

      setDepartments([...new Set(departmentsData)]);
      setPositions([...new Set(positionsData)]);

      setData(filteredData);
      setConstData(filteredData);

      api.success({
        message: "Data fetched successfully",
        duration: 3,
      });
    } catch (error) {
      api.error({
        message: "Error fetching data",
      });
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
    setSelectedRowKeys([]);
    localStorage.removeItem("selectedRows");
    localStorage.removeItem("selectedRowKeys");
  };

  const statusWriter = (idsToUpdate: string[]) => {
    fetch(`${URL_UPDATE}${idsToUpdate.join(",")}`, {
      mode: "no-cors",
      method: "GET",
    })
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
    if (branch) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branch]);

  useEffect(() => {
    if (departments.length > 0 && positions.length > 0) {
      setColumns((prev) => [
        prev[0],
        prev[1],
        {
          ...prev[2],
          filters: departments.map((item) => ({
            text: item,
            value: item,
          })),
          onFilter: (value, record) => record["BO'LIM NOMI"] === value,
        },
        {
          ...prev[3],
          filters: positions.map((item) => ({
            text: item,
            value: item,
          })),
          onFilter: (value, record) => record["Lavozim"] === value,
        },
        prev[4],
      ]);
    }
  }, [departments, positions]);

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
    const localStorageDataKeys = localStorage.getItem("selectedRowKeys");
    const parsedData = localStorageData ? JSON.parse(localStorageData) : [];
    setSelectedRowsLength(parsedData.length);
    setSelectedRows(splitArray(parsedData, SPLIT_SIZE));
    setSelectedRowKeys(
      localStorageDataKeys ? JSON.parse(localStorageDataKeys) : [],
    );
  }, []);

  useEffect(() => {
    if (localStorage.getItem("branch")) {
      setBranch(localStorage.getItem("branch"));
    } else {
      window.location.replace("/log-in");
    }
  }, []);

  return (
    <Context.Provider value={contextValue}>
      {contextHolder}
      <div
        style={{
          padding: "20px",
          maxWidth: "1800px",
          minWidth: "800px",
          margin: "0 auto ",
        }}
      >
        <FloatButton.Group shape="square" style={{ insetInlineEnd: 24 }}>
          <FloatButton
            type={selectedRowsLength > 0 ? "primary" : "default"}
            style={{
              pointerEvents: selectedRowsLength > 0 ? "auto" : "none",
            }}
            icon={<PrinterOutlined />}
            onClick={showModal}
            badge={{ count: selectedRowsLength, overflowCount: 999 }}
            tooltip={<div>Print ({selectedRowsLength} selected)</div>}
          />
          <FloatButton
            style={{ border: "1px solid red" }}
            icon={<ReloadOutlined style={{ color: "red" }} />}
            onClick={resetSelection}
            tooltip="Reset Selection"
          />
        </FloatButton.Group>

        <Space
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Title level={3} style={{ margin: "0" }}>
            {branch} - Employees Database
          </Title>
          <Search
            placeholder="Search by ID"
            allowClear
            onSearch={(value) => setSearchText(value)}
            style={{ width: 550 }}
          />

          <div>
            <Button
              style={{ marginLeft: "8px" }}
              danger
              type="primary"
              size="large"
              onClick={() => {
                localStorage.clear();
                window.location.href = "/log-in";
              }}
              icon={<LogoutOutlined />}
            >
              Log Out
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
          height="50vh"
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
              height: "75vh",
              overflow: "auto",
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
                            {/* <div
                              style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: "100%",
                                opacity: 0.5,
                              }}
                            >
                              <img
                                src="../../assets/beydjik-bg.svg"
                                width="85mm"
                                height="55mm"
                                alt="background"
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                              />
                            </div> */}
                            <div className="card-header">
                              <LogoSvg />
                            </div>

                            <div
                              className="card-body"
                              style={{
                                backgroundImage: `url(../../assets/beydjik-bg.svg)`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                                backgroundRepeat: "no-repeat",
                              }}
                            >
                              <h1>{fullNameFormater(row["FIO"])}</h1>
                              <div className="card-inner-container">
                                <div className="card-qr">
                                  <QRCode
                                    size={256}
                                    fgColor="rgb(12, 84, 160)"
                                    value={DOMAIN + "/employee/" + row["ID"]}
                                    viewBox={`0 0 256 256`}
                                  />
                                </div>
                                <div className="card-info">
                                  <p style={{ textWrap: "nowrap" }}>
                                    {" "}
                                    <strong>ID:</strong> {row["ID"]}
                                  </p>
                                  <p style={{ textWrap: "nowrap" }}>
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
    </Context.Provider>
  );
};

export default App;
