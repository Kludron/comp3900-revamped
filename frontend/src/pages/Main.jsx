import React from 'react';
import RegisterForm from '../components/RegisterForm';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import RecipeBar from '../components/RecipeBar';
import IngredientBar from '../components/IngredientBar';
import { flexbox } from '@mui/system';


/* Main Page */
function Main () {
  localStorage.clear();
  const navigate = useNavigate();

  const ingredientBox = {
    position: 'absolute',
    borderStyle: 'solid',
    borderColor: 'red',
    marginTop: 2,
    width: 350,
    height: 200,
    display: 'flex',
  };
  
  // Navigate to Login/Profile page
  const login = () => {
    navigate('/login');
  }

  return <div>
    {/* left title and search bar */}
    <Box
    sx={{
      position: 'absolute',
      width: 400,
      height: 200,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}
    >
      <p style={{marginTop: 25}}>My Pantry</p>
      <IngredientBar></IngredientBar>
    </Box>

  {/* right title and search bar */}
    <Box
    sx={{
      position: 'absolute',
      right: 10,
      width: 850,
      height: 200,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}
    >
      <h1>F1V3GUY5 RECIPES</h1>
      <RecipeBar></RecipeBar>
    </Box>
    <Avatar sx={{ margin: 1, position: 'absolute', right: 10 }}></Avatar>

    {/* left pantry box */}
    <Box
    sx={{
      position: 'absolute',
      borderStyle: 'solid',
      borderColor: 'pink',
      marginTop: 15,
      width: 400,
      height: 440,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      overflow: 'scroll',
    }}
    >

      {/* ingredient boxes */}
      <Box
      sx={{
        position: 'absolute',
        borderStyle: 'solid',
        borderColor: 'red',
        marginTop: 2,
        width: 350,
        height: 200,
        display: 'flex',
      }}
      >-------------</Box>

      <Box
      sx={{
        position: 'absolute',
        borderStyle: 'solid',
        borderColor: 'red',
        marginTop: 30,
        width: 350,
        height: 200,
        display: 'flex',
      }}
      >-------------</Box>

      <Box
      sx={{
        position: 'absolute',
        borderStyle: 'solid',
        borderColor: 'red',
        marginTop: 58,
        width: 350,
        height: 200,
        display: 'flex',
      }}
      >-------------</Box>

    </Box>

    {/* right recipes box */}
    <Box
    sx={{
      position: 'absolute',
      borderStyle: 'solid',
      borderColor: 'blue',
      marginTop: 16,
      right: 10,
      width: 850,
      height: 430,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      overflow: 'scroll',
    }}
    >
    </Box>
  </div>;
}

export default Main;
