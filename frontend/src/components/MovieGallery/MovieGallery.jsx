import React, { useState, useEffect } from "react";
import "./MovieGallery.scss";
import { Link } from "react-router-dom";
import MovieSliderItem from "../MovieSliderItem/MovieSliderItem";
const MovieGallery = ({ genre, listMovie, canExpand = true }) => {
  const [curentPage, setCurentPage] = useState(1);
  const handleNext = (e) => {
    e.preventDefault();
    if (listMovie.length > 6 && curentPage < Math.ceil(listMovie.length / 5)) {
      setCurentPage(curentPage + 1);
    }
  };

  const handlePrev = (e) => {
    e.preventDefault();
    if (listMovie.length > 6 && curentPage > 1) {
      setCurentPage(curentPage - 1);
    }
  };
  const sliderTransformValue = `-webkit-transform: translate3d(-${
    curentPage * 100
  }%, 0px, 0px);-ms-transform: translate3d(-${
    curentPage * 100
  }%, 0px, 0px);transform: translate3d(-${curentPage * 100}%, 0px, 0px)`;

  return (
    <div className="movie-gallery">
      <div className="gallery-header">
        {canExpand ? (
          <Link to="/browse" className="gallery-title">
            <h2>{genre}</h2>
            <div className="more-visible">
              <div className="see-all-link">Explore All</div>
              <svg
                width="20px"
                height="20px"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g id="SVGRepo_bgCarrier" stroke-width="0" />

                <g
                  id="SVGRepo_tracerCarrier"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />

                <g id="SVGRepo_iconCarrier">
                  {" "}
                  <path
                    d="M10 16L14 12L10 8"
                    stroke="#54b9c5"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />{" "}
                </g>
              </svg>
            </div>
          </Link>
        ) : (
          <div className="gallery-title no-expand">
            <h2>{genre}</h2>
          </div>
        )}

        <ul className="pagination-indicator">
          {Array.from({ length: Math.ceil(listMovie.length / 5) }).map(
            (_, index) => (
              <li className={curentPage === index + 1 ? "active" : ""}></li>
            )
          )}
        </ul>
      </div>
      <div className="gallery-container">
        <div className="gallery-inner">
          <div className="slider">
            <button
              className={`handle handle-prev ${curentPage > 1 ? "active" : ""}`}
              onClick={(e) => {
                if (curentPage > 1) {
                  handlePrev(e);
                }
              }}
            >
              <b className="indicator-icon">
                <svg
                  width="50px"
                  height="50px"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g id="SVGRepo_bgCarrier" stroke-width="0" />

                  <g
                    id="SVGRepo_tracerCarrier"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />

                  <g id="SVGRepo_iconCarrier">
                    {" "}
                    <path
                      d="M10 7L15 12L10 17"
                      stroke="#ffffff"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />{" "}
                  </g>
                </svg>
              </b>
            </button>
            <div className="slider-mask">
              <div
                className="slider-content"
                style={{
                  transform: `translate3d(-${
                    (curentPage - 1) * 100
                  }%, 0px, 0px)`,
                }}
              >
                {listMovie.map((movie, index) => (
                  <div className="slider-item-container">
                    <MovieSliderItem slideIndex={index} movie={movie} />
                  </div>
                ))}
              </div>
            </div>
            <button
              className={`handle handle-next ${
                curentPage < Math.ceil(listMovie.length / 5) ? "active" : ""
              }`}
              onClick={(e) => {
                if (curentPage < Math.ceil(listMovie.length / 5)) {
                  handleNext(e);
                }
              }}
            >
              <b className="indicator-icon">
                <svg
                  width="50px"
                  height="50px"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g id="SVGRepo_bgCarrier" stroke-width="0" />

                  <g
                    id="SVGRepo_tracerCarrier"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />

                  <g id="SVGRepo_iconCarrier">
                    {" "}
                    <path
                      d="M10 7L15 12L10 17"
                      stroke="#ffffff"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />{" "}
                  </g>
                </svg>
              </b>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieGallery;
