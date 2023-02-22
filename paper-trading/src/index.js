import React from 'react';
import ReactDOM from 'react-dom/client';
import {GoogleOAuthProvider} from '@react-oauth/google';
import App from './App';
import Login from './pages/Login'
import Home from './pages/Home';
import Portfolio from './pages/Portfolio';
import Stocks from './pages/Stocks';
import Learning from './pages/Learning';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <GoogleOAuthProvider clientId="679166132884-ir5rkoeo1debgih79aeoju0tp88k212p.apps.googleusercontent.com">
    <React.StrictMode>
      <Router>
        <Routes>
          <Route index element={<Login />} />
          <Route path="login" element={<Login />} />
          <Route path="/App" element={<App />} />
          <Route path='/main' element={<Home/>} />
          <Route path='/portfolio' element={<Portfolio/>} />
          <Route path='/stocks' element={<Stocks/>} />
          <Route path='/learning' element={<Learning/>} />
          <Route path='/logout' element={<Login/>} />
        </Routes>
      </Router>
    </React.StrictMode>
  </GoogleOAuthProvider>
);
