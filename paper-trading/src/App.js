import React, { useEffect } from 'react';
import { useState } from 'react';
import LineChart from './components/LineChart';
import NavBar from './components/NavBar';
import {GoogleLogin, googleLogout, useGoogleLogin} from '@react-oauth/google';
import axios from 'axios';

import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import Home from './pages/Home'
import Portfolio from './pages/Portfolio'
import Stocks from './pages/Stocks'
import Learning from './pages/Learning'
import Login from './pages/Login'


function App() {  
  return (
    <div className="App">
      <Router>
        <NavBar/> 
        <Routes>
          <Route path='/' element={<Home/>} />
          <Route path='/portfolio' element={<Portfolio/>} />
          <Route path='/stocks' element={<Stocks/>} />
          <Route path='/learning' element={<Learning/>} />
          <Route path='/logout' element={<Login/>} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
