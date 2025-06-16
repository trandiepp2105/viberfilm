import React, { useEffect, useContext } from "react";
import "./PreviewModal.scss";
import { Link, useNavigate } from "react-router-dom";
import MovieTitleCard from "../MovieTitleCard/MovieTitleCard";
import { AppContext } from "../../App";

const PreviewModal = () => {
  const navigate = useNavigate();

  const { previewMovie, setPreviewMovie } = useContext(AppContext);

  useEffect(() => {
    document.body.classList.add("no-scroll"); // Vô hiệu hóa cuộn
    return () => {
      document.body.classList.remove("no-scroll"); // Bật lại cuộn khi component bị unmount
    };
  }, []);
  const tags = {
    cast: [
      "Tomokazu Sugita",
      "Nobunaga Shimazaki",
      "Ayane Sakura",
      "Nao Toyama",
      "Yoshimasa Hosoya",
      "Saori Hayami",
      "Hiroky Yasumoto",
    ],
    genres: ["Action Anime", "Anime Series", "Japanese"],
  };

  const handleClosePreviewModal = () => {
    setPreviewMovie((prev) => {
      return {
        ...prev,
        isOpen: false,
      };
    });
  };
  const goToWatchPage = () => {
    if (!previewMovie.movie) {
      console.error("Movie data is not available");
      return;
    }

    // Determine URL based on content type
    if (previewMovie.movie.content_type === 'movie') {
      navigate(`/watch/movie/${previewMovie.movie.slug}`);
    } else if (previewMovie.movie.content_type === 'series') {
      navigate(`/watch/series/${previewMovie.movie.slug}?episode=1`);
    } else {
      // Fallback for backward compatibility
      console.warn("Unknown content type, using fallback URL");
      navigate(`/watch/movie/${previewMovie.movie.slug || previewMovie.movie.id}`);
    }
    
    handleClosePreviewModal();
  };
  return (
    <div className="preview-modal">
      <div className="preview-modal-container">
        <button className="close-btn" onClick={handleClosePreviewModal}>
          <svg
            width="30px"
            height="30px"
            viewBox="0 0 24 24"
            fill="#181818"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
            <g
              id="SVGRepo_tracerCarrier"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></g>
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
                ></path>{" "}
              </g>{" "}
            </g>
          </svg>
        </button>

        <div className="preview-layer">
          <div className="fill-container">
            <div className="movie-logo">
              <img
                src="https://occ-0-64-325.1.nflxso.net/dnm/api/v6/tx1O544a9T7n8Z_G12qaboulQQE/AAAABeOhifQI0dauFUfNDkwTN9VNZ9sfBb8XCwPhXqb9c3bDyrhvPmgKF6WzMq-3TdqfSRrsHlQ6G51VqERtzln2CWh4uxY3MI1QB_y5Gw_u8pZJU-ddtCo0DBfS_rwoOfM-Ue4D_H11659Bm-Bsnd-D4eGuQNwCcxL9Az6veMs35QdfQiUxASjg.png?r=0b2"
                alt=""
              />
            </div>
            <div className="title-progress">
              <span className="progress-bar">
                <span className="presentation"></span>
              </span>
              <span className="sumary">20 of 25m</span>
            </div>
            <div className="controller">
              <button className="play-btn" onClick={goToWatchPage}>
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
                <p>Play</p>
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
              </button>
              <button className="like-btn">
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
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M15.9 4.5C15.9 3 14.418 2 13.26 2c-.806 0-.869.612-.993 1.82-.055.53-.121 1.174-.267 1.93-.386 2.002-1.72 4.56-2.996 5.325V17C9 19.25 9.75 20 13 20h3.773c2.176 0 2.703-1.433 2.899-1.964l.013-.036c.114-.306.358-.547.638-.82.31-.306.664-.653.927-1.18.311-.623.27-1.177.233-1.67-.023-.299-.044-.575.017-.83.064-.27.146-.475.225-.671.143-.356.275-.686.275-1.329 0-1.5-.748-2.498-2.315-2.498H15.5S15.9 6 15.9 4.5zM5.5 10A1.5 1.5 0 0 0 4 11.5v7a1.5 1.5 0 0 0 3 0v-7A1.5 1.5 0 0 0 5.5 10z"
                      fill="#fff"
                    />
                  </g>
                </svg>
              </button>
            </div>
          </div>
          <div className="toggle-audio">
            <button className="toggle-audio-btn">
              <svg
                width="25"
                height="25"
                viewBox="0 0 24 24"
                // xml:space="preserve"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g stroke-width="0" />
                <g stroke-linecap="round" stroke-linejoin="round" />
                <path d="M14.6 4.6c-.9-.6-2.1-.8-3.1-.4-1.1.4-2.1.9-2.9 1.6L6.2 7.6H5c-1.7 0-3 1.3-3 3v2.9c0 1.7 1.3 3 3 3h1.2l2.3 1.8c.9.7 1.9 1.2 2.9 1.6.4.1.8.2 1.2.2.7 0 1.4-.2 2-.6.9-.6 1.4-1.6 1.4-2.7V7.3c0-1.1-.5-2.1-1.4-2.7m-9.1 9.8H5c-.6 0-1-.4-1-1v-2.9c0-.6.4-1 1-1h.5zm8.5 2.3c0 .4-.2.8-.6 1-.4.3-.9.3-1.3.2-.9-.3-1.7-.8-2.4-1.3l-2.2-1.7V9.1l2.2-1.7c.7-.6 1.5-1 2.4-1.3.4-.2.9-.1 1.3.2.3.2.6.6.6 1zm7.4-4.7.7-.7c.4-.4.4-1 0-1.4s-1-.4-1.4 0l-.7.7-.7-.7c-.4-.4-1-.4-1.4 0s-.4 1 0 1.4l.7.7-.7.7c-.4.4-.4 1 0 1.4.2.2.5.3.7.3s.5-.1.7-.3l.7-.7.7.7c.2.2.5.3.7.3s.5-.1.7-.3c.4-.4.4-1 0-1.4z" />
              </svg>
              {/* <svg
              width={25}
              height={25}
              viewBox="0 0 1024 1024"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g id="SVGRepo_bgCarrier" strokeWidth={0} />
              <g
                id="SVGRepo_tracerCarrier"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <g id="SVGRepo_iconCarrier">
                <style>{".st6{fill:#fff}"}</style>
                <g id="ICONS">
                  <path
                    className="st6"
                    d="M545.8 294.7 363.7 431.5c-1.2.9-2 2.1-2.7 3.3H256v154.5h105c.7 1.2 1.6 2.4 2.7 3.3l182.1 136.7c7.2 5.4 17.5.3 17.5-8.7V303.5c0-9-10.3-14.2-17.5-8.8m122.2 397c-8.8 0-17.4-4.5-22.2-12.7-7.1-12.2-3-27.9 9.2-35 2.4-1.4 61.7-38.4 61.7-132 0-95-61.1-131.6-61.7-132-12.2-7.1-16.3-22.8-9.2-35s22.8-16.3 35-9.2c3.7 2 87.2 52.2 87.2 176.2s-83.5 174.2-87.1 176.2c-4.1 2.4-8.5 3.5-12.9 3.5"
                  />
                  <path
                    className="st6"
                    d="M613.2 621.2c-8.8 0-17.4-4.5-22.1-12.7-7.1-12.2-3-27.9 9.2-35 .7-.4 24.6-16 24.6-55.1s-23.9-54.7-25-55.4c-11.8-7.4-15.7-23.1-8.4-35 7.2-12 22.5-16 34.6-9 2 1.2 50 29.9 50 99.4s-48 98.2-50 99.4c-4.1 2.3-8.5 3.4-12.9 3.4"
                  />
                </g>
              </g>
            </svg> */}
            </button>
          </div>
          <div className="static-image">
            <img
              src={
                previewMovie.movie?.img ||
                "https://occ-0-64-325.1.nflxso.net/dnm/api/v6/E8vDc_W8CLv7-yMQu8KMEC7Rrr8/AAAABZsmm8fmutJG4b5ghGDorXr5BRvP0AMcFn64xor0_JEIsVLig8JEYC7qSbzbNvWtKV65l3SnjGtoYoNKSBE-ycRLDyhyUZPmiAqK.jpg?r=d0c"
              }
              alt=""
            />
          </div>
        </div>
        <div className="detail-modal-container">
          <div>
            <div className="detail-meta-data">
              <div className="detail-meta-data--left"></div>
              <div className="detail-meta-data--right">
                <div className="meta-data--tags">
                  <span className="tag-label">Cast:</span>
                  {tags.cast.length > 0 && (
                    <>
                      {tags.cast.slice(0, 3).map((tag, index) => (
                        <Link key={index} className="tag-item">
                          {index === 2 ||
                          index === tags.cast.slice(0, 3).length - 1
                            ? tag
                            : tag + ", "}
                        </Link>
                      ))}
                      {tags.cast.length > 3 && (
                        <Link className="tag-item">, more...</Link>
                      )}
                    </>
                  )}
                </div>
                <div className="meta-data--tags">
                  <span className="tag-label">Genres:</span>
                  {tags.genres.map((tag, index) => (
                    <Link key={index} className="tag-item">
                      {index === tags.genres.length - 1 ? tag : tag + ", "}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div className="episode-selector">
              <div className="episode-selector-header">
                <p>Episodes</p>
                <p>SAKAMOTO DAYS</p>
              </div>
              <div className="episode-item">
                <p className="episode-index">1</p>
                <div className="image-wrapper">
                  <button className="play-episode-btn">
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
                    src="https://occ-0-58-64.1.nflxso.net/dnm/api/v6/9pS1daC2n6UGc3dUogvWIPMR_OU/AAAABeevzghfGVzDULaYPvO8iniWOgOWCgJdUZJRZm6NdGtu47vdRiltjWxoeyMeB_zz8WzqMuwo4pkom81UjAK_62rF9BSMYtmsdf1f5SMSkkc3HZsUvmid3rrd.jpg?r=ef0"
                    alt=""
                  />
                </div>
                <div className="meta-data-wrapper">
                  <div className="title">
                    <p className="episode-name">The Lagendary Hit Man</p>
                    <span className="duration">25m</span>
                  </div>
                  <p className="episode-description">
                    Sakamoto enjoys a quiet life in retirement with his family.
                    But one day, an old colleague demands he return to the
                    assassin world — or face consequences.
                  </p>
                </div>
              </div>
              <div className="episode-item current-episode">
                <p className="episode-index">1</p>
                <div className="image-wrapper">
                  <progress max={1} value={0.8}></progress>
                  <button className="play-episode-btn">
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
                    src="https://occ-0-58-64.1.nflxso.net/dnm/api/v6/9pS1daC2n6UGc3dUogvWIPMR_OU/AAAABeevzghfGVzDULaYPvO8iniWOgOWCgJdUZJRZm6NdGtu47vdRiltjWxoeyMeB_zz8WzqMuwo4pkom81UjAK_62rF9BSMYtmsdf1f5SMSkkc3HZsUvmid3rrd.jpg?r=ef0"
                    alt=""
                  />
                </div>
                <div className="meta-data-wrapper">
                  <div className="title">
                    <p className="episode-name">The Lagendary Hit Man</p>
                    <span className="duration">25m</span>
                  </div>
                  <p className="episode-description">
                    Sakamoto enjoys a quiet life in retirement with his family.
                    But one day, an old colleague demands he return to the
                    assassin world — or face consequences.
                  </p>
                </div>
              </div>
              <div className="episode-item notplayable-episode">
                <p className="episode-index">1</p>
                <div className="image-wrapper">
                  <button className="play-episode-btn">
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
                    src="https://occ-0-58-64.1.nflxso.net/dnm/api/v6/9pS1daC2n6UGc3dUogvWIPMR_OU/AAAABeevzghfGVzDULaYPvO8iniWOgOWCgJdUZJRZm6NdGtu47vdRiltjWxoeyMeB_zz8WzqMuwo4pkom81UjAK_62rF9BSMYtmsdf1f5SMSkkc3HZsUvmid3rrd.jpg?r=ef0"
                    alt=""
                  />
                </div>
                <div className="meta-data-wrapper">
                  <div className="title">
                    <p className="episode-name">The Lagendary Hit Man</p>
                    <span className="duration">25m</span>
                  </div>
                  <p className="episode-description">
                    Sakamoto enjoys a quiet life in retirement with his family.
                    But one day, an old colleague demands he return to the
                    assassin world — or face consequences.
                  </p>
                </div>
              </div>            </div>
            <div className="similar-movies">
              <div className="similar-movies-header">
                <p>More Like This</p>
              </div>
              <div className="list-similar-movies">
                <div className="similar-movie-item">
                  <MovieTitleCard />
                </div>
                <div className="similar-movie-item">
                  <MovieTitleCard />
                </div>
                <div className="similar-movie-item">
                  <MovieTitleCard />
                </div>
                <div className="similar-movie-item">
                  <MovieTitleCard />
                </div>
              </div>
            </div>
            <div className="about-wrapper">
              <div className="about-header">
                <h3>
                  About
                  <strong>SAKAMOTO DAYS</strong>
                </h3>
              </div>
              <div className="meta-data--tags">
                <span className="tag-label">Cast:</span>
                {tags.cast.length > 0 &&
                  tags.cast.map((tag, index) => (
                    <Link key={index} className="tag-item">
                      {index === tags.cast.length - 1 ? tag : tag + ", "}
                    </Link>
                  ))}
              </div>
              <div className="meta-data--tags">
                <span className="tag-label">Genres:</span>
                {tags.genres.map((tag, index) => (
                  <Link key={index} className="tag-item">
                    {index === tags.genres.length - 1 ? tag : tag + ", "}
                  </Link>
                ))}
              </div>
              <div className="meta-data--tags maturity-rating">
                <span className="tag-label">Maturity Rating:</span>
                <span className="maturity-number">16+</span>
                <p className="maturity-rating-reason">violence</p>
                <p className="maturity-desciption">
                  Eligible for dissemination to viewers from 16 or older
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;
