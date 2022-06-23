import React from 'react';
import LoginForm from '../components/LoginForm';
import { useNavigate } from 'react-router-dom';
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
      Sign in to BigBrain
    </Typography>
    <LoginForm submit={async (email, password) => {
      const response = await fetch('http://localhost:5005/admin/auth/login', {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        })
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        navigate('/dashboard');
      } else {
        alert(await data.error);
      }
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
