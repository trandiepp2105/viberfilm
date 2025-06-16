import apiClient from './apiClient';
import { API_CONFIG } from '../config/apiConfig';

const videoService = {
  // Lấy thông tin streaming video
  getStreamingVideo: async (videoId) => {
    try {
      const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.VIDEOS}/${videoId}/stream/`);
      return response.data;
    } catch (error) {
      console.error("Failed to get streaming video", error);
      // Return mock data for development
      return {
        hls_url: `/media/videos/sample_video.m3u8`,
        video_url: `/media/videos/sample_video.mp4`,
        title: "Sample Video",
        duration: 1500
      };
    }
  },

  // Lấy danh sách video của một series
  getSeriesVideos: async (seriesId) => {
    try {
      const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.SERIES}/${seriesId}/videos/`);
      return response.data;
    } catch (error) {
      console.error("Failed to get series videos", error);
      return Promise.reject(error);
    }
  },

  // Lấy video của một episode cụ thể
  getEpisodeVideo: async (contentId, seasonNumber, episodeNumber) => {
    try {
      const response = await apiClient.get(
        `/film/series/${contentId}/seasons/${seasonNumber}/episodes/${episodeNumber}/video/`
      );
      return response.data;
    } catch (error) {
      console.error("Failed to get episode video", error);
      // Return demo video as fallback
      return {
        hls_url: `/media/videos/demo/hls/index.m3u8`,
        original_url: `/media/videos/demo/demo_video.mp4`,
        title: "Demo Episode Video",
        duration: 1480
      };
    }
  },

  // Lấy thông tin video của movie
  getMovieVideo: async (movieId) => {
    try {
      const response = await apiClient.get(`/film/movies/${movieId}/video/`);
      return response.data;
    } catch (error) {
      console.error("Failed to get movie video", error);
      // Return demo video as fallback
      return {
        hls_url: `/media/videos/demo/hls/index.m3u8`,
        original_url: `/media/videos/demo/demo_video.mp4`,
        title: "Demo Video",
        duration: 1480
      };
    }
  },

  // Track view duration for movies
  trackMovieView: async (sessionId, contentId, durationSeconds) => {
    try {
      const response = await apiClient.post('/film/track-view/', {
        session_id: sessionId,
        duration_seconds: durationSeconds,
        content_id: contentId
      });
      return response.data;
    } catch (error) {
      console.error("Failed to track movie view", error);
      return Promise.reject(error);
    }
  },

  // Track view duration for episodes
  trackEpisodeView: async (sessionId, contentId, seasonNumber, episodeNumber, durationSeconds) => {
    try {
      const response = await apiClient.post('/film/track-episode-view/', {
        session_id: sessionId,
        duration_seconds: durationSeconds,
        content_id: contentId,
        season_number: seasonNumber,
        episode_number: episodeNumber
      });
      return response.data;
    } catch (error) {
      console.error("Failed to track episode view", error);
      return Promise.reject(error);
    }
  },

  // Generate unique session ID for view tracking
  generateSessionId: () => {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
};

export default videoService;
