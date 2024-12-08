import React from "react";
import { Graph } from "react-d3-graph";

const LineageGraph = ({ lineageData }) => {
    const graphConfig = {
        node: {
            color: "lightblue",
            size: 400,
            fontSize: 12,
        },
        link: {
            color: "gray",
        },
        directed: true,
    };

const handleNodeClick = (nodeId) => {
    if (!nodeId) {
        console.error("Invalid node clicked:", nodeId);
        return; // Prevent further actions if nodeId is invalid
    }
    console.log("Node clicked:", nodeId);
    alert(`You clicked on node: ${nodeId}`);  // Example of a simple action
};


    return (
        <div style={{ height: "600px", width: "100%" }}>
            {lineageData ? (
                <Graph
                    id="lineage-graph"
                    data={lineageData}
                    config={graphConfig}
                    onClickNode={handleNodeClick}
                />
            ) : (
                <p>Loading lineage graph...</p>
            )}
        </div>
    );
};

export default LineageGraph;
