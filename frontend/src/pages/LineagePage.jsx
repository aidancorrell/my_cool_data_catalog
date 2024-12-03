import React, { useEffect, useState } from "react";

const Lineage = () => {
    const [models, setModels] = useState([]);

    useEffect(() => {
        // Fetch models from the backend
        fetch("http://127.0.0.1:3000/models")
            .then((response) => response.json())
            .then((data) => setModels(data))
            .catch((error) => console.error("Error fetching models:", error));
    }, []);

    return (
        <div>
            <h1>Lineage</h1>
            <ul>
                {models.map((model, index) => (
                    <li key={index}>{model}</li>
                ))}
            </ul>
        </div>
    );
};

export default Lineage;
