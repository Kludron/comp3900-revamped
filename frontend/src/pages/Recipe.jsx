import React from 'react';
import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './RecipeDetails.css';

function Recipe () {

	const [recipe, setRecipe] = useState({});
	const [ingredients, setIngredients] = useState([]);

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
			<p className='recipe_mealtype'>Mealtype: {recipe.mealtype}</p>
			<p className='recipe_servingsize'>Serving Size: {recipe.servingsize}</p>
			<p className='recipe_cuisine'>Cuisine: {recipe.cuisine}</p>
			<div className='recipe_ingredients'>Ingredients: 
				{ingredients.map((i,key) => {
					return (
						<div key={key}>
							<p>Name: {i.Name}</p>
							<p>Energy: {i.Energy} kJ</p>
							<p>Carbohydrates: {i.Carbohydrates}g</p>
							<p>Fat: {i.Fat}g</p>
							<p>Fibre: {i.Fibre}g</p>
							<p>Protein: {i.Protein}g</p>
							<p>Sugars: {i.Sugars}g</p>
							<p>Calcium: {i.Calcium}mg</p>
							<p>Iron: {i.Iron}mg</p>
							<p>Magnesium: {i.Magnesium}mg</p>
							<p>Manganese: {i.Manganese}mg</p>
							<p>Phosphorus: {i.Phosphorus}mg</p>
							<p>Grams: {i.Grams}g</p>
							<p>Quantity: {i.Quantity}</p>
							<p>Millilitres: {i.Millilitres}mL</p>
						</div>
					)
				})}
			</div>
			<button onClick={() => goToComments()}>See Comments</button>
		</div>
	);
}

export default Recipe;