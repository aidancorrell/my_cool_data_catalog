import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ModelSearchPage = () => {
  const [models, setModels] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilters, setSelectedFilters] = useState({
    name: true,
    column: false,
    tag: false,
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://127.0.0.1:3000/manifest")
      .then((response) => response.json())
      .then((data) => {
        if (data.nodes) {
          setModels(Object.values(data.nodes)); // Extract models from nodes
        }
      })
      .catch((err) => console.error("Failed to fetch manifest:", err));
  }, []);

  const handleSelectModel = (selectedModel) => {
    navigate(`/model-details/${selectedModel}`);
    setSearchTerm("");
  };

  const handleFilterChange = (filter) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [filter]: !prev[filter],
    }));
  };

  // Function to filter models based on multiple selected criteria
  const filteredModels = models.filter((model) => {
    if (!searchTerm) return false;

    return (
      (selectedFilters.name &&
        model.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (selectedFilters.column &&
        Object.values(model.columns || {}).some((col) =>
          col.name?.toLowerCase().includes(searchTerm.toLowerCase())
        )) ||
      (selectedFilters.tag &&
        (model.tags || []).some((tag) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        ))
    );
  });

  return (
    <div className="flex bg-gray-100 min-h-screen">
      {/* Sidebar Filters */}
      <aside className="w-64 p-6 bg-white shadow-md border-r">
        <h2 className="text-lg font-bold text-gray-700 mb-4">Filters</h2>
        <div className="space-y-2">
          {Object.keys(selectedFilters).map((filter) => (
            <label key={filter} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedFilters[filter]}
                onChange={() => handleFilterChange(filter)}
              />
              <span className="capitalize">{filter}</span>
            </label>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Search DBT Models</h1>

        {/* Search Bar */}
        <div className="relative mb-6">
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded-lg shadow-sm"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Search Results */}
        <div>
          {filteredModels.length > 0 ? (
            filteredModels.map((model) => {
              // Extract matching columns if filtering by column
              let matchingColumns = [];
              if (selectedFilters.column) {
                matchingColumns = Object.values(model.columns || {}).filter((col) =>
                  col.name?.toLowerCase().includes(searchTerm.toLowerCase())
                );
              }

                return (
                <div
                  key={model.name}
                  className="bg-white p-4 rounded-lg shadow-md mb-4"
                >
                  <h2
                  className="text-blue-600 text-lg font-semibold cursor-pointer"
                  onClick={() => handleSelectModel(model.name)}
                  >
                  {model.name}
                  </h2>
                  {matchingColumns.length > 0 && (
                  <p className="text-gray-600 text-sm">
                    Includes column(s):{" "}
                    {matchingColumns.map((col, index) => (
                    <span key={col.name} className="font-semibold">
                      {col.name}
                      {index < matchingColumns.length - 1 && ", "}
                    </span>
                    ))}
                  </p>
                  )}
                </div>
                );
            })
          ) : (
            <p className="text-gray-600">No matching models found.</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default ModelSearchPage;
