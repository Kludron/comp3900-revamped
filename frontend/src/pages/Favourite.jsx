import NavBar from "./NavBar";
import React from 'react';
import './Favourite.css';
import Heart from 'react-heart'

/* Favourite Recipes Page */
function Favourite() {
    return <div>
			<NavBar/>
        <div className="main-content">
            <h2>recipe</h2>
            <BookmarkedRecipe/>
        </div>
    </div>
}

export default Favourite;

function BookmarkedRecipe() {
	return <div className="bookmarked-recipes">
			<div>recipe</div>
			<div className="bookmarked-icon">
					<button >aaaaaa</button>
					<Heart isActive="active"/>
			</div>

	</div>
}