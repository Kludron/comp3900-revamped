import React from 'react';
import ChangePasswordForm from '../components/ChangePasswordForm';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import './ChangeUsername.css';

/* Change Password Page */
function ChangePassword () {

	//Navigate functions
	const navigate = useNavigate();
	const previous = () => {
		navigate('/profile');
	}
	
	//Checks password and re-type password fields are the same, returns true if same.
	const checkPasswords = (password, repassword) => {
		if(password !== repassword){
			return alert("Passwords do not match, please try again");
		} else {
			return true;
		}
  }

	return <>
		<body>
    	<main>
				<Button className="go_back" variant='contained' onClick={previous}>← Go Back</Button>
				<Box
					className="box"
					sx={{
						marginTop: 10,
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
				}}>
					<Avatar sx={{ m: 2, bgcolor: 'secondary.main' }}></Avatar>
					<Typography className="Sign-in" component="h1" variant="h5">
						Change Password
					</Typography>
					<ChangePasswordForm submit={async (newpassword, repassword) => {
						console.log(newpassword,repassword)
						if(checkPasswords(newpassword, repassword)){
							let token = localStorage.getItem('token');
							let headers = {
											'Content-Type': 'application/json',
								'Authorization': `Bearer ${token}`,
						};
						var body = {
							newpassword
						};
						axios.put('http://localhost:5000/auth/change-password', body, {headers:headers})
						.then((response) => {
							console.log(response);
							alert('You have successfully changed your password');
							navigate('/profile');
						}).catch((error) => {
							console.log(error)
							alert(error);
						})
					} else {
						return false;
					}}}/>
				</Box>
			</main>
		</body>
	</>
}

export default ChangePassword;