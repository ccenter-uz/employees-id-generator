import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import App from "./app";
import { EmployeeInfo } from "./employee-info";
import { ErrorPage } from "./error-page";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/card-generator" element={<App />} />
        <Route path="/employees/:id" element={<EmployeeInfo />} />
        <Route path="/" element={<ErrorPage />} />
        <Route path="/employees" element={<ErrorPage />} />
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
