import './App.css';
import React from 'react';
import { 
  BrowserRouter, 
  Routes, 
  Route } from 'react-router-dom';

import Login from './pages/Login';
import Welcome from './pages/Welcome';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route exact path='/' element={<Welcome />} />
          <Route path='login' element={<Login />} />
          <Route path='register' element={<Register />} />
          <Route path='forgot-password' element={<ForgotPassword />} />
        </Routes>
      </BrowserRouter>
    </>
  )

}

export default App;
