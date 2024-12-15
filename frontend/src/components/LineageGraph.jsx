import React from "react";
import CytoscapeComponent from "react-cytoscapejs";

const LineageGraph = ({ lineageData }) => {
    if (!lineageData) {
        return <p>Loading lineage graph...</p>;
    }

    const elements = [
        // Create node elements
        ...lineageData.nodes.map((node) => ({
            data: { id: node.id, label: node.id },
        })),
        // Create edge elements with direction
        ...lineageData.links.map((link) => ({
            data: { source: link.source, target: link.target },
        })),
    ];

    const cytoscapeStyles = [
        {
            selector: "node",
            style: {
                "background-color": "#0074D9",  // Node color
                "label": "data(label)",         // Node label
                "width": 40,                    // Width of nodes
                "height": 40,                   // Height of nodes
                "border-width": 2,              // Node border width
                "border-color": "#ffffff",      // Node border color
                "font-size": 12,                // Font size for node labels
                "text-valign": "center",        // Center text vertically
                "text-halign": "center",        // Center text horizontally
                "font-weight": "bold",          // Bold font for labels
            },
        },
        {
            selector: "edge",
            style: {
                "width": 3,                    // Edge width
                "line-color": "#ccc",          // Edge color
                "target-arrow-color": "#ccc",  // Arrow color
                "target-arrow-shape": "triangle",  // Arrow shape (triangle for directed edges)
                "arrow-scale": 1.5,            // Arrow size
                "label": "data(label)",        // Label for edge (optional)
                "font-size": 10,               // Font size for edge labels
                "opacity": 0.6,                // Edge opacity
                "curve-style": "bezier",       // Smooth edges
            },
        },
        {
            selector: "node:selected",
            style: {
                "background-color": "#ff4136", // Highlight selected nodes
            },
        },
        {
            selector: "edge:selected",
            style: {
                "line-color": "#ff4136",     // Highlight selected edges
                "target-arrow-color": "#ff4136",
            },
        },
    ];

    return (
        <div style={{ height: "600px", border: "1px solid #ccc", marginTop: "20px" }}>
            <CytoscapeComponent
                elements={elements}
                style={{ width: "100%", height: "100%" }}
                layout={{
                    name: "breadthfirst",  // Breadthfirst layout works well for DAGs
                    directed: true,        // Makes the graph directed
                    padding: 10,
                    spacingFactor: 1.5,
                    fit: true,
                }}
                cy={(cy) => {
                    // Example: Add event listeners for interactivity
                    cy.on("tap", "node", (evt) => {
                        const nodeId = evt.target.id();
                        alert(`Node clicked: ${nodeId}`);
                    });
                }}
                stylesheet={cytoscapeStyles} // Apply the styles here
            />
        </div>
    );
};

export default LineageGraph;
