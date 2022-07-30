import React from 'react';
import NavBar from './NavBar';
import './Profile.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import AllIngredients from "../ingredients/allingredients.json";
import Button from '@mui/material/Button';

const token = localStorage.getItem('token');
/* Profile Page */
function Profile() {

  const [userData, setuserData] = useState({});
  const [usersAllergens, setUsersAllergens] = useState([]);
  const [allAllergens, setAllAllergens] = useState([]);
  //Gets Auth Token

  //React navigate functions
  const navigate = useNavigate();
  const previous = () => {
		navigate('/dashboard');
	};
  const logout = () => {
    localStorage.clear();
    navigate('/');
  };

  //Pulls user's profile details using their token to be displayed on the page
  const loadProfile = async () => {
    var headers = {
      "Authorization": `Bearer ${token}`
    }
    const response = await axios.get('http://localhost:5000/profile', { headers: headers });
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
  
  const [query, setQuery] = useState('');
  const [allergyList, setAllergyList] = useState([]);
  const appendList = (allergy) => {
    setAllergyList(allergyList => [...allergyList, allergy]);
    console.log(allergyList)
  };

  const Reset = () => {
    setAllergyList([]);
  }

  const Save = async () => {
    let headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };
    var body = {
      allergyList
    };
    axios.put("http://localhost:5000/profile", body, {headers:headers})
    .then((response) => {
      console.log(response);
    }).catch((error) => {
      console.log(error);
      alert(error);
    });
  }

  console.log(userData);
  return <>
    <div>
      <NavBar />
      <div className="main-content">
      <button onClick={previous}>Go Back</button>
      <Button variant='outlined' onClick={logout}>Logout</Button>
        <div className="header">
          <h2>My Profile</h2>
          <div className='userdata_field' >
            <h4>Username: {userData.username}</h4>
            <p>Email: {userData.email}</p>
            <p>Points: {userData.points}</p>
          </div>
        </div>
        <div className="info"> 
          <div className='change-button'>
            <button onClick={changeUsername}>Change Username</button>
            <button onClick={changePassword}>Change Password</button>
          </div>
        </div>

        <h2 className='allergies-title'>Allergies</h2>
        <Allergens allAllergens={allAllergens} usersAllergens={usersAllergens} setUsersAllergens={setUsersAllergens} />

      </div>
    </div>
  </>
}

export default Profile;

function UserInfo({ userData }) {
  const navigate = useNavigate();
  const changePassword = () => {
    navigate('/change-password');
  };
  const changeUsername = () => {
    navigate('/change-username');
  };

  return <div>
    <div className="header">
      <h2>My Profile</h2>
      <div className='userdata_field' >
        <h4>Username: {userData.username}</h4>
        <p>Email: {userData.email}</p>
        <p>Points: {userData.points}</p>
      </div>
    </div>
    <div className="info">
      <div className='change-button'>
        <button onClick={changeUsername}>Change Username</button>
        <button onClick={changePassword}>Change Password</button>
      </div>
    </div>
  </div>
};

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
          <button key={key} className='selection' onClick={() => appendList(allergen)}>
            {allergen}
          </button>
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
            <div key={key} className='allergies-box-element'>{allergen}</div>
            )
          })}
    </div>
    <button onClick={Reset}>Reset</button>
    <button onClick={Save}>Save</button>
  </div>
};
