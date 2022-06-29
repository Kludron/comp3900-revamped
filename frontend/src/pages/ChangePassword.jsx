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
				let authToken = localStorage.getItem('token');
				let headers = {
          'Content-Type': 'application/json',
					'Authorisation': `Bearer ${authToken}`
      };
      var body = {
				newpassword,
				repassword
      };
      axios.put('http://localhost:5000/auth/change-password', body, headers)
			.then((response) => {
				console.log(response);
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