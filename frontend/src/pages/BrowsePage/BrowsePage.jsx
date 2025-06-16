import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import "./BrowsePage.scss";
import "../../styles/style.scss";
import MovieSliderItem from "../../components/MovieSliderItem/MovieSliderItem";
import movieService from "../../services/movieService";
import seriesService from "../../services/seriesService";
import { combinedSearch } from "../../services/searchService";
const BrowsePage = () => {
  const { "*": urlPath } = useParams(); // Get everything after /browse/
  const location = useLocation();
  const navigate = useNavigate();
    // State management
  const [contentType, setContentType] = useState('movies'); // 'movies', 'series', or 'combined'
  const [allContent, setAllContent] = useState([]); // Store all data
  const [content, setContent] = useState([]); // Current page data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inputValue, setInputValue] = useState(''); // Input field value
  const [searchQuery, setSearchQuery] = useState(''); // Actual search query for API
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchMetadata, setSearchMetadata] = useState(null); // For combined search metadata
  
  const itemsPerPage = 20;  // Determine content type from URL and initialize search from URL params
  useEffect(() => {
    const pathSegments = location.pathname.split('/');
    const type = pathSegments[2]; // /browse/movies or /browse/series
    
    // Get search query from URL params
    const searchParams = new URLSearchParams(location.search);
    const urlSearchQuery = searchParams.get('search') || '';
    const urlPage = parseInt(searchParams.get('page')) || 1;
    
    // If there's a search query but no specific content type in URL, use combined search
    if (urlSearchQuery && (!type || type === '')) {
      setContentType('combined');
    } else if (type === 'movies' || type === 'series') {
      setContentType(type);
    } else {
      setContentType('movies'); // Default to movies
    }
    
    setInputValue(urlSearchQuery);
    setSearchQuery(urlSearchQuery);
    setCurrentPage(urlPage);
    
    // Reset content when URL changes
    setAllContent([]);
    setContent([]);
    setSearchMetadata(null);
  }, [location.pathname, location.search]);// Fetch content data
  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      setError(null);
        try {
        let response;
        
        // Always use API pagination for both search and browse
        const params = {
          limit: itemsPerPage,
          offset: (currentPage - 1) * itemsPerPage,
        };
        
        // Add search query if exists
        if (searchQuery.trim()) {
          params.search = searchQuery.trim();
        }
        
        if (contentType === 'combined' && searchQuery.trim()) {
          // Use combined search API
          response = await combinedSearch(searchQuery.trim(), params.offset, params.limit);
          setSearchMetadata({
            total_movies: response.total_movies,
            total_series: response.total_series
          });
        } else if (contentType === 'movies') {
          response = await movieService.getMovies(params);
          setSearchMetadata(null);
        } else {
          response = await seriesService.getSeries(params);
          setSearchMetadata(null);
        }
        
        
        if (response.results) {
          setContent(response.results);
          setTotalItems(response.count || 0);
          setTotalPages(Math.ceil((response.count || 0) / itemsPerPage));
        } else {
          setContent(response);
          setTotalItems(response.length || 0);
          setTotalPages(Math.ceil((response.length || 0) / itemsPerPage));
        }
        
        // Clear allContent since we're using API pagination
        setAllContent([]);
        
      } catch (err) {
        console.error(`Failed to fetch ${contentType}:`, err);
        setError(err.message || `Failed to load ${contentType}`);
        setContent([]);
        setAllContent([]);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [contentType, searchQuery, currentPage]); // Include currentPage in dependencies
  
  // Remove the separate useEffect for pagination since we're using API pagination// Handle search input change
  const handleSearchChange = (e) => {
    setInputValue(e.target.value);
  };  // Handle keyboard events in search input
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Escape') {
      setInputValue('');
      setSearchQuery('');
      setCurrentPage(1);
      updateURL('', 1);
      e.target.blur(); // Remove focus from input
      // Scroll to top when clearing with ESC
      window.scrollTo(0, 0);
    }
  };// Handle content type switching
  const handleContentTypeSwitch = (type) => {
    if (type === 'combined') {
      // For combined search, go to /browse with search params
      const searchParams = new URLSearchParams(location.search);
      const queryString = searchParams.toString();
      const newURL = `/browse${queryString ? `?${queryString}` : ''}`;
      navigate(newURL);
    } else {
      // For specific types, go to /browse/type with search params
      const searchParams = new URLSearchParams(location.search);
      const queryString = searchParams.toString();
      const newURL = `/browse/${type}${queryString ? `?${queryString}` : ''}`;
      navigate(newURL);
    }
    // Scroll to top when switching content type
    window.scrollTo(0, 0);
  };
  // Update URL with search params
  const updateURL = (searchValue, page = 1) => {
    const searchParams = new URLSearchParams();
    
    if (searchValue && searchValue.trim()) {
      searchParams.set('search', searchValue.trim());
    }
    
    if (page > 1) {
      searchParams.set('page', page.toString());
    }
    
    const queryString = searchParams.toString();
    
    // If content type is combined or we have a search without specific type, use /browse
    if (contentType === 'combined' || (searchValue && searchValue.trim() && contentType !== 'movies' && contentType !== 'series')) {
      const newURL = `/browse${queryString ? `?${queryString}` : ''}`;
      navigate(newURL, { replace: true });
    } else {
      const newURL = `/browse/${contentType}${queryString ? `?${queryString}` : ''}`;
      navigate(newURL, { replace: true });
    }
  };
  // Handle search submit (Enter key or button click)
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const trimmedInput = inputValue.trim();
    setSearchQuery(trimmedInput);
    setCurrentPage(1);
    updateURL(trimmedInput, 1);
    // Scroll to top when searching
    window.scrollTo(0, 0);
  };  // Handle search clear
  const handleSearchClear = () => {
    setInputValue('');
    setSearchQuery('');
    setCurrentPage(1);
    updateURL('', 1);
    // Scroll to top when clearing search
    window.scrollTo(0, 0);
  };
  // Handle pagination
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      updateURL(searchQuery, newPage);
      window.scrollTo(0, 0);
    }
  };

  // Handle previous page
  const handlePrevPage = () => {
    handlePageChange(currentPage - 1);
  };

  // Handle next page
  const handleNextPage = () => {
    handlePageChange(currentPage + 1);
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let start = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let end = Math.min(totalPages, start + maxVisiblePages - 1);
    
    // Adjust start if we're near the end
    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  };
  // Get page title
  const getPageTitle = () => {
    if (searchQuery.trim()) {
      if (contentType === 'combined') {
        return `Search results for "${searchQuery}"`;
      }
      return `Search results for "${searchQuery}" in ${contentType}`;
    }
    return contentType === 'movies' ? 'Movies' : contentType === 'series' ? 'TV Series' : 'Browse Content';
  };
  return (
    <div className="page browse-page">
      <div
        className="sub-billboard"
        style={{ backgroundImage: `url("/assets/footer-bg-efda21a6.webp")` }}
      >
        <p className="browse-page-title">{getPageTitle()}</p>
      </div>
        <form className="search-bar" onSubmit={handleSearchSubmit}>        <input 
          className="search-bar-input" 
          placeholder={contentType === 'combined' ? 'Search movies and series...' : `Search ${contentType}...`}
          value={inputValue}
          onChange={handleSearchChange}
          onKeyDown={handleSearchKeyDown}
        />
        {inputValue.trim() && (
          <button 
            type="button" 
            className="search-clear-btn"
            onClick={handleSearchClear}
            title="Clear search"
          >
            ×
          </button>
        )}
        <button type="submit" className="search-bar-icon">
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="9" cy="9" r="7" stroke="#e53935" strokeWidth="2" />
            <line
              x1="14.2929"
              y1="14.7071"
              x2="18"
              y2="18.4142"
              stroke="#e53935"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </form>      {/* Content Type Tabs */}
      <div className="content-type-tabs">
        {searchQuery.trim() && (
          <button 
            className={`tab-button ${contentType === 'combined' ? 'active' : ''}`}
            onClick={() => handleContentTypeSwitch('combined')}
          >
            All Results {searchMetadata && `(${searchMetadata.total_movies + searchMetadata.total_series})`}
          </button>
        )}
        <button 
          className={`tab-button ${contentType === 'movies' ? 'active' : ''}`}
          onClick={() => handleContentTypeSwitch('movies')}
        >
          Movies {searchMetadata && `(${searchMetadata.total_movies})`}
        </button>
        <button 
          className={`tab-button ${contentType === 'series' ? 'active' : ''}`}
          onClick={() => handleContentTypeSwitch('series')}
        >
          TV Series {searchMetadata && `(${searchMetadata.total_series})`}
        </button>
      </div>      {/* Loading State */}
      {loading && (
        <div className="loading-container">
          <p>Loading {contentType === 'combined' ? 'search results' : contentType}...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="error-container">
          <p>Error: {error}</p>
        </div>
      )}

      {/* Content Grid */}
      {!loading && !error && (
        <>
          {content.length > 0 ? (
            <>              <div className="content-info">
                <p>
                  {searchQuery.trim() 
                    ? `Found ${totalItems} results for "${searchQuery}"${contentType === 'combined' ? ' (movies & series)' : ` in ${contentType}`}` 
                    : `Total: ${totalItems} ${contentType}`
                  } - Page {currentPage} of {totalPages}
                </p>
              </div>
              
              <div className="movie-grid-display">
                {content.map((item, index) => (
                  <div className="movie-grid-item" key={item.content?.id || item.id}>
                    <MovieSliderItem 
                      movie={item} 
                      sliderIndex={index}
                    />
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button 
                    className="pagination-btn" 
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                  >
                    ← Previous
                  </button>
                  
                  {/* Page Numbers */}
                  <div className="pagination-numbers">
                    {currentPage > 3 && (
                      <>
                        <button 
                          className="pagination-btn page-number" 
                          onClick={() => handlePageChange(1)}
                        >
                          1
                        </button>
                        {currentPage > 4 && <span className="pagination-ellipsis">...</span>}
                      </>
                    )}
                    
                    {getPageNumbers().map(pageNum => (
                      <button
                        key={pageNum}
                        className={`pagination-btn page-number ${currentPage === pageNum ? 'active' : ''}`}
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </button>
                    ))}
                    
                    {currentPage < totalPages - 2 && (
                      <>
                        {currentPage < totalPages - 3 && <span className="pagination-ellipsis">...</span>}
                        <button 
                          className="pagination-btn page-number" 
                          onClick={() => handlePageChange(totalPages)}
                        >
                          {totalPages}                </button>
                      </>
                    )}
                  </div>
                  
                  <button 
                    className="pagination-btn" 
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="no-content">
              <p>
                {searchQuery.trim() 
                  ? `No ${contentType} found for "${searchQuery}"` 
                  : `No ${contentType} available`
                }
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BrowsePage;
