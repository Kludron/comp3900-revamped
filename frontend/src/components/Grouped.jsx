import * as React from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

export default function Grouped() {
	const ingredientsList = [
			{name: 'Apple'},
			{name: 'Banana'},
			{name: 'Able'}
	];

	const options = ingredientsList.map((option,key) => {
		console.log(option);
		const firstLetter = option.name[0].toUpperCase();
		console.log(firstLetter);
		return {
			firstLetter: /[0-9]/.test(firstLetter) ? '0-9' : firstLetter,
			...option,
		};
	});

	return (
		<Autocomplete
			multiple
			id="grouped-demo"
			options={options.sort((a, b) => -b.firstLetter.localeCompare(a.firstLetter))}
			groupBy={(option) => option.firstLetter}
			getOptionLabel={(option) => option.name}
			sx={{ width: 300 }}
			renderInput={(params) => <TextField {...params} label="Select Ingredient(s)" />}
		/>
	);
};
