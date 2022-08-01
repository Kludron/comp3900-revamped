import React from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

/* Change Password Form */
function ChangePasswordForm ({ submit }) {
	const [newpassword, setNewPassword] = React.useState('');
	const [repassword, setRePassword] = React.useState('');

	const onSubmit = () => {
		submit(newpassword, repassword);
	}

    /*Possible indentation error*/
		return (<>
			<TextField
				margin="normal"
				required
				halfwidth="true"
				label="New Password"
				type="password"
				onChange={e => setNewPassword(e.target.value)}
			/>
			<TextField
				margin="normal"
				required
				halfwidth="true"
				label="Re-type Password"
				type="password"
				id="password"
				onChange={e => setRePassword(e.target.value)}
			/><br />
			<Button
				sx={{ mt: 3, mb: 2 }}
				id='changepasswordbtn'
				variant="contained" onClick={onSubmit}>Submit
			</Button>
		</>)
}

ChangePasswordForm.propTypes = {
  submit: PropTypes.elementType
}

export default ChangePasswordForm;
