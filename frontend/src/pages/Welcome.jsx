import { useNavigate } from 'react-router-dom';
import React from 'react';
import './Welcome.css';
import Logo from '../img/logo.jpg';
import Landing from '../img/landing.jfif';
import Button from '@mui/material/Button';
import Shape from '../img/shape.png';

/* Welcome Page */
function Welcome () {

  //Clear localstorage
  localStorage.clear();

  //React navigation functions
  const navigate = useNavigate();
  const Guest = () => {
    navigate('/dashboard');
  };
  const signup = () => {
    navigate('/login');
  };
  const register = () => {
    navigate('/register');
  };

  return <>
  <body>
    <main className="welcome-screen">
      <div className="big-wrapper light">
        <img src={Shape} alt="" className="shape"></img>
        <img src={Shape} alt="" className="shape2"></img>
        <header>
          <div className="container">
            <div className="logo">
              <img src={Logo} alt="Logo" />
              <h3>F1V3GUY5 Recipe Recommendation System</h3>
            </div>
            <div className="links">
              <ul>
                <li><Button variant="contained" onClick={register}>Sign Up</Button></li>
                <li><Button variant="contained" onClick={signup}>Log In</Button></li>
              </ul>
            </div>
            <div className="overlay"></div>
            <div className="hamburger-menu">
              <div className="bar"></div>
            </div>
          </div>
        </header>
        <div className="showcase-area">
          <div className="container">
            <div className="left">
              <div className="big-title">
                <h1>Recipes in abundance,</h1>
                <h1>Start Cooking Now.</h1>
              </div>
              <p className="text">
                Welcome to our Recipe Recommendation System, brought to you by the team from F1V3GUY5 at COMP3900. You can continue as guest to enjoy the basic functionalities of our webpage but we recommend signing up to enjoy the full experience!
              </p>
              <div className="cta">
                <Button variant="contained" onClick={Guest}>Continue As Guest</Button>
              </div>
            </div>
            <div className="right">
              <img src={Landing} alt="Landing" className="food" />
            </div>
          </div>
        </div>
      </div>
    </main>
  </body>
  </>;
}

export default Welcome;
