import React from 'react';
import RegisterForm from '../components/RegisterForm';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import axios from 'axios';

/* Register Page */
function Register () {
  localStorage.clear();
  const navigate = useNavigate();

  // Navigate to Login page
  const login = () => {
    navigate('/login');
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
        Create an account
      </Typography>
      {/* <RegisterForm submit={async (email, password, name) => {
        const response = await fetch('http://localhost:5000/auth/register', {
          method: 'POST',
          headers: {
            'Content-type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
            name,
          })
        });
        const data = await response.json();
        if (response.ok) {
          localStorage.setItem('token', data.token);
          navigate('/dashboard');
        } else {
          alert(await data.error);
        }
      }} /> */}
      <RegisterForm submit={async (email, password, name) => {
        axios.post('http://localhost:5000/auth/register', JSON.stringify({email, password, name}))
        .then(res => {
          console.log(res.data)
        })
      }}
      />
      <br />
      <span>Already have an account? </span>
      <Button variant="outlined" onClick={login}>Log in</Button>
    </Box>
  </>;
}

export default Register;
