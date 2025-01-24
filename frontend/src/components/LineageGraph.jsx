import React, { useState, useEffect } from "react";
import CytoscapeComponent from "react-cytoscapejs";
import { useNavigate } from "react-router-dom";
import dagre from "cytoscape-dagre";
import cytoscape from "cytoscape";

// Register the dagre layout
cytoscape.use(dagre);

const LineageGraph = ({ lineageData }) => {
  const [graphElements, setGraphElements] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [modelDetails, setModelDetails] = useState(null); // Store metadata details
  const [cyInstance, setCyInstance] = useState(null);
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
    if (cyInstance && graphElements.length > 0) {
      const layout = cyInstance.layout({
        name: "dagre",
        rankDir: "LR",
        nodeSep: 50,
        edgeSep: 10,
        rankSep: 100,
        fit: true,
        padding: 30,
        animate: true,
        animationDuration: 1000,
      });
      layout.run();
    }
  }, [cyInstance, graphElements]);

  const fetchModelDetails = async (modelName) => {
    try {
      const response = await fetch(`http://127.0.0.1:3000/model_docs/${modelName}`);
      const data = await response.json();
      setModelDetails(data);
    } catch (error) {
      console.error("Failed to fetch model details:", error);
    }
  };

  const panelStyles = {
    position: "absolute",
    right: "20px",
    top: "20px",
    backgroundColor: "#fff",
    border: "1px solid #ccc",
    borderRadius: "8px",
    padding: "16px",
    width: "300px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    zIndex: 1000,
    maxHeight: "90vh",
    overflowY: "auto",
  };

  return (
    <div style={{ position: "relative" }}>
      <CytoscapeComponent
        elements={graphElements}
        style={{ width: "100%", height: "600px" }}
        cy={(cy) => {
          setCyInstance(cy);
          cy.on("tap", "node", (evt) => {
            const nodeId = evt.target.id();
            setSelectedModel(nodeId);
            fetchModelDetails(nodeId); // Fetch details for the selected model
          });
        }}
        stylesheet={[
          {
            selector: "node",
            style: {
              "background-color": "#f0f0f0", // Light grey background
              shape: "round-rectangle",
              "label": "data(label)",
              "width": "label",
              "height": "label",
              padding: "10px",
              "border-width": 2,
              "border-color": "#0074D9", // Dark blue outline
              "font-size": 12,
              "text-valign": "center",
              "text-halign": "center",
              "font-weight": "bold",
            },
          },
          {
            selector: "edge",
            style: {
              "width": 3,
              "line-color": "#aaa",
              "target-arrow-color": "#aaa",
              "target-arrow-shape": "triangle",
              "arrow-scale": 1.5,
              "curve-style": "bezier",
            },
          },
          {
            selector: "node:selected",
            style: {
              "background-color": "#0074D9",
              "border-color": "#0056A6",
              color: "#fff",
            },
          },
        ]}
      />
      {selectedModel && modelDetails && (
        <div style={panelStyles}>
          <h2 style={{ marginBottom: "10px" }}>{modelDetails.general.name}</h2>
          <p>
            <strong>Description:</strong> {modelDetails.general.description || "No description available"}
          </p>
          <p>
            <strong>Materialized:</strong> {modelDetails.general.materialized}
          </p>
          <p>
            <strong>Schema:</strong> {modelDetails.general.schema}
          </p>
          <p>
            <strong>Database:</strong> {modelDetails.general.database}
          </p>
          <p>
            <strong>Primary Keys:</strong> {modelDetails.general.primary_keys.join(", ")}
          </p>
          <p>
            <strong>Tags:</strong> {modelDetails.general.tags.length > 0 ? modelDetails.general.tags.join(", ") : "None"}
          </p>
          <h3 style={{ marginTop: "10px" }}>Columns:</h3>
          <ul>
            {modelDetails.columns.map((col) => (
              <li key={col.name}>
                <strong>{col.name}</strong>: {col.type} ({col.description || "No description"})
              </li>
            ))}
          </ul>
          <button
            style={{
              marginTop: "10px",
              padding: "10px 20px",
              backgroundColor: "#0074D9",
              color: "#ffffff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "bold",
            }}
            onClick={() => navigate(`/model-details/${selectedModel}`)}
          >
            View Full Details
          </button>
        </div>
      )}
    </div>
  );
};

export default LineageGraph;


// import React, { useState, useEffect } from "react";
// import CytoscapeComponent from "react-cytoscapejs";
// import { useNavigate } from "react-router-dom";
// import dagre from "cytoscape-dagre";
// import cytoscape from "cytoscape";

// // Register the dagre layout
// cytoscape.use(dagre);

// const LineageGraph = ({ lineageData }) => {
//   const [graphElements, setGraphElements] = useState([]);
//   const [selectedModel, setSelectedModel] = useState(null);
//   const [modelDetails, setModelDetails] = useState(null); // Store metadata details
//   const [cyInstance, setCyInstance] = useState(null); // Store Cytoscape instance
//   const navigate = useNavigate();

