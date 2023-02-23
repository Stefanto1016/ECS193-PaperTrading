import React from 'react'
import { useState } from 'react';
import LineChart from '../components/LineChart';
import NavBar from '../components/NavBar';

function Stocks() {

  const chartStyle = {
    width: 500,
  }

  // Data for Chart 1
  const chartData1 = {
    // x-axis labels
    labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
    datasets: [
      {
        label: "Cost of Stock in $ (x100)",
        // corresponding y values
        data: [3.2, 2.7, 1.9, 2.5, 3.0, 3.1, 4.0, 3.5, 3.2, 3.6, 3.9, 3.4],
        fill: true,
        borderColor: "blue",
        tension: 0.1
      }
    ]
  }

  // Datafor Chart 2
  const chartData2 = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: "Cost of Stock in $ (x100)",
        data: [1.2, 1.7, 1.0, 1.8, 2.0, 1.8, 2.1],
        fill: true,
        borderColor: "red",
        tension: 0.1
      }
    ]
  };

  const [chartData, setChartData] = useState(chartData1);

  return (
    <div className='Stocks'>
      <NavBar/> 
      <button onClick={() => setChartData(chartData1)}> Chart 1 </button>
      <button onClick={() => setChartData(chartData2)}> Chart 2 </button>
      <div style={chartStyle}>
        <LineChart chartData={chartData}/>
      </div>
    </div>

  )
}

export default Stocks