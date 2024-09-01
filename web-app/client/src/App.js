import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import CsvDataDisplay from './components/CsvDataDisplay';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/csv-data" element={<CsvDataDisplay />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
