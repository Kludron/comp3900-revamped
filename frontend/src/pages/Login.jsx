import React from 'react';
import LoginForm from '../components/LoginForm';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';

/* Login Page */
function Login () {
  localStorage.clear();
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
      axios.post('http://localhost:5000/auth/login', JSON.stringify({email, password}))
      .then(res => {
        console.log(res.data);
      })
    }} />
    <br />
    <span>Don&apos;t have an account? </span>
    <Button
    variant="outlined"
    onClick={register}>Sign Up</Button>
  </Box>
  </>;
}

export default Login;
