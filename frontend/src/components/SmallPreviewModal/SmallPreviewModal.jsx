import React, { useRef, useContext } from "react";
import "./SmallPreviewModal.scss";
import { AppContext } from "../../App";
import { useNavigate } from "react-router-dom";

const SmallPreviewModal = ({
  className,
  movie,
  sliderPosition,
  isHovered,
  setIsHovered,
  resetZIndex,
  slideIndex,
}) => {
  const navigate = useNavigate();  const goToWatchPage = () => {
    if (!movie || (!movie.id && !movie.slug)) {
      console.error("Movie data is not available");
      return;
    }

    // Determine URL based on content type
    if (movie.content_type === "movie") {
      navigate(`/watch/movie/${movie.slug}`);
    } else if (movie.content_type === "series") {
      navigate(`/watch/series/${movie.slug}?episode=1`);
    } else {
      // Fallback for backward compatibility
      console.warn("Unknown content type, defaulting to movie");
      navigate(`/watch/movie/${movie.slug || movie.id}`);
    }
  };
  const { setPreviewMovie } = useContext(AppContext);
  const tags = ["Action", "Adventure", "Sci-Fi"];
  const componentRef = useRef(null);

  const handleOpenPreviewModal = () => {
    setPreviewMovie({
      isOpen: true,
      movie: movie,
    });
  };
  const handleMouseLeave = (event) => {
    if (isHovered) {
      // Chỉ chạy nếu đã di chuột vào
      setIsHovered(false); // Đánh dấu đã đưa chuột ra ngoài
      resetZIndex();
    }
  };
  return sliderPosition ? (
    <div
      className={`small-preview-modal ${className}`}
      ref={componentRef}
      onMouseLeave={handleMouseLeave}
      style={{
        position: "fixed",
        width: `${sliderPosition.width * 1.3}px`,
        top: 0,
        left:
          (sliderPosition.right / window.innerWidth) * 100 >= 94
            ? `${
                slideIndex *
                  ((window.innerWidth - window.innerWidth * 0.08) * 0.2) -
                slideIndex * 2.5 -
                (window.innerWidth - window.innerWidth * 0.08) * 0.06 +
                2.5
              }px`
            : `${
                slideIndex *
                  ((window.innerWidth - window.innerWidth * 0.08) * 0.2) -
                slideIndex * 2.5
              }px`,
        transform:
          (sliderPosition.left / window.innerWidth) * 100 <= 5
            ? `translate(0, -25%)`
            : (sliderPosition.right / window.innerWidth) * 100 >= 94
            ? `translate(0, -25%)`
            : `translate(-12.5%, -25%)`,
      }}
    >
      <div>
        <div className="image-wrapper">
          <img
            src={
              movie.banner_img_url ||
              "https://occ-0-58-64.1.nflxso.net/dnm/api/v6/Qs00mKCpRvrkl3HZAN5KwEL1kpE/AAAABdooux6TG8BM4ZrfzBAdgS6Uu7U3WZQt1Yql4STgFuz5q-yxiT_zasNUA1yzVy-40r57TGHRtSnrAWVEXJKzWKwyS7tKyPYI9aKDPcDFAZt1eGAeTY-WZdxiL3rrhjPFIKwl.jpg?r=ea6"
            }
            alt=""
          />
        </div>
        <div className="small-preview-modal-content">
          <div className="controller">
            {" "}
            <button className="play-movie-btn" onClick={goToWatchPage}>
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
              {/* Check icon */}
              {/* <svg
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
                    d="M4 12.6111L8.92308 17.5L20 6.5"
                    stroke="#ffffff"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />{" "}
                </g>
              </svg> */}

              {/* Heart icon */}
              {/* <svg
                className="heart-icon"
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
                    d="M2 9.1371C2 14 6.01943 16.5914 8.96173 18.9109C10 19.7294 11 20.5 12 20.5C13 20.5 14 19.7294 15.0383 18.9109C17.9806 16.5914 22 14 22 9.1371C22 4.27416 16.4998 0.825464 12 5.50063C7.50016 0.825464 2 4.27416 2 9.1371Z"
                    fill="#df5756"
                  />{" "}
                </g>
              </svg> */}
            </button>
            <button className="like-btn">
              {/* <svg
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
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M15.9 4.5C15.9 3 14.418 2 13.26 2c-.806 0-.869.612-.993 1.82-.055.53-.121 1.174-.267 1.93-.386 2.002-1.72 4.56-2.996 5.325V17C9 19.25 9.75 20 13 20h3.773c2.176 0 2.703-1.433 2.899-1.964l.013-.036c.114-.306.358-.547.638-.82.31-.306.664-.653.927-1.18.311-.623.27-1.177.233-1.67-.023-.299-.044-.575.017-.83.064-.27.146-.475.225-.671.143-.356.275-.686.275-1.329 0-1.5-.748-2.498-2.315-2.498H15.5S15.9 6 15.9 4.5zM5.5 10A1.5 1.5 0 0 0 4 11.5v7a1.5 1.5 0 0 0 3 0v-7A1.5 1.5 0 0 0 5.5 10z"
                    fill="#fff"
                  />
                </g>
              </svg> */}
              <svg
                className="comment-icon"
                width="25px"
                height="25px"
                viewBox="0 -0.5 25 25"
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
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M5.5 12.9543C5.51239 14.0398 5.95555 15.076 6.73197 15.8348C7.50838 16.5936 8.55445 17.0128 9.64 17.0003H10.2L11.86 18.7323C12.0291 18.9036 12.2598 19 12.5005 19C12.7412 19 12.9719 18.9036 13.141 18.7323L14.8 17.0003H15.36C16.4456 17.0128 17.4916 16.5936 18.268 15.8348C19.0444 15.076 19.4876 14.0398 19.5 12.9543V8.04428C19.4731 5.7845 17.6198 3.97417 15.36 4.00028H9.64C7.38021 3.97417 5.5269 5.7845 5.5 8.04428V12.9543Z"
                    stroke="#fff"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />{" "}
                  <path
                    d="M9.5 8.25024C9.08579 8.25024 8.75 8.58603 8.75 9.00024C8.75 9.41446 9.08579 9.75024 9.5 9.75024V8.25024ZM15.5 9.75024C15.9142 9.75024 16.25 9.41446 16.25 9.00024C16.25 8.58603 15.9142 8.25024 15.5 8.25024V9.75024ZM9.5 11.2502C9.08579 11.2502 8.75 11.586 8.75 12.0002C8.75 12.4145 9.08579 12.7502 9.5 12.7502V11.2502ZM15.5 12.7502C15.9142 12.7502 16.25 12.4145 16.25 12.0002C16.25 11.586 15.9142 11.2502 15.5 11.2502V12.7502ZM9.5 9.75024H15.5V8.25024H9.5V9.75024ZM9.5 12.7502H15.5V11.2502H9.5V12.7502Z"
                    fill="#fff"
                  />{" "}
                </g>
              </svg>
            </button>
            <button
              className="show-detail-btn"
              onClick={handleOpenPreviewModal}
            >
              <svg
                width="30px"
                height="30px"
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
                    d="M5.70711 9.71069C5.31658 10.1012 5.31658 10.7344 5.70711 11.1249L10.5993 16.0123C11.3805 16.7927 12.6463 16.7924 13.4271 16.0117L18.3174 11.1213C18.708 10.7308 18.708 10.0976 18.3174 9.70708C17.9269 9.31655 17.2937 9.31655 16.9032 9.70708L12.7176 13.8927C12.3271 14.2833 11.6939 14.2832 11.3034 13.8927L7.12132 9.71069C6.7308 9.32016 6.09763 9.32016 5.70711 9.71069Z"
                    fill="#fff"
                  />{" "}
                </g>
              </svg>
            </button>
          </div>
          <div className="preview-meta-data">
            <div className="general-info">
              <span class="maturity-rating">
                <span class="maturity-number">{movie.age_rank || "13 +"}</span>
              </span>
              <span className="duration">2h 11m</span>
              <span class="player-feature-badge">HD</span>
            </div>
            <div className="tags">
              {tags.map((tag, index) => (
                <>
                  <span key={index} className="tag">
                    {tag}
                  </span>
                  {index !== tags.length - 1 && (
                    <span className="separator"></span>
                  )}
                </>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div></div>
  );
};

export default SmallPreviewModal;
