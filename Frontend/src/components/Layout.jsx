import React from "react";
import Sidebar from "./Sidebar";

const Layout = ({ children, role }) => {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar role={role} />

      {/* Main Content */}
      <div className="flex-1 p-6 bg-gray-50">
        {children}
      </div>
    </div>
  );
};

export default Layout;
