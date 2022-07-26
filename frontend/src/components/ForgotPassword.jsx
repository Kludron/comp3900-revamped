import React from 'react';
import { useNavigate } from 'react-router-dom';
import './componentstyle.css';

/* Forgot Password Button */
function ForgotPassword () {

	//React navigation functions
	const navigate = useNavigate();
	const navForgotPWpage = () => {
		navigate('/forgot-password');
	};

	return(<>
		<button 
			className="forgot-password-btn" 
			onClick={navForgotPWpage}>Forgot Password?
		</button>
	</>)
}


export default ForgotPassword;