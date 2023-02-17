import React, { useEffect } from 'react';
import { useState } from 'react';
import LineChart from './components/LineChart';
import {GoogleLogin, googleLogout, useGoogleLogin} from '@react-oauth/google';
import axios from 'axios';

function App() {
  //const [chartData, setChartData] = useState(chartData1);

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

  //Google User Data
  const [user, setUser] = useState([]);
  const [profile, setProfile] = useState(null);

  const login = useGoogleLogin({
    onSuccess: (res) => setUser(res),
    onError: (err) => console.log("Login failed, ", err)
  });

  useEffect(
    () => {
      if (user) {
        axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${user.access_token}`, {
          headers: {
            Authorization: `Bearer ${user.access_token}`,
            Accept: 'application/json'
          }
        })
        .then((res) => {
          setProfile(res.data);
        })
        .catch((err) => console.log(err));
      }
    },
    [user]
  );

  const logOut = () => {
    googleLogout();
    setProfile(null);
  }

  const [chartData, setChartData] = useState(chartData1);

  function DisplayChart(chartData) {
    return <LineChart chartData={chartData}/>
  }

  return (
    <div className="App">
      <div>
        <h2>Google Login</h2>
        <br></br>
        {profile ? (
          <div>
            <img src={profile.picture} alt="user image"/>
            <h3>User currently logged in</h3>
            <p>Name: {profile.name}</p>
            <p>Email: {profile.email}</p>
            <br></br>
            <button onClick={logOut}>Log Out</button>
          </div>
        ) : (
        <button onClick={() => login()}>Login</button>
        )}
        <br></br>
      </div>
      <button onClick={() => setChartData(chartData1)}> Chart 1 </button>
      <button onClick={() => setChartData(chartData2)}> Chart 2 </button>
      <div style={{width: 1000}}>
        <LineChart chartData={chartData}/>
      </div>
    </div>
  );
}

export default App;
