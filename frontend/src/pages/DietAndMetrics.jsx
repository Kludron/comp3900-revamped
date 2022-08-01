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

function DietAndMetrics() {

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

	const navigate = useNavigate();
	const previous = () => {
		navigate('/dashboard');
	};

	function valuetext(value) {
		return `${value}cal`;
	}

	const handleChangeDaily = (event, value) => {
		if (typeof value === 'number'){
			setCalorieIntakeDaily(value);
		}
	};

	const handleChangeWeekly = (event, value) => {
		if (typeof value === 'number'){
			setCalorieIntakeWeekly(value);
		}
	};
	
	const token = localStorage.getItem('token');

	const [caloricIntakeDaily, setCalorieIntakeDaily] = React.useState(1900);
	const [caloricIntakeWeekly, setCalorieIntakeWeekly] = React.useState(12600);

	const handleSubmit = async () => {
		var today = new Date();
		var date = today.getDate()+'/'+(today.getMonth()+1)+'/'+today.getFullYear();
		if(isWeekly){
			const body = {
				goal: caloricIntakeWeekly,
				timeframe: 'Weekly',
				date: date
			};
			console.log(body);
			let headers = {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${token}`
			};
			const response = await axios.post("http://localhost:5000/setGoal", headers, body);
			console.log(response);
		} else {
			const body = {
				goal: caloricIntakeDaily,
				timeframe: 'Daily',
				date: date
			};
			console.log(body);
			let headers = {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${token}`
			};
			const response = await axios.post("http://localhost:5000/setGoal", headers, body);
			console.log(response);
		}
	}

	const [checked, setChecked] = React.useState(true);
	const [isWeekly, setisWeekly] = React.useState(true);

	const handleSwitchChange = (event) => {
		console.log(event.target.checked);
		setChecked(event.target.checked);
		setisWeekly(event.target.checked);
  };

	const recommend = async () => {
		let headers = {
			"Authorization": `Bearer ${token}`
		};
		axios.get('http://localhost:5000/recommend')
		.then((response) => {
			console.log(response);
		}).catch((err) => {
			alert(err);
		})
	}

	const intakeOverview = async () => {
		let headers = {
			"Authorization": `Bearer ${token}`
		};
		axios.get('http://localhost:5000/intake_overview')
		.then((response) => {
			console.log(response);
		}).catch((err) => {
			alert(err);
		})
	}

	React.useEffect(() => {
		recommend();
		intakeOverview();
	}, []);

	return <div className="wrapper">
			<NavBar/>
			<div className="main-content">
				<button onClick={previous}>Go Back</button>
				<h1 className="title">Diet/Metrics</h1>
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
								variant='outlined'
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
								variant='outlined'
								onClick={handleSubmit}>Save</Button>
						</Box>
					}
				</div>
				<div className='recommend_section'>
					<h2>Recommendations</h2>
				</div>
				<div className='intakeoverview_section'>
					<h2>Intake Overview</h2>
				</div>
			</div>
	</div>
}

export default DietAndMetrics;