import React from 'react';
import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './RecipeDetails.css';
import Button from '@mui/material/Button';
import { Rating } from '@mui/material';

/* Recipe Page */
function Recipe () {

	//Store state variables
	const [recipe, setRecipe] = useState({});
	const [ingredients, setIngredients] = useState([]);

	//React navigate functions
	const navigate = useNavigate();
	const goBack = () => {
		navigate('/dashboard');
	};
	const goToComments = (recipeid) => {
		console.log(recipeid);
		navigate(`/view/recipe/${recipeid}/comments`);
	};
	
	//Obtains recipeID from the URL
	const recipeid = window.location.pathname.split('/')[3];

	//Obtains authToken of user that was stored in localStorage
	const token = localStorage.getItem('token');
	
	//Asynchronous function that pulls data from backend server to be displayed to user
	const getRecipe = async () => {
		let headers = {
			'Content-type': 'application/json',
			Authorization: `Bearer ${token}`,
		}
		const response = await axios.get(`http://localhost:5000/view/recipe/${recipeid}`, headers);
		// console.log(response.data);
		// console.log(recipeid)
		setRecipe({
			name: response.data.Name,
			description: response.data.Description, 
			instructions: response.data.Instructions,
			ingredients: response.data.Ingredients, 
			cuisine: response.data.Cuisine, 
			mealtype: response.data.MealType, 
			servingsize: response.data.ServingSize, 
			rating: response.data.Rating,
		});
		setIngredients(response.data.Ingredients);
		console.log(response.data.Ingredients);
	};

	React.useEffect(() => {
		getRecipe();
	}, []);
	console.log(recipe.rating)
	return (
		<div>
			<div className='recipe_details'>
				<Button className='btn' variant="contained" onClick={() => goBack()}>← Go Back</Button>
				<div className='upper'>
					<h2 className='recipe_name'>{recipe.name}</h2>
					<Rating value={Number(recipe.rating)} precision={0.1} readOnly/>
					<p className='recipe_description'>Description: {recipe.description}</p>
					<p className='recipe_mealtype'>Mealtype: {recipe.mealtype}</p>
					<p className='recipe_servingsize'>Serves: {recipe.servingsize} people</p>
					<p className='recipe_cuisine'>Cuisine: {recipe.cuisine}</p>
					<Button className="comments" variant='outlined' onClick={() => goToComments(recipeid)}>See Reviews & Comments</Button>
				</div>
				<div className="lower">
					<div className="instructions">
						<h2 className='recipe_instruction'>Instructions: </h2>
						 {recipe.instructions}
					</div>
					<div className='v1'></div>
					<div className='recipe_ingredients'>
						<h2 className='ingredients'>Ingredients: </h2>
						{ingredients.map((i,key) => {
							return (
								<div className="ingredient_values" key={key}>
									<li>{i.Name}</li>
								</div>
							)
						})}
					</div>
				</div>
			</div>
		</div>
	);
}

export default Recipe;
