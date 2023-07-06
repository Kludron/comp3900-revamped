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
import ChangeUsername from './pages/ChangeUsername';
import Comments from './pages/Comments';
import Recipe from './pages/Recipe';
import CreateRecipe from './pages/CreateRecipe';
import EditRecipe from './pages/EditRecipe';

/* App.js Routes */
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
          <Route path='/change-username' element={<ChangeUsername />} />
          <Route path='/view/recipe/:recipeid' element={<Recipe />} />
          <Route path='/create-recipe' element={<CreateRecipe />} />
          <Route path='/view/recipe/:recipeid/comments' element={<Comments />} />
          <Route path='/myRecipes/edit/:recipeid' element={<EditRecipe />} />
        </Routes>
      </BrowserRouter>
    </>
  )

}

export default App;
