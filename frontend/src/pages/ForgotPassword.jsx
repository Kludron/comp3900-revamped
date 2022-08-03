import axios from "axios";
import React from "react";
import ForgotPasswordForm from '../components/ForgotPasswordForm';

/* Forgot Password Page */
function ForgotPassword () {

	return(<>
		<div>
			<h1>Reset your Password</h1>
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
					}).catch(err => {
						console.log(err)
					})
			}}/>
		</div>
	</>)

}

export default ForgotPassword;