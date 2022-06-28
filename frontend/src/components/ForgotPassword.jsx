import React from 'react';
import { useNavigate } from 'react-router-dom';
import './componentstyle.css';

function ForgotPassword () {

	const navigate = useNavigate();

	const navForgotPWpage = () => {
		navigate('/forgot-password');
	}

	return(<>
		<button 
			className="forgot-password-btn" 
			onClick={navForgotPWpage}>Forgot Password?
		</button>
	</>)
}


export default ForgotPassword;