import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import LineageGraph from "../components/LineageGraph";
import Select from "react-select";

const LineagePage = () => {
  const [models, setModels] = useState([]);
  const [startNode, setStartNode] = useState(null);
  const [endNode, setEndNode] = useState(null);
  const [lineageData, setLineageData] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:3000/models")
      .then((response) => response.json())
      .then((data) => setModels(data));
  }, []);

  useEffect(() => {
    if (startNode && endNode) {
      fetch(`http://127.0.0.1:3000/lineage/${startNode}/${endNode}`)
        .then((response) => response.json())
        .then((data) => setLineageData(data));
    }
  }, [startNode, endNode]);

  return (
    <Layout>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-xl font-semibold mb-4">Data Lineage</h1>
        <div className="flex space-x-4 mb-6">
          <Select
            options={models.map((model) => ({ value: model, label: model }))}
            onChange={(option) => setStartNode(option?.value)}
            placeholder="Select Start Node"
            isClearable
          />
          <Select
            options={models.map((model) => ({ value: model, label: model }))}
            onChange={(option) => setEndNode(option?.value)}
            placeholder="Select End Node"
            isClearable
          />
        </div>
        {lineageData ? (
          <LineageGraph lineageData={lineageData} models={models}/>
        ) : (
          <p className="text-gray-500">Select nodes to view the lineage graph.</p>
        )}
      </div>
    </Layout>
  );
};

export default LineagePage;
