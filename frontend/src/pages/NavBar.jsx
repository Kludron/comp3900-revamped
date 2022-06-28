import { useMatch, useResolvedPath, Link } from 'react-router-dom';
import './NavBar.css'

function NavBar() {
  return <div>
  <ul
    style={{
      listStyleType: 'none',
      margin: 0,
      padding: 0,
      width: '15%',
      position: 'fixed',
      height: '100%',
      overflow: 'auto',
    }}
    >
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

  return <li className={ ifActive ? 'currentTag' : '' }>
    <Link to={ to } { ...props }>
      { children }
    </Link>
  </li>
}