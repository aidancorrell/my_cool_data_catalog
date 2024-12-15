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

        // Fetch lineage data (for the graph)
        fetch("http://127.0.0.1:3000/lineage")
            .then((response) => response.json())
            .then((data) => {
                const graphData = {
                    nodes: Object.keys(data).map((key) => ({ id: key })),
                    links: Object.entries(data).flatMap(([key, value]) =>
                        value.dependencies.map((dep) => ({
                            source: key,
                            target: dep,
                        }))
                    ),
                };

                setLineageData(graphData);
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