import React, { useState, useEffect } from "react";
import { View, Text, FlatList, Pressable, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { MoviesStackParamList } from "../types/navigation";
import { Movie, TVShow } from "../types/media";
import useMediaStore from "../state/mediaStore";
import { SearchBar, LoadingSpinner, ErrorState } from "../components";
import { mockMovies, mockTVShows } from "../api/tmdb";

type SearchScreenNavigationProp = NativeStackNavigationProp<MoviesStackParamList, "Search">;
type SearchScreenRouteProp = RouteProp<MoviesStackParamList, "Search">;

interface SearchResultItemProps {
  item: Movie | TVShow;
  onPress: () => void;
}

function SearchResultItem({ item, onPress }: SearchResultItemProps) {
  const isMovie = "title" in item;
  const title = isMovie ? item.title : item.name;
  const year = isMovie 
    ? item.release_date ? new Date(item.release_date).getFullYear() : ""
    : item.first_air_date ? new Date(item.first_air_date).getFullYear() : "";

  const posterUrl = item.poster_path 
    ? `https://image.tmdb.org/t/p/w185${item.poster_path}`
    : null;

  return (
    <Pressable
      onPress={onPress}
      className="flex-row bg-gray-800/50 rounded-lg p-3 mb-3 mx-4"
      style={({ pressed }) => ({
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <View className="w-16 h-24 rounded-lg overflow-hidden bg-gray-700 mr-3">
        {posterUrl ? (
          <Image
            source={{ uri: posterUrl }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-full items-center justify-center">
            <Ionicons 
              name={isMovie ? "film-outline" : "tv-outline"} 
              size={20} 
              color="#9CA3AF" 
            />
          </View>
        )}
      </View>
      
      <View className="flex-1">
        <Text className="text-white font-semibold text-base mb-1" numberOfLines={2}>
          {title}
        </Text>
        
        <View className="flex-row items-center mb-2">
          <Text className="text-gray-400 text-sm">
            {year}
          </Text>
          <View className="w-1 h-1 bg-gray-500 rounded-full mx-2" />
          <Text className="text-gray-400 text-sm capitalize">
            {isMovie ? "Movie" : "TV Show"}
          </Text>
          {item.vote_average > 0 && (
            <>
              <View className="w-1 h-1 bg-gray-500 rounded-full mx-2" />
              <View className="flex-row items-center">
                <Ionicons name="star" size={12} color="#FCD34D" />
                <Text className="text-gray-400 text-sm ml-1">
                  {item.vote_average.toFixed(1)}
                </Text>
              </View>
            </>
          )}
        </View>
        
        <Text className="text-gray-300 text-sm" numberOfLines={3}>
          {item.overview || "No description available."}
        </Text>
      </View>
    </Pressable>
  );
}

export default function SearchScreen() {
  const navigation = useNavigation<SearchScreenNavigationProp>();
  const route = useRoute<SearchScreenRouteProp>();
  
  const [searchQuery, setSearchQuery] = useState(route.params?.query || "");
  const [searchType, setSearchType] = useState<"movie" | "tv" | "multi">(route.params?.type || "multi");
  const [results, setResults] = useState<(Movie | TVShow)[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { setSearchResults, setSearchQuery: setStoreSearchQuery } = useMediaStore();

  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // For demo purposes, filter mock data based on search query
      let searchResults: (Movie | TVShow)[] = [];
      
      if (searchType === "movie" || searchType === "multi") {
        const movieResults = mockMovies.filter(movie => 
          movie.title.toLowerCase().includes(query.toLowerCase()) ||
          movie.overview.toLowerCase().includes(query.toLowerCase())
        );
        searchResults = [...searchResults, ...movieResults];
      }
      
      if (searchType === "tv" || searchType === "multi") {
        const tvResults = mockTVShows.filter(show => 
          show.name.toLowerCase().includes(query.toLowerCase()) ||
          show.overview.toLowerCase().includes(query.toLowerCase())
        );
        searchResults = [...searchResults, ...tvResults];
      }

      // Sort newest-first by date (movies: release_date, tv: first_air_date)
      searchResults.sort((a, b) => {
        const da = new Date(("title" in a ? (a as any).release_date : (a as any).first_air_date) || 0).getTime();
        const db = new Date(("title" in b ? (b as any).release_date : (b as any).first_air_date) || 0).getTime();
        return db - da;
      });

      setResults(searchResults);
      setSearchResults(searchResults);
      setStoreSearchQuery(query);

    } catch (err) {
      setError("Search failed. Please try again.");
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (route.params?.query) {
      performSearch(route.params.query);
    }
  }, [route.params?.query, searchType]);

  const handleSearchSubmit = (query: string) => {
    setSearchQuery(query);
    performSearch(query);
  };

  const handleItemPress = (item: Movie | TVShow) => {
    const type = "title" in item ? "movie" : "tv";
    navigation.navigate("Details", { id: item.id, type });
  };

  const handleTypeFilter = (type: "movie" | "tv" | "multi") => {
    setSearchType(type);
    if (searchQuery.trim()) {
      performSearch(searchQuery);
    }
  };

  const renderEmptyState = () => {
    if (loading) return null;
    
    if (!searchQuery.trim()) {
      return (
        <View className="flex-1 items-center justify-center p-6">
          <Ionicons name="search" size={48} color="#6B7280" />
          <Text className="text-white text-lg font-semibold mt-4 text-center">
            Search for Movies & TV Shows
          </Text>
          <Text className="text-gray-400 text-sm mt-2 text-center">
            Enter a title, actor, or keyword to get started
          </Text>
        </View>
      );
    }

    if (results.length === 0) {
      return (
        <View className="flex-1 items-center justify-center p-6">
          <Ionicons name="film-outline" size={48} color="#6B7280" />
          <Text className="text-white text-lg font-semibold mt-4 text-center">
            No Results Found
          </Text>
          <Text className="text-gray-400 text-sm mt-2 text-center">
            Try adjusting your search terms or filters
          </Text>
        </View>
      );
    }

    return null;
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSubmit={handleSearchSubmit}
        autoFocus={!route.params?.query}
        className="mb-4"
      />

      {/* Filter buttons */}
      <View className="flex-row px-4 mb-4">
        {[
          { key: "multi", label: "All" },
          { key: "movie", label: "Movies" },
          { key: "tv", label: "TV Shows" },
        ].map(({ key, label }) => (
          <Pressable
            key={key}
            onPress={() => handleTypeFilter(key as "movie" | "tv" | "multi")}
            className={`px-4 py-2 rounded-full mr-3 ${
              searchType === key ? "bg-blue-600" : "bg-gray-700"
            }`}
            style={({ pressed }) => ({
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text className={`text-sm font-medium ${
              searchType === key ? "text-white" : "text-gray-300"
            }`}>
              {label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Results count */}
      {results.length > 0 && !loading && (
        <Text className="text-gray-400 text-sm px-4 mb-3">
          {results.length} result{results.length !== 1 ? "s" : ""} found
        </Text>
      )}

      {loading && (
        <LoadingSpinner message="Searching..." className="mt-20" />
      )}

      {error && (
        <ErrorState
          message={error}
          onRetry={() => performSearch(searchQuery)}
          className="mt-20"
        />
      )}

      <FlatList
        data={results}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={({ item }) => (
          <SearchResultItem
            item={item}
            onPress={() => handleItemPress(item)}
          />
        )}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      />
    </SafeAreaView>
  );
}