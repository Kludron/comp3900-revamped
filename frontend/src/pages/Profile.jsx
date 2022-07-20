import React from 'react';
import NavBar from './NavBar';
import './Profile.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

/* Profile Page */
function Profile () {

  //Gets Auth Token
  const token = localStorage.getItem('token');


  const navigate = useNavigate();

  const changePassword = () => {
    navigate('/change-password');
  };

  const previous = () => {
		navigate('/dashboard');
	};

  const loadProfile = async () => {
    let headers = {
      "Authorization": `Bearer ${token}`,
    };
    console.log(headers);
    const response = await axios.get('http://localhost:5000/profile', headers);
    console.log(response);
  }

  React.useEffect(() => {
    loadProfile();
  }, []);

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
