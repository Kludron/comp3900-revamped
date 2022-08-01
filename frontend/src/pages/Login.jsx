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

/* Login Page */
function Login () {

  const [authenticated, setAuthenticated] = useState(false);

  //React navigate functions
  const navigate = useNavigate();
  // Navigate to register page
  const register = () => {
    navigate('/register');
  }

  return <>
  <Box
  sx={{
    marginTop: 8,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  }}
  >
    <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}></Avatar>
    <Typography component="h1" variant="h5">
      Sign in to F1V3GUY5
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
    <ForgotPassword/>
    <br />
    <span>Don&apos;t have an account? </span>
    <Button
    variant="outlined"
    onClick={register}>Sign Up</Button>
  </Box>
  </>;
}

export default Login;