//   useEffect(() => {
//     const prepareGraphData = () => {
//       if (!lineageData || !lineageData.models) {
//         console.error("Invalid lineage data:", lineageData);
//         return [];
//       }

//       const nodes = lineageData.models.map((model) => ({
//         data: { id: model.name, label: model.name },
//       }));

//       const edges = lineageData.models.flatMap((model) =>
//         (model.depends_on?.nodes || [])
//           .map((dependency) => dependency.split(".").pop())
//           .map((dependency) => ({
//             data: { source: dependency, target: model.name },
//           }))
//       );

//       setGraphElements([...nodes, ...edges]);
//     };

//     prepareGraphData();
//   }, [lineageData]);

//   // Apply layout after elements are set and Cytoscape instance is ready
//   useEffect(() => {
//     if (cyInstance && graphElements.length > 0) {
//       const layout = cyInstance.layout({
//         name: "dagre",
//         rankDir: "LR", // Change to "TB" for top-to-bottom layout
//         nodeSep: 50,
//         edgeSep: 10,
//         rankSep: 100,
//         fit: true,
//         padding: 30,
//         animate: true,
//         animationDuration: 1000,
//       });
//       layout.run();
//     }
//   }, [cyInstance, graphElements]);

//   const fetchModelDetails = async (modelName) => {
//     try {
//       const response = await fetch(`http://127.0.0.1:3000/model_docs/${modelName}`);
//       const data = await response.json();
//       setModelDetails(data);
//     } catch (error) {
//       console.error("Failed to fetch model details:", error);
//     }
//   };

//   const panelStyles = {
//     position: "absolute",
//     right: "20px",
//     top: "20px",
//     backgroundColor: "#ffffff",
//     border: "1px solid #ccc",
//     borderRadius: "8px",
//     padding: "16px",
//     width: "300px",
//     boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
//     zIndex: 1000,
//   };

//   return (
//     <div style={{ position: "relative" }}>
//       <CytoscapeComponent
//         elements={graphElements}
//         style={{ width: "100%", height: "600px" }}
//         cy={(cy) => {
//           setCyInstance(cy); // Save the Cytoscape instance
//           cy.on("tap", "node", (evt) => {
//             const nodeId = evt.target.id();
//             console.log("Node clicked:", nodeId);
//             setSelectedModel(nodeId);
//           });
//         }}
//         stylesheet={[
//           {
//             selector: "node",
//             style: {
//               "background-color": "#f0f0f0", // Light grey background
//               shape: "round-rectangle",
//               "label": "data(label)",
//               "width": "label",
//               "height": "label",
//               padding: "10px",
//               "border-width": 2,
//               "border-color": "#0074D9", // Dark blue outline
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
//               "line-color": "#aaa", // Light grey edges
//               "target-arrow-color": "#aaa",
//               "target-arrow-shape": "triangle",
//               "arrow-scale": 1.5,
//               "curve-style": "bezier",
//             },
//           },
//           {
//             selector: "node:selected",
//             style: {
//               "background-color": "#0074D9", // Dark blue on selection
//               "border-color": "#0056A6",
//               color: "#fff",
//             },
//           },
//         ]}
//       />

// {selectedModel && modelDetails && (
//         <div style={panelStyles}>
//           <h2 style={{ marginBottom: "10px" }}>{modelDetails.general.name}</h2>
//           <p>
//             <strong>Description:</strong> {modelDetails.general.description || "No description available"}
//           </p>
//           <p>
//             <strong>Materialized:</strong> {modelDetails.general.materialized}
//           </p>
//           <p>
//             <strong>Schema:</strong> {modelDetails.general.schema}
//           </p>
//           <p>
//             <strong>Database:</strong> {modelDetails.general.database}
//           </p>
//           <p>
//             <strong>Primary Keys:</strong> {modelDetails.general.primary_keys.join(", ")}
//           </p>
//           <p>
//             <strong>Tags:</strong> {modelDetails.general.tags.length > 0 ? modelDetails.general.tags.join(", ") : "None"}
//           </p>
//           <h3 style={{ marginTop: "10px" }}>Columns:</h3>
//           <ul>
//             {modelDetails.columns.map((col) => (
//               <li key={col.name}>
//                 <strong>{col.name}</strong>: {col.type} ({col.description || "No description"})
//               </li>
//             ))}
//           </ul>
//           <button
//             style={{
//               marginTop: "10px",
//               padding: "10px 20px",
//               backgroundColor: "#0074D9",
//               color: "#ffffff",
//               border: "none",
//               borderRadius: "5px",
//               cursor: "pointer",
//               fontSize: "14px",
//               fontWeight: "bold",
//             }}
//             onClick={() => navigate(`/model-details/${selectedModel}`)}
//           >
//             View Full Details
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default LineageGraph;