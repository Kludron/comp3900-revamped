import NavBar from "./NavBar";
import React from 'react';
import { useNavigate } from "react-router";
import './MyRecipes.css';
import Button from '@mui/material/Button';

/* MyRecipes Page */
function MyRecipes() {

	const [myRecipes, setMyRecipes] = React.useState('You have created no recipes, please create one via the button below.')
	
	//React navigate functions
	const navigate = useNavigate();
	const previous = () => {
		navigate('/dashboard');
	};
	const navigateRecipeForm = () => {
		navigate('/create-recipe');
	};
	
	return <>
		<div className="wrapper">
			<NavBar/>
			<div className="main-content">
				<button onClick={previous}>Go Back</button>
				<h2>My Recipes</h2>
				<p>{myRecipes}</p>
				<Button
      		sx={{ mt: 3, mb: 2 }}
      		id='create_recipe'
      		variant="outlined"
					onClick={() => navigateRecipeForm()}>
					Create Recipe
				</Button>
			</div>
		</div>
	</>
}

export default MyRecipes;