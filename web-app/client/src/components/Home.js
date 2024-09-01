import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  const navigateToCsvData = () => {
    navigate('/csv-data');
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Welcome to the Fantasy Football Draft Tool</h1>
      <button onClick={navigateToCsvData} style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}>
        View CSV Data
      </button>
    </div>
  );
};

export default Home;
