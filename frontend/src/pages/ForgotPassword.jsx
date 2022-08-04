import axios from "axios";
import React from "react";
import ForgotPasswordForm from '../components/ForgotPasswordForm';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import { useNavigate } from "react-router";
import './ForgotPassword.css';

/* Forgot Password Page */
function ForgotPassword () {

	//React navigation functions
	const navigate = useNavigate();
	const goback = () => {
		navigate('/login');
	};

	return(<>
	<div>
		<Button className='btn' variant='contained' onClick={goback}>← Go Back</Button>
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
					Reset your Password
        </Typography>
			<ForgotPasswordForm submit={async (email) => {
				console.log(email)
				let headers = {
            "Content-Type": "application/json",
          };
          var body = {
            email,
					}
					console.log(body);
					axios.post("http://localhost:5000/auth/reset", body, headers)
					.then((response) => {
						console.log(response);
						alert('An email has been sent to change your password');
						navigate('/login');
					}).catch(err => {
						alert('An issue has occurred, please try again.');
						console.log(err)
					})
			}}/>
			</Box>
		</div>
	</>)

}

export default ForgotPassword;