import React, { useEffect, useState } from "react";
import { ScrollView, RefreshControl, Pressable, Text, View, TextInput, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { MoviesStackParamList } from "../types/navigation";
import { Movie, TVShow } from "../types/media";
import useMediaStore from "../state/mediaStore";
import { SearchBar, HorizontalCarousel, LoadingSpinner, ErrorState } from "../components";
import tmdbService, { ExtendedTMDBService, mockMovies } from "../api/tmdb";
import plexService from "../api/plex";
import useSettingsStore from "../state/settingsStore";

type HomeScreenNavigationProp = NativeStackNavigationProp<MoviesStackParamList, "Home">;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Bottom search state
  const [bottomSearchQuery, setBottomSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [plexResults, setPlexResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const plexSettings = useSettingsStore(s => s.plex);

  const {
    popularMovies,
    trendingMovies,
    topRatedMovies,
    upcomingMovies,
    isLoadingMovies,
    setPopularMovies,
    setTrendingMovies,
    setTopRatedMovies,
    setUpcomingMovies,
    setLoadingMovies,
  } = useMediaStore();

  const PROVIDERS = [
    { id: 8, name: "Netflix" },
    { id: 337, name: "Disney+" },
    { id: 9, name: "Prime Video" },
  ];
  const [providerMovies, setProviderMovies] = useState<Record<number, Movie[]>>({});
  const [providersEnabled, setProvidersEnabled] = useState(false);

  const loadData = async () => {
    try {
      setError(null);
      setLoadingMovies(true);

      // For demo purposes, we'll use mock data
      // In production, you would use the actual TMDB API calls:
      // const [popularRes, trendingRes, topRatedRes, upcomingRes, popularTVRes, trendingTVRes] = await Promise.all([
      //   tmdbService.getPopularMovies(),
      //   tmdbService.getTrendingMovies(),
      //   tmdbService.getTopRatedMovies(),
      //   tmdbService.getUpcomingMovies(),
      //   tmdbService.getPopularTVShows(),
      //   tmdbService.getTrendingTVShows(),
      // ]);

      // Try live TMDB data first
      try {
        const [trendingRes, popularRes, topRatedRes, upcomingRes] = await Promise.all([
          tmdbService.getTrendingMovies("week"),
          tmdbService.getPopularMovies(),
          tmdbService.getTopRatedMovies(),
          tmdbService.getUpcomingMovies(),
        ]);
        setTrendingMovies((trendingRes?.results || []).slice(0, 20));
        setPopularMovies((popularRes?.results || []).slice(0, 20));
        setTopRatedMovies((topRatedRes?.results || []).slice(0, 20));
        setUpcomingMovies((upcomingRes?.results || []).slice(0, 20));
      } catch {
        const pad = (arr: typeof mockMovies, n: number = 12) => {
          const base = arr && arr.length ? arr : mockMovies;
          const out: typeof mockMovies = [] as any;
          for (let i = 0; i < n; i++) out.push(base[i % base.length]);
          return out as any;
        };
        setPopularMovies(pad(mockMovies));
        setTrendingMovies(pad(mockMovies));
        setTopRatedMovies(pad(mockMovies));
        setUpcomingMovies(pad(mockMovies));
      }

      // Try provider sections if TMDB key available
      try {
        const svc = new ExtendedTMDBService();
        const ids = PROVIDERS.map(p => p.id);
        const res = await Promise.all(ids.map(async (id) => {
          try {
            const r = await svc.discoverMoviesByProviders([id], "US", 1);
            return { id, items: r.results || [] };
          } catch {
            return { id, items: [] as Movie[] };
          }
        }));
        const map: Record<number, Movie[]> = {};
        res.forEach(({ id, items }) => { map[id] = items; });
        setProviderMovies(map);
        setProvidersEnabled(true);
      } catch {
        setProvidersEnabled(false);
      }

    } catch (err) {
      setError("Failed to load content. Please try again.");
      console.error("Error loading data:", err);
    } finally {
      setLoadingMovies(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleSearchSubmit = (query: string) => {
    navigation.navigate("Search", { query });
  };

  const handleSearchFocus = () => {
    navigation.navigate("Search", { query: searchQuery });
  };

  const handleItemPress = (item: Movie | TVShow) => {
    const type = "title" in item ? "movie" : "tv";
    navigation.navigate("Details", { id: item.id, type });
  };

  const handleSeeAllPress = () => {
    // Navigate to a filtered search or category view
    navigation.navigate("Search", { type: "movie" });
  };

  const handleBottomSearch = async () => {
    if (!bottomSearchQuery.trim()) return;

    try {
      setIsSearching(true);
      setHasSearched(true);
      setSearchResults([]);
      setPlexResults([]);

      // Search TMDB
      const tmdbResults = await tmdbService.searchMovies(bottomSearchQuery);
      const movies = (tmdbResults?.results || []).slice(0, 10);
      setSearchResults(movies);

      // Search Plex if connected
      if (plexSettings.isConnected && plexSettings.serverUrl && plexSettings.token) {
        try {
          plexService.setCredentials(plexSettings.serverUrl, plexSettings.token);
          const plexMatches: any[] = [];

          for (const movie of movies) {
            const year = movie.release_date ? new Date(movie.release_date).getFullYear() : undefined;
            const plexItem = await plexService.findMediaByTitle(movie.title, year, 'movie');
            if (plexItem) {
              plexMatches.push({ movie, plexItem });
            }
          }

          setPlexResults(plexMatches);
        } catch (error) {
          console.log("Plex search failed silently");
        }
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleMoviePress = (movie: Movie) => {
    navigation.navigate("Details", { id: movie.id, type: "movie" });
  };

  const handleTrailerPress = async (movie: Movie) => {
    try {
      const videos = await tmdbService.getMovieVideos(movie.id);
      const trailer = videos.results?.find(v => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser"));
      if (trailer?.key) {
        // Navigate to details and open trailer
        navigation.navigate("Details", { id: movie.id, type: "movie" });
      }
    } catch (error) {
      console.error("Trailer error:", error);
    }
  };

  if (isLoadingMovies && popularMovies.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-black">
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmit={handleSearchSubmit}
          onFocus={handleSearchFocus}
          className="mb-6"
        />
        <LoadingSpinner 
          fullScreen 
          message="Loading amazing content..." 
        />
      </SafeAreaView>
    );
  }

  if (error && popularMovies.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-black">
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmit={handleSearchSubmit}
          onFocus={handleSearchFocus}
          className="mb-6"
        />
        <ErrorState
          fullScreen
          message={error}
          onRetry={loadData}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSubmit={handleSearchSubmit}
        onFocus={handleSearchFocus}
        className="mb-4"
      />

      <Pressable
        onPress={() => navigation.navigate("Providers")}
        className="mx-4 mb-4 px-4 py-3 bg-gray-800 rounded-xl"
        style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
      >
        <Text className="text-white font-semibold">Browse by Service</Text>
        <Text className="text-gray-400 text-xs mt-1">Disney+, Netflix, Paramount+, and more</Text>
      </Pressable>
      
      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#60A5FA"
            colors={["#60A5FA"]}
          />
        }
      >
        <HorizontalCarousel
          title="Trending Movies"
          data={trendingMovies}
          onItemPress={handleItemPress}
          onSeeAllPress={handleSeeAllPress}
          loading={isLoadingMovies}
          cardSize="large"
          showRating
        />

        <HorizontalCarousel
          title="Popular Movies"
          data={popularMovies}
          onItemPress={handleItemPress}
          onSeeAllPress={handleSeeAllPress}
          loading={isLoadingMovies}
          showRating
        />

         <HorizontalCarousel
           title="Top Rated Movies"
           data={topRatedMovies}
           onItemPress={handleItemPress}
           onSeeAllPress={handleSeeAllPress}
           loading={isLoadingMovies}
           showRating
         />
 
         <HorizontalCarousel
           title="Upcoming Movies"
           data={upcomingMovies}
           onItemPress={handleItemPress}
           onSeeAllPress={handleSeeAllPress}
           loading={isLoadingMovies}
         />

         {providersEnabled && PROVIDERS.map(p => (
           providerMovies[p.id] && providerMovies[p.id].length > 0 ? (
             <HorizontalCarousel
               key={p.id}
               title={`On ${p.name}`}
               data={providerMovies[p.id]}
               onItemPress={handleItemPress}
               onSeeAllPress={handleSeeAllPress}
               loading={false}
               showRating
             />
           ) : null
         ))}

        {/* Bottom Search Section */}
        <View className="mt-8 mb-4 px-4">
          <View className="mb-4">
            <Text className="text-white text-2xl font-bold mb-2">Search Movies</Text>
            <Text className="text-gray-400 text-sm">Find movies in your Plex library or discover new ones</Text>
          </View>

          <View className="flex-row items-center mb-4">
            <View className="flex-1 mr-2">
              <TextInput
                value={bottomSearchQuery}
                onChangeText={setBottomSearchQuery}
                onSubmitEditing={handleBottomSearch}
                placeholder="Search by movie name..."
                placeholderTextColor="#6B7280"
                className="bg-gray-800 text-white px-4 py-3 rounded-lg"
                returnKeyType="search"
              />
            </View>
            <Pressable
              onPress={handleBottomSearch}
              disabled={isSearching || !bottomSearchQuery.trim()}
              className="bg-blue-600 px-4 py-3 rounded-lg"
              style={({ pressed }) => ({
                opacity: pressed || isSearching || !bottomSearchQuery.trim() ? 0.6 : 1,
              })}
            >
              {isSearching ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="search" size={24} color="#FFFFFF" />
              )}
            </Pressable>
          </View>

          {/* Search Results */}
          {hasSearched && !isSearching && (
            <>
              {/* Plex Library Results */}
              {plexResults.length > 0 && (
                <View className="mb-6">
                  <View className="flex-row items-center mb-3">
                    <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                    <Text className="text-emerald-400 text-lg font-semibold ml-2">
                      In Your Plex Library ({plexResults.length})
                    </Text>
                  </View>
                  {plexResults.map(({ movie, plexItem }) => (
                    <Pressable
                      key={movie.id}
                      onPress={() => handleMoviePress(movie)}
                      className="flex-row mb-3 bg-emerald-900/20 border border-emerald-700/40 rounded-lg p-3"
                      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                    >
                      <View className="flex-1">
                        <Text className="text-white font-semibold text-base mb-1">
                          {movie.title}
                        </Text>
                        <Text className="text-emerald-300/70 text-xs">
                          {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
                        </Text>
                        {plexItem.addedAt && (
                          <Text className="text-emerald-300/60 text-xs mt-1">
                            Added {new Date(plexItem.addedAt * 1000).toLocaleDateString()}
                          </Text>
                        )}
                      </View>
                      <View className="justify-center">
                        <Ionicons name="chevron-forward" size={24} color="#10B981" />
                      </View>
                    </Pressable>
                  ))}
                </View>
              )}

              {/* Other Results (Not in Plex) */}
              {searchResults.filter(m => !plexResults.find(p => p.movie.id === m.id)).length > 0 && (
                <View className="mb-6">
                  <View className="flex-row items-center mb-3">
                    <Ionicons name="film-outline" size={20} color="#60A5FA" />
                    <Text className="text-blue-400 text-lg font-semibold ml-2">
                      Available to Download ({searchResults.filter(m => !plexResults.find(p => p.movie.id === m.id)).length})
                    </Text>
                  </View>
                  {searchResults
                    .filter(m => !plexResults.find(p => p.movie.id === m.id))
                    .map(movie => (
                      <View
                        key={movie.id}
                        className="mb-3 bg-gray-800/80 border border-gray-700/50 rounded-lg p-3"
                      >
                        <Pressable
                          onPress={() => handleMoviePress(movie)}
                          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                        >
                          <Text className="text-white font-semibold text-base mb-1">
                            {movie.title}
                          </Text>
                          <Text className="text-gray-400 text-xs mb-2">
                            {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
                            {movie.vote_average > 0 && ` • ⭐ ${movie.vote_average.toFixed(1)}`}
                          </Text>
                        </Pressable>

                        <View className="flex-row mt-2 gap-2">
                          <Pressable
                            onPress={() => handleMoviePress(movie)}
                            className="flex-1 bg-blue-600 py-2 rounded-lg flex-row items-center justify-center"
                            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                          >
                            <Ionicons name="download-outline" size={16} color="#FFFFFF" />
                            <Text className="text-white text-sm font-medium ml-2">Download</Text>
                          </Pressable>

                          <Pressable
                            onPress={() => handleTrailerPress(movie)}
                            className="flex-1 bg-gray-700 py-2 rounded-lg flex-row items-center justify-center"
                            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                          >
                            <Ionicons name="play-circle-outline" size={16} color="#FFFFFF" />
                            <Text className="text-white text-sm font-medium ml-2">Trailer</Text>
                          </Pressable>
                        </View>
                      </View>
                    ))}
                </View>
              )}

              {/* No Results */}
              {searchResults.length === 0 && (
                <View className="py-8 items-center">
                  <Ionicons name="search-outline" size={48} color="#6B7280" />
                  <Text className="text-gray-400 text-center mt-4">
                    No movies found for "{bottomSearchQuery}"
                  </Text>
                </View>
              )}
            </>
          )}
        </View>


        {/* Add some bottom padding for better scrolling */}
        <SafeAreaView edges={["bottom"]} />
      </ScrollView>
    </SafeAreaView>
  );
}