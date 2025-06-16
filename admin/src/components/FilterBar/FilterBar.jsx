import React from "react";
import "./FilterBar.scss";

const FilterBar = () => {
    return (
        <div className="filter-bar-container">
            <img className="filter-icon" src="/assets/icons/filter.png" alt="Filter Icon" />
            <input className="filter-input" type="text" placeholder="Filter" />
        </div>
    )
}

export default FilterBar;