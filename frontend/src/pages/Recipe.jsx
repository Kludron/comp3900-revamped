import React from 'react';
import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Rating } from "@mui/material";
import './RecipeDetails.css';
import Button from '@mui/material/Button';

/* Recipe Page */
function Recipe () {

	const [recipe, setRecipe] = useState({});
	const [ingredients, setIngredients] = useState([]);

	//React navigate functions
	const navigate = useNavigate();
	const goBack = () => {
		navigate('/dashboard');
		// window.history.back();
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

	/*
	<li>Energy: {i.Energy} kJ</li>
									<li>Carbohydrates: {i.Carbohydrates}g</li>
									<li>Fat: {i.Fat}g</li>
									<li>Fibre: {i.Fibre}g</li>
									<li>Protein: {i.Protein}g</li>
									<li>Sugars: {i.Sugars}g</li>
									<li>Calcium: {i.Calcium}mg</li>
									<li>Iron: {i.Iron}mg</li>
									<li>Magnesium: {i.Magnesium}mg</li>
									<li>Manganese: {i.Manganese}mg</li>
									<li>Phosphorus: {i.Phosphorus}mg</li>
									<li>Grams: {i.Grams}g</li>
									<li>Quantity: {i.Quantity}</li>
									<li>Millilitres: {i.Millilitres}mL</li>
	*/

	return (
		<div>
			<div className='recipe_details'>
				<Button className='btn' variant="contained" onClick={() => goBack()}>←Go Back</Button>
				<div className='upper'>
					<h2 className='recipe_name'>{recipe.name}</h2>
					<p className='recipe_description'>Description: {recipe.description}</p>
					<p className='recipe_mealtype'>Mealtype: {recipe.mealtype}</p>
					<p className='recipe_servingsize'>Serves: {recipe.servingsize} people</p>
					<p className='recipe_cuisine'>Cuisine: {recipe.cuisine}</p>
					<button onClick={() => goToComments(recipeid)}>See Reviews & Comments</button>
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