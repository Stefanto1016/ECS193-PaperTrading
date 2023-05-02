import React, { useEffect, useState } from 'react';
import Home from './pages/Home';
import { Navigate } from 'react-router';


function App() { 
  const profile = localStorage.getItem("profile");

  return (
    <div>
      {profile ? (
    <div className="App"> 
      <Home/>
    </div>
      ) : (
        <Navigate to="/login"/>
      )}
    </div>
  );
}


export default App;
