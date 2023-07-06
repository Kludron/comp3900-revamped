import React from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

/* Change Username Form */
function ChangeUsernameForm ({ submit }) {
	
	//Store state variable
	const [newUsername, setNewUsername] = React.useState('');
	
	//Submits the parameters below through ChangeUsernameForm
	const onSubmit = () => {
		submit(newUsername);
	}

	return (<>
		<TextField
			sx={{ width: 300}}
			margin="normal"
			required
			halfwidth="true"
			label="New Username"
			onChange={e => setNewUsername(e.target.value)}
		/>
		<Button
			sx={{ mt: 3, mb: 2 }}
			id='login'
			size="large"
			variant="contained" onClick={onSubmit}>Submit
		</Button>
	</>)

}

ChangeUsernameForm.propTypes = {
  submit: PropTypes.elementType
}

export default ChangeUsernameForm;