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


/* Dashboard Page */
function Dashboard () {

  const [query, setQuery] = useState('');

  const [ingredientList, setIngredientList] = useState([]);
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
              <button
                onClick={set}>{post.name}</button>
            </div>
          )
      })}
      {/*
        AllIngredients.filer(post => {
          if (query === ""){
            //Empty query
            return post;
          } else if (post.title.toLowerCase().includes(query.toLowerCase())) {
            //returns filtered array
            return post;
          }
        }).map((post, index) => (
          <div className="res" key={index}>
              <p>{post.name}</p>
          </div>
        ))
      */}
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
    <div
    style={{
      width: '75%',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      overflow: 'scroll',
    }}
    >
      <Link to='/profile'>
        <Avatar sx={{ margin: 3, position: 'absolute', right: 20 }}></Avatar>
      </Link>
      <h2>F1V3GUY5 RECIPES</h2>
      <RecipeBar/>
      
      {/* right recipes box */}
      <div
      style={{
          borderStyle: 'solid',
          borderColor: 'pink',
          marginTop: 15,
          width: '95%',
          height: '100vh',
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
