import axios from 'axios';
import React from 'react';
import { useNavigate } from 'react-router';
import CreateRecipeForm from '../components/CreateRecipeForm';

/* Create Recipe Page */
function CreateRecipe() {

	const empty = '';
	const token = localStorage.getItem('token');

	//React Navigation functions
	const navigate = useNavigate();
	const previous = () => {
		navigate('/myRecipes');
	}
    return <>
			<button onClick={previous}>Go Back</button>
			<CreateRecipeForm submit={(recipeName, description, cuisineName, mealtypeName, servingsize, ingredients, instructions) => {
				console.log(recipeName, description, cuisineName, mealtypeName, servingsize, ingredients, instructions)
				if(recipeName === empty || description === empty ||  mealtypeName === empty || servingsize === empty || ingredients === empty || instructions === empty){
					alert('One of the fields are incorrect or empty, please try again.');
				} else {
					const body = {
						"name": recipeName,
						"description": description,
						"cuisine": cuisineName,
						"mealtype": mealtypeName,
						"servingsize": servingsize,
						"ingredients": ingredients,
						"instructions": instructions,
					}
					var headers = {
      			"Authorization": `Bearer ${token}`
    			}
					console.log(body);
					axios.post("http://localhost:5000/post_recipe", body, {headers: headers})
					.then((response) => {
						console.log(response);
						alert('Recipe created successfully');
						navigate('/myRecipes');
					}).catch((err) => {
						alert(err);
					});
				}
			}}/>
		</>
}

export default CreateRecipe;