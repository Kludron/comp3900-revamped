import React from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import { TextField } from '@mui/material';

/* Register Form Component */
function RegisterForm ({ submit }) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [name, setName] = React.useState('');

  const onSubmit = () => {
    submit(email, password, name);
  }
  return (<>
    <TextField
      margin="normal"
      required
      fullwidth
      id="email"
      label="Email Address"
      name="email"
      onChange={e => setEmail(e.target.value)}
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
      name="name"
      id="name"
      label="Name"
      onChange={e => setName(e.target.value)}
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
