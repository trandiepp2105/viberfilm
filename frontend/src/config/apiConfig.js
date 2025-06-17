// Cấu hình API cho ứng dụng xem phim miễn phí
export const API_CONFIG = {
  // Base URL cho backend API
  BASE_URL: process.env.REACT_APP_API_URL,
  
  // Timeout cho requests (ms)
  TIMEOUT: 15000,
  
  // Headers mặc định
  DEFAULT_HEADERS: {
    "Content-Type": "application/json",
  },
  
  // Pagination settings
  DEFAULT_PAGE_SIZE: 12,
  MAX_PAGE_SIZE: 50,
  
  // Cấu hình endpoints
  ENDPOINTS: {
    MOVIES: "/film/movies/",
    SERIES: "/film/series/",
    GENRES: "/film/genres/",  
    NATIONS: "/film/nations/",
    TAGS: "/film/tags/",
    VIDEOS: "/video/videos/",
    
    // Endpoints mới cần tạo ở backend
    MOVIES_RECENTLY_UPDATED: "/film/movies/recently-updated/",
    SERIES_RECENTLY_UPDATED: "/film/series/recently-updated/",
  },
  
  // Development mode
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
};

export default API_CONFIG;
