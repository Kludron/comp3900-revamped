import NavBar from "./NavBar";
import React from 'react';
import './Favourite.css';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import profile_background from '../img/profile-background.jpeg';

/* Favourite Recipes Page */
function Favourite() {
  const token = localStorage.getItem('token');
  const [bookmarks, setBookmarks] = useState([]);

  const loadBookmarks = async () => {
    var headers = {
      "Authorization": `Bearer ${token}`
    }
    const response = await axios.get('http://localhost:5000/favourite', {headers:headers});
    console.log(response.data.Bookmarks);
      setBookmarks(response.data.Bookmarks);
  }

  useEffect(() => {
    loadBookmarks();
  }, []);

  return <div>
    <img className='profile-background' src={profile_background} alt='profile background'></img>
    <NavBar />
    <div className="main-content">
      <h2>Favourite Recipe</h2>
      <div>
        {bookmarks.map((recipe, key) => {
          return (
            <BookmarkedRecipe key={key} recipe={recipe} />
          )
        })}
      </div>
    </div>
  </div>
}

export default Favourite;

function BookmarkedRecipe(r) {
  console.log(r.recipe)
  const recipe = r.recipe
  const [favourite, setfavourite] = useState(false);
  const [bookmarkStar, setbookmarkStar] = useState('★');
  const navigate = useNavigate();

  const viewRecipe = ({ recipeid }) => {
    console.log(recipeid);
    navigate(`/view/recipe/${recipeid}`);
  }

  const handleBookmark = () => {
    if (bookmarkStar === '☆' && favourite === false) { //Bookmarked
      setfavourite(true);
      setbookmarkStar('★');
      console.log('bookmarked'); //Still need to work out how to store this state and send state to backend
    } else { //Un-bookmarked
      setfavourite(false);
      setbookmarkStar('☆');
      console.log('unbookmarked'); //As above
    }
  }

  return <div className='recipe_box' key={recipe.id}>
    <button onClick={() => handleBookmark()}>{bookmarkStar}</button>
    <h3>Name: {recipe.name}</h3>
    <p>Cuisine: {recipe.cuisine}</p>
    <p>Description: {recipe.description}</p>
    <p>Mealtype: {recipe.mealType}</p>
    <p>Serving Size: {recipe.servingSize}</p>
    <button className='see_recipe_button' onClick={() => viewRecipe(recipe.id)}>See Recipe→</button>
  </div>
}
