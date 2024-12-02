import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';

// Pages (you can create separate components for these)
import HomePage from './pages/HomePage';
import DataSourcesPage from './pages/DataSourcesPage';
import LineagePage from './pages/LineagePage';

function App() {
  return (
    <Router>
      <div>
        {/* Navbar */}
        <nav>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/data-sources">Data Sources</Link></li>
            <li><Link to="/lineage">Lineage</Link></li>
          </ul>
        </nav>

        {/* Page routing */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/data-sources" element={<DataSourcesPage />} />
          <Route path="/lineage" element={<LineagePage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
