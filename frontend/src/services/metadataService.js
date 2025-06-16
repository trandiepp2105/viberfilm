import apiClient from "./apiClient";

const metadataService = {
  // Lấy danh sách thể loại
  getGenres: async (params = {}) => {
    try {
      const response = await apiClient.get("/film/genres/", { params });
      return response.data;
    } catch (error) {
      console.error("Failed to get genres", error);
      return Promise.reject(error);
    }
  },

  // Tạo thể loại mới (chỉ dành cho admin)
  createGenre: async (genreData) => {
    try {
      const response = await apiClient.post("/film/genres/", genreData);
      return response.data;
    } catch (error) {
      console.error("Failed to create genre", error);
      return Promise.reject(error);
    }
  },

  // Lấy danh sách quốc gia
  getNations: async (params = {}) => {
    try {
      const response = await apiClient.get("/film/nations/", { params });
      return response.data;
    } catch (error) {
      console.error("Failed to get nations", error);
      return Promise.reject(error);
    }
  },

  // Tạo quốc gia mới (chỉ dành cho admin)
  createNation: async (nationData) => {
    try {
      const response = await apiClient.post("/film/nations/", nationData);
      return response.data;
    } catch (error) {
      console.error("Failed to create nation", error);
      return Promise.reject(error);
    }
  },

  // Lấy danh sách tags
  getTags: async (params = {}) => {
    try {
      const response = await apiClient.get("/film/tags/", { params });
      return response.data;
    } catch (error) {
      console.error("Failed to get tags", error);
      return Promise.reject(error);
    }
  },

  // Tạo tag mới (chỉ dành cho admin)
  createTag: async (tagData) => {
    try {
      const response = await apiClient.post("/film/tags/", tagData);
      return response.data;
    } catch (error) {
      console.error("Failed to create tag", error);
      return Promise.reject(error);
    }
  },

  // Lấy danh sách careers
  getCareers: async () => {
    try {
      const response = await apiClient.get("/film/careers/");
      return response.data;
    } catch (error) {
      console.error("Failed to get careers", error);
      return Promise.reject(error);
    }
  },
};

export default metadataService;
