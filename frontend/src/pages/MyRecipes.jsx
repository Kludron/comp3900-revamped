import NavBar from "./NavBar";
import React from 'react';
import { useNavigate } from "react-router";
import './MyRecipes.css';
import Button from '@mui/material/Button';
import axios from "axios";
function MyRecipes() {

	const [myRecipes, setMyRecipes] = React.useState('You have created no recipes, please create one via the button below.')
	
	const navigate = useNavigate();
	const previous = () => {
		navigate('/dashboard');
	};

	const navigateRecipeForm = () => {
		navigate('/create-recipe');
	};
	
	const getMyRecipes = async () => {
		axios.get('http://localhost:5000/my-recipes/')
		.then((response) => {
			console.log(response);
		}).catch(err => {
			alert(err);
		})
	};

	const getRecentlyViewed = async () => {
		//Retrieves list of recent recipes that user has viewed
		const recent = JSON.parse(localStorage.getItem('recent'));
		const token = localStorage.getItem('token');
		let body = {recentlyViewed: recent};
		console.log(body);
		let headers = {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`
		}
		axios.post('http://localhost:5000/recentlyviewed', body, {headers:headers})
		.then((response) => {
			console.log(response);
		}).catch(err => {
			alert(err);
		})
	}

	React.useEffect(() => {
		getMyRecipes();
		getRecentlyViewed();
	}, [])

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
				<div className="recent_viewed">
					<h2>Recently Viewed</h2>

				</div>
			</div>
		</div>
	</>
}

export default MyRecipes;