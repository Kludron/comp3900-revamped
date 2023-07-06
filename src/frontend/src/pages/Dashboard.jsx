import React from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
import './Dashboard.css'
import axios from 'axios';
import MultipleSelect from '../components/MultipleSelect';
import Button from '@mui/material/Button';
import { paperClasses } from '@mui/material';

/* Dashboard Page */
function Dashboard () {

  //Store state variables
  const [recipes, setRecipes] = useState([]);
  const [userData, setuserData] = useState([]);
  const [bookmarkedRecipe, setbookmarkedRecipe] = useState([])
  
  //Gets user's authorisation token
  const token = localStorage.getItem('token');

  //React Navigation Function
  const navigate = useNavigate();
  const logout = () => {
    localStorage.clear();
    navigate('/');
  }

  //Loads user profile details
  const loadProfile = async () => {
    const headers = {
      "Authorization": `Bearer ${token}`
    }
    const response = await axios.get('http://localhost:5000/profile', {headers: headers});
    setuserData({
      email: response.data.Email,
      username: response.data.Username,
      points: response.data.Points,
    });
  };

  //Load bookmarked recipes for a user
  const loadDashboard = async () => {
    var headers = {
      "Authorization": `Bearer ${token}`
    }
    const response = await axios.get('http://localhost:5000/dashboard', {headers:headers});
    setbookmarkedRecipe(response.data.Bookmarks);
    console.log(bookmarkedRecipe)
  };
  
  //Run loadDashboard on initial page load
  React.useEffect(() => {
    loadDashboard();
  }, [])

  //Navigates to a dynamically rendered page for a specific recipe with recipeID
  const viewRecipe = (recipeid, key) => {
    //Checks if there is any existing recipes
    var existing = JSON.parse(localStorage.getItem('recent'));
    console.log(existing);
    if(existing == null) existing = [];
    let recent = {
      r_id: recipeid
    };
    existing.push(recent);
    localStorage.setItem('recent', JSON.stringify(existing));
    navigate(`/view/recipe/${recipeid}`);
  }

  // Bookmark function for recipes
  const handleBookmark = async (id) => {
    var headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    }
    var body = {
      id, 
      bookmarkedRecipe
    };
    axios.put('http://localhost:5000/dashboard', body, { headers: headers })
    .then((response) => {
      console.log(response)
      setbookmarkedRecipe(response.data.Bookmarks)
    }).catch((error) => {
      alert(error)
    });
  };

  //Returns the correct symbol upon bookmarking a recipe
  const showBookmark = (id) => {
    if (bookmarkedRecipe.includes(id)) {
      return '★'
    } else {
      return '☆'
    }
  };

  //Handle click function 
  const handleClick = () => {
    if(localStorage.getItem('token') == null){
      alert('Please create an account to access your profile and our other services.');
    } else {
      navigate('/profile');
    };
  }

  //Handle eatenRecipe function for a recipe
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

  React.useEffect(() => {
    loadProfile();
    /*if (!token) {
      navigate('/login');
    }*/
  },[]);

  return <div>
    <div className="recipeBox">
      <div className="upper-section">
        <div className="title_bar">
          <Button className='logout_btn' variant='contained' onClick={logout}>Logout</Button>
          <h2 className='head'>Welcome {userData.username}!</h2>
          <Avatar className="avatar" onClick={handleClick} sx={{ margin: 3, bgcolor: 'primary.main'}}></Avatar>
        </div>
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
        <hr className="break"></hr>
        <h3 className="search_results">Search Results:</h3>
        <div className='list_recipes'>
          {recipes.map((recipe, key) => {
            return (
              <div className='recipe_box' key={key}>
                <Button className='btn' onClick={() => handleBookmark(recipe.id)}>{showBookmark(recipe.id)}</Button>
                <Button className='btn' onClick={() => eatenRecipe(recipe.id)}>Eaten</Button>
                <div className='details'>
                  <h3 className='rec_name'>{recipe.name}</h3>
                  <p>Cuisine: {recipe.cuisine}</p>
                  <p>Description: {recipe.description}</p>
                  <p>Mealtype: {recipe.mealtype}</p>
                  <p>Serves: {recipe.servingsize}</p>
                  <Button variant="contained" className='see_recipe_button' onClick={() => viewRecipe(recipe.id, key)}>View Recipe→</Button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  </div>;

}

export default Dashboard;
