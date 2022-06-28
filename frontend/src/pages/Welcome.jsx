import { Link } from 'react-router-dom';
import React from 'react';
import { Avatar } from '@mui/material';

/* Welcome Page */
function Welcome () {
  localStorage.clear();
  return <>
    <nav>
      <Link to='/register'>Sign up</Link> |
      <Link to='/login'>Log in</Link> |
      <Link to='/Dashboard'>Continue with Guest</Link>
    </nav>
    <h1>Welcome to F1V3GUY5</h1>
  </>;
}

export default Welcome;
