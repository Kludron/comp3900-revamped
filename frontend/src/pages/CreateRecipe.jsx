import axios from 'axios';
import React from 'react';
import { useNavigate } from 'react-router';
import CreateRecipeForm from '../components/CreateRecipeForm';

function CreateRecipe() {

	const token = localStorage.getItem('token');

	const navigate = useNavigate();
	const previous = () => {
		navigate('/myRecipes');
	}
    return <>
			<button onClick={previous}>Go Back</button>
			<CreateRecipeForm submit={(recipeName, description, cuisineName, mealtypeName, servingsize) => {
				/*if(recipeName === '' || description === '' || cuisineName ===  || mealtypeName === '' || servingsize === ''){
					alert('One of the fields are empty.');
				} else {*/
					alert('Recipe created successfully')
					navigate('/myRecipes');
				const body = {
					"name": recipeName,
					"description": description,
					"cuisine": cuisineName,
					"mealtype": mealtypeName,
					"servingsize": servingsize,
					"ingredients": '',
				}
				var headers = {
      		"Authorization": `Bearer ${token}`
    		}
				console.log(body);
				axios.post("http://localhost:5000/post_recipe", body, {headers:headers})
				.then((response) => {
					console.log(response);
				}).catch((err) => {
					alert(err);
				})
			}}/>
		</>
}

export default CreateRecipe;