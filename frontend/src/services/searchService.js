import apiClient from './apiClient';

// Combined search for both movies and series
export const combinedSearch = async (query, offset = 0, limit = 20) => {
  try {
    const params = new URLSearchParams({
      search: query,
      offset: offset.toString(),
      limit: limit.toString()
    });
    
    const response = await apiClient.get(`/film/search/combined/?${params}`);
    return response.data;
  } catch (error) {
    console.error('Combined search error:', error);
    throw error;
  }
};

const searchService = {
  combinedSearch
};

export default searchService;