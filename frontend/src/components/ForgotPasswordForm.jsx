import React from "react";
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

/* Forgot Password Form */
function ForgotPasswordForm({submit}) {

  //Submits the parameters below through ForgotPasswordForm
	const onSubmit = () => {
    submit(email);
  }

  //Store state variables
	const [email, setEmail] = React.useState('');

	return (<>
    <TextField
      sx={{width:400}}
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
      variant="contained" onClick={onSubmit}>Reset
    </Button>
	</>)
}

export default ForgotPasswordForm;
