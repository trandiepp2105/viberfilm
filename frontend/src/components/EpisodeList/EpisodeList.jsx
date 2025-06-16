import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./EpisodeList.scss";

const EpisodeList = ({ seriesData, episodes = [], episodesLoading = false, seriesSlug, currentEpisode = null }) => {
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [activeEpisode, setActiveEpisode] = useState(currentEpisode); // Track active episode
  const navigate = useNavigate();
  const episodeGridRef = useRef(null); // Ref for the episode grid container

  // Use episodes prop if available, otherwise extract from seriesData
  const allEpisodes = episodes.length > 0 ? episodes : (seriesData?.episodes || []);

  // Update activeEpisode when currentEpisode changes (only if currentEpisode is not null)
  useEffect(() => {
    if (currentEpisode !== null) {
      setActiveEpisode(currentEpisode);
      
      // Also update selectedSeason to match the current episode's season
      if (allEpisodes.length > 0) {
        const currentEpisodeData = allEpisodes.find(ep => ep.episode_number === currentEpisode || ep.order === currentEpisode);
        if (currentEpisodeData && currentEpisodeData.season_number) {
          setSelectedSeason(currentEpisodeData.season_number);
        }
      }
    } else {
      // If no current episode is specified, don't set any episode as active
      setActiveEpisode(null);
    }
  }, [currentEpisode, allEpisodes]);

  // Scroll to active episode when activeEpisode or selectedSeason changes
  useEffect(() => {
    if (activeEpisode !== null && episodeGridRef.current) {
      // Use a small delay to ensure the DOM is updated
      setTimeout(() => {
        // Double check that ref is still valid
        if (episodeGridRef.current) {
          const activeElement = episodeGridRef.current.querySelector('.episode-number-box.active');
          if (activeElement) {
            const container = episodeGridRef.current;
            const containerRect = container.getBoundingClientRect();
            const elementRect = activeElement.getBoundingClientRect();
            
            // Calculate the position to center the active episode
            const containerHeight = container.clientHeight;
            const scrollTop = container.scrollTop;
            const elementTop = activeElement.offsetTop;
            const elementHeight = activeElement.offsetHeight;
            
            // Calculate the scroll position to center the active episode
            const targetScrollTop = elementTop - (containerHeight / 2) + (elementHeight / 2);
            
            // Smooth scroll to the calculated position
            container.scrollTo({
              top: Math.max(0, targetScrollTop),
              behavior: 'smooth'
            });
          }
        }
      }, 100);
    }
  }, [activeEpisode, selectedSeason]);

  // Get unique season numbers
  const availableSeasons = [...new Set(allEpisodes.map(ep => ep.season_number))].sort((a, b) => a - b);

  // Filter episodes for the selected season
  const currentSeasonEpisodes = allEpisodes.filter(ep => ep.season_number === selectedSeason);

  if (!seriesData || (allEpisodes.length === 0 && !episodesLoading)) {
    return (
      <div className="episode-list">
        <div className="episode-list__header">
          <h3>Episodes</h3>
        </div>
        <div className="episode-list__empty">
          <p>No episodes available</p>
        </div>
      </div>
    );
  }

  if (episodesLoading) {
    return (
      <div className="episode-list">
        <div className="episode-list__header">
          <h3>Episodes</h3>
        </div>
        <div className="episode-list__empty">
          <p>Loading episodes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="episode-list">
      <div className="episode-list__header">
        <h3>Episodes</h3>
        {availableSeasons.length > 1 && (
          <div className="episode-list__season-selector">
            {availableSeasons.map(seasonNum => (
              <button
                key={seasonNum}
                className={`season-btn ${selectedSeason === seasonNum ? 'active' : ''}`}
                onClick={() => {
                  setSelectedSeason(seasonNum);
                  // Only reset active episode if current episode is not in the selected season
                  // or if no current episode is set
                  if (currentEpisode !== null) {
                    const currentEpisodeInSeason = allEpisodes.find(ep => 
                      (ep.episode_number === currentEpisode || ep.order === currentEpisode) && 
                      ep.season_number === seasonNum
                    );
                    if (!currentEpisodeInSeason) {
                      setActiveEpisode(null); // Don't set default, keep null
                    }
                  } else {
                    setActiveEpisode(null); // Keep null if no current episode
                  }
                }}
              >
                Season {seasonNum}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="episode-list__grid" ref={episodeGridRef}>
        {currentSeasonEpisodes.map((episode) => {
          const episodeNumber = episode.episode_number || episode.order;
          // Only show as active if currentEpisode is explicitly set and matches
          const isActive = currentEpisode !== null && 
                           episodeNumber === activeEpisode && 
                           episode.season_number === selectedSeason;
          
          return (
            <div 
              key={episode.id} 
              className={`episode-number-box ${isActive ? 'active' : ''}`}
              onClick={() => {
                setActiveEpisode(episodeNumber);
                // Navigate to new URL structure
                navigate(`/watch/series/${seriesSlug}?episode=${episodeNumber}`);
              }}
            >
              {episodeNumber}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EpisodeList;
