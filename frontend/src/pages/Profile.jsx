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

  const previous = () => {
		navigate('/dashboard');
	};

  return <>
    <div className="wrapper">
      <NavBar/>
      <div className="main-content">
      <button onClick={previous}>Go Back</button>
        <div className="header">
          <h2>My Profile</h2>
        </div>
        <div className="info">
          <button onClick={() => changePassword()}>Change Password</button>
        </div>
      </div>
    </div>
  </>
}

export default Profile;
