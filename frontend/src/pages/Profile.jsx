import React from 'react';
import NavBar from './NavBar';
import './Profile.css';
import { useNavigate } from 'react-router-dom';

/* Profile Page */
function Profile () {

  const navigate = useNavigate();

  const changePassword = () => {
    navigate('/change-password');
  };

  const changeUsername = () => {
    navigate('/change-username');
  };

  const previous = () => {
		navigate('/dashboard');
	};

  const email = localStorage.getItem('email')
  const password = localStorage.getItem('password')

  return <>
    <div>
      <NavBar/>
      <div className="main-content">
        <button onClick={previous}>Go Back</button>
        <h2>My Profile</h2>

        <div className="info">
          <div className='attribute'>
            <div>Email Address:</div>
            <div>Username:</div>
            <div>Password:</div>
          </div>

          <div className='data'>
            <div>{email}</div>
            <div>username</div>
            <div>{password}</div>
          </div>
          
          <div className='change-button'>
            <button onClick={changeUsername}>Change Username</button>
            <button onClick={changePassword}>Change Password</button>
          </div>
        </div>
        <h2>Allergies</h2>
        
      </div>
    </div>
  </>
}

export default Profile;
