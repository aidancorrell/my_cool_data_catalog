// src/components/Sidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
  const menuItems = [
    { name: "Lineage Graph", to: "/lineage", icon: "📈" },
    // still in development
    { name: "Model Details", to: "/model-search/", icon: "📊" },
  ];

  return (
    <aside className="w-64 bg-white shadow-md h-screen">
      <div className="p-4 text-xl font-bold text-blue-600">my cool data catalog</div>
      <nav>
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center p-4 text-gray-600 hover:bg-blue-50 rounded-md ${
                    isActive ? "bg-blue-100 text-blue-600" : ""
                  }`
                }
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
