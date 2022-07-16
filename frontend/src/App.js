import './App.css';
import React from 'react';
import { 
  BrowserRouter, 
  Routes, 
  Route } from 'react-router-dom';

import Login from './pages/Login';
import Welcome from './pages/Welcome';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Favourite from './pages/Favourite';
import DietAndMetrics from './pages/DietAndMetrics';
import MyRecipes from './pages/MyRecipes';
import Setting from './pages/Setting';
import ForgotPassword from './pages/ForgotPassword';
import ChangePassword from './pages/ChangePassword';
import Recipe from './pages/Recipe';

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route exact path='/' element={<Welcome />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/dashboard' element={<Dashboard />} />
          <Route path='/profile' element={<Profile />} />
          <Route path='/favourite' element={<Favourite />} />
          <Route path='/dietAndMetrics' element={<DietAndMetrics />} />
          <Route path='/myRecipes' element={<MyRecipes />} />
          <Route path='/setting' element={<Setting />} />
          <Route path='forgot-password' element={<ForgotPassword />} />
          <Route path='/change-password' element={<ChangePassword />} />
          <Route path='/view/recipe/:recipeID' element={<Recipe />} />
        </Routes>
      </BrowserRouter>
    </>
  )

}

export default App;
