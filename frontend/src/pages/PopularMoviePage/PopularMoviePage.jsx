import React, { useState, useEffect } from "react";
import "./PopularMoviePage.scss";
import "../../styles/style.scss";
import MovieGallery from "../../components/MovieGallery/MovieGallery";
import movieService from "../../services/movieService";
import contentService from "../../services/contentService";

const PopularMoviePage = () => {
  const [contentSections, setContentSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNewAndPopularContent = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch different types of content in parallel
        const [
          // NEW CONTENT
          newMovies,
          newSeries,
          recentlyUpdatedMovies,
          
          // POPULAR CONTENT  
          popularMovies,
          popularSeries,
          trendingContent
        ] = await Promise.all([
          // NEW: Latest movies (by release date)
          contentService.getContentsByType('movie', { 
            ordering: '-release_date', 
            limit: 12 
          }),
          // NEW: Latest series (by release date)
          contentService.getContentsByType('series', { 
            ordering: '-release_date', 
            limit: 12 
          }),
          // NEW: Recently updated movies
          movieService.getRecentlyUpdatedMovies(12).catch(() => []),
          
          // POPULAR: Most viewed movies
          contentService.getContentsByType('movie', { 
            ordering: '-views', 
            limit: 12 
          }),
          // POPULAR: Most viewed series
          contentService.getContentsByType('series', { 
            ordering: '-views', 
            limit: 12 
          }),
          // POPULAR: All content by views (mixed)
          contentService.getAllContents({ 
            ordering: '-views', 
            limit: 12 
          })
        ]);

        // Transform data to match MovieGallery format
        const sections = [
          // NEW SECTION
          {
            genre: "🆕 New Movies",
            listMovie: transformContentToMovieFormat(newMovies.results || newMovies)
          },
          {
            genre: "🆕 New Series", 
            listMovie: transformContentToMovieFormat(newSeries.results || newSeries)
          },
          
          // POPULAR SECTION
          {
            genre: "🔥 Popular Movies",
            listMovie: transformContentToMovieFormat(popularMovies.results || popularMovies)
          },
          {
            genre: "🔥 Popular Series",
            listMovie: transformContentToMovieFormat(popularSeries.results || popularSeries)
          },
          {
            genre: "⭐ Trending Now",
            listMovie: transformContentToMovieFormat(trendingContent.results || trendingContent)
          }
        ];

        // Add recently updated if available
        if (recentlyUpdatedMovies && recentlyUpdatedMovies.length > 0) {
          sections.splice(2, 0, {
            genre: "🆕 Recently Updated",
            listMovie: transformContentToMovieFormat(recentlyUpdatedMovies.results || recentlyUpdatedMovies)
          });
        }

        setContentSections(sections.filter(section => section.listMovie.length > 0));

      } catch (err) {
        console.error('Failed to fetch new and popular content:', err);
        setError('Failed to load content. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchNewAndPopularContent();
  }, []);

  // Transform API data to MovieGallery format
  const transformContentToMovieFormat = (contents) => {
    if (!Array.isArray(contents)) return [];
    
    return contents.map(content => ({
      id: content.id,
      title: content.title,
      img: content.banner_img_url || content.poster_img_url || 'https://via.placeholder.com/300x450',
      slug: content.slug,
      content_type: content.content_type,
      // Add additional data that MovieGallery might need
      banner_img_url: content.banner_img_url,
      poster_img_url: content.poster_img_url,
      content: content // Include full content object for navigation
    }));
  };

  if (loading) {
    return (
      <div className="page popular-movie-page">
        <div className="loading-container">
          <h2>Loading new & popular content...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page popular-movie-page">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page popular-movie-page">
      <div className="page-header">
        <h1>New & Popular</h1>
        <p>Discover the latest releases and trending content</p>
      </div>
      
      {contentSections.length === 0 ? (
        <div className="empty-container">
          <h2>No content available</h2>
          <p>Please check back later.</p>
        </div>
      ) : (
        contentSections.map((section, index) => (
          <MovieGallery
            key={index}
            genre={section.genre}
            listMovie={section.listMovie}
            canExpand={false}
          />
        ))
      )}
    </div>
  );
};

export default PopularMoviePage;
