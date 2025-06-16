import apiClient from './apiClient';

const recommendationService = {
  // Lấy similar movies từ backend API
  getSimilarMovies: async (movieId, limit = 6) => {
    try {
      const response = await apiClient.get('/film/movies/similar/', {
        params: {
          movie_id: movieId,
          limit: limit
        }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get similar movies:', error);
      return [];
    }
  },

  // Lấy similar series từ backend API
  getSimilarSeries: async (seriesId, limit = 6) => {
    try {
      const response = await apiClient.get('/film/series/similar/', {
        params: {
          series_id: seriesId,
          limit: limit
        }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get similar series:', error);
      return [];
    }
  },

  // Lấy movies được recommend cho user
  getRecommendedMovies: async (userId, limit = 12) => {
    try {
      // Có thể implement dựa trên lịch sử xem, rating, etc.
      const response = await apiClient.get('/film/movies/', {
        params: {
          ordering: '-views',
          limit: limit
        }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get recommended movies:', error);
      return [];
    }
  },

  // Lấy movies trending trong genre
  getTrendingInGenre: async (genreId, limit = 8) => {
    try {
      const response = await apiClient.get('/film/movies/', {
        params: {
          genre: genreId,
          ordering: '-views',
          limit: limit
        }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get trending movies in genre:', error);
      return [];
    }
  },

  // Lấy similar content dựa trên genre (fallback method)
  getSimilarByGenre: async (contentType, genreId, excludeId, limit = 6) => {
    try {
      const endpoint = contentType === 'movie' ? '/film/movies/' : '/film/series/';
      const response = await apiClient.get(endpoint, {
        params: {
          genre: genreId,
          ordering: '-views',
          limit: limit + 1 // +1 để loại trừ item hiện tại
        }
      });
      
      // Loại trừ content hiện tại
      return response.data.filter(item => item.id !== excludeId).slice(0, limit);
    } catch (error) {
      console.error('Failed to get similar content by genre:', error);
      return [];
    }
  }
};

export default recommendationService;
