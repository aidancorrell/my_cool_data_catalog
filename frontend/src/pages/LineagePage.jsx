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
        .then((data) => {
          console.log("Lineage Data:", data);
          setLineageData(data);
        })
        .catch((error) => setError(error.message));
    }
  }, [startNode, endNode]);

  if (error) return <p>Error: {error}</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Data Lineage</h1>
      <div style={{ marginBottom: "20px" }}>
        <label>
          Start Node:
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
        </label>
        <label>
          End Node:
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
        </label>
      </div>

      <h2>Lineage Graph</h2>
      {lineageData ? (
        <LineageGraph lineageData={lineageData} />
      ) : (
        <p>Select both a start and end node to view the lineage graph.</p>
      )}
    </div>
  );
};

export default LineagePage;



// import React, { useEffect, useState } from "react";
// import LineageGraph from "../components/LineageGraph";

// const LineagePage = () => {
//     const [models, setModels] = useState([]);
//     const [lineageData, setLineageData] = useState(null);

//     useEffect(() => {
//         // Fetch models from the backend
//         fetch("http://127.0.0.1:3000/models")
//             .then((response) => response.json())
//             .then((data) => setModels(data))
//             .catch((error) => console.error("Error fetching models:", error));

//         // Fetch lineage data (for the graph)
//         fetch("http://127.0.0.1:3000/lineage")
//             .then((response) => response.json())
//             .then((data) => {
//                 const graphData = {
//                     nodes: Object.keys(data).map((key) => ({ id: key })),
//                     links: Object.entries(data).flatMap(([key, value]) =>
//                         value.dependencies.map((dep) => ({
//                             source: key,
//                             target: dep,
//                         }))
//                     ),
//                 };

//                 setLineageData(graphData);
//             })
//             .catch((error) => console.error("Error fetching lineage data:", error));
//     }, []);

//     return (
//         <div style={{ padding: "20px" }}>
//             <h1>Data Lineage</h1>
//             <h2>Models</h2>
//             <ul>
//                 {models.map((model, index) => (
//                     <li key={index}>{model}</li>
//                 ))}
//             </ul>

//             <h2>Lineage Graph</h2>
//             <LineageGraph lineageData={lineageData} />
//         </div>
//     );
// };

// export default LineagePage;