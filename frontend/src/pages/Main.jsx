import React from 'react';
import { Link } from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
import RecipeBar from '../components/RecipeBar';
import IngredientBar from '../components/IngredientBar';


/* Main Page */
function Main () {
  localStorage.clear();
  
  // Style for ingredient boxes
  const ingredientBox = {
      borderStyle: 'groove',
      marginTop: 10,
      width: '90%',
  }

  return <div>
    {/* left title and search bar */}
    <div
    style={{
      backgroundColor: 'red',
      float: 'left',
      width: '30%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}
    >
      <p style={{marginTop: 25}}>My Pantry</p>
      <IngredientBar></IngredientBar>
      
      {/* left pantry box */}
      <div
      style={{
        backgroundColor: 'blue',
        borderStyle: 'solid',
        borderColor: 'pink',
        marginTop: 15,
        width: '90%',
        height: '460px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        overflow: 'scroll',
      }}
      >

        {/* ingredient boxes */}
        <div style={ ingredientBox }>
          <h4>Meat</h4>
          <button style={{margin: 5}}>Pork</button>
          <button style={{margin: 5}}>Lamb</button>
        </div>

        <div style={ ingredientBox }>
          <h4>Vegetables&Greens</h4>
          <button style={{margin: 5}}>Lettuce</button>
          <button style={{margin: 5}}>Carrot</button>
        </div>

        <div style={ ingredientBox }>
          <h4>Baking</h4>
          <button style={{margin: 5}}>Flower</button>
          <button style={{margin: 5}}>Sugar</button>
        </div>
      </div>
    </div>

  {/* right title and search bar */}
    <div
    style={{
      backgroundColor: 'gray',
      width: '70%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}
    >
      <Link to='/Profile'>
        <Avatar sx={{ margin: 3, position: 'absolute', right: 20 }}></Avatar>
      </Link>
      <h1>F1V3GUY5 RECIPES</h1>
      <RecipeBar></RecipeBar>
      
      {/* right recipes box */}
      <div
      style={{
        backgroundColor: 'yellow',
          borderStyle: 'solid',
          borderColor: 'pink',
          marginTop: 15,
          width: '95%',
          height: '435px',
          overflow: 'scroll',
      }}
      >
        <button style={{margin: 5}}>Meal Type</button>
        <button style={{margin: 5}}>Allergies</button>
        <button style={{margin: 5}}>Cuisine</button>
      </div>
    </div>
  </div>;
}

export default Main;
