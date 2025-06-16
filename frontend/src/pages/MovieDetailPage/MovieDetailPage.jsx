import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import MovieDetailHeader from "../../components/MovieDetailHeader/MovieDetailHeader";
import EpisodeList from "../../components/EpisodeList/EpisodeList";
import "./MovieDetailPage.scss";
import MovieGallery from "../../components/MovieGallery/MovieGallery";
import movieService from "../../services/movieService";
import seriesService from "../../services/seriesService";
import recommendationService from "../../services/recommendationService";

const MovieDetailPage = () => {
  const { "*": slug } = useParams(); // Get slug from URL
  const location = useLocation();
  const [contentData, setContentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [contentType, setContentType] = useState(null); // 'movie' or 'series'
  const [similarContent, setSimilarContent] = useState([]);
  const [similarLoading, setSimilarLoading] = useState(false);
  const [episodes, setEpisodes] = useState([]);
  const [episodesLoading, setEpisodesLoading] = useState(false);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Determine content type from URL and fetch data
  useEffect(() => {
    const fetchContentData = async () => {
      if (!slug) return;

      setLoading(true);
      setError(null);
      setSimilarContent([]); // Reset similar content when slug changes
      setSimilarLoading(false); // Reset similar loading state

      try {
        // Determine content type from pathname
        const isMovie = location.pathname.startsWith('/movies/');
        const isSeries = location.pathname.startsWith('/series/');
        
        let data;
        let currentContentType;
        
        if (isMovie) {
          currentContentType = 'movie';
          setContentType('movie');
          data = await movieService.getMovieBySlug(slug);
        } else if (isSeries) {
          currentContentType = 'series';
          setContentType('series');
          data = await seriesService.getSeriesBySlug(slug);
        } else {
          throw new Error('Invalid content type');
        }

        setContentData(data);
        setLoading(false); // Set loading to false immediately after content data is set

      } catch (err) {
        console.error('Failed to fetch content data:', err);
        setError(err.message || 'Failed to load content');
        setLoading(false);
      }
    };

    fetchContentData();
  }, [slug, location.pathname]);

  // Separate useEffect for similar content
  useEffect(() => {
    const fetchSimilarContent = async () => {
      if (!contentData?.content?.id || !contentType) return;

      setSimilarLoading(true);
      setSimilarContent([]); // Reset similar content

      try {
        
        let similarData = [];
        
        if (contentType === 'movie') {
          similarData = await recommendationService.getSimilarMovies(contentData.content.id, 20);
        } else if (contentType === 'series') {
          similarData = await recommendationService.getSimilarSeries(contentData.content.id, 20);
        }

        setSimilarContent(similarData);

      } catch (similarError) {
        console.error('Failed to fetch similar content:', similarError);
        // Fallback to genre-based similar content
        if (contentData?.content?.genres?.length > 0) {
          try {
            const fallbackData = await recommendationService.getSimilarByGenre(
              contentType,
              contentData.content.genres[0].id,
              contentData.content.id,
              6
            );
            const transformedFallback = fallbackData.map(item => ({
              id: item.id,
              title: item.title,
              img: item.banner_image || item.background_image || '',
              slug: item.slug,
              content_type: contentType,
              content: {
                id: item.id,
                title: item.title,
                slug: item.slug,
                content_type: contentType,
              },
              banner_img_url: item.banner_image || item.background_image || '',
            }));
            setSimilarContent(transformedFallback);
          } catch (fallbackError) {
            console.error('Failed to fetch fallback similar content:', fallbackError);
            setSimilarContent([]);
          }
        }
      } finally {
        setSimilarLoading(false);
      }
    };

    fetchSimilarContent();
  }, [contentData, contentType]); // Trigger when contentData or contentType changes

  // Separate useEffect for episodes data
  useEffect(() => {
    const fetchEpisodes = async () => {
      if (!contentData?.content?.slug || contentType !== 'series') {
        setEpisodes([]);
        return;
      }

      setEpisodesLoading(true);
      setEpisodes([]); // Reset episodes

      try {
        
        const episodesData = await seriesService.getSeriesEpisodes(contentData.content.slug);
        setEpisodes(episodesData);

      } catch (episodesError) {
        console.error('Failed to fetch episodes:', episodesError);
        // Fallback to episodes from seriesData if available
        if (contentData?.episodes) {
          setEpisodes(contentData.episodes);
        } else {
          setEpisodes([]);
        }
      } finally {
        setEpisodesLoading(false);
      }
    };

    fetchEpisodes();
  }, [contentData, contentType]); // Trigger when contentData or contentType changes

  // Loading state - only for main content
  if (loading) {
    return (
      <div className="movie-detail-page">
        <div className="loading-container">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="movie-detail-page">
        <div className="error-container">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  // Main content is ready, render immediately
  return (
    <div className="movie-detail-page">
      {contentData && (
        <>
          <MovieDetailHeader contentData={contentData} contentType={contentType} />
          {contentType === 'series' && (
            episodesLoading ? (
              <div className="episodes-loading">
                <p>Loading episodes...</p>
              </div>
            ) : (
              <EpisodeList 
                seriesData={contentData} 
                episodes={episodes}
                episodesLoading={episodesLoading}
                seriesSlug={contentData?.content?.slug}
              />
            )
          )}
        </>
      )}
      
      <div className="wrapper-similar-movies">
        {similarLoading ? (
          <div className="similar-loading">
            <p>Loading similar content...</p>
          </div>
        ) : similarContent.length > 0 ? (
          <MovieGallery 
            genre={contentType === 'movie' ? "Similar Movies" : "Similar Series"} 
            listMovie={similarContent}
            canExpand={false}
          />
        ) : (
          !similarLoading && (
            <div className="no-similar-content">
              <p>No similar content found</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default MovieDetailPage;
