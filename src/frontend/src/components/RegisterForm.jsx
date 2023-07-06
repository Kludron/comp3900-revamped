import React from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import { TextField } from '@mui/material';

/* Register Form Component */
function RegisterForm ({ submit }) {

  //Store state variables
  const [email, setEmail] = React.useState('');
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [repassword, setRepassword] = React.useState('');

  //Submits the parameters below through RegisterForm
  const onSubmit = () => {
    submit(email, username, password, repassword);
  }

  return (<>
    <TextField
      margin="normal"
      required
      fullwidth="true"
      id="email"
      label="Email Address"
      name="email"
      onChange={e => setEmail(e.target.value)}
    />
    <TextField
      margin="normal"
      required
      fullwidth="true"
      id="username"
      label="Username"
      name="username"
      onChange={e => setUsername(e.target.value)}
    />
    <TextField
      margin="normal"
      required
      fullwidth="true"
      name="password"
      label="Password"
      type="password"
      id="password"
      onChange={e => setPassword(e.target.value)}
    />
    <TextField
      margin="normal"
      required
      fullwidth="true"
      name="repassword"
      id="repassword"
      type="password"
      label="Re-type Password"
      onChange={e => setRepassword(e.target.value)}
    />
    <Button variant="contained"
      sx={{ mt: 3, mb: 2 }}
      type="submit"
      id="register"
      onClick={onSubmit}>Register</Button>
  </>)
}

RegisterForm.propTypes = {
  submit: PropTypes.elementType
}

export default RegisterForm;
