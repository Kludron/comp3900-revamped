import NavBar from "./NavBar";
import React from 'react';
import { useNavigate } from "react-router";
import './MyRecipes.css';
import Button from '@mui/material/Button';
import axios from "axios";
import profile_background from '../img/profile-background.jpeg';
import AddIcon from '@mui/icons-material/Add';

axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
axios.defaults.headers.post['Content-Type'] = 'application/json';

/* MyRecipes Page */
function MyRecipes() {

	//Store state variables
	const [myRecipes, setMyRecipes] = React.useState([]);
	const [recentViewed, setRecentViewed] = React.useState([]);

	//Get token from local storage
	const token = localStorage.getItem('token');

	//React navigate functions
	const navigate = useNavigate();
	const previous = () => {
		navigate('/dashboard');
	};
	const navigateRecipeForm = () => {
		navigate('/create-recipe');
	};
	const viewRecipe = (recipeID,key) => {
		console.log('viewed ' + recipeID);
		navigate(`/view/recipe/${recipeID}`);
	};
	const handleClick = (recipeID) => {
		navigate(`/myRecipes/edit/${recipeID}`);
	}

	//Async API request to get recipes a user has created
	async function getMyRecipes() {
		let headers = {
			headers: {
				Authorization: `Bearer ${token}`
			}
		}
		console.log(headers);
		axios.get('http://localhost:5000/my-recipes', headers)
		.then((response) => {
			response.data.Recipes.forEach((rec) => {
				console.log(rec);
				setMyRecipes(myRecipes => [...myRecipes, {id: rec.r_id, name: rec.Name, description: rec.Description, cuisine: rec.Cuisine, mealtype: rec.MealType, servingsize: rec.ServingSize}]);
			})
		}).catch(err => {
			console.log(err);
		})
	};

	//API request for recently viewed recipes
	async function getRecentlyViewed() {
		//Retrieves list of recent recipes that user has viewed
		const recent = JSON.parse(localStorage.getItem('recent'));
		let body = {
			recentlyViewed: recent
		};
		let headers = {
			headers: {
				'Content-type': 'application/json',
				Authorization: `Bearer ${token}`
			}
		}
		console.log(body);
		axios.post('http://localhost:5000/recentlyviewed', body, headers)
		.then((response) => {
			console.log(response);
		}).catch(err => {
			alert(err);
		})
	}

	React.useEffect(() => {
		getMyRecipes();
		getRecentlyViewed();
	}, [])

	return <>
		<img className='profile-background' src={profile_background} alt='profile background'></img>
		<div className="my-recipe-wrapper">
			<NavBar/>
			<div className="main-content">
				<Button className="go-back" variant="contained" onClick={previous}>← Go Back</Button>
				<h1>My Recipes</h1>
				<div className='list_recipes'>
					{myRecipes.map((recipe, key) => {
						return (
							<div className='recipe_box' key={key}>
								<Button className='edit' variant='contained' onClick={() => handleClick(recipe.id)}>Edit</Button>
								<h3>{recipe.name}</h3>
								<p>Cuisine: {recipe.cuisine}</p>
								<p>Description: {recipe.description}</p>
								<p>Mealtype: {recipe.mealtype}</p>
								<p>Serving Size: {recipe.servingsize}</p>
								<Button className='see_recipe_button' variant='contained' onClick={() => viewRecipe(recipe.id, key)}>See Recipe→</Button>
							</div>
						)})}
				</div>
				<Button
					sx={{ mt: 3, mb: 2,  marginLeft: 2}}
					id='create_recipe'
					variant="contained"
					startIcon={<AddIcon/>}
					size='large'
					onClick={() => navigateRecipeForm()}>
					Create Recipe
				</Button>
				<hr className="my-recipe-hr"/>
				<div className="recent_viewed">
					<h2>Recently Viewed</h2>
					<div className='list_recipes'>
          	{recentViewed.map((recipe, key) => {
            	return (
              	<div className='recipe_box' key={key}>
									<h3>Name: {recipe.name}</h3>
									<p>Cuisine: {recipe.cuisine}</p>
									<p>Description: {recipe.description}</p>
									<p>Mealtype: {recipe.mealtype}</p>
									<p>Serving Size: {recipe.servingsize}</p>
								</div>
							)})}
					</div>
				</div>
			</div>
		</div>
	</>
}

export default MyRecipes;
