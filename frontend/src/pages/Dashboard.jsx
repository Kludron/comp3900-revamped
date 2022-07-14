import React from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
import RecipeBar from '../components/RecipeBar';
import './Dashboard.css'
import Meat from "../ingredients/meat.json";
import Vegetables from "../ingredients/vegetables&greens.json";
import Seafood from "../ingredients/seafood.json";
import AllIngredients from "../ingredients/allingredients.json";
import axios from 'axios';


/* Dashboard Page */
function Dashboard () {

  const [query, setQuery] = useState('');
  const [recipes, setRecipes] = useState([]);

  //Gets Authorization token
  const getAuthToken = () => {
    let AuthToken = localStorage.getItem('token');
    return AuthToken;
  }

  //Gets all Recipe Data
  const loadRecipes = async () => {
    const response = await axios.get('http://localhost:5000/get_recipe');
    console.log(response.data);
    setRecipes(response.data.recipes);
  }

  React.useEffect(() => {
    loadRecipes();
  }, []);

  return <div>
    {/* left title and search bar */}
    <div className="pantry-upper">
      <h3 style={{marginTop: 25}}>My Pantry</h3>
      <input 
        className="ingredient-search"
        type="search" 
        placeholder="Search.." 
        onChange={event => {
          setQuery(event.target.value)
        }}
      />
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
            <button>
              {post.name}
            </button>
          </div>
        )
      })}

      {/* left pantry box */}
      <div className="pantrybox">
        {/* ingredient boxes */}
        <div className='ingredientBox'>
          <h4>Meat</h4>
          {Meat.map((post, index) => (
            <div key={index}>
              <button>{post.name}</button>
            </div>
          ))}
        </div>
        <div className='ingredientBox'>
          <h4>Seafood</h4>
          {Seafood.map((post,index) => (
            <div key={index}>
              <button>{post.name}</button>
            </div>
          ))}
        </div>
        <div className='ingredientBox'>
          <h4>Vegetables & greens</h4>
          {Vegetables.map((post,index) => (
            <div key={index}>
              <button>{post.name}</button>
            </div>
          ))}
        </div>
      </div>
    </div>

  {/* right title and search bar */}
    <div className='recipe_screen'>
      <Link to='/profile'>
        <Avatar sx={{ margin: 3, position: 'absolute', right: 20 }}></Avatar>
      </Link>
      <h2>F1V3GUY5 RECIPES</h2>
      
      {/* right recipes box */}
      <div className="recipeBox">
      <RecipeBar/>
        <button>Meal Type</button>
        <button>Allergies</button>
        <button>Cuisine</button>
        <button>Show Recipe</button>
      </div>
      <div className='list_recipes'>
        {recipes.map((recipe) => {
          return (
            <div>
              <p>{recipe.name}</p>
            </div>
          )
        })}
      </div>
    </div>
  </div>;
}

export default Dashboard;
