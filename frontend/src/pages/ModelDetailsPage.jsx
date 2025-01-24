import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import SyntaxHighlighter from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/hljs";
import Layout from "../components/Layout";


const ModelDetails = () => {
  const { modelName } = useParams();
  const [modelData, setModelData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (modelName) {
      fetch(`http://127.0.0.1:3000/model_docs/${modelName}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Failed to fetch model details: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          setModelData(data);
        })
        .catch((err) => {
          setError(err.message);
        });
    }
  }, [modelName]);

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (!modelData) {
    return <div className="text-gray-500 italic">Loading model details...</div>;
  }

  const { general, columns, sql } = modelData;

  return (
  <Layout>
    <div className="p-8 bg-gray-100">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Model Details</h1>
      </header>

      <section className="mb-6 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-gray-700 mb-2">General Information</h2>
        <p>
          <strong>Name:</strong> {general.name || "Unknown"}
        </p>
        <p>
          <strong>Description:</strong> {general.description || "No description available"}
        </p>
        <p>
          <strong>Materialized Type:</strong> {general.materialized || "Unknown"}
        </p>
        <p>
          <strong>Schema:</strong> {general.schema || "Unknown"}
        </p>
      </section>

      <section className="mb-6 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-gray-700 mb-2">Columns</h2>
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Data Type
              </th>
            </tr>
          </thead>
          <tbody>
            {columns.map((col, index) => (
              <tr key={index}>
                <td className="px-6 py-4 text-sm text-gray-800">{col.name}</td>
                <td className="px-6 py-4 text-sm text-gray-800">
                  {col.description || "No description available"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-800">{col.type || "Unknown"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-gray-700 mb-2">SQL</h2>
        <SyntaxHighlighter language="sql" style={dracula}>
          {sql.raw_code || "No SQL code available"}
        </SyntaxHighlighter>
      </section>
    </div>
  </Layout>
  );
};

export default ModelDetails;
