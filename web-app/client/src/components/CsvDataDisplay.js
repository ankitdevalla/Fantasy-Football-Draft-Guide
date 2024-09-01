import React, { useEffect, useState } from 'react';
import axios from 'axios';

const CsvDataDisplay = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8000/api/csv-data')
      .then(response => {
        setData(response.data);
      })
      .catch(error => {
        console.error('Error fetching the CSV data:', error);
      });
  }, []);

  return (
    <div>
      <h2>CSV Data</h2>
      <table border="1">
        <thead>
          <tr>
            {data.length > 0 && Object.keys(data[0]).map((key) => (
              <th key={key}>{key}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              {Object.values(row).map((value, i) => (
                <td key={i}>{value}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CsvDataDisplay;
