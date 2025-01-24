import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';

// Pages (you can create separate components for these)
import HomePage from './pages/HomePage';
import DataSourcesPage from './pages/DataSourcesPage';
import LineagePage from './pages/LineagePage';
import ModelDetailsPage from "./pages/ModelDetailsPage";

function App() {
  return (
    <Router>
      <div>
        {/* Page routing */}
        <Routes>
          <Route path="/" element={<LineagePage />} />
          <Route path="/lineage" element={<LineagePage />} />
          <Route path="/model-details/:modelName" element={<ModelDetailsPage />} />
          {/* still in development
          <Route path="/data-sources" element={<DataSourcesPage />} /> */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
