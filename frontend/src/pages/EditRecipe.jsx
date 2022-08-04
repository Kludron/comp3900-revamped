import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import axios from 'axios';
import Autocomplete from '@mui/material/Autocomplete';
import { useNavigate } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import './EditRecipe.css';

/* Edit Recipe Page */
function EditRecipe ({submit}) {
  
	const navigate = useNavigate();
	const previous = () => {
		navigate('/profile');
	};

	//Obtains recipeID from the URL
	const recipeid = window.location.pathname.split('/')[3];

	//Obtains authToken of user that was stored in localStorage
	const token = localStorage.getItem('token');
	
	//Store state variables
	const [recipeData, setrecipeData] = React.useState([]);

	//Asynchronous function that pulls data from backend server to be displayed to user
	const getRecipe = async () => {
		let headers = {
			'Content-type': 'application/json',
			Authorization: `Bearer ${token}`,
		}
		const response = await axios.get(`http://localhost:5000/view/recipe/${recipeid}`, headers);
		console.log(response);
		console.log(response.data.Ingredients);
		setrecipeData({
			name: response.data.Name,
			description: response.data.Description, 
			instructions: response.data.Instructions,
			ingredients: response.data.Ingredients, 
			cuisine: response.data.Cuisine, 
			mealtype: response.data.MealType, 
			servingsize: response.data.ServingSize
		});
	}

	//Submits the changes taken from the EditRecipeForm and sends API request
	const onSubmit = async () => {
		const body = {
			"name": recipeName,
			"description": description,
			"cuisine": cuisineName,
			"mealtype": mealtypeName,
			"servingsize": servingsize,
			"ingredients": ingredientsName,
			"instructions": instructions,
		}
		var headers = {
			'Content-Type': 'application/json',
			"Authorization": `Bearer ${token}`
		}
		console.log(body);
		axios.post(`http://localhost:5000/my-recipes/recipeid=${recipeid}`, body, {headers: headers})
		.then((response) => {
			console.log(response);
			alert('Recipe editted successfully');
			navigate('/myRecipes');
		}).catch((err) => {
			alert(err);
		});
	};

	//Styling the form
	const theme = useTheme();
	const ITEM_HEIGHT = 48;
	const ITEM_PADDING_TOP = 8;
	const MenuProps = {
		PaperProps: {
			style: {
				maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
				width: 100,
			},
		},
	};

	//Store state variables
	const [cuisineList, setCuisineList] = React.useState([]);
  const [mealtypeList, setMealtypeList] =  React.useState([]);
  const [ingredientsList, setIngredientsList] = React.useState([]);

	//Makes API request to get all of the mealtypes, cuisines and ingredients
	const getCuisines = async () => {
    const configdata = await axios.get('http://localhost:5000/search');
    setMealtypeList(configdata.data.MealTypes);
    setCuisineList(configdata.data.Cuisine);
    configdata.data.Ingredients.forEach((i) => {
      setIngredientsList(ingredientsList => [...ingredientsList, {name: i}]);
    });
  };

	React.useEffect(() => {
		getCuisines();
		getRecipe();
	}, [])

	//Store state variables
	const [recipeName, setRecipeName] = React.useState('');
	const [description, setDescription] = React.useState('');
	const [cuisineName, setCuisines] = React.useState('');
	const [mealtypeName, setmealtypes] = React.useState('');
	const [ingredientsName, setIngredients] = React.useState([]);
	const [servingsize, setServingSize] = React.useState('');
	const [instructions, setInstructions] = React.useState('');

	//Handle Cuisine change
	const handleChangeCuisine = (event) => {
		const {
			target: { value },
		} = event;
		setCuisines(value);
	};

	//Handle Mealtype Change
	const handleChangeMealtype = (event) => {
    const {
      target: { value },
    } = event;
    setmealtypes(value);
  };

	//Handle Ingredients Change
	const handleChangeIngredients = (event, value) => {
    setIngredients(value);
    console.log(value);
  };
	
	//Style Cuisine Field
	function getStylesCuisine(name, cuisines, theme) {
		return {
			fontWeight:
				cuisines.indexOf(name) === -1
					? theme.typography.fontWeightRegular
					: theme.typography.fontWeightMedium,
		};
	};

	//Style Mealtype Field
	function getStylesMealtype(name, mealtypeName, theme) {
		return {
			fontWeight:
				mealtypeName.indexOf(name) === -1
					? theme.typography.fontWeightRegular
					: theme.typography.fontWeightMedium,
		};
	};

	//Creates options list and grouped by first letter
	const options = ingredientsList.map((option) => {
    //console.log(option.name);
		const firstLetter = option.name.Name[0].toUpperCase();
		return {
			firstLetter: /[0-9]/.test(firstLetter) ? '0-9' : firstLetter,
			...option.name,
		};
	});

	return(<>
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
						Edit Your Recipe
					</Typography>
					<TextField
						className='field'
						sx={{ width: 400 }}
						margin="normal"
						required
						label={"Recipe Name: "+recipeData.name}
						type="text"
						onChange={e => setRecipeName(e.target.value)}
					/>
					<TextField
						className='field'
						sx={{ width: 400 }}
						margin="normal"
						required
						label={"Description: "+recipeData.description}
						defaultValue={recipeData.description}
						type="text"
						onChange={e => setDescription(e.target.value)}
					/>
					<FormControl sx={{ m: 2, width: 400}}
						className='field'>
						<InputLabel id="Cuisine_selectbox">Select Cuisine</InputLabel>
						<Select
							value={cuisineName}
							onChange={handleChangeCuisine}
							input={<OutlinedInput label="Cuisines" />}
							MenuProps={MenuProps}
							defaultValue=""
						>
							{cuisineList.map((name) => (
								<MenuItem
									key={name}
									value={name}
									style={getStylesCuisine(name, cuisineName, theme)}
								>
									{name}
								</MenuItem>
							))}
						</Select>
					</FormControl>
					<FormControl className='field' sx={{ m: 2, width: 400}}>
						<InputLabel id="Mealtype_selectbox">Select Meal Type</InputLabel>
						<Select
							required
							value={mealtypeName}
							onChange={handleChangeMealtype}
							input={<OutlinedInput label="Mealtype" />}
							MenuProps={MenuProps}
							defaultValue=""
						>
							{mealtypeList.map((name) => (
								<MenuItem
									key={name}
									value={name}
									style={getStylesMealtype(name, mealtypeName, theme)}
								>
									{name}
								</MenuItem>
							))}
						</Select>
					</FormControl>
					<Autocomplete
						className='field'
						required
						multiple
						id="grouped"
						options={options.sort((a, b) => -b.firstLetter.localeCompare(a.firstLetter))}
						groupBy={(option) => option.firstLetter}
						getOptionLabel={(option) => option.Name}
						sx={{ m: 1, width: 400 }}
						onChange={handleChangeIngredients}
						renderInput={(params) => <TextField {...params} label="Ingredients: " />}
					/>
					<TextField
						className='field'
						sx={{ m: 2, width: 400 }}
						required
						margin="normal"
						label={"Serving Size: "+recipeData.servingsize}
						type="text"
						onChange={e => setServingSize(e.target.value)}
					/>
					<TextField
						className='field'
						required
						label={"Instructions: "+recipeData.instructions}
						sx={{ width: 400}}
						defaultValue={recipeData.instructions}
						multiline={true}
						rows={8}
						margin="normal"
						autoFocus={true}
						variant="outlined"
						onChange={e => setInstructions(e.target.value)}
					/>
					<br />
					<Button
						sx={{ mt: 3, mb: 2 }}
						id='login'
						variant="contained" onClick={onSubmit}>Submit
					</Button>
				</Box>
			</main>
		</body>
	</>)
}

export default EditRecipe;