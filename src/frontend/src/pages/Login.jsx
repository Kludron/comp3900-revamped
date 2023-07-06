import React from 'react';
import LoginForm from '../components/LoginForm';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import ForgotPassword from '../components/ForgotPassword';
import './Login.css';
import LoginImg from '../img/login.jpg';

/* Login Page */
function Login () {

  //Store state variable
  const [authenticated, setAuthenticated] = useState(false);

  //React navigate functions
  const navigate = useNavigate();
  const register = () => {
    navigate('/register');
  }

  return <>
  <body>
    <main>
      <Box
        className="box"
        sx={{
          marginTop: 9,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
      }}>
        <Avatar sx={{ m: 2, bgcolor: 'secondary.main' }}></Avatar>
        <Typography className="Sign-in" component="h1" variant="h5">
          F1V3GUY5 Sign In
        </Typography>
        <LoginForm submit={async (email, password) => {
          let headers = {
            "Content-Type": "application/json",
          };
          var body = {
            email,
            password
          };
          axios.post("http://localhost:5000/auth/login", body, headers)
          .then((response) => {
            console.log(response.data.token);
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('username', response.data.username);
            localStorage.setItem('email', response.data.email);
            localStorage.setItem('points', response.data.points);
            if(response.status === 200 && response.data.token != null) {        
              setAuthenticated(true);
              navigate('/dashboard');
            }
          }).catch((error) => {
            console.log(error);
            alert('Your email or password are incorrect. Please try again.')
          });
        }} />
        <ForgotPassword />
        <br />
        <span>Don&apos;t have an account? 
          <Button
            onClick={register}>Sign Up
          </Button>
        </span>
      </Box>
    </main>
  </body>
  </>;
}

export default Login;
