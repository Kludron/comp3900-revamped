import React from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
import './Dashboard.css'
import Meat from "../ingredients/meat.json";
import Vegetables from "../ingredients/vegetables&greens.json";
import Seafood from "../ingredients/seafood.json";
import AllIngredients from "../ingredients/allingredients.json";
import axios from 'axios';
import MultipleSelect from '../components/MultipleSelect';

/* Dashboard Page */
function Dashboard () {

  const [query, setQuery] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [favourite, setfavourite] = useState(false);
  const [bookmarkStar, setbookmarkStar] = useState('☆');
  
  //Gets Authorization token
  const token = localStorage.getItem('token');

  //allows page navigation
  const navigate = useNavigate();

  //Gets all Recipe Data
  //const loadRecipes = async () => {
  //  const result = await axios.get('http://localhost:5000/get_recipe');
  //  /*console.log(result);*/
  //  result.data.forEach((rec) => {
  //    console.log(rec);
  //    setRecipes(recipes => [...recipes, {id: rec.id, name: rec.name, description: rec.description, cuisine: rec.cuisine, mealtype: rec.mealtype, servingsize: rec.servingsize, uploader: rec.uploader}]);
  //  });
  //}

  //Navigates to a dynamically rendered page for a specific recipe with recipeID
  const viewRecipe = (recipeid) => {
    console.log(recipeid);
    navigate(`/view/recipe/${recipeid}`);
  }

  const handleBookmark = () => {
    if(bookmarkStar === '☆' && favourite === false) { //Bookmarked
      setfavourite(true);
      setbookmarkStar('★');
      console.log('bookmarked'); //Still need to work out how to store this state and send state to backend
    } else { //Un-bookmarked
      setfavourite(false);
      setbookmarkStar('☆');
      console.log('unbookmarked'); //As above
    }
  }

  const eatenRecipe = async (recipeid) => {
    let headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    }
    let body = {
      r_id: recipeid,
    }
    console.log(recipeid + ': eaten');
    const response = await axios.put(`http://localhost:5000/eaten/recipeid=${recipeid}`, body, {headers:headers})
    console.log(response.status);
    if(response.status === '200'){
      alert('You have marked the recipe as eaten.');
    } else {
      alert('An issue has occurred marking the recipe as eaten. Please try again.')
    }
  }

  React.useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  });

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

        <MultipleSelect submit={(mealtypeName, cuisineName, ingredientsName, searchQuery) => {
          setRecipes([]);
          console.log('submitted successfully');
          var body = {
            "search": searchQuery,
            "mealTypes": mealtypeName,
            "cuisines": cuisineName,
            "ingredients": ingredientsName
          }
          console.log(body);
          let headers = {
            "Content-Type": "application/json",
          };
          axios.post("http://localhost:5000/search", body, headers)
            .then((response) => {
              console.log(response);
              response.data.recipes.forEach((rec) => {
                console.log(rec);
                setRecipes(recipes => [...recipes, {id: rec.ID, name: rec.Name, description: rec.Description, cuisine: rec.Cuisine, mealtype: rec.MealType, servingsize: rec.ServingSize}]);
              })
            }).catch((error) => {
              alert(error);
            });
          }}
        />
        <div className='list_recipes'>
          {recipes.map((recipe, key) => {
            return (
              <div className='recipe_box' key={key}>
                <button onClick={() => handleBookmark()}>{bookmarkStar}</button>
                <button className='eaten_button' onClick={() => eatenRecipe(recipe.id)}>Eaten</button>
                <h3>Name: {recipe.name}</h3>
                <p>Cuisine: {recipe.cuisine}</p>
                <p>Description: {recipe.description}</p>
                <p>Mealtype: {recipe.mealtype}</p>
                <p>Serving Size: {recipe.servingsize}</p>
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
