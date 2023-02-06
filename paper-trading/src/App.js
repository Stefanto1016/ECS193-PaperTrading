import React from 'react';
import { useState } from 'react';
import LineChart from './components/LineChart';

function App() {
  const [chartData, setChartData] = useState({
    labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
    datasets: [
      {
        label: "Cost of Stock in $ (x100)",
        data: [3.2, 2.7, 1.9, 2.5, 3.0, 3.1, 4.0, 3.5, 3.2, 3.6, 3.9, 3.4],
        fill: true,
        borderColor: "rgb(0,191,255)",
        tension: 0.1
      }
    ]
  });

  return (
    <div className="App">
      <LineChart chartData={chartData} />
    </div>
  );
}

export default App;
