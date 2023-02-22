import React, { useEffect } from 'react';
import { useState } from 'react';
import {googleLogout, useGoogleLogin} from '@react-oauth/google';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import GoogleButton from 'react-google-button';
import stock from "../images/stock_background.jpeg"
import { width } from '@mui/system';

function Login() {
    //Google User Data
  const navigate = useNavigate();
  const [user, setUser] = useState([]);
  const [profile, setProfile] = useState(null);

  const login = useGoogleLogin({
    onSuccess: (res) => setUser(res),
    onError: (err) => console.log("Login failed, ", err)
  });

  const handleNav = (e) => {
    navigate("/App");
  }

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


    return (
        <div style={{backgroundColor: "#104e8d", height: "100vh", width: "100vw", display: "flex", justifyContent: "center", alignItems: "center"}}>
          <div style={{backgroundImage: `url(${stock})`, height: "100%", width: "100%", margin: "0px", padding: "0px", backgroundPosition: "center center", position: "50% 50%", backgroundRepeat: "no-repeat",  backgroundSize: "100%", display: "flex", justifyContent: "center", alignItems: "center", opacity: "0.6"}}>
          <br></br>
          {profile ? (
            <div>
              <button onClick={logOut}>Log Out</button>
            </div>
          ) : (
          <GoogleButton onClick={() => {login(); handleNav();}}/>
          )}
          <br></br>
        </div>
      </div>
    )
}


export default Login