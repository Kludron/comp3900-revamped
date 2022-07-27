import React from 'react';
import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './RecipeDetails.css';

function Recipe () {

	const [recipe, setRecipe] = useState({});

	const navigate = useNavigate();
	const goBack = () => {
		navigate('/dashboard');
	};
	const goToComments = (recipeid) => {
		navigate(`/view/recipe/${recipeid}/comments`);
	};
	//obtains the recipeID
	const recipeid = window.location.pathname.split('/')[3];

	//Obtains authToken of user
	const token = localStorage.getItem('token');
	
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
			ingredients: response.data.Ingredients[0], 
			cuisine: response.data.Cuisine, 
			mealtype: response.data.MealType, 
			servingsize: response.data.ServingSize
		});
		console.log(response.data.Ingredients[0].Calories);
		const calories = localStorage.setItem('energy', response.data.Ingredients[0].Energy);
		const carbs = localStorage.setItem('carbohydrates', response.data.Ingredients[0].Carbohydrates);
		const fat = localStorage.setItem('fat', response.data.Ingredients[0].Fat);
		const fiber = localStorage.setItem('fibre', response.data.Ingredients[0].Fibre);
		const grams = localStorage.setItem('grams', response.data.Ingredients[0].Grams);
		const Name = localStorage.setItem('Name', response.data.Ingredients[0].Name);
		const protein = localStorage.setItem('protein', response.data.Ingredients[0].Protein);
		const quantity = localStorage.setItem('quantity', response.data.Ingredients[0].Quantity);
		const sugars = localStorage.setItem('sugars', response.data.Ingredients[0].Sugars);
		const calcium = localStorage.setItem('calcium', response.data.Ingredients[0].Calcium);
		const iron = localStorage.setItem('iron', response.data.Ingredients[0].Iron);
		const magnesium = localStorage.setItem('magnesium', response.data.Ingredients[0].Magnesium);
		const manganese = localStorage.setItem('manganese', response.data.Ingredients[0].Manganese);
		const phosphorus = localStorage.setItem('phosphorus', response.data.Ingredients[0].Phosphorus);
		const millilitres = localStorage.setItem('millilitres', response.data.Ingredients[0].Millilitres);
	}

	React.useEffect(() => {
		getRecipe()
	}, []);

	return (
		<div className='recipe_details'>
			<button onClick={() => goBack()}>←Go Back</button>
			<h2 className='recipe_name'>Recipe Name: {recipe.name}</h2>
			<p className='recipe_description'>Description: {recipe.description}</p>
			<p className='recipe_mealtype'>Mealtype: {recipe.mealtype}</p>
			<p className='recipe_servingsize'>Serving Size: {recipe.servingsize}</p>
			<p className='recipe_cuisine'>Cuisine: {recipe.cuisine}</p>
			<div className='recipe_ingredients'>Ingredients: 
				<p>Name: {localStorage.getItem('Name')}</p>
				<p>Energy: {localStorage.getItem('energy')} kJ</p>
				<p>Carbohydrates: {localStorage.getItem('carbohydrates')}g</p>
				<p>Fat: {localStorage.getItem('fat')}g</p>
				<p>Fiber: {localStorage.getItem('fiber')}g</p>
				<p>Protein: {localStorage.getItem('protein')}g</p>
				<p>Sugars: {localStorage.getItem('sugars')}g</p>
				<p>Calcium: {localStorage.getItem('calcium')}mg</p>
				<p>Iron: {localStorage.getItem('iron')}mg</p>
				<p>Magnesium: {localStorage.getItem('magnesium')}mg</p>
				<p>Manganese: {localStorage.getItem('manganese')}mg</p>
				<p>Phosphorus: {localStorage.getItem('phosphorus')}mg</p>
				<p>Grams: {localStorage.getItem('grams')}</p>
				<p>Quantity: {localStorage.getItem('quantity')}</p>
				<p>Millilitres: {localStorage.getItem('millilitres')}</p>
			</div>
			<button onClick={() => goToComments()}>See Comments</button>
		</div>
	);
}

export default Recipe;