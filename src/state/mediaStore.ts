import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Movie, TVShow, WatchlistItem, Genre } from "../types/media";

interface MediaState {
  // Movies
  popularMovies: Movie[];
  trendingMovies: Movie[];
  topRatedMovies: Movie[];
  upcomingMovies: Movie[];
  movieGenres: Genre[];
  
  // TV Shows
  popularTVShows: TVShow[];
  trendingTVShows: TVShow[];
  topRatedTVShows: TVShow[];
  airingTodayTVShows: TVShow[];
  tvGenres: Genre[];
  
  // Search
  searchResults: (Movie | TVShow)[];
  searchQuery: string;
  searchType: "movie" | "tv" | "multi";
  
  // Watchlist (persisted)
  watchlist: WatchlistItem[];
  
  // Loading states
  isLoadingMovies: boolean;
  isLoadingTVShows: boolean;
  isSearching: boolean;
  
  // Actions
  setPopularMovies: (movies: Movie[]) => void;
  setTrendingMovies: (movies: Movie[]) => void;
  setTopRatedMovies: (movies: Movie[]) => void;
  setUpcomingMovies: (movies: Movie[]) => void;
  setMovieGenres: (genres: Genre[]) => void;
  
  setPopularTVShows: (shows: TVShow[]) => void;
  setTrendingTVShows: (shows: TVShow[]) => void;
  setTopRatedTVShows: (shows: TVShow[]) => void;
  setAiringTodayTVShows: (shows: TVShow[]) => void;
  setTVGenres: (genres: Genre[]) => void;
  
  setSearchResults: (results: (Movie | TVShow)[]) => void;
  setSearchQuery: (query: string) => void;
  setSearchType: (type: "movie" | "tv" | "multi") => void;
  
  addToWatchlist: (item: WatchlistItem) => void;
  removeFromWatchlist: (id: number, type: "movie" | "tv") => void;
  isInWatchlist: (id: number, type: "movie" | "tv") => boolean;
  
  setLoadingMovies: (loading: boolean) => void;
  setLoadingTVShows: (loading: boolean) => void;
  setSearching: (searching: boolean) => void;
}

const useMediaStore = create<MediaState>()(
  persist(
    (set, get) => ({
      // Initial state
      popularMovies: [],
      trendingMovies: [],
      topRatedMovies: [],
      upcomingMovies: [],
      movieGenres: [],
      
      popularTVShows: [],
      trendingTVShows: [],
      topRatedTVShows: [],
      airingTodayTVShows: [],
      tvGenres: [],
      
      searchResults: [],
      searchQuery: "",
      searchType: "multi",
      
      watchlist: [],
      
      isLoadingMovies: false,
      isLoadingTVShows: false,
      isSearching: false,
      
      // Actions
      setPopularMovies: (movies) => set({ popularMovies: movies }),
      setTrendingMovies: (movies) => set({ trendingMovies: movies }),
      setTopRatedMovies: (movies) => set({ topRatedMovies: movies }),
      setUpcomingMovies: (movies) => set({ upcomingMovies: movies }),
      setMovieGenres: (genres) => set({ movieGenres: genres }),
      
      setPopularTVShows: (shows) => set({ popularTVShows: shows }),
      setTrendingTVShows: (shows) => set({ trendingTVShows: shows }),
      setTopRatedTVShows: (shows) => set({ topRatedTVShows: shows }),
      setAiringTodayTVShows: (shows) => set({ airingTodayTVShows: shows }),
      setTVGenres: (genres) => set({ tvGenres: genres }),
      
      setSearchResults: (results) => set({ searchResults: results }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setSearchType: (type) => set({ searchType: type }),
      
      addToWatchlist: (item) => {
        const { watchlist } = get();
        const exists = watchlist.find(w => w.id === item.id && w.type === item.type);
        if (!exists) {
          set({ watchlist: [...watchlist, item] });
        }
      },
      
      removeFromWatchlist: (id, type) => {
        const { watchlist } = get();
        set({ watchlist: watchlist.filter(item => !(item.id === id && item.type === type)) });
      },
      
      isInWatchlist: (id, type) => {
        const { watchlist } = get();
        return watchlist.some(item => item.id === id && item.type === type);
      },
      
      setLoadingMovies: (loading) => set({ isLoadingMovies: loading }),
      setLoadingTVShows: (loading) => set({ isLoadingTVShows: loading }),
      setSearching: (searching) => set({ isSearching: searching }),
    }),
    {
      name: "media-storage",
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist watchlist, not the API data
      partialize: (state) => ({ watchlist: state.watchlist }),
    }
  )
);

export default useMediaStore;