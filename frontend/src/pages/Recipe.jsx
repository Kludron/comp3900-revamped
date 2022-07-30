import React from 'react';
import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './RecipeDetails.css';

/* Recipe Page */
function Recipe () {

	const [recipe, setRecipe] = useState({});
	const [ingredients, setIngredients] = useState([]);

	//React navigate functions
	const navigate = useNavigate();
	const goBack = () => {
		navigate('/dashboard');
	};
	const goToComments = (recipeid) => {
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
		console.log(response.data);
		setRecipe({
			name: response.data.Name,
			description: response.data.Description, 
			instructions: response.data.Instructions,
			ingredients: response.data.Ingredients, 
			cuisine: response.data.Cuisine, 
			mealtype: response.data.MealType, 
			servingsize: response.data.ServingSize
		});
		setIngredients(response.data.Ingredients);
		console.log(response.data.Ingredients);
	};

	React.useEffect(() => {
		getRecipe();
	}, []);

	return (
		<div className='recipe_details'>
			<button onClick={() => goBack()}>←Go Back</button>
			<h2 className='recipe_name'>Recipe Name: {recipe.name}</h2>
			<p className='recipe_description'>Description: {recipe.description}</p>
			<p className='recipe_instruction'>Instructions: {recipe.instructions}</p>
			<p className='recipe_mealtype'>Mealtype: {recipe.mealtype}</p>
			<p className='recipe_servingsize'>Serving Size: {recipe.servingsize}</p>
			<p className='recipe_cuisine'>Cuisine: {recipe.cuisine}</p>
			<div className='recipe_ingredients'>Ingredients: 
				{ingredients.map((i,key) => {
					return (
						<div className="ingredient_values" key={key}>
							<li>Name: {i.Name}</li>
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
						</div>
					)
				})}
			</div>
			<button onClick={() => goToComments()}>See Comments</button>
		</div>
	);
}

export default Recipe;