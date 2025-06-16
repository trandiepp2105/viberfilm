# 🎬 ViberFilm Frontend Services

Thư mục này chứa các services cần thiết để giao tiếp với backend API cho **ứng dụng xem phim miễn phí** (không cần authentication).

## 📁 Cấu trúc Services (Đã tối ưu)

### **Core Services**
- `apiClient.js` - Axios client đơn giản (không có token auth)
- `contentService.js` - Service chung cho movies và series  
- `movieService.js` - Service chuyên biệt cho movies
- `seriesService.js` - Service cho series management

### **Supporting Services**
- `metadataService.js` - Genres, nations, tags
- `homeService.js` - Tập hợp dữ liệu cho home page

## 🔧 API Client (Simplified)

**Thay đổi quan trọng**: API Client đã được đơn giản hóa, loại bỏ hoàn toàn:
- ❌ Token authentication
- ❌ Cookie management  
- ❌ Refresh token logic
- ❌ User session handling

**Chỉ giữ lại**:
- ✅ Basic HTTP client với axios
- ✅ Error handling cho network issues
- ✅ Development logging
- ✅ Timeout configuration

## 🚀 Cách sử dụng

### Import services
```javascript
// Import các services chính
import { movieService, seriesService, homeService } from '../services';
```

### Sử dụng trong React Components

#### 1. Lấy dữ liệu cho Home Page (Đơn giản hóa)
```javascript
import { homeService } from '../services';

const HomePage = () => {
  const [homeData, setHomeData] = useState(null);
  
  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        // Một lần call để lấy tất cả dữ liệu cho home page
        const data = await homeService.getHomePageData();
        
        setHomeData({
          trendingMovies: data.trendingMovies,    // Top movies theo views
          trendingSeries: data.trendingSeries,    // Top series theo views  
          latestMovies: data.latestMovies,        // Movies mới nhất theo release_date
          latestSeries: data.latestSeries,        // Series mới nhất theo release_date
          recentlyUpdated: data.recentlyUpdatedSeries, // Series có episode mới
          popularGenres: data.popularGenres
        });
      } catch (error) {
        console.error('Failed to load home data:', error);
      }
    };
    
    fetchHomeData();
  }, []);
  
  // Render components...
};
```

#### 2. Sử dụng từng service riêng biệt
```javascript
import { movieService, seriesService } from '../services';

const MoviesPage = () => {
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [latestMovies, setLatestMovies] = useState([]);
  
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        // Trending movies (sắp xếp theo views, limit 12)
        const trending = await movieService.getTrendingMovies(12);
        setTrendingMovies(trending.results);
        
        // Latest movies (sắp xếp theo release_date, limit 12)  
        const latest = await movieService.getLatestMovies(12);
        setLatestMovies(latest.results);
      } catch (error) {
        console.error('Failed to load movies:', error);
      }
    };
    
    fetchMovies();
  }, []);
};
```

#### 2. Tìm kiếm phim
```javascript
import { searchService } from '../services';

const SearchPage = () => {
  const [searchResults, setSearchResults] = useState([]);
  
  const handleSearch = async (query) => {
    try {
      const results = await searchService.searchContents(query, {
        limit: 20,
        page: 1
      });
      setSearchResults(results.results);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };
};
```

#### 3. Lấy chi tiết phim
```javascript
import { contentService, statisticsService } from '../services';

const MovieDetailPage = ({ slug }) => {
  const [movie, setMovie] = useState(null);
  
  useEffect(() => {
    const fetchMovie = async () => {
      try {
        // Lấy thông tin phim
        const movieData = await contentService.getContentBySlug(slug);
        setMovie(movieData);
        
        // Tăng lượt xem
        await statisticsService.incrementView(slug);
      } catch (error) {
        console.error('Failed to load movie:', error);
      }
    };
    
    fetchMovie();
  }, [slug]);
};
```

#### 4. Lọc phim theo thể loại
```javascript
import { contentService } from '../services';

const GenrePage = ({ genreSlug }) => {
  const [movies, setMovies] = useState([]);
  
  useEffect(() => {
    const fetchMoviesByGenre = async () => {
      try {
        const results = await contentService.getContentsByGenre(genreSlug, {
          limit: 24,
          ordering: '-views'
        });
        setMovies(results.results);
      } catch (error) {
        console.error('Failed to load movies by genre:', error);
      }
    };
    
    fetchMoviesByGenre();
  }, [genreSlug]);
};
```

## 🎯 API Endpoints Chính (Đơn giản hóa)

### Movie Service APIs
- `GET /film/movies/?ordering=-views&limit=12` - Trending movies
- `GET /film/movies/?ordering=-release_date&limit=12` - Latest movies  
- `GET /film/movies/recently-updated/` - Recently updated movies (cần tạo)

### Series Service APIs  
- `GET /film/series/?ordering=-views&limit=12` - Trending series
- `GET /film/series/?ordering=-release_date&limit=12` - Latest series
- `GET /film/series/recently-updated/` - Recently updated series (cần tạo)

### Content APIs (Chung)
- `GET /film/contents/{slug}/` - Chi tiết theo slug
- `GET /film/genres/` - Thể loại
- `GET /film/nations/` - Quốc gia

## 📊 Home Page Sections

Chỉ cần 5 sections chính:
1. **Trending Movies** - `movieService.getTrendingMovies(12)`
2. **Trending Series** - `seriesService.getTrendingSeries(12)` 
3. **Latest Movies** - `movieService.getLatestMovies(12)`
4. **Latest Series** - `seriesService.getLatestSeries(12)`
5. **Recently Updated** - `seriesService.getRecentlyUpdatedSeries(12)`

## 🔧 Backend APIs cần tạo thêm

Chỉ cần thêm 2 endpoints cho "Recently Updated":
- `GET /film/movies/recently-updated/` 
- `GET /film/series/recently-updated/`

## 🔧 Error Handling

Tất cả services đều có error handling và sẽ log errors ra console. Trong production, bạn có thể thêm error tracking service như Sentry.

```javascript
try {
  const data = await contentService.getAllContents();
} catch (error) {
  // Error đã được log trong service
  // Xử lý UI error state ở đây
  setError('Không thể tải dữ liệu');
}
```

## 🚀 Performance Tips

1. **Sử dụng React Query/SWR** cho caching và background updates
2. **Lazy loading** cho hình ảnh và components
3. **Pagination** thay vì load tất cả data một lúc
4. **Debounce** cho search input

## 📝 Notes

- Tất cả images đã được trả về dưới dạng full URLs
- API sử dụng slug thay vì ID cho SEO-friendly
- Không có authentication cho việc xem phim (chỉ admin mới cần login)
- Lượt xem được track thông qua `statisticsService.incrementView()`
