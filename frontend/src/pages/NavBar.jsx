import { useMatch, useResolvedPath, Link } from 'react-router-dom';
import './NavBar.css';
import React from 'react';

function NavBar() {
  return <div>
  <ul className='navBar'>
      <CustomLink to='/profile'>Profile</CustomLink>
      <CustomLink to='/favourite'>Favourite Recipes</CustomLink>
      <CustomLink to='/dietAndMetrics'>Diet/Metrics Page</CustomLink>
      <CustomLink to='/myRecipes'>My Recipes</CustomLink>
      <CustomLink to='/setting'>Setting/Connect</CustomLink>
    </ul> 
  </div>
}

export default NavBar;

function CustomLink( {to, children, ...props }) {
  const resolvedPath = useResolvedPath(to)
  const ifActive = useMatch( {path: resolvedPath.pathname} )

  return <li className={ ifActive ? 'active' : '' }>
    <Link to={ to } { ...props }>
      { children }
    </Link>
  </li>
}