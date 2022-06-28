import React from 'react';
import { Link } from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
import RecipeBar from '../components/RecipeBar';
import IngredientBar from '../components/IngredientBar';
import './Dashboard.css'

/* Dashboard Page */
function Dashboard () {

  return <div>
    {/* left title and search bar */}
    <div
    style={{
      float: 'left',
      width: '30%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}
    >
      <p style={{marginTop: 25}}>My Pantry</p>
      <IngredientBar/>
      
      {/* left pantry box */}
      <div
      style={{
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
        <div className='ingredientBox'>
          <h4>Meat</h4>
          <button>Pork</button>
          <button>Lamb</button>
        </div>

        <div className='ingredientBox'>
          <h4>Vegetables&Greens</h4>
          <button>Lettuce</button>
          <button>Carrot</button>
        </div>

        <div className='ingredientBox'>
          <h4>Baking</h4>
          <button>Flower</button>
          <button>Sugar</button>
        </div>
      </div>
    </div>

  {/* right title and search bar */}
    <div
    style={{
      width: '70%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}
    >
      <Link to='/profile'>
        <Avatar sx={{ margin: 3, position: 'absolute', right: 20 }}></Avatar>
      </Link>
      <h1>F1V3GUY5 RECIPES</h1>
      <RecipeBar/>
      
      {/* right recipes box */}
      <div
      style={{
          borderStyle: 'solid',
          borderColor: 'pink',
          marginTop: 15,
          width: '95%',
          height: '435px',
          overflow: 'scroll',
      }}
      >
        <button>Meal Type</button>
        <button>Allergies</button>
        <button>Cuisine</button>
      </div>
    </div>
  </div>;
}

export default Dashboard;
