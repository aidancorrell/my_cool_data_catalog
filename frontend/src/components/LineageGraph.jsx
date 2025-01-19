import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CytoscapeComponent from "react-cytoscapejs";

const LineageGraph = ({ lineageData }) => {
  const [graphElements, setGraphElements] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [modelDocs, setModelDocs] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const prepareGraphData = () => {
      if (!lineageData || !lineageData.models) {
        console.error("Invalid lineage data:", lineageData);
        return [];
      }

      const nodes = lineageData.models.map((model) => ({
        data: { id: model.name, label: model.name },
      }));

      const edges = lineageData.models.flatMap((model) =>
        (model.depends_on?.nodes || [])
          .map((dependency) => dependency.split(".").pop())
          .map((dependency) => ({
            data: { source: dependency, target: model.name },
          }))
      );

      setGraphElements([...nodes, ...edges]);
    };

    prepareGraphData();
  }, [lineageData]);

  useEffect(() => {
    const fetchMetadata = async () => {
      if (selectedModel) {
        try {
          const [metadataResponse, modelDocsResponse] = await Promise.all([
            fetch(`http://127.0.0.1:3000/models/${selectedModel}`).then((res) => res.json()),
            fetch(`http://127.0.0.1:3000/model_docs/${selectedModel}`).then((res) => res.json()),
          ]);
          setMetadata(metadataResponse);
          setModelDocs(modelDocsResponse);
        } catch (error) {
          console.error("Failed to fetch model metadata or docs:", error);
        }
      }
    };

    fetchMetadata();
  }, [selectedModel]);

  const panelStyles = {
    position: "absolute",
    right: "20px",
    top: "20px",
    backgroundColor: "#ffffff",
    border: "1px solid #ccc",
    borderRadius: "8px",
    padding: "16px",
    width: "300px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    zIndex: 1000,
    overflowY: "auto",
    maxHeight: "90vh",
  };

  const renderMetadataPanel = () => {
    if (!metadata || !modelDocs) return null;

    const { columns, metadata: docMetadata, stats } = modelDocs;

    return (
      <div style={panelStyles}>
        <h2>{metadata.name}</h2>
        <p>
          <strong>Description:</strong> {docMetadata?.comment || "No description available."}
        </p>
        <p>
          <strong>Materialized Type:</strong> {metadata.config?.materialized || "N/A"}
        </p>
        <p>
          <strong>Database:</strong> {docMetadata?.database || "N/A"}
        </p>
        <p>
          <strong>Schema:</strong> {docMetadata?.schema || "N/A"}
        </p>
        <p>
          <strong>Tags:</strong> {metadata.tags?.length ? metadata.tags.join(", ") : "None"}
        </p>
        <p>
          <strong>Has Stats?</strong> {stats?.has_stats?.value ? "Yes" : "No"}
        </p>

        <h3>Columns</h3>
        {columns ? (
          <ul>
            {Object.entries(columns).map(([columnName, details]) => (
              <li key={columnName}>
                <strong>{details.name}</strong>: {details.type}
                {details.comment && <p>{details.comment}</p>}
              </li>
            ))}
          </ul>
        ) : (
          <p>No columns available.</p>
        )}

        {/* Add a link to the comprehensive metadata page */}
        <button
          style={{
            marginTop: "10px",
            padding: "10px 20px",
            backgroundColor: "#0074D9",
            color: "#ffffff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
          onClick={() => navigate(`/model/${selectedModel}`)}
        >
          View Full Details
        </button>
      </div>
    );
  };

  return (
    <div style={{ position: "relative" }}>
      <CytoscapeComponent
        elements={graphElements}
        style={{ width: "100%", height: "600px" }}
        layout={{
          name: "breadthfirst",
          directed: true,
          padding: 10,
          spacingFactor: 1.5,
        }}
        cy={(cy) => {
          cy.on("tap", "node", (evt) => {
            const nodeId = evt.target.id();
            console.log("Node clicked:", nodeId);
            setSelectedModel(nodeId);
          });
        }}
        stylesheet={[
          {
            selector: "node",
            style: {
              "background-color": "#0074D9",
              shape: "round-rectangle",
              "label": "data(label)",
              "width": "label",
              "height": "label",
              padding: "8px",
              "border-width": 2,
              "border-color": "#ffffff",
              "font-size": 12,
              "text-valign": "center",
              "text-halign": "center",
              "font-weight": "bold",
              "text-wrap": "wrap",
              "box-shadow": "0px 4px 6px rgba(0, 0, 0, 0.1)",
            },
          },
          {
            selector: "edge",
            style: {
              "width": 3,
              "line-color": "#ccc",
              "target-arrow-color": "#ccc",
              "target-arrow-shape": "triangle",
              "arrow-scale": 1.5,
              "curve-style": "bezier",
            },
          },
        ]}
      />
      {renderMetadataPanel()}
    </div>
  );
};

export default LineageGraph;


// import React, { useState, useEffect } from "react";
// import CytoscapeComponent from "react-cytoscapejs";

// const LineageGraph = ({ lineageData }) => {
//   const [graphElements, setGraphElements] = useState([]);

//   const prepareGraphData = () => {
//     if (!lineageData || !lineageData.models) {
//       console.error("Lineage data is missing or improperly structured:", lineageData);
//       return;
//     }

//     // Extract model names to ensure only relevant nodes and edges are included
//     const modelNames = new Set(lineageData.models.map((model) => model.name));

//     // Create nodes for each model
//     const nodes = lineageData.models.map((model) => ({
//       data: { id: model.name, label: model.name },
//     }));

//     // Create edges based on `depends_on.nodes`
//     const edges = lineageData.models.flatMap((model) =>
//       (model.depends_on?.nodes || [])
//         .map((dependency) => dependency.split(".").pop()) // Extract model name
//         .filter((dependency) => modelNames.has(dependency)) // Only include edges within the response
//         .map((dependency) => ({
//           data: {
//             source: dependency,
//             target: model.name,
//           },
//         }))
//     );

//     console.log("Prepared Nodes:", nodes);
//     console.log("Prepared Edges:", edges);

//     setGraphElements([...nodes, ...edges]);
//   };

//   useEffect(() => {
//     prepareGraphData();
//   }, [lineageData]);

//   return (
//     <div style={{ height: "600px", border: "1px solid #ccc", marginTop: "20px" }}>
//       <CytoscapeComponent
//         elements={graphElements}
//         style={{ width: "100%", height: "100%" }}
//         layout={{
//           name: "breadthfirst",
//           directed: true,
//           padding: 10,
//           spacingFactor: 1.5,
//           fit: true,
//         }}
//         stylesheet={[
//           {
//             selector: "node",
//             style: {
//               "background-color": "#0074D9",
//               "label": "data(label)",
//               "width": 40,
//               "height": 40,
//               "border-width": 2,
//               "border-color": "#ffffff",
//               "font-size": 12,
//               "text-valign": "center",
//               "text-halign": "center",
//               "font-weight": "bold",
//             },
//           },
//           {
//             selector: "edge",
//             style: {
//               "width": 3,
//               "line-color": "#ccc",
//               "target-arrow-color": "#ccc",
//               "target-arrow-shape": "triangle",
//               "arrow-scale": 1.5,
//               "opacity": 0.6,
//               "curve-style": "bezier",
//             },
//           },
//           {
//             selector: ".highlighted",
//             style: {
//               "background-color": "#FF4136",
//               "line-color": "#FF4136",
//               "target-arrow-color": "#FF4136",
//               "width": 4,
//             },
//           },
//         ]}
//       />
//     </div>
//   );
// };

// export default LineageGraph;
