import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Button from '@mui/material/Button';
import axios from 'axios';

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

const mealtypes = [
  'Breakfast',
  'Lunch',
  'Dinner',
  'Snack',
  'Dessert'
];

const cuisines = [
  'Chinese',
  'Korean',
  'Japanese'
];

const ingredients = [
  'Broccoli',
  'Tomato'
]

function getStylesMealtype(name, mealtypeName, theme) {
  return {
    fontWeight:
      mealtypeName.indexOf(name) === -1
        ? theme.typography.fontWeightRegular
        : theme.typography.fontWeightMedium,
  };
}

function getStylesCuisine(name, cuisineName, theme) {
  return {
    fontWeight:
      cuisineName.indexOf(name) === -1
        ? theme.typography.fontWeightRegular
        : theme.typography.fontWeightMedium,
  };
}

function getStylesIngredients(name, ingredientsName, theme) {
  return {
    fontWeight:
      ingredientsName.indexOf(name) === -1
        ? theme.typography.fontWeightRegular
        : theme.typography.fontWeightMedium,
  };
}

export default function MultipleSelect({ submit }) {
  const theme = useTheme();
	const [mealtypeName, setmealtypes] = React.useState([]);
  const [cuisineName, setCuisines] = React.useState([]);
  const [ingredientsName, setIngredients] = React.useState([]);

  const onSubmit = () => {
    submit(mealtypeName, cuisineName, ingredientsName);
  }

  const handleChangeMealtype = (event) => {
    const {
      target: { value },
    } = event;
    setmealtypes(
      // On autofill we get a stringified value.
      typeof value === 'string' ? value.split(',') : value,
    );
  };

  const handleChangeCuisine = (event) => {
    const {
      target: { value },
    } = event;
    setCuisines(
      // On autofill we get a stringified value.
      typeof value === 'string' ? value.split(',') : value,
    );
  };

  const handleChangeIngredients = (event) => {
    const {
      target: { value },
    } = event;
    setIngredients(
      // On autofill we get a stringified value.
      typeof value === 'string' ? value.split(',') : value,
    );
  };

  const getCuisines = async () => {
    const data = await axios.get('http://localhost:5000/search')
    console.log(data);
  };

  React.useEffect(() => {
    getCuisines();
  });

  return (
    <div>
      <FormControl sx={{ m: 1, width: 200}}>
        <InputLabel id="Mealtype_inputlabel">Select Mealtype(s)...</InputLabel>
        <Select
          multiple
          value={mealtypeName}
          onChange={handleChangeMealtype}
          input={<OutlinedInput label="Mealtypes" />}
          MenuProps={MenuProps}
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
      <FormControl sx={{ m: 1, width: 200}}>
        <InputLabel id="Cuisine_selectbox">Select Cuisine(s)...</InputLabel>
        <Select
          multiple
          value={cuisineName}
          onChange={handleChangeCuisine}
          input={<OutlinedInput label="Cuisines" />}
          MenuProps={MenuProps}
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
        <InputLabel id="Ingredient_selectbox">Select ingredient(s)...</InputLabel>
        <Select
          multiple
          value={ingredientsName}
          onChange={handleChangeIngredients}
          input={<OutlinedInput label="Ingredients" />}
          MenuProps={MenuProps}
        >
          {ingredients.map((name) => (
            <MenuItem
              key={name}
              value={name}
              style={getStylesIngredients(name, ingredientsName, theme)}
            >
              {name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Button variant="contained"
        sx={{ mt: 3, mb: 2 }}
        type="submit" 
        onClick={onSubmit}>Search
      </Button>
    </div>
  );
}
