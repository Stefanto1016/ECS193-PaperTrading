import React, { useEffect } from 'react';
import { useState } from 'react';
import {GoogleLogin, googleLogout, useGoogleLogin} from '@react-oauth/google';
import axios from 'axios';

function Login() {
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

    return (
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
    )
}

export default Login