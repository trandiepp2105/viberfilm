import React from "react";
import "./SearchPage.scss";
import "../../styles/style.scss";
import MovieSliderItem from "../../components/MovieSliderItem/MovieSliderItem";
import { Link } from "react-router-dom";
const SearchPage = () => {
  const movie = {
    title: "Hustler vs Scammer",
    img: "https://occ-0-64-325.1.nflxso.net/dnm/api/v6/Qs00mKCpRvrkl3HZAN5KwEL1kpE/AAAABUtHQFwgOyYI1CtdDjo8IqD-_nEYntMHAmO1IMBBRTT3ZitmzvHDXoeHMW33oVAWs93uIZ1TAyLuUA3C4FOeTOZEizppSaKwqMA.jpg?r=5ce",
  };
  return (
    <div className="page search-page">
      <div>
        <div className="search-video-gallery">
          {Array(25)
            .fill()
            .map((_, i) => (
              <div className="slider-item-container">
                <MovieSliderItem movie={movie} />
              </div>
            ))}
        </div>
        <div className="pagination-indicator">
          <span className="handle-prev">
            <svg
              //   fill="#000000"
              width="15px"
              height="15px"
              viewBox="0 0 24 24"
              id="previous"
              data-name="Flat Color"
              xmlns="http://www.w3.org/2000/svg"
              class="icon flat-color"
            >
              <g id="SVGRepo_bgCarrier" stroke-width="0" />

              <g
                id="SVGRepo_tracerCarrier"
                stroke-linecap="round"
                stroke-linejoin="round"
              />

              <g id="SVGRepo_iconCarrier">
                <path
                  id="primary"
                  d="M17.45,2.11a1,1,0,0,0-1.05.09l-12,9a1,1,0,0,0,0,1.6l12,9a1,1,0,0,0,1.05.09A1,1,0,0,0,18,21V3A1,1,0,0,0,17.45,2.11Z"
                  //   style="fill: #fff;"
                  style={{ fill: "#ffffff" }}
                />
              </g>
            </svg>
          </span>
          <span className="current-page">1</span>
          <Link to="/movie/1" className="inactive">
            2
          </Link>
          <Link to="/movie/1" className="inactive">
            3
          </Link>
          <Link to="/movie/1" className="inactive">
            4
          </Link>
          <span className="handle-next">
            <svg
              fill="#000000"
              width="15px"
              height="15px"
              viewBox="0 0 24 24"
              id="previous"
              data-name="Flat Color"
              xmlns="http://www.w3.org/2000/svg"
              class="icon flat-color"
              style={{ transform: "rotate(180deg)" }}
            >
              <g id="SVGRepo_bgCarrier" stroke-width="0" />

              <g
                id="SVGRepo_tracerCarrier"
                stroke-linecap="round"
                stroke-linejoin="round"
              />

              <g id="SVGRepo_iconCarrier">
                <path
                  id="primary"
                  d="M17.45,2.11a1,1,0,0,0-1.05.09l-12,9a1,1,0,0,0,0,1.6l12,9a1,1,0,0,0,1.05.09A1,1,0,0,0,18,21V3A1,1,0,0,0,17.45,2.11Z"
                  //   style="fill: #fff;"
                  style={{ fill: "#ffffff" }}
                />
              </g>
            </svg>
          </span>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
