import apiClient from "./apiClient";

const seriesService = {
  // Lấy danh sách series
  getSeries: async (params = {}) => {
    try {
      const response = await apiClient.get("/film/series/", { params });
      return response.data;
    } catch (error) {
      console.error("Failed to get series", error);
      return Promise.reject(error);
    }
  },

  // Lấy chi tiết series theo slug
  getSeriesBySlug: async (slug) => {
    try {
      const response = await apiClient.get(`/film/series/${slug}/`);
      return response.data;
    } catch (error) {
      console.error("Failed to get series details", error);
      return Promise.reject(error);
    }
  },

  // Lấy chi tiết series theo ID
  getSeriesById: async (id) => {
    try {
      const response = await apiClient.get(`/film/series/${id}/`);
      return response.data;
    } catch (error) {
      console.error("Failed to get series details", error);
      return Promise.reject(error);
    }
  },

  // Tạo series mới (chỉ dành cho admin)
  createSeries: async (seriesData) => {
    try {
      const response = await apiClient.post("/film/series/", seriesData);
      return response.data;
    } catch (error) {
      console.error("Failed to create series", error);
      return Promise.reject(error);
    }
  },

  // Cập nhật series (chỉ dành cho admin)
  updateSeries: async (id, seriesData) => {
    try {
      const response = await apiClient.put(`/film/series/${id}/`, seriesData);
      return response.data;
    } catch (error) {
      console.error("Failed to update series", error);
      return Promise.reject(error);
    }
  },

  // Xóa series (chỉ dành cho admin)
  deleteSeries: async (id) => {
    try {
      const response = await apiClient.delete(`/film/series/${id}/`);
      return response.data;
    } catch (error) {
      console.error("Failed to delete series", error);
      return Promise.reject(error);
    }
  },

  // Lấy series theo thể loại
  getSeriesByGenre: async (genreId, params = {}) => {
    try {
      const response = await apiClient.get("/film/series/", { 
        params: { genre: genreId, ...params } 
      });
      return response.data;
    } catch (error) {
      console.error("Failed to get series by genre", error);
      return Promise.reject(error);
    }
  },

  // Lấy trending series (sắp xếp theo views)
  getTrendingSeries: async (limit = 12) => {
    try {
      const response = await apiClient.get("/film/series/", { 
        params: { 
          ordering: '-views',
          limit: limit
        } 
      });
      return response.data;
    } catch (error) {
      console.error("Failed to get trending series", error);
      return Promise.reject(error);
    }
  },

  // Lấy latest series (sắp xếp theo release date)
  getLatestSeries: async (limit = 12) => {
    try {
      const response = await apiClient.get("/film/series/", { 
        params: { 
          ordering: '-release_date',
          limit: limit
        } 
      });
      return response.data;
    } catch (error) {
      console.error("Failed to get latest series", error);
      return Promise.reject(error);
    }
  },

  // Lấy recently updated series (series có episode mới)
  getRecentlyUpdatedSeries: async (limit = 12) => {
    try {
      const response = await apiClient.get("/film/series/recently-updated/", { 
        params: { limit } 
      });
      return response.data;
    } catch (error) {
      console.error("Failed to get recently updated series", error);
      return Promise.reject(error);
    }
  },

  // Lấy tất cả episodes của series theo slug
  getSeriesEpisodes: async (slug) => {
    try {
      const response = await apiClient.get(`/film/series/${slug}/episodes/`);
      return response.data;
    } catch (error) {
      console.error("Failed to get series episodes", error);
      return Promise.reject(error);
    }
  },
};

export default seriesService;
