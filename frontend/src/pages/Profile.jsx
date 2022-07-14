import React from 'react';
import NavBar from './NavBar';
import './Profile.css';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import AllIngredients from "../ingredients/allingredients.json";

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

  const [query, setQuery] = useState('');
  const [allergyList, setAllergyList] = useState([]);
  const appendList = (allergy) => {
    setAllergyList(allergyList => [...allergyList, allergy]);
    console.log(allergyList)
  };

  const reset = () => {
    setAllergyList([]);
  }

  const save = () => {
    return;
  }

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
                return (
                  <div key={key}>{key}</div>
                )
                })}
            </div>
            <button onClick={reset}>reset</button>
            <button onClick={save}>save</button>
          </div>
        </div>

      </div>
    </div>
  </>
}

export default Profile;
