import React, { useState, useEffect } from "react";
import LineageGraph from "../components/LineageGraph";
import Select from "react-select";

const LineagePage = () => {
  const [models, setModels] = useState([]);
  const [startNode, setStartNode] = useState(null);
  const [endNode, setEndNode] = useState(null);
  const [lineageData, setLineageData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:3000/models")
      .then((response) => response.json())
      .then((data) => setModels(data))
      .catch((error) => setError(error.message));
  }, []);

  useEffect(() => {
    if (startNode && endNode) {
      fetch(`http://127.0.0.1:3000/lineage/${startNode}/${endNode}`)
        .then((response) => response.json())
        .then((data) => setLineageData(data))
        .catch((error) => setError(error.message));
    }
  }, [startNode, endNode]);

  if (error) return <p>Error: {error}</p>;

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-100 border-r p-4">
        <h1 className="text-xl font-bold text-gray-700 mb-4">Data Lineage</h1>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">Start Node:</label>
            <Select
              options={models.map((model) => ({
                value: model,
                label: model,
              }))}
              value={startNode ? { value: startNode, label: startNode } : null}
              onChange={(selectedOption) => setStartNode(selectedOption?.value || null)}
              placeholder="Select or type to search..."
              isClearable
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">End Node:</label>
            <Select
              options={models.map((model) => ({
                value: model,
                label: model,
              }))}
              value={endNode ? { value: endNode, label: endNode } : null}
              onChange={(selectedOption) => setEndNode(selectedOption?.value || null)}
              placeholder="Select or type to search..."
              isClearable
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow bg-gray-50 p-6">
        {lineageData ? (
          <LineageGraph lineageData={lineageData} />
        ) : (
          <p className="text-gray-600">Select both a start and end node to view the lineage graph.</p>
        )}
      </div>
    </div>
  );
};

export default LineagePage;