import React from 'react';
import axios from 'axios';
import { useState, useEffect } from 'react';

function Recipe () {

	const [recipe, setRecipe] = useState([]);

	//obtains the recipeID
	const recipeID = window.location.pathname.split('/')[3];

	//Obtains authToken of user
	const token = localStorage.getItem('token');

	const getRecipe = async () => {
		let headers = {
			'Content-type': 'application/json',
			Authorization: `Bearer ${token}`,
		}
		const result = await axios.get(`http://localhost:5000/view/recipe/${recipeID}`, headers);
		console.log(result);
		result.data.forEach((rec) => {
			console.log(rec);
      setRecipe(recipe => [...recipe, {id: rec.id, name: rec.name, description: rec.description, cuisine: rec.cuisine, mealtype: rec.mealtype, servingsize: rec.servingsize, uploader: rec.uploader}]);
		});
	}

	useEffect(() => {
		getRecipe();
	}, []);

	{recipe.map((rec, key) => {
		return (
			<div key={key}>
				<h3>{rec.name}</h3>
				<p>{rec.description}</p>
				<p>{rec.mealtype}</p>
				<p>{rec.servingsize}</p>
				<p>{rec.cuisine}</p>
				<p>{rec.uploader}</p>
				<h1>Hi</h1>
			</div>
		)})};
}

export default Recipe;