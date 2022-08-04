import React from 'react';
import NavBar from './NavBar';
import './Profile.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import profile_background from '../img/profile-background.jpeg';
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import { Chip } from '@mui/material';

//Gets token from local storage
const token = localStorage.getItem('token');

/* Profile Page */
function Profile() {

  //Store state variables
  const [userData, setuserData] = useState({});
  const [usersAllergens, setUsersAllergens] = useState([]);
  const [allAllergens, setAllAllergens] = useState([]);

  //React navigate functions
  const navigate = useNavigate();
  const logout = () => {
    localStorage.clear();
    navigate('/');
  }
  const previous = () => {
    navigate('/dashboard');
  };
  const changePassword = () => {
    navigate('/change-password');
  };
  const changeUsername = () => {
    navigate('/change-username');
  };

  //Pulls user's profile details using their token to be displayed on the page
  const loadProfile = async () => {
    const headers = {
      "Authorization": `Bearer ${token}`
    }
    const response = await axios.get('http://localhost:5000/profile', headers);
    setuserData({
      email: response.data.Email,
      username: response.data.Username,
      points: response.data.Points,
    });
    setUsersAllergens(response.data.usersAllergens);
    setAllAllergens(response.data.allAllergens);
    console.log(usersAllergens);
  }

  React.useEffect(() => {
    loadProfile();
  }, []);

  return <div className='profile'>
      <img className='profile-background' src={profile_background} alt='profile background'></img>
      <NavBar/>
      <div className="main-content">
        <Button className='go-back' variant='contained' onClick={previous}>← Go Back</Button>
        <Button className='logout' variant='contained' onClick={logout}>Logout</Button>
        <div className="header">
          <h1>My Profile</h1>
          <div className='userdata_field'>
            <div className='attribute'>
              <p>Username:</p>
              <p>Password</p>
              <p>Email:</p>
              <p>Points:</p>
            </div>
            <div className="info"> 
              <p>
                {userData.username}
                <Button variant='contained' size='small' onClick={changeUsername}>Change Username</Button>
              </p>
              <p>
                ********
                <Button variant='contained' size='small' onClick={changePassword}>Change Password</Button>
              </p>
              <p>{userData.email}</p>
              <p>{userData.points}</p>
            </div>
          </div>
        </div>
        <h1 className='allergies-title'>Allergies</h1>
        <Allergens allAllergens={allAllergens} usersAllergens={usersAllergens} setUsersAllergens={setUsersAllergens} />

      </div>
    </div>
}

export default Profile;

function Allergens({ allAllergens, usersAllergens, setUsersAllergens }) {
  return <div className='allergens'>
    <SelectAllergens allAllergens={allAllergens} usersAllergens={usersAllergens} setUsersAllergens={setUsersAllergens} />
    <UsersAllergen usersAllergens={usersAllergens} setUsersAllergens={setUsersAllergens} />
  </div>
};

function SelectAllergens({ allAllergens, usersAllergens, setUsersAllergens }) {

  const appendList = (allergy) => {
    if (!usersAllergens.includes(allergy)) {
      setUsersAllergens(usersAllergens => [...usersAllergens, allergy]);
      console.log(usersAllergens)
    }
  };

  return <div className='select-allergens'>
    <h4>Selections</h4>
    <div className='selections'>
      {allAllergens.map((allergen, key) => {
        return (
          <Button key={key} className='selection' variant='contained' size='small' color='primary' onClick={() => appendList(allergen)}>
            {allergen}
          </Button>
        )
      })}
    </div>
  </div>
};

function UsersAllergen({ usersAllergens, setUsersAllergens }) {

  const Reset = () => {
    setUsersAllergens([]);
  };

  const Save = async () => {
    let headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    };
    var body = {
      usersAllergens
    };
    axios.put("http://localhost:5000/profile", body, { headers: headers })
      .then((response) => {
        console.log(response);
      }).catch((error) => {
        console.log(error);
        alert(error)
      });
    alert("Allergens saved!");
  };

  return <div className='users-allergen'>
    <h4>Added Allergies</h4>
    <div className='allergies-box'>
      {usersAllergens.map((allergen, key) => {
          console.log(allergen);
          return (
            <Chip key={key} label={allergen}       className='allergies-box-element' color='info'/>
            )
          })}
    </div>
    <div className='reset-save-button'>
      <Button variant='contained' color='error' startIcon={<DeleteIcon />} onClick={Reset}>Reset</Button>
      <Button variant='contained' endIcon={<SaveIcon />} onClick={Save}>Save</Button>
    </div>
  </div>
};