import axios from 'axios';
import React from 'react';
import { useNavigate } from 'react-router';
import CreateRecipeForm from '../components/CreateRecipeForm';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';

/* Create Recipe Page */
function CreateRecipe() {

	//Constant used to compare strings to an empty string
	const empty = '';

	//Get token from local storage
	const token = localStorage.getItem('token');

	//React Navigation functions
	const navigate = useNavigate();
	const previous = () => {
		navigate('/myRecipes');
	};

	return <>
		<body>
			<main>
				<Button className="go_back" variant='contained' onClick={previous}>← Go Back</Button>
				<Box
					className="box"
					sx={{
						marginTop: 0,
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
				}}>
					<Avatar sx={{ m: 2, bgcolor: 'secondary.main' }}></Avatar>
					<Typography className="Sign-in" component="h1" variant="h5">
						Create a Recipe
					</Typography>
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
				</Box>
			</main>
		</body>
	</>
}

export default CreateRecipe;
