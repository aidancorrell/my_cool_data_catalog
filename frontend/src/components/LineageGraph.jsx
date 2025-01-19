import React, { useState, useEffect } from "react";
import CytoscapeComponent from "react-cytoscapejs";

const LineageGraph = ({ lineageData }) => {
  const [graphElements, setGraphElements] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [metadata, setMetadata] = useState(null);

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
    if (selectedModel) {
      fetch(`http://127.0.0.1:3000/models/${selectedModel}`)
        .then((response) => response.json())
        .then((data) => setMetadata(data))
        .catch((error) =>
          console.error("Failed to fetch metadata for model:", selectedModel, error)
        );
    }
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
          // Node styling as boxes with shadow
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
          // Edge styling
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
          // Styling for selected nodes
          {
            selector: "node:selected",
            style: {
              "background-color": "#FF4136",
              "border-color": "#FF4136",
              "box-shadow": "0px 4px 8px rgba(255, 65, 54, 0.3)",
            },
          },
        ]}
      />

      {metadata && (
        <div style={panelStyles}>
          <h2>{metadata.name}</h2>
          <p>
            <strong>Description:</strong> {metadata.description || "No description available."}
          </p>
          <p>
            <strong>Materialized Type:</strong> {metadata.config?.materialized || "N/A"}
          </p>
          <p>
            <strong>Tags:</strong> {metadata.tags?.length ? metadata.tags.join(", ") : "None"}
          </p>
          <h3>Columns</h3>
          <ul>
            {metadata.columns?.map((column) => (
              <li key={column.name}>
                <strong>{column.name}</strong>: {column.description || "No description available"}
              </li>
            ))}
          </ul>
        </div>
      )}
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
