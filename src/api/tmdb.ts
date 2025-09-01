import { Movie, TVShow, MediaDetails, TVShowDetails, Credits, Video, Genre } from "../types/media";

// TMDB API configuration
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

// For demo purposes, we'll use a public TMDB API key
// In production, this should be stored securely
const TMDB_API_KEY = "your_tmdb_api_key_here"; // Replace with actual key

interface TMDBResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

interface TMDBError {
  status_code: number;
  status_message: string;
}

class TMDBService {
  private async makeRequest<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
    url.searchParams.append("api_key", TMDB_API_KEY);
    
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    try {
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        const error: TMDBError = await response.json();
        throw new Error(`TMDB API Error: ${error.status_message}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("TMDB API request failed:", error);
      throw error;
    }
  }

  // Movie endpoints
  async getPopularMovies(page: number = 1): Promise<TMDBResponse<Movie>> {
    return this.makeRequest<TMDBResponse<Movie>>("/movie/popular", { page: page.toString() });
  }

  async getTrendingMovies(timeWindow: "day" | "week" = "week"): Promise<TMDBResponse<Movie>> {
    return this.makeRequest<TMDBResponse<Movie>>(`/trending/movie/${timeWindow}`);
  }

  async getTopRatedMovies(page: number = 1): Promise<TMDBResponse<Movie>> {
    return this.makeRequest<TMDBResponse<Movie>>("/movie/top_rated", { page: page.toString() });
  }

  async getUpcomingMovies(page: number = 1): Promise<TMDBResponse<Movie>> {
    return this.makeRequest<TMDBResponse<Movie>>("/movie/upcoming", { page: page.toString() });
  }

  async getMovieDetails(movieId: number): Promise<MediaDetails> {
    return this.makeRequest<MediaDetails>(`/movie/${movieId}`, { 
      append_to_response: "credits,videos,similar,recommendations" 
    });
  }

  async getMovieCredits(movieId: number): Promise<Credits> {
    return this.makeRequest<Credits>(`/movie/${movieId}/credits`);
  }

  async getMovieVideos(movieId: number): Promise<{ results: Video[] }> {
    return this.makeRequest<{ results: Video[] }>(`/movie/${movieId}/videos`);
  }

  // TV Show endpoints
  async getPopularTVShows(page: number = 1): Promise<TMDBResponse<TVShow>> {
    return this.makeRequest<TMDBResponse<TVShow>>("/tv/popular", { page: page.toString() });
  }

  async getTrendingTVShows(timeWindow: "day" | "week" = "week"): Promise<TMDBResponse<TVShow>> {
    return this.makeRequest<TMDBResponse<TVShow>>(`/trending/tv/${timeWindow}`);
  }

  async getTopRatedTVShows(page: number = 1): Promise<TMDBResponse<TVShow>> {
    return this.makeRequest<TMDBResponse<TVShow>>("/tv/top_rated", { page: page.toString() });
  }

  async getAiringTodayTVShows(page: number = 1): Promise<TMDBResponse<TVShow>> {
    return this.makeRequest<TMDBResponse<TVShow>>("/tv/airing_today", { page: page.toString() });
  }

  async getTVShowDetails(tvId: number): Promise<TVShowDetails> {
    return this.makeRequest<TVShowDetails>(`/tv/${tvId}`, { 
      append_to_response: "credits,videos,similar,recommendations" 
    });
  }

  async getTVShowCredits(tvId: number): Promise<Credits> {
    return this.makeRequest<Credits>(`/tv/${tvId}/credits`);
  }

  async getTVShowVideos(tvId: number): Promise<{ results: Video[] }> {
    return this.makeRequest<{ results: Video[] }>(`/tv/${tvId}/videos`);
  }

  // Search endpoints
  async searchMovies(query: string, page: number = 1): Promise<TMDBResponse<Movie>> {
    return this.makeRequest<TMDBResponse<Movie>>("/search/movie", { 
      query, 
      page: page.toString() 
    });
  }

  async searchTVShows(query: string, page: number = 1): Promise<TMDBResponse<TVShow>> {
    return this.makeRequest<TMDBResponse<TVShow>>("/search/tv", { 
      query, 
      page: page.toString() 
    });
  }

  async searchMulti(query: string, page: number = 1): Promise<TMDBResponse<Movie | TVShow>> {
    return this.makeRequest<TMDBResponse<Movie | TVShow>>("/search/multi", { 
      query, 
      page: page.toString() 
    });
  }

  // Genre endpoints
  async getMovieGenres(): Promise<{ genres: Genre[] }> {
    return this.makeRequest<{ genres: Genre[] }>("/genre/movie/list");
  }

  async getTVGenres(): Promise<{ genres: Genre[] }> {
    return this.makeRequest<{ genres: Genre[] }>("/genre/tv/list");
  }

  // Utility methods
  getImageUrl(path: string | null, size: "w92" | "w154" | "w185" | "w342" | "w500" | "w780" | "original" = "w500"): string | null {
    if (!path) return null;
    return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
  }

  getBackdropUrl(path: string | null, size: "w300" | "w780" | "w1280" | "original" = "w1280"): string | null {
    if (!path) return null;
    return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
  }
}

// Create and export a singleton instance
const tmdbService = new TMDBService();
export default tmdbService;

// Mock data for development when API key is not available
export const mockMovies: Movie[] = [
  {
    id: 1,
    title: "The Dark Knight",
    overview: "Batman raises the stakes in his war on crime with the help of Lt. Jim Gordon and District Attorney Harvey Dent.",
    poster_path: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    backdrop_path: "/hqkIcbrOHL86UncnHIsHVcVmzue.jpg",
    release_date: "2008-07-18",
    vote_average: 9.0,
    vote_count: 32000,
    genre_ids: [28, 80, 18],
    adult: false,
    original_language: "en",
    original_title: "The Dark Knight",
    popularity: 123.456,
    video: false,
  },
  {
    id: 2,
    title: "Inception",
    overview: "A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea.",
    poster_path: "/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
    backdrop_path: "/s3TBrRGB1iav7gFOCNx3H31MoES.jpg",
    release_date: "2010-07-16",
    vote_average: 8.8,
    vote_count: 28000,
    genre_ids: [28, 878, 53],
    adult: false,
    original_language: "en",
    original_title: "Inception",
    popularity: 98.765,
    video: false,
  },
];

export const mockTVShows: TVShow[] = [
  {
    id: 1,
    name: "Breaking Bad",
    overview: "A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine.",
    poster_path: "/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
    backdrop_path: "/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg",
    first_air_date: "2008-01-20",
    vote_average: 9.5,
    vote_count: 15000,
    genre_ids: [18, 80],
    origin_country: ["US"],
    original_language: "en",
    original_name: "Breaking Bad",
    popularity: 234.567,
  },
  {
    id: 2,
    name: "Stranger Things",
    overview: "When a young boy vanishes, a small town uncovers a mystery involving secret experiments and supernatural forces.",
    poster_path: "/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
    backdrop_path: "/56v2KjBlU4XaOv9rVYEQypROD7P.jpg",
    first_air_date: "2016-07-15",
    vote_average: 8.7,
    vote_count: 12000,
    genre_ids: [18, 9648, 10765],
    origin_country: ["US"],
    original_language: "en",
    original_name: "Stranger Things",
    popularity: 187.432,
  },
];