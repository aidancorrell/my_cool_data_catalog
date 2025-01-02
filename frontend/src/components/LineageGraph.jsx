import React, { useState, useEffect } from "react";
import CytoscapeComponent from "react-cytoscapejs";

const LineageGraph = ({ lineageData }) => {
  const [graphElements, setGraphElements] = useState([]);

  const prepareGraphData = () => {
    if (!lineageData || !lineageData.models) {
      console.error("Lineage data is missing or improperly structured:", lineageData);
      return;
    }

    // Extract model names to ensure only relevant nodes and edges are included
    const modelNames = new Set(lineageData.models.map((model) => model.name));

    // Create nodes for each model
    const nodes = lineageData.models.map((model) => ({
      data: { id: model.name, label: model.name },
    }));

    // Create edges based on `depends_on.nodes`
    const edges = lineageData.models.flatMap((model) =>
      (model.depends_on?.nodes || [])
        .map((dependency) => dependency.split(".").pop()) // Extract model name
        .filter((dependency) => modelNames.has(dependency)) // Only include edges within the response
        .map((dependency) => ({
          data: {
            source: dependency,
            target: model.name,
          },
        }))
    );

    console.log("Prepared Nodes:", nodes);
    console.log("Prepared Edges:", edges);

    setGraphElements([...nodes, ...edges]);
  };

  useEffect(() => {
    prepareGraphData();
  }, [lineageData]);

  return (
    <div style={{ height: "600px", border: "1px solid #ccc", marginTop: "20px" }}>
      <CytoscapeComponent
        elements={graphElements}
        style={{ width: "100%", height: "100%" }}
        layout={{
          name: "breadthfirst",
          directed: true,
          padding: 10,
          spacingFactor: 1.5,
          fit: true,
        }}
        stylesheet={[
          {
            selector: "node",
            style: {
              "background-color": "#0074D9",
              "label": "data(label)",
              "width": 40,
              "height": 40,
              "border-width": 2,
              "border-color": "#ffffff",
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
              "line-color": "#ccc",
              "target-arrow-color": "#ccc",
              "target-arrow-shape": "triangle",
              "arrow-scale": 1.5,
              "opacity": 0.6,
              "curve-style": "bezier",
            },
          },
          {
            selector: ".highlighted",
            style: {
              "background-color": "#FF4136",
              "line-color": "#FF4136",
              "target-arrow-color": "#FF4136",
              "width": 4,
            },
          },
        ]}
      />
    </div>
  );
};

export default LineageGraph;
