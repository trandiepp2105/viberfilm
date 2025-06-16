import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./MovieDetailHeader.scss";
import recommendationService from "../../services/recommendationService";

const MovieDetailHeader = ({ contentData, contentType }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showMoreButton, setShowMoreButton] = useState(false);
  const [similarContent, setSimilarContent] = useState([]);
  const contentRef = useRef(null);
  const navigate = useNavigate();
  
  // Handle watch button click
  const handleWatchClick = () => {
    if (!contentData?.content?.slug) {
      console.error("Content slug is not available");
      return;
    }

    // Navigate to watch page based on content type
    if (contentType === 'movie') {
      navigate(`/watch/movie/${contentData.content.slug}`);
    } else if (contentType === 'series') {
      navigate(`/watch/series/${contentData.content.slug}?episode=1`);
    } else {
      // Fallback for unknown content type
      console.warn("Unknown content type, defaulting to movie");
      navigate(`/watch/movie/${contentData.content.slug}`);
    }
  };
  
  // Load similar content khi component mount - phải đặt trước early return
  useEffect(() => {
    const loadSimilarContent = async () => {
      try {
        let similar = [];
        if (contentType === 'movie' && contentData?.id) {
          similar = await recommendationService.getSimilarMovies(contentData.id, 6);
        } else if (contentType === 'series' && contentData?.id) {
          similar = await recommendationService.getSimilarSeries(contentData.id, 6);
        }
        setSimilarContent(similar);
      } catch (error) {
        console.error('Failed to load similar content:', error);
      }
    };

    if (contentData?.id) {
      loadSimilarContent();
    }
  }, [contentData?.id, contentType]);

  // Check if content height exceeds default height to show "More Details" button
  useEffect(() => {
    const checkContentHeight = () => {
      if (contentRef.current && !isExpanded) {
        const contentElement = contentRef.current;
        const scrollHeight = contentElement.scrollHeight;
        const clientHeight = contentElement.clientHeight;
        
        // Show button if content is taller than visible area (with some tolerance)
        setShowMoreButton(scrollHeight > clientHeight + 20);
      }
    };

    // Check height after content loads
    const timer = setTimeout(checkContentHeight, 100);
    
    // Also check on window resize
    window.addEventListener('resize', checkContentHeight);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkContentHeight);
    };
  }, [contentData, isExpanded]);

  // Fallback data nếu chưa có dữ liệu từ API
  if (!contentData) {
    return (
      <div className="movie-detail-header">
        <div className="movie-detail-header__overlay">
          <div className="movie-detail-header__content">
            <h1 className="movie-title">Loading...</h1>
          </div>
        </div>
      </div>
    );
  }

  // Format genres để hiển thị
  const formatGenres = (genres) => {
    if (!genres || genres.length === 0) return "N/A";
    return genres.map(genre => genre.name || genre).join(", ");
  };

  // Format languages để hiển thị
  const formatLanguages = (languages, type) => {
    if (!languages || !languages[type] || languages[type].length === 0) {
      return type === 'audio' ? "Japanese, English" : "English, Vietnamese";
    }
    return languages[type].map(lang => lang.name || lang.native_name || lang).join(", ");
  };

  // Lấy poster hoặc banner image
  const getBackgroundImage = () => {
    if (contentData.content.banner_img_url) return contentData.content.banner_img_url;
    return 'https://imgsrv.crunchyroll.com/cdn-cgi/image/fit=cover,format=auto,quality=85,width=1920/keyart/GKEH2G428-backdrop_wide';
  };

  // Tạo style cho background image với tỷ lệ cố định
  const backgroundStyle = {
    '--bg-image': `url('${getBackgroundImage()}')`
  };

  return (
    <div className="movie-detail-header" style={backgroundStyle}>
      <div className={`movie-detail-header__overlay ${isExpanded ? 'expanded' : ''}`}>
        <div className="movie-detail-header__content" ref={contentRef}>
          <h1 className="movie-title">{contentData.content.title}</h1>
          <div className="movie-meta">
            <span className="age-badge">{contentData.content.age_rank || "PG-13"}</span>
            <span className="divider">•</span>
            {/* <span className="meta-link">Sub</span>
            <span className="divider">|</span>
            <span className="meta-link">Dub</span>
            <span className="divider">|</span> */}
            <span className="meta-link">{formatGenres(contentData.content.genres)}</span>
          </div>
          {/* <div className="movie-rating">
            <span className="stars">★★★★★</span>
            <span className="average-rating">
              Average Rating: <b>{contentData.rating || "N/A"}</b> 
              {contentData.views && ` (${contentData.views} views)`}
            </span>
          </div> */}
          <div className="movie-actions">
            <button className="btn-watch" onClick={handleWatchClick}>
              <span className="watch-text">
                {contentType === 'series' ? 'START WATCHING S1 E1' : 'WATCH NOW'}
              </span>
            </button>
            <button className="btn-icon">+</button>
            <button className="btn-icon">⤴</button>
            <button className="btn-icon">⋮</button>
          </div>
          <div className="movie-detail-columns">
            <div className="movie-detail-col-left">
              <div className="movie-description" ref={contentRef}>
                {contentData.content.description || "No description available."}
              </div>
            </div>
            <div className="movie-detail-col-right">
              <div className="movie-extra">
                <b>Audio:</b> {formatLanguages(contentData.content.languages, 'audio')}
              </div>
              <div className="movie-extra">
                <b>Subtitles:</b> {formatLanguages(contentData.content.languages, 'subtitle')}
              </div>
              {contentData.age_rating && (
                <div className="movie-extra">
                  <b>Content Advisory:</b> <span className="age-badge">{contentData.age_rating}</span>
                </div>
              )}
              {/* <div className="movie-extra">
                <b>Genres:</b> <span className="meta-link">{formatGenres(contentData.genres)}</span>
              </div> */}
              {contentData.content.release_date && (
                <div className="movie-extra">
                  <b>Release Date:</b> {new Date(contentData.content.release_date).toLocaleDateString('en-GB')}
                </div>
              )}
              {contentData.duration && (
                <div className="movie-extra">
                  <b>Duration:</b> {contentData.duration} minutes
                </div>
              )}
              {contentData.copyright && (
                <div className="movie-extra copyright">{contentData.copyright}</div>
              )}
            </div>
          </div>
        </div>
        
        {/* More Details Button - chỉ hiện khi chưa expand và nội dung vượt quá chiều cao */}
        {!isExpanded && showMoreButton && (
          <div className="more-details-section">
            <div className="fade-overlay"></div>
            <button 
              className="more-details-btn"
              onClick={() => setIsExpanded(true)}
            >
              MORE DETAILS
            </button>
          </div>
        )}
        
        <div className="movie-detail-header__banner" onClick={handleWatchClick}>
          <img 
            src={contentData.content.poster_img_url || 'https://via.placeholder.com/300x450'} 
            alt={contentData.content.title} 
            className="movie-poster" 
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
  );
};

export default MovieDetailHeader;
