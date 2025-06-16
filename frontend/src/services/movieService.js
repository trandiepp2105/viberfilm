import apiClient from "./apiClient";

const movieService = {
  // Lấy danh sách movies
  getMovies: async (params = {}) => {
    try {
      const response = await apiClient.get("/film/movies/", { params });
      return response.data;
    } catch (error) {
      console.error("Failed to get movies", error);
      return Promise.reject(error);
    }
  },

  // Lấy chi tiết movie theo slug
  getMovieBySlug: async (slug) => {
    try {
      const response = await apiClient.get(`/film/movies/${slug}/`);
      return response.data;
    } catch (error) {
      console.error("Failed to get movie details", error);
      return Promise.reject(error);
    }
  },

  // Tạo movie mới (chỉ dành cho admin)
  createMovie: async (movieData) => {
    try {
      const response = await apiClient.post("/film/movies/", movieData);
      return response.data;
    } catch (error) {
      console.error("Failed to create movie", error);
      return Promise.reject(error);
    }
  },

  // Cập nhật movie (chỉ dành cho admin)
  updateMovie: async (slug, movieData) => {
    try {
      const response = await apiClient.put(`/film/movies/${slug}/`, movieData);
      return response.data;
    } catch (error) {
      console.error("Failed to update movie", error);
      return Promise.reject(error);
    }
  },

  // Xóa movie (chỉ dành cho admin)
  deleteMovie: async (slug) => {
    try {
      const response = await apiClient.delete(`/film/movies/${slug}/`);
      return response.data;
    } catch (error) {
      console.error("Failed to delete movie", error);
      return Promise.reject(error);
    }
  },

  // Lấy movies theo thể loại
  getMoviesByGenre: async (genreId, params = {}) => {
    try {
      const response = await apiClient.get("/film/movies/browse/genre/", { 
        params: { genre: genreId, ...params } 
      });
      return response.data;
    } catch (error) {
      console.error("Failed to get movies by genre", error);
      return Promise.reject(error);
    }
  },

  // Lấy trending movies (sắp xếp theo views)
  getTrendingMovies: async (limit = 12) => {
    try {
      const response = await apiClient.get("/film/movies/", { 
        params: { 
          ordering: '-views',
          limit: limit
        } 
      });
      return response.data;
    } catch (error) {
      console.error("Failed to get trending movies", error);
      return Promise.reject(error);
    }
  },

  // Lấy latest movies (sắp xếp theo release date)
  getLatestMovies: async (limit = 12) => {
    try {
      const response = await apiClient.get("/film/movies/", { 
        params: { 
          ordering: '-release_date',
          limit: limit
        } 
      });
      return response.data;
    } catch (error) {
      console.error("Failed to get latest movies", error);
      return Promise.reject(error);
    }
  },

  // Lấy recently updated movies (cần API endpoint mới từ server)
  getRecentlyUpdatedMovies: async (limit = 12) => {
    try {
      const response = await apiClient.get("/film/movies/recently-updated/", { 
        params: { limit } 
      });
      return response.data;
    } catch (error) {
      console.error("Failed to get recently updated movies", error);
      return Promise.reject(error);
    }
  },
};

export default movieService;
