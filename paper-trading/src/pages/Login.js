import React, { useEffect } from 'react';
import { useState } from 'react';
import {googleLogout, useGoogleLogin} from '@react-oauth/google';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import GoogleButton from 'react-google-button';
import stock from "../images/stock_background.jpeg"
import { width } from '@mui/system';
import { Typography } from '@mui/material';




function Login() {
    //Google User Data
  const navigate = useNavigate();
  /*useEffect(() => {
    if(localStorage.getItem("profile") != ""){
        navigate("/App");
    }
  })*/

  const [user, setUser] = useState([]);
  const [profile, setProfile] = useState(null);

  const login = useGoogleLogin({
    onSuccess: (res) => {setUser(res);},
    onError: (err) => console.log("Login failed, ", err)
  });

  useEffect(
    () => {
      if (window.localStorage.getItem('googleCypress')) {
        const credentials = JSON.parse(localStorage.getItem("googleCypress"));
        console.log(credentials.user)
        setProfile(credentials.user)
      }
    },
    []
  )

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
          console.log(res.data)
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
    localStorage.setItem("profile", "");
  }
  
  useEffect(
    ()  => {
      if (profile) {
        fetch("http://localhost:8000/hasAccount?" + new URLSearchParams({
            userKey: profile["email"]
        })).then((res) => { return res.json()}).then((data) => {
          if(!(data)){
            const options = {
              method: 'PUT',
              body: JSON.stringify({userKey: profile["email"]}),
              headers: {'Content-Type': 'application/json'}
            }
            fetch("http://localhost:8000/createAccount", options).then((res) => {
              if(res.ok){
                localStorage.setItem("profile", JSON.stringify(profile));
                navigate("/App");
              }
            })
          } else {
            localStorage.setItem("profile", JSON.stringify(profile));
            navigate("/App");
          }
        });
      }
    }
  );


  const pageStyle = {
    backgroundColor: "#e5e8eb",
    height: "100vh", 
    width: "100vw", 
    display: "flex", 
    justifyContent: "center",
    alignItems: "center"
  };
  /*
  const loginStyle = {
    backgroundImage: `url(${stock})`, 
    height: "100%", 
    width: "60%", 
    margin: "0px", 
    padding: "0px", 
    backgroundPosition: "center center", 
    position: "50% 50%", 
    backgroundRepeat: "no-repeat",  
    backgroundSize: "100%", 
    display: "flex", 
    justifyContent: "center", 
    alignItems: "center", 
    opacity: "0.6"
  };*/

  const loginBackgroundStyle = {
    backgroundImage: `url(${stock})`, 
    height: "100%", 
    width: "60%", 
    margin: "0px", 
    padding: "0px", 
    backgroundPosition: "center center", 
    position: "50% 50%", 
    backgroundRepeat: "no-repeat",  
    backgroundSize: "cover", 
    display: "flex", 
    justifyContent: "center", 
    alignItems: "center", 
    opacity: "0.6",
    float: "right",
    borderRadius: "50px 0px 0px 50px",
    overflow: "auto"
  };

  const loginModuleStyle = {
    height: "80%",
    width: "70%",
    backgroundColor: "#F0EAD6",
    display: "inline-block",
    borderRadius: "50px",
    overflow: "auto",
    boxShadow: "5px 10px 50px 10px"
  }

  const buttonSideStyle = {
    height: "100%",
    width: "40%",
    backgroundColor: "#F0EAD6",
    float: "left",
    alignItems: "center",
    justifyContent: "center",
    display: "flex",
    overflow: "auto"
  }



    return (
        <div style={pageStyle}>
          <div style={loginModuleStyle}>
            <div style={buttonSideStyle}>
            
          <br></br>
          {profile ? (
            <div>
            
            </div>
          ) : (
            <div>
              <GoogleButton onClick={() => login()}/>
            </div>
          )}
          <br></br>
          </div>
          <div style={loginBackgroundStyle}>
          </div>
        </div>
      </div>
    )
}


export default Login