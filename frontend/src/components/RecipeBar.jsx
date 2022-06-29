import React, { useState } from 'react';
import './componentstyle.css';
  
function RecipeBar () {
  const [searchInput, setSearchInput] = useState("");
  
  return <div>
  <input
    className="recipebar"
    type="search"
    placeholder="Search for Recipes..."
    onChange={e => setSearchInput(e.target.value)}
    value={searchInput}
    style={{marginTop: 10}} />
  </div>
}

export default RecipeBar;