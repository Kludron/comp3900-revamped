import { useMatch, useResolvedPath, Link } from 'react-router-dom';
import PersonIcon from '@mui/icons-material/Person';
import BookmarksIcon from '@mui/icons-material/Bookmarks';
import EditIcon from '@mui/icons-material/Edit';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import SettingsIcon from '@mui/icons-material/Settings';
import './NavBar.css';
import React from 'react';

/* Side NavBar */
function NavBar() {
  return <div>
    <ul className='navBar'>
      <CustomLink className='CustomLink' to='/profile'>
        <PersonIcon sx={{ fontSize: '10vh', color: 'white' }} className='navBar-icon'/>
        <div className='navBar-text'>Profile</div>
      </CustomLink>
      <CustomLink className='CustomLink' to='/favourite'>
        <BookmarksIcon sx={{ fontSize: '10vh', color: 'white' }} className='navBar-icon'/>
        <div className='navBar-text'>Favourite Recipes</div>
      </CustomLink>
      <CustomLink className='CustomLink' to='/dietAndMetrics'>
        <DirectionsRunIcon sx={{ fontSize: '10vh', color: 'white' }} className='navBar-icon'/>  
        <div className='navBar-text'>Diet/Metrics Page</div>
      </CustomLink>
      <CustomLink className='CustomLink' to='/myRecipes'>
        <EditIcon sx={{ fontSize: '10vh', color: 'white' }} className='navBar-icon'/>
        <div className='navBar-text'>My Recipes</div>
      </CustomLink>
      <CustomLink className='CustomLink' to='/setting'>
        <SettingsIcon sx={{ fontSize: '10vh', color: 'white' }} className='navBar-icon'/>
        <div className='navBar-text'>Setting/Connect</div>
      </CustomLink>
    </ul> 
  </div>
}

export default NavBar;

function CustomLink( {to, children, ...props }) {
  const resolvedPath = useResolvedPath(to)
  const ifActive = useMatch( {path: resolvedPath.pathname} )

  return <li className={ ifActive ? 'active' : '' }>
    <Link style={{ textDecoration: "none"}} to={ to } { ...props }>
      { children }
    </Link>
  </li>
}