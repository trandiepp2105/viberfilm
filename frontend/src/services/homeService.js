import movieService from "./movieService";
import seriesService from "./seriesService";

const homeService = {
  // Lấy tất cả dữ liệu cần thiết cho home page
  getHomePageData: async () => {
    try {
      const [
        trendingMovies,
        trendingSeries, 
        latestMovies,
        latestSeries,
        recentlyUpdatedSeries
      ] = await Promise.all([
        movieService.getTrendingMovies(12),
        seriesService.getTrendingSeries(12),
        movieService.getLatestMovies(12),
        seriesService.getLatestSeries(12),
        seriesService.getRecentlyUpdatedSeries(12)
      ]);
      
      return {
        trendingMovies: trendingMovies,
        trendingSeries: trendingSeries,
        latestMovies: latestMovies,
        latestSeries: latestSeries,
        recentlyUpdatedSeries: recentlyUpdatedSeries
      };
    } catch (error) {
      console.error("Failed to get home page data", error);
      return Promise.reject(error);
    }
  },

  // Lấy thống kê nhanh
  getQuickStats: async () => {
    try {
      const [moviesCount, seriesCount] = await Promise.all([
        movieService.getMovies({ limit: 1 }),
        seriesService.getSeries({ limit: 1 })
      ]);

      return {
        totalMovies: moviesCount.count || 0,
        totalSeries: seriesCount.count || 0
      };
    } catch (error) {
      console.error("Failed to get quick stats", error);
      return Promise.reject(error);
    }
  },

  // Lấy phim nổi bật cho banner (top trending)
  getFeaturedContents: async (limit = 5) => {
    try {
      // Lấy mix của trending movies và series
      const [movies, series] = await Promise.all([
        movieService.getTrendingMovies(3),
        seriesService.getTrendingSeries(2)
      ]);

      const featured = [
        ...(movies.results || movies).slice(0, 3),
        ...(series.results || series).slice(0, 2)
      ];

      // Shuffle để random order
      return featured.sort(() => Math.random() - 0.5).slice(0, limit);
    } catch (error) {
      console.error("Failed to get featured contents", error);
      return Promise.reject(error);
    }
  },
};

export default homeService;