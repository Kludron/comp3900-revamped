import React from 'react';
import ChangeUsernameForm from '../components/ChangeUsernameForm'; // [TODO] fix this
import { useNavigate } from 'react-router-dom';
function ChangeUsername () {

	const navigate = useNavigate();

	const previous = () => {
		navigate('/profile');
	}

	return <>
		<div>
			<h1>Change Username</h1>
			<button onClick={previous}>Go Back</button>
		</div>
		<ChangeUsernameForm submit={async (newusername) => {
			console.log(newusername)
            let authToken = localStorage.getItem('token');
            let headers = {
          		'Content-Type': 'application/json',
				'Authorisation': `Bearer ${authToken}`
      };
      var body = {
				newusername
      };
      axios.put('http://localhost:5000/auth/change-username', body, headers)
			.then((response) => {
				console.log(response);
			}).catch((error) => {
				console.log(error)
				alert(error);
			})
            }}/>
	</>
}

export default ChangeUsername;