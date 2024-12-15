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
        // Create edge elements
        ...lineageData.links.map((link) => ({
            data: { source: link.source, target: link.target },
        })),
    ];

    return (
        <div style={{ height: "600px", border: "1px solid #ccc" }}>
            <CytoscapeComponent
                elements={elements}
                style={{ width: "100%", height: "100%" }}
                layout={{ name: "breadthfirst" }} // Layout can be customized
                cy={(cy) => {
                    // Example: Add event listeners for interactivity
                    cy.on("tap", "node", (evt) => {
                        const nodeId = evt.target.id();
                        alert(`Node clicked: ${nodeId}`);
                    });
                }}
            />
        </div>
    );
};

export default LineageGraph;



// // import React from "react";
// import React, { useEffect } from "react";
// import { Graph } from "react-d3-graph";

// const LineageGraph = ({ lineageData }) => {
//     const graphConfig = {
//         automaticRearrangeAfterDropNode: false,
//         collapsible: false,
//         directed: false,
//         focusAnimationDuration: 0.75,
//         focusZoom: 1,
//         freezeAllDragEvents: false,
//         height: 400,
//         highlightDegree: 1,
//         highlightOpacity: 1,
//         linkHighlightBehavior: false,
//         maxZoom: 8,
//         minZoom: 0.1,
//         nodeHighlightBehavior: true,
//         panAndZoom: true,
//         staticGraph: false,
//         staticGraphWithDragAndDrop: false,
//         width: 800,
//         d3: {
//           alphaTarget: 0.05,
//           gravity: -100,
//           linkLength: 100,
//           linkStrength: 1,
//           disableLinkForce: false
//         },
//         node: {
//           color: "#d3d3d3",
//           fontColor: "black",
//           fontSize: 8,
//           fontWeight: "normal",
//           highlightColor: "SAME",
//           highlightFontSize: 8,
//           highlightFontWeight: "normal",
//           highlightStrokeColor: "SAME",
//           highlightStrokeWidth: "SAME",
//           labelProperty: "id",
//           mouseCursor: "pointer",
//           opacity: 1,
//           renderLabel: true,
//           size: 200,
//           strokeColor: "none",
//           strokeWidth: 1.5,
//           svg: "",
//           symbolType: "circle"
//         },
//         link: {
//           color: "#d3d3d3",
//           fontColor: "black",
//           fontSize: 8,
//           fontWeight: "normal",
//           highlightColor: "SAME",
//           highlightFontSize: 8,
//           highlightFontWeight: "normal",
//           labelProperty: "label",
//           mouseCursor: "pointer",
//           opacity: 1,
//           renderLabel: false,
//           semanticStrokeWidth: false,
//           strokeWidth: 1.5,
//           markerHeight: 6,
//           markerWidth: 6,
//           strokeDasharray: 0,
//           strokeDashoffset: 0,
//           strokeLinecap: "butt"
//         }
//       };

//   useEffect(() => {
//     // Log lineageData to ensure it has the expected structure
//     console.log("Lineage data:", lineageData);
//   }, [lineageData]);

//   // Check if lineageData is in the correct format
//   if (!lineageData || !lineageData.nodes || !lineageData.links) {
//     return <div>Error: Invalid lineage data format.</div>;
//   }

// class ErrorBoundary extends React.Component {
//     constructor(props) {
//         super(props);
//         this.state = { hasError: false };
//     }

//     static getDerivedStateFromError(error) {
//         return { hasError: true };
//     }

//     componentDidCatch(error, errorInfo) {
//         console.error("Error occurred:", error, errorInfo);
//     }

//     render() {
//         if (this.state.hasError) {
//             return <p>Something went wrong while rendering the graph.</p>;
//         }
//         return this.props.children;
//     }
// }

    
    

// const handleNodeClick = (nodeId,event) => {
//     if (!nodeId) {
//         console.error("Invalid node clicked:", nodeId);
//         return; // Prevent further actions if nodeId is invalid
//     }
//     console.log("Node clicked:", nodeId);
//     alert(`You clicked on node: ${nodeId}`);  // Example of a simple action

//     console.log("Event:", event); 

//     console.log(nodeId || "Unknown node clicked");

// };


// const handleGraphClick = (event) => {
//     if (event.target.tagName === "svg") {
//         console.log("Clicked on empty space.");
//         return;
//     }

//     if (!event.target) {
//         console.log("White space clicked.");
//         return;
//     }

//     console.log("Graph element clicked:", event.target);
//     console.log("Graph whitespace clicked.");
//     alert("Clicked on empty graph area.");
// };

// const handleNodeDrag = (nodeId, x, y) => {
//     console.log(`Node ${nodeId} dragged to position (${x}, ${y})`);
//     // Ensure the data is being correctly updated
//     // For example, update the node's position in your lineageData
// };

// const handleNodeDrop = (nodeId) => {
//     console.log(`Dropped node: ${nodeId}`);
// };

// const handleNodeDragEnd = (nodeId) => {
//     console.log(`Finished dragging node: ${nodeId}`);
// };



//     return (
//         <div 
//         style={{
//             height: "600px",
//             width: "100%",
//             border: "2px solid black", // Adds a solid black border
//             borderRadius: "8px", // Optional: Makes the edges rounded
//             padding: "10px", // Optional: Adds spacing inside the border
//             boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", // Optional: Adds a shadow for a nice effect
//         }}
//         >
//             {lineageData ? (
//             <ErrorBoundary>
//                 <Graph
//                     id="lineage-graph"
//                     data={lineageData}
//                     config={graphConfig}
//                     onClickNode={handleNodeClick}
//                     onClickGraph={handleGraphClick}
//                     onNodeDrag={handleNodeDrag}
//                     onNodeDrop={handleNodeDrop}
//                     onNodeDragEnd={handleNodeDragEnd}
//                 />
//             </ErrorBoundary>
//             ) : (
//                 <p>Loading lineage graph...</p>
//             )}
//         </div>
//     );
// };

// export default LineageGraph;
