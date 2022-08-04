import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import axios from 'axios';
import '../pages/Dashboard.css';

//Used to style the form elements
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

//Style mealtype field
function getStylesMealtype(name, mealtypeName, theme) {
  return {
    fontWeight:
      mealtypeName.indexOf(name) === -1
        ? theme.typography.fontWeightRegular
        : theme.typography.fontWeightMedium,
  };
}

//Style Cuisine Field
function getStylesCuisine(name, cuisineName, theme) {
  return {
    fontWeight:
      cuisineName.indexOf(name) === -1
        ? theme.typography.fontWeightRegular
        : theme.typography.fontWeightMedium,
  };
}

/* A majority of the code is referenced from MaterialUI(GroupedDemo & MultipleSelect) with the following links:
  React-Select: www.mui.com/material-ui/react-select
  Grouped: www.mui.com/material-ui/react-autocomplete
*/
export default function MultipleSelect({ submit }) {

  const theme = useTheme();

  //Store state variables
	const [mealtypeName, setmealtypes] = React.useState([]);
  const [cuisineName, setCuisines] = React.useState([]);
  const [ingredientsName, setIngredients] = React.useState([]);
  const [cuisineList, setCuisineList] = React.useState([]);
  const [mealtypeList, setMealtypeList] =  React.useState([]);
  const [ingredientsList, setIngredientsList] = React.useState([]);
  const [searchQuery, setSearchQuery] = React.useState('');

  //Submits the parameters below through MultipleSelect
  const onSubmit = () => {
    submit(mealtypeName, cuisineName, ingredientsName, searchQuery);
  }

  //Handle change of mealtype field
  const handleChangeMealtype = (event) => {
    const {
      target: { value },
    } = event;
    setmealtypes(
      typeof value === "string" ? value.split(',') : value,
    );
  };

  //Handle change of Cuisine field
  const handleChangeCuisine = (event) => {
    const {
      target: { value },
    } = event;
    setCuisines(
      typeof value === "string" ? value.split(',') : value,
    );
  };

  //Handle change of Ingredients field
  const handleChangeIngredients = (event, value) => {
    setIngredients(value);
    console.log(value);
  };

  //Gets all Mealtype, Cuisine and Ingredients in the database to be displayed in the search bars
  const getCuisines = async () => {
    const configdata = await axios.get('http://localhost:5000/search');
    setMealtypeList(configdata.data.MealTypes);
    setCuisineList(configdata.data.Cuisine);
    configdata.data.Ingredients.forEach((i) => {
      setIngredientsList(ingredientsList => [...ingredientsList, {name: i}]);
    })
  };

  //Runs once on initial page loading
  React.useEffect(() => {
    getCuisines();
  }, []);
  
  //Obtains the list of options of ingredients (~1000 options) and grouped by first letter
  const options = ingredientsList.map((option) => {
    //console.log(option.name);
		const firstLetter = option.name.Name[0].toUpperCase();
		return {
			firstLetter: /[0-9]/.test(firstLetter) ? '0-9' : firstLetter,
			...option.name,
		};
	});

  return (
    <div className="search_bars">
      <div className="ingredient_bar">
        <Autocomplete
          className="bar"
          multiple
          id="grouped"
          options={options.sort((a, b) => -b.firstLetter.localeCompare(a.firstLetter))}
          groupBy={(option) => option.firstLetter}
          getOptionLabel={(option) => option.Name}
          sx={{ m: 1,}}
          onChange={handleChangeIngredients}
          renderInput={(params) => <TextField {...params} label="Select Ingredient(s)" />}
        />
      </div>
      <div className="remaining_bars">
        <div>
          <TextField sx={{ m: 1}}
          className="bar2"
          margin="normal"
          label="Search for Recipes.."
          type="text"
          onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div>
          <FormControl sx={{ m: 1}}>
            <InputLabel id="Mealtype_inputlabel">Select Mealtype(s)...</InputLabel>
            <Select
              className="bar2"
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
        </div>
        <div>
          <FormControl sx={{ m: 1}}>
            <InputLabel id="Cuisine_selectbox">Select Cuisine(s)...</InputLabel>
            <Select
              className="bar2"
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
        </div>
        <div>
          <Button variant="contained"
            className="btn"
            sx={{ mt: 3, mb: 3 }}
            type="submit" 
            onClick={onSubmit}>Search
          </Button>
        </div>
      </div>
    </div>
  );
}
