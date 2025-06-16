// Import để tạo default export object
import apiClient from './apiClient';
import contentService from './contentService';
import movieService from './movieService';
import seriesService from './seriesService';
import metadataService from './metadataService';
import homeService from './homeService';
import videoService from './videoService';

// Export các services cần thiết cho ứng dụng xem phim miễn phí
export { default as apiClient } from './apiClient';
export { default as contentService } from './contentService';
export { default as movieService } from './movieService';
export { default as seriesService } from './seriesService';
export { default as metadataService } from './metadataService';
export { default as homeService } from './homeService';
export { default as videoService } from './videoService';

// Export tất cả services as một object
const services = {
  apiClient,
  contentService,
  movieService,
  seriesService,
  metadataService,
  homeService,
  videoService,
};

export default services;
