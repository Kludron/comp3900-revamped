import React from 'react';
import NavBar from './NavBar';
import './Profile.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import AllIngredients from "../ingredients/allingredients.json";

/* Profile Page */
function Profile () {

  const [userData, setuserData] = React.useState({});

  //Gets Auth Token
  const token = localStorage.getItem('token');

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
      alert(error)
    });
  }

  return <>
    <div>
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
          <div className='change-button'>
            <button onClick={changeUsername}>Change Username</button>
            <button onClick={changePassword}>Change Password</button>
          </div>
        </div>

        <h2 className='allergies-title'>Allergies</h2>
        <div className='allergies'>
          <div className='search-allergies'>
            <input 
              type="search" 
              placeholder="Search allergies.." 
              onChange={event => {
                setQuery(event.target.value)
              }}
            />
            <div className='search-results'>
            {AllIngredients.filter((post) => {
              if (query === ""){
                //returns empty
                return post;
              } else if (post.name.toString().toLowerCase().includes(query.toString().toLowerCase())) {
                //returns filtered array
                return post;
              }
            }).map((post, key) => {
              return (
                <div className="pantry-ingredients" key={key}>
                  <button onClick={() => appendList({post})}>
                    {post.name}
                  </button>
                </div>
              )
            })}
            </div>
          </div>
          <div className='added-allergies'>
            <h5>Added Allergies</h5>
            <div className='allergies-box'>
              {allergyList.map((post, key) => {
                console.log(post["post"]);
                return (
                  <div className='allergies-box-element'>{post["post"].name}</div>
                )
                })}
            </div>
            <button onClick={Reset}>Reset</button>
            <button onClick={Save}>Save</button>
          </div>
        </div>

      </div>
    </div>
  </>
}

export default Profile;
