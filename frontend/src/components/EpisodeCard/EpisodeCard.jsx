import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./EpisodeCard.scss";

// Example episode data (replace with your real data or props)


const EpisodeCard = ({ episode, seriesSlug }) => {
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();

  const handleCardClick = () => {
    // Use series slug and episode number for navigation
    if (seriesSlug && episode.episode_number) {
      navigate(`/watch/series/${seriesSlug}?episode=${episode.episode_number}`);
    } else {
      // Fallback for backward compatibility
      navigate(`/watch/series/${episode.series_id || episode.id}?episode=${episode.episode_number || 1}`);
    }
  };

  return (
    <div
      className={`episode-card${hovered ? " hovered" : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleCardClick}
      style={{ cursor: 'pointer' }}
    >
      {!hovered ? (
        <div className="episode-card__thumb">
          <img src={episode.thumbnail} alt={episode.episode_name} />
          <div className="episode-card__play" onClick={(e) => {
            e.stopPropagation();
            if (seriesSlug && episode.episode_number) {
              navigate(`/watch/series/${seriesSlug}?episode=${episode.episode_number}`);
            } else {
              navigate(`/watch/series/${episode.series_id || episode.id}?episode=${episode.episode_number || 1}`);
            }
          }}>
            <span className="play-icon">▶</span>
          </div>
          <div className="episode-card__duration">{episode.duration}m</div>
        </div>
      ) : (
        <div className="episode-card__hover">
          <div className="episode-card__series">{episode.series_name}</div>
          <div className="episode-card__title">S{episode.season_number} E{episode.episode_number} - {episode.episode_name}</div>
          <div className="episode-card__date">
            <span role="img" aria-label="calendar">📅</span> {episode.release_date}
          </div>
          <div className="episode-card__desc">{episode.description}</div>
          <button className="episode-card__play-btn" onClick={(e) => {
            e.stopPropagation();
            if (seriesSlug && episode.episode_number) {
              navigate(`/watch/series/${seriesSlug}?episode=${episode.episode_number}`);
            } else {
              navigate(`/watch/series/${episode.series_id || episode.id}?episode=${episode.episode_number || 1}`);
            }
          }}>
            <span className="play-icon">▶</span>
             PLAY S{episode.season_number} E{episode.episode_number}</button>
        </div>
      )}
      {!hovered && (
        <>
          <div className="episode-card__series-short">{episode.series_name}</div>
          <div className="episode-card__title-short">S{episode.season_number} E{episode.episode_number} - {episode.episode_name}</div>
          <div className="episode-card__sub">Dub | Sub</div>
          <div className="episode-card__more">⋮</div>
        </>
      )}
      {hovered && <div className="episode-card__more hovered">⋮</div>}
    </div>
  );
};

export default EpisodeCard;
