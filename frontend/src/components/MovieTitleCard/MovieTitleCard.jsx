import React from "react";
import "./MovieTitleCard.scss";
const MovieTitleCard = () => {
  return (
    <div className="movie-title-card">
      <div className="image-wrapper">
        <button className="play-movie-btn">
          <svg
            width="25px"
            height="25px"
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
                d="M21.4086 9.35258C23.5305 10.5065 23.5305 13.4935 21.4086 14.6474L8.59662 21.6145C6.53435 22.736 4 21.2763 4 18.9671L4 5.0329C4 2.72368 6.53435 1.26402 8.59661 2.38548L21.4086 9.35258Z"
                fill="#1C274C"
              />{" "}
            </g>
          </svg>
        </button>
        <img
          src="https://occ-0-58-64.1.nflxso.net/dnm/api/v6/Qs00mKCpRvrkl3HZAN5KwEL1kpE/AAAABdooux6TG8BM4ZrfzBAdgS6Uu7U3WZQt1Yql4STgFuz5q-yxiT_zasNUA1yzVy-40r57TGHRtSnrAWVEXJKzWKwyS7tKyPYI9aKDPcDFAZt1eGAeTY-WZdxiL3rrhjPFIKwl.jpg?r=ea6"
          alt=""
        />
      </div>
      <div className="movie-meta-data">
        <div className="general-info">
          <p className="maturity-rating">
            <span className="maturity-number">16 +</span>
          </p>
          <span className="player-feature-badge">HD</span>
          <p className="year">2023</p>
          <div className="controller">
            <button className="add-to-wish-list-btn">
              <svg
                width="25px"
                height="25px"
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
                  <g id="Edit / Add_Plus">
                    {" "}
                    <path
                      id="Vector"
                      d="M6 12H12M12 12H18M12 12V18M12 12V6"
                      stroke="#fff"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />{" "}
                  </g>{" "}
                </g>
              </svg>
            </button>
          </div>
        </div>
        <div className="movie-description">
          <p>
            In this comedy anime show, a former gangster now spends his days as
            a stay-at-home husband.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MovieTitleCard;
