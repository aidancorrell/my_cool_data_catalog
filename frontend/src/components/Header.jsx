// src/components/Header.jsx
import React from "react";

const Header = () => {
  return (
    <header className="flex items-center justify-between bg-white shadow-md p-4">
      {/* Search Bar */}
      <div className="flex items-center bg-gray-100 rounded-md px-3 py-2">
        <input
          type="text"
          placeholder="Search..."
          className="bg-transparent outline-none text-sm w-64"
        />
      </div>

      {/* User Actions */}
      <div className="flex items-center space-x-4">
        <button className="text-gray-600 hover:text-blue-600">🔔</button>
        <div className="w-8 h-8 bg-blue-500 rounded-full text-white flex items-center justify-center">
          JD
        </div>
      </div>
    </header>
  );
};

export default Header;
