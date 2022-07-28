import NavBar from "./NavBar";
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import axios from 'axios';
import { Typography } from "@mui/material";
import './DietAndMetrics.css';

function DietAndMetrics() {

	const marks = [
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

	const navigate = useNavigate();
	const previous = () => {
		navigate('/dashboard');
	};

	function valuetext(value) {
		return `${value}cal`;
	}

	const handleChange = (event, value) => {
		if (typeof value === 'number'){
			setCalorieIntake(value);
		}
	};
	
	const token = localStorage.getItem('token');

	const [caloricIntake, setCalorieIntake] = React.useState(1900);

	const handleSubmit = async () => {
		const body = {
			goal: caloricIntake,
		};
		console.log(body);
		let headers = {
			"Content-Type": "application/json",
			"Authorization": `Bearer ${token}`
		};
		const response = await axios.post('http://localhost:5000/setGoal', {headers:headers}, body);
		console.log(response);
		if(response.status === 200){
			//do something
		}
	}

	return <div className="wrapper">
			<NavBar/>
			<div className="main-content">
			<button onClick={previous}>Go Back</button>
				<h2 className="title">Diet/Metrics</h2>
				<div className='calorie_bar'>
					<Box sx={{ width: 500 }}>
						<Typography>
							Daily Caloric Intake: {caloricIntake}
						</Typography>
						<Slider
							aria-label="Calorie Intake per Day"
							defaultValue={1900}
							getAriaValueText={valuetext}
							step={50}
							min={1600}
							max={2200}
							valueLabelDisplay="auto"
							marks={marks}
							color="secondary"
							onChange={handleChange}
						/>
						<Button 
							sx={{ mt: 3, mb: 2 }}
							variant='outlined'
							onClick={handleSubmit}>Save</Button>
					</Box>
				</div>
			</div>
	</div>
}

export default DietAndMetrics;