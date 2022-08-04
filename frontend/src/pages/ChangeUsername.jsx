import React from 'react';
import ChangeUsernameForm from '../components/ChangeUsernameForm';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import './ChangeUsername.css';

/* Change Username Page */
function ChangeUsername () {

	//React navigation function
	const navigate = useNavigate();
	const previous = () => {
		navigate('/profile');
	};

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
						Change Username
					</Typography>
					<ChangeUsernameForm submit={async (newusername) => {
						console.log(newusername);
						let authToken = localStorage.getItem('token');
						let headers = {
							'Content-Type': 'application/json',
							'Authorization': `Bearer ${authToken}`
						};
						var body = {
							newusername
						};
						axios.put('http://localhost:5000/auth/change-username', body, {headers:headers})
						.then((response) => {
							console.log(response);
							alert('You have successfully changed your username!');
							navigate('/profile');
						}).catch((error) => {
							console.log(error)
							alert(error);
						})
					}}/>
				</Box>
			</main>
		</body>
	</>
}

export default ChangeUsername;
