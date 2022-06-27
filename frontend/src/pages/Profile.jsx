import React from 'react';
import LoginForm from '../components/LoginForm';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';

/* Profile Page */
function Profile () {
  const navigate = useNavigate();

  // Navigate to register page
  const register = () => {
    navigate('/register');
  }

  return <>
    <div className='flex-container'>
      <div>
        Profile
      </div>
      <div>
        Bookedmarked Recipes
      </div>
      <div>
        Diet/Metrics Page
      </div>
      <div>
        My Recipes
      </div>  
      <div>
        Settings/Connect
      </div>  
    </div>  
  </>
}

export default Profile;
