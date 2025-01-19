import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const ModelDetailsPage = () => {
  const { modelId } = useParams(); // Assumes you're using React Router
  const [modelDetails, setModelDetails] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`http://127.0.0.1:3000/model_docs/${modelId}`)
      .then((response) => response.json())
      .then((data) => setModelDetails(data))
      .catch((err) => setError(err.message));
  }, [modelId]);

  if (error) {
    return <p>Error fetching model details: {error}</p>;
  }

  if (!modelDetails) {
    return <p>Loading model details...</p>;
  }

  const { name, description, materialization, schema, database, columns } =
    modelDetails;

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Model Details: {name}</h1>
      <p>
        <strong>Description:</strong> {description || "No description available."}
      </p>
      <p>
        <strong>Materialization:</strong> {materialization || "Unknown"}
      </p>
      <p>
        <strong>Schema:</strong> {schema || "Unknown"}
      </p>
      <p>
        <strong>Database:</strong> {database || "Unknown"}
      </p>

      <h2>Columns</h2>
      {columns && columns.length > 0 ? (
        <table style={tableStyles}>
          <thead>
            <tr>
              <th style={headerCellStyles}>Name</th>
              <th style={headerCellStyles}>Description</th>
              <th style={headerCellStyles}>Data Type</th>
            </tr>
          </thead>
          <tbody>
            {columns.map((col) => (
              <tr key={col.name} style={rowStyles}>
                <td style={cellStyles}>{col.name}</td>
                <td style={cellStyles}>
                  {col.description || "No description available"}
                </td>
                <td style={cellStyles}>{col.type || "Unknown"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No columns available for this model.</p>
      )}
    </div>
  );
};

export default ModelDetailsPage;

// Styles
const tableStyles = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: "20px",
};

const headerCellStyles = {
  borderBottom: "2px solid #ddd",
  padding: "10px",
  textAlign: "left",
  fontWeight: "bold",
  backgroundColor: "#f4f4f4",
};

const cellStyles = {
  borderBottom: "1px solid #ddd",
  padding: "10px",
  textAlign: "left",
};

const rowStyles = {
  backgroundColor: "#fff",
  transition: "background-color 0.2s ease",
};

const hoverStyles = {
  ...rowStyles,
  backgroundColor: "#f9f9f9",
};
