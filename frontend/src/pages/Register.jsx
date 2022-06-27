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
    <RegisterForm submit={async (email, username, password, repassword) => {
      console.log(email, username, password, repassword);
      axios.post('http://localhost:5000/auth/login', { email, password })
      .then((response) => {
        console.log(response);
        //Need a popup box here
        navigate('/login');
      }, (error) => {
        console.log(error);
      });
    }} />
    <br />
    <span>Already have an account? </span>
    <Button variant="outlined" onClick={login}>Log in</Button>
    </Box>
  </>;
}

export default Register;
