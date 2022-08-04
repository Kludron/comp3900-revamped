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

/* Create Recipe Form */
function CreateRecipeForm ({ submit }) {

	//Submits the parameters below through CreateRecipeForm
	const onSubmit = () => {
		submit(recipeName, description, cuisineName, mealtypeName, servingsize, ingredientsName, instructions);
	};

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

	const [cuisineList, setCuisineList] = React.useState([]);
  const [mealtypeList, setMealtypeList] =  React.useState([]);
  const [ingredientsList, setIngredientsList] = React.useState([]);

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
	}, [])

	const [recipeName, setRecipeName] = React.useState('');
	const [description, setDescription] = React.useState('');
	const [cuisineName, setCuisines] = React.useState('');
	const [mealtypeName, setmealtypes] = React.useState('');
	const [ingredientsName, setIngredients] = React.useState([]);
	const [servingsize, setServingSize] = React.useState('');
	const [instructions, setInstructions] = React.useState('');

	const handleChangeCuisine = (event) => {
		const {
			target: { value },
		} = event;
		setCuisines(value);
	};

	const handleChangeMealtype = (event) => {
    const {
      target: { value },
    } = event;
    setmealtypes(value);
  };

	const handleChangeIngredients = (event, value) => {
    setIngredients(value);
    console.log(value);
  };

	function getStylesCuisine(name, cuisines, theme) {
		return {
			fontWeight:
				cuisines.indexOf(name) === -1
					? theme.typography.fontWeightRegular
					: theme.typography.fontWeightMedium,
		};
	};

	function getStylesMealtype(name, mealtypeName, theme) {
		return {
			fontWeight:
				mealtypeName.indexOf(name) === -1
					? theme.typography.fontWeightRegular
					: theme.typography.fontWeightMedium,
		};
	};

	const options = ingredientsList.map((option) => {
    //console.log(option.name);
		const firstLetter = option.name.Name[0].toUpperCase();
		return {
			firstLetter: /[0-9]/.test(firstLetter) ? '0-9' : firstLetter,
			...option.name,
		};
	});

	return (<>
		<TextField
			className='field'
			sx={{ width: 400 }}
			margin="normal"
			required
			label="Recipe Name"
			placeholder="e.g Mashed Potatoes"
			type="text"
			onChange={e => setRecipeName(e.target.value)}
		/>
		<TextField
			className='field'
			sx={{ width: 400 }}
			margin="normal"
			required
			label="Description"
			placeholder="Quick, easy and a family favourite!"
			type="text"
			onChange={e => setDescription(e.target.value)}
		/>
		<FormControl className='field' sx={{ m: 2, width: 200}}>
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
		<FormControl className='field' sx={{ m: 2, width: 200}}>
			<InputLabel id="Mealtype_selectbox">Select Meal Type *</InputLabel>
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
			renderInput={(params) => <TextField {...params} label="Select Ingredient(s)" />}
		/>
		<TextField
			className='field'
			required
			placeholder="Eg. 3"
			margin="normal"
			label="Serving Size (No. of People)"
			type="text"
			onChange={e => setServingSize(e.target.value)}
		/>
		<TextField
			className='field'
			required
			label="Recipe Instructions"
			sx={{ width: 400}}
			placeholder="Instructions: eg. 
			1. Peel the potatoes
			2. Boil potatoes for 15 minutes"
			multiline={true}
			rows={8}
			margin="normal"
			autoFocus={true}
			variant="outlined"
			onChange={e => setInstructions(e.target.value)}
		/>
		<Button
			sx={{ mt: 3, mb: 2 }}
			id='login'
			variant="contained" onClick={onSubmit}>Submit
		</Button>
	</>)

}

export default CreateRecipeForm;