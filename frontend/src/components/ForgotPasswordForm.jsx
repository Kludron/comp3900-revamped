import React from "react";
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

/* Forgot Password Form */
function ForgotPasswordForm({submit}) {

	const onSubmit = () => {
    submit(email);
  }
	const [email, setEmail] = React.useState('');


	return (<>
    <TextField
      margin="normal"
      required
      halfwidth="true"
      id="email"
      label="Email Address"
      name="email"
      onChange={e => setEmail(e.target.value)}
    />
		<Button
      sx={{ mt: 3, mb: 2 }}
      id='login'
      variant="contained" onClick={onSubmit}>Log in
    </Button>
	</>)
}

export default ForgotPasswordForm;
