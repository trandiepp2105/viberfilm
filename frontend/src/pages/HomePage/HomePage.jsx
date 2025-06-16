import React from "react";
import "./HomePage.scss";
import "../../styles/style.scss";
import MovieBillboard from "../../components/MovieBillboard/MovieBillboard";
import MovieGallery from "../../components/MovieGallery/MovieGallery";
import { useHomeData } from "../../hooks/useHomeData";

const HomePage = () => {
  const { data, loading, error } = useHomeData();

  // Loading state
  if (loading) {
    return (
      <div className="page home-page">
        <div className="loading-container">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="page home-page">
        <div className="error-container">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }  // Create list of genres from API data
  const listGenre = [];
  
  // Helper function to extract array from API response
  const extractArray = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (data.results && Array.isArray(data.results)) return data.results;
    return [];
  };

  const trendingMovies = extractArray(data?.trendingMovies);
  const trendingSeries = extractArray(data?.trendingSeries);
  const latestMovies = extractArray(data?.latestMovies);
  const latestSeries = extractArray(data?.latestSeries);
  const recentlyUpdatedSeries = extractArray(data?.recentlyUpdatedSeries);
  
  if (trendingMovies.length > 0) {
    listGenre.push({
      genre: "Trending Movies",
      listMovie: trendingMovies
    });
  }

  if (trendingSeries.length > 0) {
    listGenre.push({
      genre: "Trending Series",
      listMovie: trendingSeries
    });
  }

  if (latestMovies.length > 0) {
    listGenre.push({
      genre: "Latest Movies",
      listMovie: latestMovies
    });
  }

  if (latestSeries.length > 0) {
    listGenre.push({
      genre: "Latest Series",
      listMovie: latestSeries
    });
  }

  if (recentlyUpdatedSeries.length > 0) {
    listGenre.push({
      genre: "Recently Updated",
      listMovie: recentlyUpdatedSeries
    });
  }  return (
    <div className="page home-page">
      <MovieBillboard featuredContentList={trendingMovies.slice(0, 10)} />
      {listGenre.length > 0 ? (
        listGenre.map((genre, index) => (
          <MovieGallery key={index} genre={genre.genre} listMovie={genre.listMovie} />
        ))
      ) : (
        <div className="no-content">
          <p>No content available at the moment.</p>
        </div>
      )}
    </div>
  );
};

export default HomePage;
