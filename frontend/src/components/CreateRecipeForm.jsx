import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

function CreateRecipeForm ({ submit }) {

	const onSubmit = () => {
		submit(recipeName, description, cuisineName, mealtypeName, servingsize);
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

	const [recipeName, setRecipeName] = React.useState('');
	const [description, setDescription] = React.useState('');
	const cuisines = ['English','Irish','Korean','Chinese','Japanese','Spanish','Thai','Indian','Israeli','Middle Eastern','German'];
	const [cuisineName, setCuisines] = React.useState('');
	const [mealtypeName, setmealtypes] = React.useState('');
	const mealtypes = ['Breakfast','Lunch','Dinner','Dessert','Snack'];
	const [servingsize, setServingSize] = React.useState('');


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

	return (<>
		<h2>Create a Recipe</h2>
		<TextField
			margin="normal"
			required
			label="Recipe Name"
			type="text"
			onChange={e => setRecipeName(e.target.value)}
		/>
		<TextField
			margin="normal"
			required
			label="Description"
			type="text"
			onChange={e => setDescription(e.target.value)}
		/>
		<FormControl sx={{ m: 1, width: 200}}>
			<InputLabel id="Cuisine_selectbox">Select Cuisine</InputLabel>
			<Select
				value={cuisineName}
				onChange={handleChangeCuisine}
				input={<OutlinedInput label="Cuisines" />}
				MenuProps={MenuProps}
				defaultValue=""
			>
				{cuisines.map((name) => (
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
		<FormControl sx={{ m: 1, width: 200}}>
			<InputLabel id="Mealtype_selectbox">Select Meal Type</InputLabel>
			<Select
				value={mealtypeName}
				onChange={handleChangeMealtype}
				input={<OutlinedInput label="Mealtype" />}
				MenuProps={MenuProps}
				defaultValue=""
			>
				{mealtypes.map((name) => (
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
		<TextField
			margin="normal"
			required
			label="Serving Size (No. of People)"
			type="text"
			onChange={e => setServingSize(e.target.value)}
		/>
		<br />
		<Button
			sx={{ mt: 3, mb: 2 }}
			id='login'
			variant="contained" onClick={onSubmit}>Submit
		</Button>
	</>)

}

export default CreateRecipeForm;