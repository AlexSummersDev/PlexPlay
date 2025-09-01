import React, { useEffect, useState } from "react";
import { ScrollView, RefreshControl, Pressable, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { MoviesStackParamList } from "../types/navigation";
import { Movie, TVShow } from "../types/media";
import useMediaStore from "../state/mediaStore";
import { SearchBar, HorizontalCarousel, LoadingSpinner, ErrorState } from "../components";
import tmdbService, { ExtendedTMDBService, mockMovies, mockTVShows } from "../api/tmdb";

type HomeScreenNavigationProp = NativeStackNavigationProp<MoviesStackParamList, "Home">;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    popularMovies,
    trendingMovies,
    topRatedMovies,
    upcomingMovies,
    popularTVShows,
    trendingTVShows,
    isLoadingMovies,
    setPopularMovies,
    setTrendingMovies,
    setTopRatedMovies,
    setUpcomingMovies,
    setPopularTVShows,
    setTrendingTVShows,
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

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Use mock data for now
      setPopularMovies(mockMovies);
      setTrendingMovies(mockMovies);
      setTopRatedMovies(mockMovies);
      setUpcomingMovies(mockMovies);
      setPopularTVShows(mockTVShows);
      setTrendingTVShows(mockTVShows);

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
 
         <HorizontalCarousel
          title="Popular TV Shows"
          data={popularTVShows}
          onItemPress={handleItemPress}
          onSeeAllPress={handleSeeAllPress}
          loading={isLoadingMovies}
          showRating
        />

        <HorizontalCarousel
          title="Trending TV Shows"
          data={trendingTVShows}
          onItemPress={handleItemPress}
          onSeeAllPress={handleSeeAllPress}
          loading={isLoadingMovies}
          showRating
        />

        {/* Add some bottom padding for better scrolling */}
        <SafeAreaView edges={["bottom"]} />
      </ScrollView>
    </SafeAreaView>
  );
}