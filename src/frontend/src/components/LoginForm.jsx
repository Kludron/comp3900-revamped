import React from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

/* Login Form Component */
function LoginForm ({ submit }) {

  //Store state variables
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  //Submits the parameters below through LoginForm
  const onSubmit = () => {
    submit(email, password);
  }
  
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
    <TextField
      margin="normal"
      required
      halfwidth="true"
      name="password"
      label="Password"
      type="password"
      id="password"
      onChange={e => setPassword(e.target.value)}
    />
    <Button
      sx={{ mt: 3, mb: 2 }}
      id='login'
      variant="contained" onClick={onSubmit}>Log in
    </Button>
  </>)
}

LoginForm.propTypes = {
  submit: PropTypes.elementType
}

export default LoginForm;
