import React from 'react';
import { useHomeData } from '../hooks';
import { HOME_PAGE_CONFIG } from '../config/homePageConfig';

const HomePage = () => {
  const { data: homeData, loading, error } = useHomeData();

  if (loading) {
    return (
      <div className="home-page-loading">
        <div className="loading-spinner">Đang tải...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-page-error">
        <div className="error-message">❌ {error}</div>
        <button onClick={() => window.location.reload()}>Thử lại</button>
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* Hero Banner */}
      <section className="hero-banner">
        <h1>{HOME_PAGE_CONFIG.hero.title}</h1>
        <p>{HOME_PAGE_CONFIG.hero.description}</p>
      </section>

      {/* Dynamic Sections */}
      {HOME_PAGE_CONFIG.sections.map((section) => {
        // Get data for each section
        const sectionData = getSectionData(homeData, section.id);
        
        return (
          <section key={section.id} className={`content-section ${section.id}`}>
            <h2>{section.title}</h2>
            <div className="content-grid">
              {sectionData?.slice(0, section.limit).map((item) => (
                <div key={item.id || item.slug} className="content-card">
                  <img 
                    src={item.poster_url || item.thumbnail} 
                    alt={item.title}
                    loading="lazy"
                  />
                  <div className="card-info">
                    <h3>{item.title}</h3>
                    <p className="release-year">{new Date(item.release_date).getFullYear()}</p>
                    {item.views && <p className="views">👁 {formatViews(item.views)}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
};

// Helper function to get data for each section
const getSectionData = (homeData, sectionId) => {
  if (!homeData) return [];
  
  switch (sectionId) {
    case 'trending-movies':
      return homeData.trendingMovies;
    case 'trending-series':
      return homeData.trendingSeries;
    case 'latest-movies':
      return homeData.latestMovies;
    case 'latest-series':
      return homeData.latestSeries;
    case 'recently-updated':
      return homeData.recentlyUpdatedSeries;
    default:
      return [];
  }
};

// Helper function to format view counts
const formatViews = (views) => {
  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M`;
  } else if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}K`;
  }
  return views.toString();
};

export default HomePage;
