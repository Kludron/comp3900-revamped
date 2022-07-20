import React from 'react';
import NavBar from './NavBar';
import './Profile.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

/* Profile Page */
function Profile () {

  const [userData, setuserData] = React.useState({});

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
    var headers = {
      "Authorization": `Bearer ${token}`
    }
    const response = await axios.get('http://localhost:5000/profile', {headers:headers});
    console.log(response.data.Email);
      setuserData({
        email: response.data.Email, 
        username: response.data.Username, 
        points: response.data.Points, 
        bookmarks: response.data.Bookmarks
      });
      console.log(userData);
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
          <div className='userdata_field' >
            <h4>Username: {userData.username}</h4>
            <p>Email: {userData.email}</p>
            <p>Points: {userData.points}</p>
          </div>
        </div>
        <div className="info">
          <button onClick={() => changePassword()}>Change Password</button>
        </div>
      </div>
    </div>
  </>
}

export default Profile;
