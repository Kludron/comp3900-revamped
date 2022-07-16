import React from 'react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
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
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  //Gets all Recipe Data
  const loadRecipes = async () => {
    const result = await axios.get('http://localhost:5000/get_recipe');
    /*console.log(result);*/
    result.data.forEach((rec) => {
      console.log(rec);
      setRecipes(recipes => [...recipes, {id: rec.id, name: rec.name, description: rec.description, cuisine: rec.cuisine, mealtype: rec.mealtype, servingsize: rec.servingsize, uploader: rec.uploader}]);
    });
  }

  const viewRecipe = (recipeID) => {
    console.log(recipeID);
    navigate(`/view/recipe/${recipeID}`);
  }

  useEffect(() => {
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
        <div className='list_recipes'>
        {recipes.map((recipe, key) => {
          return (
            <div className='recipe_box' key={key}>
              <h3>{recipe.name}</h3>
              <p>{recipe.id}</p>
              <p>{recipe.description}</p>
              <p>{recipe.mealtype}</p>
              <p>{recipe.servingsize}</p>
              <button className='see_recipe_button' onClick={() => viewRecipe(recipe.id)}>See Recipe→</button>
            </div>
          )
        })}
      </div>
      </div>
    </div>
  </div>;
}

export default Dashboard;
