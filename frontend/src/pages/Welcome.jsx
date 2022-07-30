import { Link } from 'react-router-dom';
import React from 'react';
import './Welcome.css';

/* Welcome Page */
function Welcome () {
  localStorage.clear();
  return <>
  <main className="welcome-screen">
    <div>
      <h1>Welcome to F1V3GUY5</h1>
    </div>
    <div className="signuplogin-btn">
      <div className="left">
        <Link to='/register'>Sign up</Link>
      </div>
      <div className="space"></div>
      <div className="right">
        <Link to='/dashboard'>Continue as Guest</Link>
      </div>
      <div className="space"></div>
      <div className="right">
        <Link to='/login'>Log in</Link>
      </div>

    </div>
  </main>
  </>;
}

export default Welcome;
