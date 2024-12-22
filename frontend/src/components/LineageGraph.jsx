import React, { useState, useEffect } from "react";
import CytoscapeComponent from "react-cytoscapejs";
import Select from "react-select";

const LineageGraph = () => {
  const [models, setModels] = useState([]);
  const [lineageData, setLineageData] = useState(null);
  const [startNode, setStartNode] = useState(null);
  const [endNode, setEndNode] = useState(null);

  // Fetch all models on component mount
  useEffect(() => {
    fetch("http://127.0.0.1:3000/models")
      .then((response) => response.json())
      .then((data) => setModels(data))
      .catch((error) => console.error("Error fetching models:", error));
  }, []);

  // Fetch lineage data when a start or end node is selected
  useEffect(() => {
    if (startNode && endNode) {
      fetch(`http://127.0.0.1:3000/lineage/${startNode}/${endNode}`)
        .then((response) => response.json())
        .then((data) => setLineageData(data))
        .catch((error) => console.error("Error fetching lineage data:", error));
    }
  }, [startNode, endNode]);

  // Prepare data for Cytoscape visualization
  const prepareGraphData = () => {
    if (!lineageData) return [];
  
    // Remove duplicate nodes from upstream and downstream
    const uniqueUpstream = [...new Set(lineageData.upstream)];
    const uniqueDownstream = [...new Set(lineageData.downstream)];
  
    // Avoid self-loops: exclude the startNode from the downstream and the endNode from the upstream
    const downstream = uniqueDownstream.filter((node) => node !== startNode);
    const upstream = uniqueUpstream.filter((node) => node !== endNode);
  
    // Prepare the nodes array
    const nodes = [
      { data: { id: startNode, label: startNode } },
      ...upstream.map((node) => ({
        data: { id: node, label: node },
      })),
      ...downstream.map((node) => ({
        data: { id: node, label: node },
      })),
      { data: { id: endNode, label: endNode } },
    ];
  
    // Prepare the edges array
    const edges = [
      ...upstream.map((upstreamNode) => ({
        data: { source: upstreamNode, target: startNode },
      })),
      ...downstream.map((downstreamNode) => ({
        data: { source: startNode, target: downstreamNode },
      })),
    ];
  
    return [...nodes, ...edges];
  };

  // Handle the highlighting logic
  const highlightLineage = (cy, start, end) => {
    if (!start || !end) return;

    // Reset previous highlights
    cy.elements().removeClass("highlighted");

    // Get the start and end node elements
    const startNodeElem = cy.getElementById(start);
    const endNodeElem = cy.getElementById(end);

    // Highlight the selected nodes
    startNodeElem.addClass("highlighted");
    endNodeElem.addClass("highlighted");

    // Traverse from the start node to gather all reachable nodes (downstream)
    const downstreamNodes = startNodeElem.successors();
    downstreamNodes.addClass("highlighted");

    // Traverse from the end node to gather all reachable nodes (upstream)
    const upstreamNodes = endNodeElem.incomers();
    upstreamNodes.addClass("highlighted");
  };

  return (
    <div>
      <div style={{ marginBottom: "10px" }}>
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
      <div style={{ height: "600px", border: "1px solid #ccc", marginTop: "20px" }}>
        <CytoscapeComponent
          elements={prepareGraphData()}
          style={{ width: "100%", height: "100%" }}
          layout={{
            name: "breadthfirst",
            directed: true,
            padding: 10,
            spacingFactor: 1.5,
            fit: true,
          }}
          cy={(cy) => {
            if (startNode && endNode) {
              highlightLineage(cy, startNode, endNode);
            }
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
    </div>
  );
};

export default LineageGraph;



// import React, { useState } from "react";
// import CytoscapeComponent from "react-cytoscapejs";
// import Select from "react-select";

// const LineageGraph = ({ lineageData }) => {
//     if (!lineageData) {
//         return <p>Loading lineage graph...</p>;
//     }

//     const elements = [
//         ...lineageData.nodes.map((node) => ({
//             data: { id: node.id, label: node.id },
//         })),
//         ...lineageData.links.map((link) => ({
//             data: { source: link.source, target: link.target },
//         })),
//     ];

//     const cytoscapeStyles = [
//         {
//             selector: "node",
//             style: {
//                 "background-color": "#0074D9",
//                 "label": "data(label)",
//                 "width": 40,
//                 "height": 40,
//                 "border-width": 2,
//                 "border-color": "#ffffff",
//                 "font-size": 12,
//                 "text-valign": "center",
//                 "text-halign": "center",
//                 "font-weight": "bold",
//             },
//         },
//         {
//             selector: "edge",
//             style: {
//                 "width": 3,
//                 "line-color": "#ccc",
//                 "target-arrow-color": "#ccc",
//                 "target-arrow-shape": "triangle",
//                 "arrow-scale": 1.5,
//                 "opacity": 0.6,
//                 "curve-style": "bezier",
//             },
//         },
//         {
//             selector: ".highlighted",
//             style: {
//                 "background-color": "#FF4136",
//                 "line-color": "#FF4136",
//                 "target-arrow-color": "#FF4136",
//                 "width": 4,
//             },
//         },
//         {
//             selector: "node.highlighted",
//             style: {
//                 "border-color": "#FF4136",
//             },
//         },
//     ];

//     const [startNode, setStartNode] = useState(null);
//     const [endNode, setEndNode] = useState(null);

//     const nodeOptions = lineageData.nodes.map((node) => ({
//         value: node.id,
//         label: node.id,
//     }));

//     const highlightLineage = (cy, start, end) => {
//         if (!start || !end) return;

//         // Reset previous highlights
//         cy.elements().removeClass("highlighted");

//         // Get the start and end node elements
//         const startNodeElem = cy.getElementById(start);
//         const endNodeElem = cy.getElementById(end);

//         // Traverse from the start node to gather all reachable nodes (downstream)
//         const downstreamNodes = startNodeElem.successors();

//         // Traverse from the end node to gather all reachable nodes (upstream)
//         const upstreamNodes = endNodeElem.incomers();

//         // Highlight the selected nodes
//         startNodeElem.addClass("highlighted");
//         endNodeElem.addClass("highlighted");

//         // Highlight all downstream nodes of the start node
//         downstreamNodes.addClass("highlighted");

//         // Highlight all upstream nodes of the end node
//         upstreamNodes.addClass("highlighted");

//         // Combine the nodes and ensure they're connected
//         const allConnectedNodes = downstreamNodes.union(upstreamNodes).union(startNodeElem).union(endNodeElem);

//         // If no nodes are connected, show an alert
//         if (allConnectedNodes.length === 0) {
//             alert(`No lineage found between ${start} and ${end}`);
//         }

//         // Print the lineage in the console
//         console.log("Start Node:", start);
//         console.log("End Node:", end);
//         console.log("Downstream Nodes:", downstreamNodes.map(node => node.id()).join(", "));
//         console.log("Upstream Nodes:", upstreamNodes.map(node => node.id()).join(", "));

//     };

//     return (
//         <div>
//             <div style={{ marginBottom: "10px" }}>
//                 <div style={{ marginBottom: "10px" }}>
//                     <label>
//                         Start Node:
//                         <Select
//                             options={nodeOptions}
//                             value={nodeOptions.find((option) => option.value === startNode)}
//                             onChange={(selectedOption) => setStartNode(selectedOption?.value || null)}
//                             placeholder="Select or type to search..."
//                             isClearable
//                         />
//                     </label>
//                 </div>
//                 <div>
//                     <label>
//                         End Node:
//                         <Select
//                             options={nodeOptions}
//                             value={nodeOptions.find((option) => option.value === endNode)}
//                             onChange={(selectedOption) => setEndNode(selectedOption?.value || null)}
//                             placeholder="Select or type to search..."
//                             isClearable
//                         />
//                     </label>
//                 </div>
//                 <button
//                     onClick={() => {
//                         const cy = window.cy;
//                         if (startNode && endNode) {
//                             highlightLineage(cy, startNode, endNode);
//                         } else {
//                             alert("Please select both Start Node and End Node.");
//                         }
//                     }}
//                     disabled={!startNode || !endNode}
//                 >
//                     Highlight Lineage
//                 </button>
//             </div>
//             <div style={{ height: "600px", border: "1px solid #ccc", marginTop: "20px" }}>
//                 <CytoscapeComponent
//                     elements={elements}
//                     style={{ width: "100%", height: "100%" }}
//                     layout={{
//                         name: "breadthfirst",
//                         directed: true,
//                         padding: 10,
//                         spacingFactor: 1.5,
//                         fit: true,
//                     }}
//                     cy={(cy) => {
//                         window.cy = cy; // Expose Cytoscape instance for highlighting
//                     }}
//                     stylesheet={cytoscapeStyles}
//                 />
//             </div>
//         </div>
//     );
// };

// export default LineageGraph;



// import React from "react";
// import CytoscapeComponent from "react-cytoscapejs";

// const LineageGraph = ({ lineageData }) => {
//     if (!lineageData) {
//         return <p>Loading lineage graph...</p>;
//     }

//     const elements = [
//         // Create node elements
//         ...lineageData.nodes.map((node) => ({
//             data: { id: node.id, label: node.id },
//         })),
//         // Create edge elements with direction
//         ...lineageData.links.map((link) => ({
//             data: { source: link.source, target: link.target },
//         })),
//     ];

//     const cytoscapeStyles = [
//         {
//             selector: "node",
//             style: {
//                 "background-color": "#0074D9",  // Node color
//                 "label": "data(label)",         // Node label
//                 "width": 40,                    // Width of nodes
//                 "height": 40,                   // Height of nodes
//                 "border-width": 2,              // Node border width
//                 "border-color": "#ffffff",      // Node border color
//                 "font-size": 12,                // Font size for node labels
//                 "text-valign": "center",        // Center text vertically
//                 "text-halign": "center",        // Center text horizontally
//                 "font-weight": "bold",          // Bold font for labels
//             },
//         },
//         {
//             selector: "edge",
//             style: {
//                 "width": 3,                    // Edge width
//                 "line-color": "#ccc",          // Edge color
//                 "target-arrow-color": "#ccc",  // Arrow color
//                 "target-arrow-shape": "triangle",  // Arrow shape (triangle for directed edges)
//                 "arrow-scale": 1.5,            // Arrow size
//                 "label": "data(label)",        // Label for edge (optional)
//                 "font-size": 10,               // Font size for edge labels
//                 "opacity": 0.6,                // Edge opacity
//                 "curve-style": "bezier",       // Smooth edges
//             },
//         },
//         {
//             selector: "node:selected",
//             style: {
//                 "background-color": "#ff4136", // Highlight selected nodes
//             },
//         },
//         {
//             selector: "edge:selected",
//             style: {
//                 "line-color": "#ff4136",     // Highlight selected edges
//                 "target-arrow-color": "#ff4136",
//             },
//         },
//     ];

//     return (
//         <div style={{ height: "600px", border: "1px solid #ccc", marginTop: "20px" }}>
//             <CytoscapeComponent
//                 elements={elements}
//                 style={{ width: "100%", height: "100%" }}
//                 layout={{
//                     name: "breadthfirst",  // Breadthfirst layout works well for DAGs
//                     directed: true,        // Makes the graph directed
//                     padding: 10,
//                     spacingFactor: 1.5,
//                     fit: true,
//                 }}
//                 cy={(cy) => {
//                     // Example: Add event listeners for interactivity
//                     cy.on("tap", "node", (evt) => {
//                         const nodeId = evt.target.id();
//                         alert(`Node clicked: ${nodeId}`);
//                     });
//                 }}
//                 stylesheet={cytoscapeStyles} // Apply the styles here
//             />
//         </div>
//     );
// };

// export default LineageGraph;
