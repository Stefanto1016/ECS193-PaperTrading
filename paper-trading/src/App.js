import React, { useEffect, useState } from 'react';
import NavBar from './components/NavBar';
import Home from './pages/Home';
import { useNavigate } from 'react-router';


function App() { 
  const navigate = useNavigate();
  useEffect(() => {
    if(localStorage.getItem("profile") == ""){
        navigate("/login");
    }else{
        setProfile(localStorage.getItem("profile"))
    }
})

const [profile, setProfile] = useState(null);

  return (
    <div>
      {profile ? (
    <div className="App">
      <NavBar/> 
      <Home/>
    </div>
      ) : (
        <div></div>
      )}
    </div>
  );
}


export default App;
