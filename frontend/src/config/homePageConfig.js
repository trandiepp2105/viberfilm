// Cấu hình cho Home Page Layout
export const HOME_PAGE_CONFIG = {
  // Hero/Banner Section
  hero: {
    title: "Xem Phim Anime & Movies Miễn Phí",
    description: "Khám phá hàng ngàn bộ phim anime, movies và series chất lượng cao",
    featuredCount: 5,
    autoSlide: true,
    slideInterval: 5000 // 5 seconds
  },

  // Các sections chính trên home page (đơn giản hóa)
  sections: [
    {
      id: "trending-movies",
      title: "🔥 Movies Trending",
      serviceMethod: "movieService.getTrendingMovies",
      limit: 12,
      priority: 1
    },
    {
      id: "trending-series",
      title: "🔥 Series Trending", 
      serviceMethod: "seriesService.getTrendingSeries",
      limit: 12,
      priority: 2
    },
    {
      id: "latest-movies",
      title: "🆕 Movies Mới Nhất",
      serviceMethod: "movieService.getLatestMovies",
      limit: 12,
      priority: 3
    },
    {
      id: "latest-series",
      title: "🆕 Series Mới Nhất",
      serviceMethod: "seriesService.getLatestSeries", 
      limit: 12,
      priority: 4
    },
    {
      id: "recently-updated",
      title: "🔄 Series Vừa Cập Nhật",
      serviceMethod: "seriesService.getRecentlyUpdatedSeries",
      limit: 12,
      priority: 5
    }
  ],

  // Layout configuration
  layout: {
    itemsPerRow: {
      mobile: 2,
      tablet: 4, 
      desktop: 6
    },
    cardAspectRatio: '2/3',
    horizontalScroll: true
  }
};

export default HOME_PAGE_CONFIG;
