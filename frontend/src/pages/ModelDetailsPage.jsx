import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const ModelDetails = () => {
  const { modelName } = useParams();
  const [modelData, setModelData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("Model Name:", modelName);
    if (modelName) {
      fetch(`http://127.0.0.1:3000/model_docs/${modelName}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Failed to fetch model details: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          console.log("Fetched Model Data:", data);
          setModelData(data);
        })
        .catch((err) => {
          console.error("Error fetching model data:", err);
          setError(err.message);
        });
    }
  }, [modelName]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!modelData) {
    return <div>Loading model details...</div>;
  }

  const { general, columns, sql } = modelData;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Model Details</h1>

      {/* General Information */}
      <section style={{ marginBottom: "20px" }}>
        <h2>General Information</h2>
        <p><strong>Name:</strong> {general.name || "Unknown"}</p>
        <p><strong>Description:</strong> {general.description || "No description available"}</p>
        <p><strong>Materialized Type:</strong> {general.materialized || "Unknown"}</p>
        <p><strong>Schema:</strong> {general.schema || "Unknown"}</p>
        <p><strong>Database:</strong> {general.database || "Unknown"}</p>
        <p><strong>Primary Keys:</strong> {general.primary_keys?.join(", ") || "None"}</p>
        <p><strong>Tags:</strong> {general.tags?.length > 0 ? general.tags.join(", ") : "None"}</p>
      </section>

      {/* Columns Table */}
      <section style={{ marginBottom: "20px" }}>
        <h2>Columns</h2>
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
          <thead>
            <tr>
              <th style={{ borderBottom: "2px solid #ccc", textAlign: "left", padding: "8px" }}>Name</th>
              <th style={{ borderBottom: "2px solid #ccc", textAlign: "left", padding: "8px" }}>Description</th>
              <th style={{ borderBottom: "2px solid #ccc", textAlign: "left", padding: "8px" }}>Data Type</th>
            </tr>
          </thead>
          <tbody>
            {columns.map((col, index) => (
              <tr key={index}>
                <td style={{ borderBottom: "1px solid #eee", padding: "8px" }}>{col.name}</td>
                <td style={{ borderBottom: "1px solid #eee", padding: "8px" }}>
                  {col.description || "No description available"}
                </td>
                <td style={{ borderBottom: "1px solid #eee", padding: "8px" }}>
                  {col.type || "Unknown"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* SQL Information */}
      <section>
        <h2>SQL</h2>
        <p><strong>Relation Name:</strong> {sql.relation_name || "Unknown"}</p>
        <pre
          style={{
            backgroundColor: "#f4f4f4",
            padding: "10px",
            borderRadius: "5px",
            overflowX: "auto",
          }}
        >
          {sql.raw_code || "No SQL code available"}
        </pre>
      </section>
    </div>
  );
};

export default ModelDetails;
