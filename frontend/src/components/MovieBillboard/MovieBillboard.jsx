import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./MovieBillboard.scss";

const MovieBillboard = ({ featuredContentList = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const navigate = useNavigate();

  // Fallback data if no featured content is provided
  const defaultContent = {
    title: "Mission: Impossible - The Final Reckoning",
    overview: "Ethan Hunt and team continue their search for the terrifying AI known as the Entity — which has infiltrated intelligence networks all over the globe — with the world's governments ....",
    backdrop_path: "https://occ-0-64-325.1.nflxso.net/dnm/api/v6/6AYY37jfdO6hpXcMjf9Yu5cnmO0/AAAABQlfktwfWXD_JUIM_gd6VCqVEuddpYEn2db9r1cXmg_pocVU1H_b0QUL5AbGRG1VZcEucmYmj3kc8WmY96RdVM9QStVouXxd2Fr0.jpg?r=0b2"
  };

  // Use the list or fallback to single default content
  const contentList = featuredContentList.length > 0 ? featuredContentList : [defaultContent];
  const currentContent = contentList[currentIndex];
  // Auto-rotate effect
  useEffect(() => {
    if (contentList.length <= 1) return; // Don't rotate if only one item
    
    const interval = setInterval(() => {
      setIsTransitioning(true);
      
      setTimeout(() => {
        setCurrentIndex((prevIndex) => 
          prevIndex === contentList.length - 1 ? 0 : prevIndex + 1
        );
        setIsTransitioning(false);
      }, 500); // Transition duration
      
    }, 10000); // 10 seconds interval

    return () => clearInterval(interval);
  }, [contentList.length]);
  const getBackgroundImage = (item) => {
    const content = item.content || item; // Handle both nested and direct structure
    return content.banner_img_url || content.backdrop_path 
      ? (content.banner_img_url?.startsWith('http') 
          ? content.banner_img_url 
          : content.backdrop_path?.startsWith('http') 
            ? content.backdrop_path 
            : `https://image.tmdb.org/t/p/original${content.backdrop_path}`)
      : defaultContent.backdrop_path;
  };

  const getPosterImage = (item) => {
    const content = item.content || item; // Handle both nested and direct structure
    return content.poster_img_url || content.poster_path 
      ? (content.poster_img_url?.startsWith('http') 
          ? content.poster_img_url 
          : content.poster_path?.startsWith('http') 
            ? content.poster_path 
            : `https://image.tmdb.org/t/p/w500${content.poster_path}`)
      : "https://image.tmdb.org/t/p/original//qJ2tW6WMUDux911r6m7haRef0WH.jpg";
  };

  // Helper function to get slug from content
  const getSlug = (item) => {
    const content = item.content || item; // Handle both nested and direct structure
    return content.slug;
  };

  // Helper function to get content type
  const getContentType = (item) => {
    const content = item.content || item; // Handle both nested and direct structure
    return content.content_type;
  };  // Handle More Info button click
  const handleMoreInfoClick = () => {
    const slug = getSlug(currentContent);
    const contentType = getContentType(currentContent);
    
    if (!slug) {
      return;
    }

    // Navigate based on content type
    if (contentType === "movie") {
      navigate(`/movies/${slug}`);
    } else if (contentType === "series") {
      navigate(`/series/${slug}`);
    } else {
      // Fallback for unknown content type or movies without specified type
      navigate(`/movies/${slug}`);
    }
  };
  // Handle Play button click
  const handlePlayClick = () => {
    const slug = getSlug(currentContent);
    const contentType = getContentType(currentContent);
    
    if (!slug) {
      return;
    }

    // Navigate to watch page based on content type
    if (contentType === "movie") {
      navigate(`/watch/movie/${slug}`);
    } else if (contentType === "series") {
      navigate(`/watch/series/${slug}?episode=1`);
    } else {
      // Fallback for unknown content type, default to movie
      navigate(`/watch/movie/${slug}`);
    }
  };

  return (
    <div className="movie-billboard">
      <div className="billboard">
        <div className="billboard-motion">
          <div className="motion-background">
            <div className="motion-background-wrapper">              {/* Background Images */}
              {contentList.map((item, index) => (
                <div 
                  key={index}
                  className={`static-image ${index === currentIndex ? 'active' : ''} ${isTransitioning ? 'transitioning' : ''}`}
                >
                  <img
                    src={getBackgroundImage(item)}
                    alt={(item.content?.title || item.content?.name || item.title || item.name)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="fill-container">
          <div className="meta-layer">            <div className={`meta-layer-content ${isTransitioning ? 'transitioning' : ''}`}>
              <h2 className="movie-name">
                {currentContent.content?.title || currentContent.content?.name || currentContent.title || currentContent.name}
              </h2>
              <p className="movie-description">
                {currentContent.content?.description || currentContent.content?.overview || currentContent.description || currentContent.overview || "No description available."}
              </p>              <div className="button-layer">
                <button type="button" className="billboard-play-btn" onClick={handlePlayClick}>
                  <svg
                    width="20px"
                    height="20px"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g id="SVGRepo_bgCarrier" strokeWidth="0" />
                    <g
                      id="SVGRepo_tracerCarrier"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <g id="SVGRepo_iconCarrier">
                      <path
                        d="M21.4086 9.35258C23.5305 10.5065 23.5305 13.4935 21.4086 14.6474L8.59662 21.6145C6.53435 22.736 4 21.2763 4 18.9671L4 5.0329C4 2.72368 6.53435 1.26402 8.59661 2.38548L21.4086 9.35258Z"
                        fill="currentColor"
                      />
                    </g>
                  </svg>
                  <span>Play</span>
                </button>
                <button type="button" className="billboard-info-btn" onClick={handleMoreInfoClick}>
                  <svg
                    width="20px"
                    height="20px"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g id="SVGRepo_bgCarrier" strokeWidth="0" />
                    <g
                      id="SVGRepo_tracerCarrier"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <g id="SVGRepo_iconCarrier">
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M12 17V11"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                      <circle
                        cx="1"
                        cy="1"
                        r="1"
                        transform="matrix(1 0 0 -1 11 9)"
                        fill="currentColor"
                      />
                    </g>
                  </svg>
                  <span>More Info</span>
                </button>
              </div>
            </div>          </div>          <div className={`banner-card ${isTransitioning ? 'transitioning' : ''}`} onClick={handlePlayClick}>
            <img
              src={getPosterImage(currentContent)}
              alt={currentContent.content?.title || currentContent.content?.name || currentContent.title || currentContent.name}
              className="banner-poster"
            />
            <div className="banner-play-overlay">
              <div className="play-button">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M8 5v14l11-7z" fill="currentColor"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieBillboard;
