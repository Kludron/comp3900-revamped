import React from 'react';
import RegisterForm from '../components/RegisterForm';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import axios from 'axios';
import './Register.css';

/* Register Page */
function Register () {

  //Clear localstorage
  localStorage.clear();

  //React navigate functions
  const navigate = useNavigate();
  const login = () => {
    navigate('/login');
  };
  
  //Checks the password and re-type password fields are the same before registering.
  const checkPasswords = (password, repassword) => {
    if(password !== repassword){
      return alert("Passwords do not match, please try again.");
    } else {
      return true;
    }
  }

  return <>
  <body>
    <main>
      <Box
      sx={{
        marginTop: 9,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
      >
        <Avatar sx={{ m: 2, bgcolor: 'secondary.main' }}></Avatar>
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
              alert("Registration Successful! You will now be moved to the log-in page.")
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
        <span>Already have an account? 
          <Button onClick={login}>Log in</Button>
        </span>
      </Box>
    </main>
    </body>
  </>;
}

export default Register;
