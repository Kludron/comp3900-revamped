import React from 'react';
import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './RecipeDetails.css';

function Recipe () {

	const [recipe, setRecipe] = useState([]);

	const navigate = useNavigate();

	const goBack = () => {
		navigate('/dashboard');
	}

	//obtains the recipeID
	const recipeid = window.location.pathname.split('/')[3];

	//Obtains authToken of user
	const token = localStorage.getItem('token');

	const getRecipe = async () => {
		let headers = {
			'Content-type': 'application/json',
			Authorization: `Bearer ${token}`,
		}
		const result = await axios.get(`http://localhost:5000/view/recipe/${recipeid}`, headers);
		console.log(result.data);
		result.data.forEach((rec) => {
      setRecipe(recipe => [...recipe, {id: rec.id, name: rec.name, description: rec.description, cuisine: rec.cuisine, mealtype: rec.mealtype, servingsize: rec.servingsize, uploader: rec.uploader}]);
		});
	}

	React.useEffect(() => {
		getRecipe();
	}, []);

	return (
		<div>
			{recipe.map((r, key) => {
				return (
					<div className='recipe_details' key={key}>
						<button onClick={() => goBack()}>←Go Back</button>
						<h2 className='recipe_name'>{r.name}</h2>
						<p className='recipe_description'>{r.description}</p>
						<p className='recipe_mealtype'>{r.mealtype}</p>
						<p className='recipe_servingsize'>{r.servingsize}</p>
						<p className='recipe_cuisine'>{r.cuisine}</p>
					</div>
				)
			})}
		</div>
	);
}

export default Recipe;