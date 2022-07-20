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

/*const mealtypeList = [
  'mealtype'
];

const ingredientsList = [
  'ingred'
];

const cuisineList = [
  'cuisine'
];*/

export default function MultipleSelect({ submit }) {

  const theme = useTheme();
	const [mealtypeName, setmealtypes] = React.useState([]);
  const [cuisineName, setCuisines] = React.useState([]);
  const [ingredientsName, setIngredients] = React.useState([]);
  const [cuisineList, setCuisineList] = React.useState([]);
  const [mealtypeList, setMealtypeList] =  React.useState([]);
  const [ingredientsList, setIngredientsList] = React.useState([]);

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
    const configdata = await axios.get('http://localhost:5000/search');
    console.log(configdata.data);
    setMealtypeList(configdata.data.MealTypes);
    setCuisineList(configdata.data.Cuisine);
    setIngredientsList(configdata.data.Ingredients);
  };

  React.useEffect(() => {
    getCuisines();
  }, []);

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
      <FormControl sx={{ m: 1, width: 200}}>
        <InputLabel id="Cuisine_selectbox">Select Cuisine(s)...</InputLabel>
        <Select
          multiple
          value={cuisineName}
          onChange={handleChangeCuisine}
          input={<OutlinedInput label="Cuisines" />}
          MenuProps={MenuProps}
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
      <FormControl sx={{ m: 1, width: 200}}>
        <InputLabel id="Ingredient_selectbox">Select ingredient(s)...</InputLabel>
        <Select
          multiple
          value={ingredientsName}
          onChange={handleChangeIngredients}
          input={<OutlinedInput label="Ingredients" />}
          MenuProps={MenuProps}
        >
          {ingredientsList.map((name) => (
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
      <Button variant="outlined"
        sx={{ mt: 3, mb: 2 }}
        type="submit" 
        onClick={onSubmit}>Search
      </Button>
    </div>
  );
}
