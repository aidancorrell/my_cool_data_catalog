// keeping this for now to have a deeper dive into the model metadata in a separate page for future development

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const ModelMetadataPage = () => {
  const { modelName } = useParams(); // Get the model name from the URL
  const [modelDetails, setModelDetails] = useState(null);

  useEffect(() => {
    // Fetch model details from the backend
    fetch(`http://127.0.0.1:3000/models/${modelName}`)
      .then((response) => response.json())
      .then((data) => setModelDetails(data))
      .catch((error) => console.error("Error fetching model details:", error));
  }, [modelName]);

  if (!modelDetails) {
    return <p>Loading model metadata...</p>;
  }

  const { name, alias, config, depends_on, original_file_path, tags } = modelDetails;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Metadata for {name}</h1>
      <p>
        <strong>Alias:</strong> {alias || "N/A"}
      </p>
      <p>
        <strong>Materialization:</strong> {config.materialized || "N/A"}
      </p>
      <p>
        <strong>Schema:</strong> {config.schema || "N/A"}
      </p>
      <p>
        <strong>File Path:</strong> {original_file_path}
      </p>
      <p>
        <strong>Tags:</strong> {tags.length > 0 ? tags.join(", ") : "No tags."}
      </p>
      <p>
        <strong>Enabled:</strong> {config.enabled ? "Yes" : "No"}
      </p>

      <h2>Dependencies</h2>
      {depends_on.nodes.length > 0 ? (
        <ul>
          {depends_on.nodes.map((node, index) => (
            <li key={index}>{node.split(".").pop()}</li>
          ))}
        </ul>
      ) : (
        <p>No dependencies.</p>
      )}

      <h2>Additional Config</h2>
      <ul>
        <li>
          <strong>Access:</strong> {config.access || "N/A"}
        </li>
        <li>
          <strong>Incremental Strategy:</strong> {config.incremental_strategy || "N/A"}
        </li>
        <li>
          <strong>On Schema Change:</strong> {config.on_schema_change || "N/A"}
        </li>
      </ul>
    </div>
  );
};

export default ModelMetadataPage;
