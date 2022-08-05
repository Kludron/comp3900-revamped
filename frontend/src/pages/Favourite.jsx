import NavBar from "./NavBar";
import React from 'react';
import './Favourite.css';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Button } from "@mui/material";
import profile_background from '../img/profile-background.jpeg';

const token = localStorage.getItem('token');
/* Favourite Recipes Page */
function Favourite() {

  const navigate = useNavigate();
  const previous = () => {
    navigate('/dashboard');
  };

  const [recipes, setRecipes] = useState([]);
  const [bookmarkIds, setBookmarkIds] = useState([]);

  const loadFavourite = async () => {
    var headers = {
      "Authorization": `Bearer ${token}`
    }
    const response = await axios.get('http://localhost:5000/favourite', {headers:headers});
    setRecipes(response.data.Bookmarks);
    setBookmarkIds(response.data.b_id)
  };
  
  React.useEffect(() => {
    loadFavourite();
  }, [])
  console.log(recipes)
  console.log(bookmarkIds)
  
  return <div>
    <img className='profile-background' src={profile_background} alt='profile background'></img>
    <NavBar />
    <div className="main-content">
      <Button className="go-back" variant='contained' onClick={previous}>← Go Back</Button>
      <h1>Favourite Recipe</h1>
      <hr className="favourite-hr"/>
      <div className="list_bookmarked_recipes">
        {recipes.map((recipe, key) => {
          return (
            <BookmarkedRecipe key={key} recipe={recipe} bookmarkIds={bookmarkIds} setBookmarkIds={setBookmarkIds}/>
          )
        })}
      </div>
    </div>
  </div>
}

export default Favourite;

function BookmarkedRecipe({ key, recipe, bookmarkIds, setBookmarkIds }) {
  console.log(recipe)
  const navigate = useNavigate();

  const viewRecipe = ( recipeid ) => {
    console.log(recipeid);
    navigate(`/view/recipe/${recipeid}`);
  }

  const handleBookmark = async (id) => {
    var headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    }
    var body = {
      id, 
      bookmarkIds
    };
    axios.put('http://localhost:5000/favourite', body, { headers: headers })
    .then((response) => {
      console.log(response)
      setBookmarkIds(response.data.Bookmarks)
    }).catch((error) => {
      alert(error)
    });
  };

  const showBookmark = (id) => {
    console.log(bookmarkIds)
    if (bookmarkIds.includes(id)) {
      return '★'
    } else {
      return '☆'
    }
  };

  const eatenRecipe = async (recipeid) => {
    if(localStorage.getItem('token') != null){
      var headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
      let body = {
        r_id: recipeid,
      }
      console.log(body);
      const response = await axios.put(`http://localhost:5000/eaten/recipeid=${recipeid}`, body, {headers:headers})
      console.log(response.status);
      if(response.status === '200'){
        alert('You have marked the recipe as eaten.');
      } else {
        alert('An issue has occurred marking the recipe as eaten. Please try again.')
      }
    } else {
      alert('Please create an account to access the Eaten functionality and being tracking your dietary intake.')
    }
  }

  return <div className='recipe_box' key={key}>
    <Button className="btn" variant="outlined" onClick={() => handleBookmark(recipe.id)}>{showBookmark(recipe.id)}</Button>
    <Button className='btn' variant="outlined" onClick={() => eatenRecipe(recipe.id)}>Eaten</Button>
    <div className="details">
      <h3 className="rec_name">{recipe.name}</h3>
      <p>Cuisine: {recipe.cuisine}</p>
      <p>Description: {recipe.description}</p>
      <p>Mealtype: {recipe.mealType}</p>
      <p>Serves: {recipe.servingSize}</p>
      <Button variant="contained" className='see_recipe_button' onClick={() => viewRecipe(recipe.id, key)}>View Recipe→</Button>
    </div>
  </div>
}
