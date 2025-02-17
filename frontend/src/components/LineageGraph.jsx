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
  const [modelDetails, setModelDetails] = useState(null);
  const [cyInstance, setCyInstance] = useState(null);
  const [materializationData, setMaterializationData] = useState({});
  const [highlightMaterialization, setHighlightMaterialization] = useState(false);

  const navigate = useNavigate();

  // Fetch materialization details from the manifest API
  useEffect(() => {
    const fetchMaterializationData = async () => {
      try {
        const response = await fetch("http://127.0.0.1:3000/manifest");
        const manifest = await response.json();

        const materializations = {};
        Object.entries(manifest.nodes).forEach(([key, value]) => {
          materializations[value.name] = value.config.materialized;
        });

        setMaterializationData(materializations);
      } catch (error) {
        console.error("Error fetching manifest data:", error);
      }
    };

    fetchMaterializationData();
  }, []);

  // Prepare graph data based on lineageData
  useEffect(() => {
    if (!lineageData || !lineageData.models) {
      console.error("Invalid lineage data:", lineageData);
      return;
    }

    const nodes = lineageData.models.map((model) => ({
      data: { id: model.name, label: model.name, materialized: materializationData[model.name] || "unknown" },
    }));

    const edges = lineageData.models.flatMap((model) =>
      (model.depends_on?.nodes || [])
        .map((dependency) => dependency.split(".").pop())
        .map((dependency) => ({
          data: { source: dependency, target: model.name },
        }))
    );

    setGraphElements([...nodes, ...edges]);
  }, [lineageData, materializationData]);

  // Apply layout after elements are set and Cytoscape instance is ready
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

  // Materialization-based colors
  const materializationColors = {
    table: "#FFA500", // Orange
    view: "#4CAF50", // Green
    ephemeral: "#0074D9", // Blue
    incremental: "#FF4500", // Red-orange
    unknown: "#ccc", // Gray
  };

  // Stylesheet for Cytoscape graph
  const getStylesheet = () => [
    {
      selector: "node",
      style: {
        "background-color": (ele) =>
          highlightMaterialization
            ? materializationColors[ele.data("materialized")] || materializationColors.unknown
            : "#f0f0f0",
        shape: "round-rectangle",
        "label": (ele) =>
          highlightMaterialization 
            ? `${ele.data("id")} - ${ele.data("materialized")}`
            : ele.data("id"),
        "width": "label",
        "height": "label",
        padding: "10px",
        "border-width": 2,
        "border-color": "#0074D9",
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
  ];

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
      {/* Materialization Filter Checkbox */}
      <div style={{ position: "absolute", left: "20px", top: "20px", zIndex: 1000 }}>
        <label>
          <input
            type="checkbox"
            checked={highlightMaterialization}
            onChange={() => setHighlightMaterialization(!highlightMaterialization)}
            style={{ marginRight: "8px" }}
          />
          Materialization Filter
        </label>

        {/* Legend (Only show when checkbox is checked) */}
        {highlightMaterialization && (
          <div
            style={{
              marginTop: "10px",
              padding: "10px",
              backgroundColor: "#fff",
              border: "1px solid #ccc",
              borderRadius: "8px",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            }}
          >
            <strong>Legend:</strong>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "5px" }}>
              {Object.entries(materializationColors).map(([type, color]) => (
                <div key={type} style={{ display: "flex", alignItems: "center" }}>
                  <div
                    style={{
                      width: "14px",
                      height: "14px",
                      backgroundColor: color,
                      borderRadius: "3px",
                      marginRight: "6px",
                    }}
                  ></div>
                  <span style={{ fontSize: "12px" }}>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <CytoscapeComponent
        elements={graphElements}
        style={{ width: "100%", height: "600px" }}
        cy={(cy) => {
          setCyInstance(cy);
          cy.on("tap", "node", (evt) => {
            const nodeId = evt.target.id();
            setSelectedModel(nodeId);
            fetchModelDetails(nodeId);
          });
        }}
        stylesheet={getStylesheet()}
      />

      {selectedModel && modelDetails && (
        <div style={panelStyles}>
          <h2 style={{ marginBottom: "10px" }}>{modelDetails.general.name}</h2>
          <p><strong>Description:</strong> {modelDetails.general.description || "No description available"}</p>
          <p><strong>Materialized:</strong> {modelDetails.general.materialized}</p>
          <p><strong>Schema:</strong> {modelDetails.general.schema}</p>
          <p><strong>Database:</strong> {modelDetails.general.database}</p>
          <p><strong>Primary Keys:</strong> {modelDetails.general.primary_keys.join(", ")}</p>
          <p><strong>Tags:</strong> {modelDetails.general.tags.length > 0 ? modelDetails.general.tags.join(", ") : "None"}</p>
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
