import React, { useEffect, useState } from "react";
import LineageGraph from "../components/LineageGraph";

const LineagePage = () => {
    const [models, setModels] = useState([]);
    const [lineageData, setLineageData] = useState(null);

    useEffect(() => {
        // Fetch models from the backend
        fetch("http://127.0.0.1:3000/models")
            .then((response) => response.json())
            .then((data) => setModels(data))
            .catch((error) => console.error("Error fetching models:", error));
    }, []);

    useEffect(() => {
        // Fetch lineage data for all models (for graph data)
        fetch("http://127.0.0.1:3000/lineage")
            .then((response) => response.json())
            .then((data) => {
                // Prepare the lineage data in a format that LineageGraph expects
                const formattedLineageData = {
                    nodes: Object.keys(data).map((key) => key), // List of node ids (model names)
                    upstream: [],
                    downstream: [],
                };

                // Loop through each model's dependencies and split them into upstream and downstream
                Object.entries(data).forEach(([key, value]) => {
                    const { dependencies } = value;
                    // Mark dependencies as downstream for the start model
                    formattedLineageData.downstream.push(...dependencies);
                    // Reverse the logic if you want upstream instead
                    formattedLineageData.upstream.push(key);
                });

                // Log the lineage data in the console
                console.log("Lineage Data:", formattedLineageData);

                setLineageData(formattedLineageData);
            })
            .catch((error) => console.error("Error fetching lineage data:", error));
    }, []);

    return (
        <div style={{ padding: "20px" }}>
            <h1>Data Lineage</h1>
            <h2>Models</h2>
            <ul>
                {models.map((model, index) => (
                    <li key={index}>{model}</li>
                ))}
            </ul>

            <h2>Lineage Graph</h2>
            {/* Pass the lineageData prop to LineageGraph */}
            <LineageGraph lineageData={lineageData} />
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