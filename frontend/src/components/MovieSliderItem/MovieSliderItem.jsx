import React, { useState, useRef } from "react";
import "./MovieSliderItem.scss";
import { Link } from "react-router-dom";
import SmallPreviewModal from "../SmallPreviewModal/SmallPreviewModal";

import { useNavigate } from "react-router-dom";

const MovieSliderItem = ({ movie, slideIndex }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [sliderPosition, setSliderPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  });
  const sliderItemRef = useRef(null); // Tạo ref cho slider-item

  // const handleMouseEnter = () => {
  //   setIsHovered(true);
  //   const rect = sliderItemRef.current.getBoundingClientRect();
  //   setSliderPosition({
  //     top: rect.top,
  //     left: rect.left,
  //     width: rect.width,
  //     height: rect.height,
  //   });
  //   // const parentElement = sliderItemRef.current.closest(".movie-gallery");
  //   // if (parentElement) {
  //   //   parentElement.style.zIndex = 100;
  //   // }
  // };

  const resetZIndex = () => {
    const parentElement = sliderItemRef.current.closest(".movie-gallery");
    if (parentElement) {
      parentElement.style.zIndex = ""; // Xoá z-index đã thay đổi
    }
  };

  const handleMouseEnter = (event) => {
    if (!isHovered) {
      setCurrentSlideIndex(slideIndex);
      const parentElement = sliderItemRef.current.closest(".movie-gallery");
      if (parentElement) {
        parentElement.style.zIndex = 1000;
      }

      const rect = event.target.getBoundingClientRect();
      setSliderPosition({
        top: rect.top,
        left: rect.left,
        right: rect.right,
        width: rect.width,
        height: rect.height,
      });
      // Chỉ chạy nếu chưa có sự kiện di chuột vào trước đó
      setIsHovered(true); // Đánh dấu đã di chuột vào
    }
  };

  // const handleMouseLeave = (event) => {
  //   if (isHovered) {
  //     // Chỉ chạy nếu đã di chuột vào
  //     setIsHovered(false); // Đánh dấu đã đưa chuột ra ngoài
  //   }
  // };


  const navigate = useNavigate();
  const goToDetailPage = (movie) => {
    if (!movie.content || !movie.content.id) {
      console.error("Movie ID is not available");
      return;
    }

    if(movie.content.content_type === "movie") {
      navigate(`/movies/${movie.content.slug}`);
    } else if (movie.content.content_type === "series") {
      navigate(`/series/${movie.content.slug}`);
    }
  };
  return (
    <>
      {isHovered && (
        <SmallPreviewModal
          movie={movie}
          className="show"
          sliderPosition={sliderPosition}
          setIsHovered={setIsHovered}
          isHovered={isHovered}
          resetZIndex={resetZIndex}
          slideIndex={currentSlideIndex}
        />
      )}

      <div className="slider-item">
        {/* <SmallPreviewModal /> */}
        <div
          className="title-card"
          ref={sliderItemRef}
          onClick={() => {
            goToDetailPage(movie);
          }}
          // onMouseEnter={(e) => {
          //   handleMouseEnter(e);
          // }}
          // onMouseLeave={(e) => {
          //   handleMouseLeave(e);
          // }}
          // onMouseOver={handleMouseOver}
          // onMouseOut={handleMouseOut}
        >
          <span className="wrapper-play-icon">
            <svg
            width="15px"
            height="15px"
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
                fill="#f14c47"
              />{" "}
            </g>
          </svg>
          </span>
          <Link  className="slider-focus">
            <img
              src={
                movie.content?.poster_img_url ||
                "https://image.tmdb.org/t/p/original//qJ2tW6WMUDux911r6m7haRef0WH.jpg"
              }
              alt=""
            />
          </Link>
        </div>        <h4 className="slider-movie-title">
          {movie.content?.title ||
          "No title available"}
        </h4>
      </div>
    </>
  );
};

export default MovieSliderItem;
