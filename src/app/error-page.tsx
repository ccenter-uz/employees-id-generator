import { Result } from "antd";

export const ErrorPage = () => {
  return (
    <Result
      status="404"
      title="404"
      subTitle="Kechirasiz, siz kirgan sahifa mavjud emas."
    />
  );
};
