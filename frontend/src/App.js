import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import UploadContent from './pages/UploadContent';
import RetrieveContent from './pages/RetrieveContent';
import ViewContentPage from './pages/ViewContentPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<UploadContent />} />
          <Route path="/retrieve" element={<RetrieveContent />} />
          <Route path="/view/:key" element={<ViewContentPage />} />
          {/* Legacy routes for backward compatibility */}
          <Route path="/upload" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

