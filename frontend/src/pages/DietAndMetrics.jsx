import NavBar from "./NavBar";
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import axios from 'axios';
import { Typography } from "@mui/material";
import './DietAndMetrics.css';
import Switch from '@mui/material/Switch';
import './Dashboard.css';
import profile_background from '../img/profile-background.jpeg';
import SaveIcon from '@mui/icons-material/Save';

/* Diet and Metrics Page */
function DietAndMetrics() {

	//Slider Bar marks for Daily setGoal
	const marksDaily = [
		{
			value: 1400,
			label: '1400cal'
		},
		{
			value: 1600,
			label: '1600cal'
		},
		{
			value: 1800,
			label: '1800cal'
		},
		{
			value: 2000,
			label: '2000cal'
		},
		{
			value: 2200,
			label: '2200cal'
		},
	];

	//Slider Bar marks for Weekly setGoal
	const marksWeekly = [
		{
			value: 9800,
			label: '9800cal'
		},
		{
			value: 11200,
			label: '11200cal'
		},
		{
			value: 12600,
			label: '12600cal'
		},
		{
			value: 14000,
			label: '14000cal'
		},
		{
			value: 15400,
			label: '15400cal'
		},
	];

	//React navigation functions
	const navigate = useNavigate();
	const previous = () => {
		navigate('/dashboard');
	};

	//display value of a variable e.g Calories
	function valuetext(value) {
		return `${value}cal`;
	}

	//Handles change on daily slider bar
	const handleChangeDaily = (event, value) => {
		if (typeof value === 'number'){
			setCalorieIntakeDaily(value);
		}
	};

	//Handles change on weekly slider bar
	const handleChangeWeekly = (event, value) => {
		if (typeof value === 'number'){
			setCalorieIntakeWeekly(value);
		}
	};

	//Gets token from local storage
	const token = localStorage.getItem('token');


	//Store state variables
	const [caloricIntakeDaily, setCalorieIntakeDaily] = React.useState(1900);
	const [caloricIntakeWeekly, setCalorieIntakeWeekly] = React.useState(12600);
	const [viewGoalWeekly, setViewGoalWeekly] = React.useState(0);
	const [viewGoalDaily, setViewGoalDaily] = React.useState(0);
	const [isGoal, setisGoal] = React.useState(false);

	//Handles submit of setGoal
	const handleSubmit = async () => {
		var today = new Date();
		var dd = String(today.getDate()).padStart(2, '0');
		var mm = String(today.getMonth()+1).padStart(2, '0');
		var yyyy = today.getFullYear();
		var date = dd+'/'+mm+'/'+yyyy;
		if(isWeekly){
			const body = {
				"goal": caloricIntakeWeekly,
				"timeframe": 'Weekly',
				"date": date
			};
			console.log(body);
			let headers = {
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${token}`
				}
			};
			console.log(headers)
			axios.post("http://localhost:5000/setGoal", body, headers)
			.then(response => {
				alert('You have successfully set a Goal!')
			}).catch(err => {
				console.log(err);
			})
		} else {
			const body = {
				"goal": caloricIntakeDaily,
				"timeframe": 'Daily',
				"date": date
			};
			console.log(body);
			let headers = {
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${token}`
				}
			};
			axios.post("http://localhost:5000/setGoal", body, headers)
			.then(response => {
				console.log(response);
			}).catch(err => {
				console.log(err);
			})
		}
		let headers = {
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${token}`
			}
		};
		axios.get("http://localhost:5000/setGoal", headers)
		.then(response => {
			console.log(response.data.goals)
			setViewGoalWeekly(response.data.goals[1]);
			setViewGoalDaily(response.data.goals[0]);
			setisGoal(true);
		}).catch(err => {
			console.log(err);
		})
	}

	//Store state variables
	const [checked, setChecked] = React.useState(true);
	const [isWeekly, setisWeekly] = React.useState(true);

	//Handle Switch change
	const handleSwitchChange = (event) => {
		console.log(event.target.checked);
		setChecked(event.target.checked);
		setisWeekly(event.target.checked);
  };

	//Store state variables
	const [recommend, setRecommend] = React.useState([]);


	//Recommendations API route function
	const Recommendations = async () => {
		let headers = {
			headers: {
				"Authorization": `Bearer ${token}`
			}
		};
		axios.get('http://localhost:5000/recommend', headers)
		.then((response) => {
			console.log(response);
			response.data.recipes.forEach(rid => {
				console.log(rid);
				let headers = {
					'Content-type': 'application/json',
					Authorization: `Bearer ${token}`,
				}
				axios.get(`http://localhost:5000/view/recipe/${rid}`, headers)
				.then((response) => {
					console.log(response)
					setRecommend(recommend => [...recommend, {
						id: rid,
						name: response.data.Name,
						description: response.data.Description, 
						instructions: response.data.Instructions,
						ingredients: response.data.Ingredients, 
						cuisine: response.data.Cuisine, 
						mealtype: response.data.MealType, 
						servingsize: response.data.ServingSize
					}]);
				});
			})
		}).catch((err) => {
			alert(err);
		})
	}

	//Store state variables
	const [intake, setIntake] = React.useState([]);


	//Intake Overview API route function
	const intakeOverview = async () => {
		let headers = {
			headers: {
				"Authorization": `Bearer ${token}`
			}
		};
		axios.get('http://localhost:5000/intake_overview', headers)
		.then((res) => {
			console.log(res);
			setIntake({
				"energy": res.data.overview[0],
				"protein": res.data.overview[1].toFixed(1),
				"fat": res.data.overview[2].toFixed(1),
				"fiber": res.data.overview[3].toFixed(1),
				"sugars": res.data.overview[4].toFixed(1),
				"carbohydrates": res.data.overview[5].toFixed(1),
				"calcium": res.data.overview[6].toFixed(1),
				"iron": res.data.overview[7].toFixed(1),
				"magnesium": res.data.overview[8].toFixed(1),
			});
		}).catch((err) => {
			alert(err);
		})
	}

	//Navigate to view recipe page for a specific recipeID
	const viewRecipe = (recipeID,key) => {
		console.log('viewed ' + recipeID);
		navigate(`/view/recipe/${recipeID}`);
	}

	React.useEffect(() => {
		Recommendations();
		intakeOverview();
	}, []);

	return <div className="DAM-wrapper">
		<img className='profile-background' src={profile_background} alt='profile background'></img>
		<NavBar/>
		<div className="main-content">
			<Button className="go-back" variant='contained' onClick={previous}>← Go Back</Button>
			<h1 className="title">Diet/Metrics</h1>
			<h2>Your daily goal is {viewGoalDaily} and weekly goal is {viewGoalWeekly} Calories.</h2>
			<h2 className="title">Set Calorie Goal</h2>
			<div className='calorie_bar'>
				Daily
				<Switch
					checked={checked}
					onChange={handleSwitchChange}
					inputProps={{ 'aria-label': 'controlled' }}
					color="secondary"
				></Switch> Weekly
				{ !isWeekly && 
					<Box sx={{ width: 500 }}>
						<Typography>
							Daily Caloric Intake: {caloricIntakeDaily}cal
						</Typography>
						<Slider
							aria-label="Calorie Intake per Day"
							defaultValue={1800}
							getAriaValueText={valuetext}
							step={50}
							min={1400}
							max={2200}
							valueLabelDisplay="auto"
							marks={marksDaily}
							color="secondary"
							onChange={handleChangeDaily}
						/>
						<Button 
							sx={{ mt: 3, mb: 2 }}
							variant='contained'
							endIcon={<SaveIcon />}
							onClick={handleSubmit}>Save</Button>
					</Box>
				}
				{ isWeekly && 
					<Box sx={{ width: 500 }}>
						<Typography>
							Weekly Caloric Intake: {caloricIntakeWeekly}cal
						</Typography>
						<Slider
							aria-label="Calorie Intake per Day"
							defaultValue={12600}
							getAriaValueText={valuetext}
							step={100}
							min={9800}
							max={15400}
							valueLabelDisplay="auto"
							marks={marksWeekly}
							color="secondary"
							onChange={handleChangeWeekly}
						/>
						<Button 
							sx={{ mt: 3, mb: 2 }}
							variant='contained'
							endIcon={<SaveIcon />}
							onClick={handleSubmit}>Save</Button>
							
					</Box>
				}
			</div>
			<hr className="break"></hr>
			<h2>Recommendations</h2>
			<div className='recommend_section'>
				{recommend.map((recipe,key) => {
					return (
					<div className='recipe_box' key={key}>
						<div className="details">
							<h3 className="rec_name">{recipe.name}</h3>
							<p>Cuisine: {recipe.cuisine}</p>
							<p>Description: {recipe.description}</p>
							<p>Mealtype: {recipe.mealtype}</p>
							<p>Serves: {recipe.servingsize}</p>
							<Button variant="contained" className='see_recipe_button' onClick={() => viewRecipe(recipe.id, key)}>View Recipe→</Button>
						</div>
					</div>
				)})}
			</div>
					<hr className="break"></hr>
					<div className='intakeoverview_section'>
						<h2>Intake Overview</h2>
						<div className="intake">
							<p>Energy: {intake.energy}kJ</p>
							<p>Protein: {intake.protein}g</p>
							<p>Fat: {intake.fat}g</p>
							<p>Fiber {intake.fiber}g</p>
							<p>Sugar: {intake.sugars}g</p>
							<p>Carbohydrates: {intake.carbohydrates}g</p>
							<p>Calcium: {intake.calcium}mg</p>
							<p>Magnesium: {intake.magnesium}mg</p>
						</div>
					</div>
				</div>
			</div>
}

export default DietAndMetrics;
