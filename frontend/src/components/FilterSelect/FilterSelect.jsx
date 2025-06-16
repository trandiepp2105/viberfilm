import React, { useState } from "react";
import "./FilterSelect.scss";
const FilterSelect = ({ width = 120, options = ["Latest", "Oldest"] }) => {
  const [sort, setSort] = useState(options[0]);
  const handleChange = (event, option) => {
    event.stopPropagation();
    setSort(option);
  };

  const [onSelect, setOnSelect] = useState(false);
  const handleSelect = () => {
    setOnSelect(!onSelect);
  };

  return (
    <div className="form-control" style={{ width: width }}>
      <div
        className={`select-container ${onSelect ? "on-select" : ""}`}
        onClick={handleSelect}
      >
        <svg
          className="dropdown-icon"
          fill="#fff"
          width="15px"
          height="15px"
          viewBox="-6.5 0 32 32"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          stroke="#fff"
        >
          <g id="SVGRepo_bgCarrier" stroke-width="0" />

          <g
            id="SVGRepo_tracerCarrier"
            stroke-linecap="round"
            stroke-linejoin="round"
          />

          <g id="SVGRepo_iconCarrier">
            {" "}
            <title>dropdown</title>{" "}
            <path d="M18.813 11.406l-7.906 9.906c-0.75 0.906-1.906 0.906-2.625 0l-7.906-9.906c-0.75-0.938-0.375-1.656 0.781-1.656h16.875c1.188 0 1.531 0.719 0.781 1.656z" />{" "}
          </g>
        </svg>
        {/* <span className="label">Sort</span> */}
        <span className="current-value">{sort}</span>

        <div className="list-option">
          {options.map((option, index) => (
            <div
              className={`option ${sort === option ? "active" : ""}`}
              onClick={(event) => {
                handleChange(event, option);
              }}
              value={option}
              key={index}
            >
              {option}
            </div>
          ))}
          {/* <div className="option" onClick={handleChange} value="Latest">
            Latest
          </div>
          <div className="option" onClick={handleChange} value="Oldest">
            Oldest
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default FilterSelect;
