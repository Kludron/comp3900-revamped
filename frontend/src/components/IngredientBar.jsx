import React, { useState } from 'react';
  
function IngredientBar () {
  const [searchInput, setSearchInput] = useState("");

  return <div>
  <input
    type="search"
    placeholder="Search here"
    onChange={e => setSearchInput(e.target.value)}
    value={searchInput}
    style={{marginTop: 10}} />
  </div>
}

export default IngredientBar;