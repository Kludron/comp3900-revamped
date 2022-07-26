import React from 'react';
import ChangeUsernameForm from '../components/ChangeUsernameForm';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

/* Change Username Page */
function ChangeUsername () {

	//React navigation page
	const navigate = useNavigate();
	const previous = () => {
		navigate('/profile');
	};

	return <>
		<div>
			<h1>Change Username</h1>
			<button onClick={previous}>Go Back</button>
		</div>
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
	</>
}

export default ChangeUsername;