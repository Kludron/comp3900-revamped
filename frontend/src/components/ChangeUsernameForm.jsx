import React from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

function ChangeUsernameForm ({ submit }) {
	const [newUsername, setNewUsername] = React.useState('');
	

	const onSubmit = () => {
			submit(newUsername);
		}

		return (<>
			<TextField
				margin="normal"
				required
				halfwidth="true"
				label="New Username"
				type="password"
				onChange={e => setNewUsername(e.target.value)}
			/>
			<br />
			<Button
				sx={{ mt: 3, mb: 2 }}
				id='login'
				variant="contained" onClick={onSubmit}>Submit
			</Button>
		</>)

}

ChangeUsernameForm.propTypes = {
  submit: PropTypes.elementType
}

export default ChangeUsernameForm;