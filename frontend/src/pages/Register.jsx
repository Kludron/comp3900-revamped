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
  
  //Checks the password and re-type password fields are the same before registering.
  const checkPasswords = (password, repassword) => {
    if(password !== repassword){
      return alert("Passwords do not match, please try again.");
    } else {
      return true;
    }
  }

  return <>
    <main>
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
        if(checkPasswords(password, repassword)){
          let headers = {
            "Content-Type": "application/json",
          };
          var body = {
            email,
            username,
            password
          };
          axios.post("http://localhost:5000/auth/register", body, headers)
          .then((response) => {
            console.log(response);
            //Need a popup box here
            alert("You have successfully registered. You have been moved to the login page.")
            navigate('/login');
          }).catch((error) => {
            console.log(error);
            alert(error)
          });
        } else {
          alert("Passwords do not match. Please try again.")
          return;
        }
      }} />
      <br />
      <span>Already have an account? </span>
      <Button variant="outlined" onClick={login}>Log in</Button>
      </Box>
    </main>
  </>;
}

export default Register;
