// src/components/Layout.jsx
import React from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

const Layout = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-col flex-grow">
        {/* header still in dev */}
        {/* <Header /> */}
        <main className="p-6 flex-grow">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
