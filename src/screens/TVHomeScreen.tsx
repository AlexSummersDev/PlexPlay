import React, { useEffect, useState } from "react";
import { ScrollView, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { TVShowsStackParamList } from "../types/navigation";
import { Movie, TVShow } from "../types/media";
import useMediaStore from "../state/mediaStore";
import { SearchBar, HorizontalCarousel, LoadingSpinner, ErrorState } from "../components";
import { ExtendedTMDBService, mockTVShows } from "../api/tmdb";

type TVHomeScreenNavigationProp = NativeStackNavigationProp<TVShowsStackParamList, "Home">;

export default function TVHomeScreen() {
  const navigation = useNavigation<TVHomeScreenNavigationProp>();
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    popularTVShows,
    trendingTVShows,
    topRatedTVShows,
    airingTodayTVShows,
    isLoadingTVShows,
    setPopularTVShows,
    setTrendingTVShows,
    setTopRatedTVShows,
    setAiringTodayTVShows,
    setLoadingTVShows,
  } = useMediaStore();

  const PROVIDERS = [
    { id: 8, name: "Netflix" },
    { id: 337, name: "Disney+" },
    { id: 9, name: "Prime Video" },
  ];
  const [providerShows, setProviderShows] = useState<Record<number, TVShow[]>>({});
  const [providersEnabled, setProvidersEnabled] = useState(false);

  const loadData = async () => {
    try {
      setError(null);
      setLoadingTVShows(true);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Use mock data for now
      setPopularTVShows(mockTVShows);
      setTrendingTVShows(mockTVShows);
      setTopRatedTVShows(mockTVShows);
      setAiringTodayTVShows(mockTVShows);

      // Try provider sections if TMDB key available
      try {
        const svc = new ExtendedTMDBService();
        const ids = PROVIDERS.map(p => p.id);
        const res = await Promise.all(ids.map(async (id) => {
          try {
            const r = await svc.discoverTVByProviders([id], "US", 1);
            return { id, items: r.results || [] };
          } catch {
            return { id, items: [] as TVShow[] };
          }
        }));
        const map: Record<number, TVShow[]> = {};
        res.forEach(({ id, items }) => { map[id] = items; });
        setProviderShows(map);
        setProvidersEnabled(true);
      } catch {
        setProvidersEnabled(false);
      }

    } catch (err) {
      setError("Failed to load TV shows. Please try again.");
      console.error("Error loading TV data:", err);
    } finally {
      setLoadingTVShows(false);
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
    navigation.navigate("Search", { query, type: "tv" });
  };

  const handleSearchFocus = () => {
    navigation.navigate("Search", { query: searchQuery, type: "tv" });
  };

  const handleItemPress = (item: Movie | TVShow) => {
    const type = "title" in item ? "movie" : "tv";
    navigation.navigate("Details", { id: item.id, type });
  };

  const handleSeeAllPress = () => {
    navigation.navigate("Search", { type: "tv" });
  };

  if (isLoadingTVShows && popularTVShows.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-black">
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmit={handleSearchSubmit}
          onFocus={handleSearchFocus}
          placeholder="Search TV shows..."
          className="mb-6"
        />
        <LoadingSpinner 
          fullScreen 
          message="Loading TV shows..." 
        />
      </SafeAreaView>
    );
  }

  if (error && popularTVShows.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-black">
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmit={handleSearchSubmit}
          onFocus={handleSearchFocus}
          placeholder="Search TV shows..."
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
        placeholder="Search TV shows..."
        className="mb-6"
      />
      
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
          title="Trending TV Shows"
          data={trendingTVShows}
          onItemPress={handleItemPress}
          onSeeAllPress={handleSeeAllPress}
          loading={isLoadingTVShows}
          cardSize="large"
          showRating
        />

        <HorizontalCarousel
          title="Popular TV Shows"
          data={popularTVShows}
          onItemPress={handleItemPress}
          onSeeAllPress={handleSeeAllPress}
          loading={isLoadingTVShows}
          showRating
        />

        <HorizontalCarousel
          title="Top Rated TV Shows"
          data={topRatedTVShows}
          onItemPress={handleItemPress}
          onSeeAllPress={handleSeeAllPress}
          loading={isLoadingTVShows}
          showRating
        />

         <HorizontalCarousel
           title="Airing Today"
           data={airingTodayTVShows}
           onItemPress={handleItemPress}
           onSeeAllPress={handleSeeAllPress}
           loading={isLoadingTVShows}
         />

         {providersEnabled && PROVIDERS.map(p => (
           providerShows[p.id] && providerShows[p.id].length > 0 ? (
             <HorizontalCarousel
               key={p.id}
               title={`On ${p.name}`}
               data={providerShows[p.id]}
               onItemPress={handleItemPress}
               onSeeAllPress={handleSeeAllPress}
               loading={false}
               showRating
             />
           ) : null
         ))}
 
         {/* Add some bottom padding for better scrolling */}
         <SafeAreaView edges={["bottom"]} />
      </ScrollView>
    </SafeAreaView>
  );
}