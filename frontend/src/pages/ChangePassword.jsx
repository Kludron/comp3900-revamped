import React from 'react';
import ChangePasswordForm from '../components/ChangePasswordForm';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function ChangePassword () {

	const navigate = useNavigate();

	const previous = () => {
		navigate('/profile');
	}
	
	const checkPasswords = (password, repassword) => {
		if(password !== repassword){
			return alert("Passwords do not match, please try again");
		} else {
			return true;
		}
  }

	return <>
		<div>
			<h1>Change Password</h1>
			<button onClick={previous}>Go Back</button>
		</div>
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
	</>
}

export default ChangePassword;