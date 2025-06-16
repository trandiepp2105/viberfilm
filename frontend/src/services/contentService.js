import apiClient from "./apiClient";

const contentService = {
  // Lấy danh sách tất cả content (movies + series)
  getAllContents: async (params = {}) => {
    try {
      const response = await apiClient.get("/film/contents/", { params });
      return response.data;
    } catch (error) {
      console.error("Failed to get contents", error);
      return Promise.reject(error);
    }
  },

  // Lấy chi tiết content theo slug
  getContentBySlug: async (slug) => {
    try {
      const response = await apiClient.get(`/film/contents/${slug}/`);
      return response.data;
    } catch (error) {
      console.error("Failed to get content details", error);
      return Promise.reject(error);
    }
  },

  // Lấy content theo thể loại
  getContentsByGenre: async (genreId, params = {}) => {
    try {
      const response = await apiClient.get("/film/contents/", { 
        params: { genre: genreId, ...params } 
      });
      return response.data;
    } catch (error) {
      console.error("Failed to get contents by genre", error);
      return Promise.reject(error);
    }
  },

  // Lấy content theo quốc gia
  getContentsByNation: async (nationId, params = {}) => {
    try {
      const response = await apiClient.get("/film/contents/", { 
        params: { nation: nationId, ...params } 
      });
      return response.data;
    } catch (error) {
      console.error("Failed to get contents by nation", error);
      return Promise.reject(error);
    }
  },

  // Tìm kiếm content
  searchContents: async (query, params = {}) => {
    try {
      const response = await apiClient.get("/film/contents/", { 
        params: { search: query, ...params } 
      });
      return response.data;
    } catch (error) {
      console.error("Failed to search contents", error);
      return Promise.reject(error);
    }
  },

  // Lấy content theo loại (movie hoặc series)
  getContentsByType: async (contentType, params = {}) => {
    try {
      const response = await apiClient.get("/film/contents/", { 
        params: { content_type: contentType, ...params } 
      });
      return response.data;
    } catch (error) {
      console.error("Failed to get contents by type", error);
      return Promise.reject(error);
    }
  },
};

export default contentService;
