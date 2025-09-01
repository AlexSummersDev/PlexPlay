import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Image, Dimensions, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { MoviesStackParamList } from "../types/navigation";
import { Movie, TVShow, WatchlistItem } from "../types/media";
import useMediaStore from "../state/mediaStore";
import { ActionButton, LoadingSpinner, ErrorState, HorizontalCarousel } from "../components";
import { mockMovies, mockTVShows } from "../api/tmdb";

type DetailsScreenRouteProp = RouteProp<MoviesStackParamList, "Details">;
type DetailsScreenNavigationProp = NativeStackNavigationProp<MoviesStackParamList, "Details">;

const { width: screenWidth } = Dimensions.get("window");

export default function DetailsScreen() {
  const route = useRoute<DetailsScreenRouteProp>();
  const navigation = useNavigation<DetailsScreenNavigationProp>();
  const { id, type } = route.params;

  const [item, setItem] = useState<Movie | TVShow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [similarItems, setSimilarItems] = useState<(Movie | TVShow)[]>([]);

  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useMediaStore();

  const isMovie = type === "movie";
  const inWatchlist = item ? isInWatchlist(item.id, type) : false;

  useEffect(() => {
    loadItemDetails();
  }, [id, type]);

  const loadItemDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // For demo purposes, find item in mock data
      const mockData = isMovie ? mockMovies : mockTVShows;
      const foundItem = mockData.find(item => item.id === id);

      if (foundItem) {
        setItem(foundItem);
        // Set similar items (just use the same mock data for demo)
        setSimilarItems(mockData.filter(item => item.id !== id));
      } else {
        setError("Content not found");
      }

    } catch (err) {
      setError("Failed to load details. Please try again.");
      console.error("Error loading details:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleWatchlistToggle = () => {
    if (!item) return;

    const title = isMovie ? (item as Movie).title : (item as TVShow).name;
    
    if (inWatchlist) {
      removeFromWatchlist(item.id, type);
    } else {
      const watchlistItem: WatchlistItem = {
        id: item.id,
        type,
        title,
        poster_path: item.poster_path,
        added_at: new Date().toISOString(),
      };
      addToWatchlist(watchlistItem);
    }
  };

  const handleStreamPress = () => {
    // In a real app, this would check IPTV availability and start streaming
    console.log("Stream pressed for:", item);
  };

  const handleDownloadPress = () => {
    // In a real app, this would trigger Radarr/Sonarr download
    console.log("Download pressed for:", item);
  };

  const handleSimilarItemPress = (similarItem: Movie | TVShow) => {
    const similarType = "title" in similarItem ? "movie" : "tv";
    navigation.push("Details", { id: similarItem.id, type: similarType });
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-black">
        <LoadingSpinner fullScreen message="Loading details..." />
      </SafeAreaView>
    );
  }

  if (error || !item) {
    return (
      <SafeAreaView className="flex-1 bg-black">
        <ErrorState
          fullScreen
          message={error || "Content not found"}
          onRetry={loadItemDetails}
        />
      </SafeAreaView>
    );
  }

  const title = isMovie ? (item as Movie).title : (item as TVShow).name;
  const year = isMovie 
    ? (item as Movie).release_date ? new Date((item as Movie).release_date).getFullYear() : ""
    : (item as TVShow).first_air_date ? new Date((item as TVShow).first_air_date).getFullYear() : "";

  const posterUrl = item.poster_path 
    ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
    : null;

  const backdropUrl = item.backdrop_path 
    ? `https://image.tmdb.org/t/p/w1280${item.backdrop_path}`
    : null;

  return (
    <SafeAreaView className="flex-1 bg-black" edges={["bottom"]}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View className="relative">
          {backdropUrl ? (
            <Image
              source={{ uri: backdropUrl }}
              style={{ width: screenWidth, height: screenWidth * 0.6 }}
              resizeMode="cover"
            />
          ) : (
            <View 
              style={{ width: screenWidth, height: screenWidth * 0.6 }}
              className="bg-gray-800 items-center justify-center"
            >
              <Ionicons 
                name={isMovie ? "film-outline" : "tv-outline"} 
                size={64} 
                color="#6B7280" 
              />
            </View>
          )}
          
          {/* Gradient overlay */}
          <View 
            className="absolute inset-0 bg-gradient-to-b from-transparent via-black/70 to-black"
          />

          {/* Back button */}
          <Pressable
            onPress={() => navigation.goBack()}
            className="absolute top-4 left-4 w-10 h-10 bg-black/50 rounded-full items-center justify-center"
            style={({ pressed }) => ({
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </Pressable>

          {/* Watchlist button */}
          <Pressable
            onPress={handleWatchlistToggle}
            className="absolute top-4 right-4 w-10 h-10 bg-black/50 rounded-full items-center justify-center"
            style={({ pressed }) => ({
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Ionicons 
              name={inWatchlist ? "heart" : "heart-outline"} 
              size={24} 
              color={inWatchlist ? "#EF4444" : "#FFFFFF"} 
            />
          </Pressable>
        </View>

        {/* Content */}
        <View className="px-4 -mt-20 relative z-10">
          <View className="flex-row">
            {/* Poster */}
            <View className="w-32 h-48 rounded-lg overflow-hidden bg-gray-800 mr-4">
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
                    size={32} 
                    color="#6B7280" 
                  />
                </View>
              )}
            </View>

            {/* Title and info */}
            <View className="flex-1">
              <Text className="text-white text-2xl font-bold mb-2">
                {title}
              </Text>
              
              <View className="flex-row items-center mb-3">
                <Text className="text-gray-300 text-base">
                  {year}
                </Text>
                <View className="w-1 h-1 bg-gray-500 rounded-full mx-3" />
                <Text className="text-gray-300 text-base capitalize">
                  {isMovie ? "Movie" : "TV Show"}
                </Text>
              </View>

              {item.vote_average > 0 && (
                <View className="flex-row items-center mb-4">
                  <Ionicons name="star" size={20} color="#FCD34D" />
                  <Text className="text-white text-lg font-semibold ml-2">
                    {item.vote_average.toFixed(1)}
                  </Text>
                  <Text className="text-gray-400 text-sm ml-1">
                    ({item.vote_count.toLocaleString()} votes)
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Action Buttons */}
          <View className="flex-row mt-6 mb-6">
            <ActionButton
              title="Stream"
              icon="play"
              onPress={handleStreamPress}
              variant="primary"
              className="flex-1 mr-2"
            />
            <ActionButton
              title="Download"
              icon="download"
              onPress={handleDownloadPress}
              variant="secondary"
              className="flex-1 ml-2"
            />
          </View>

          {/* Synopsis */}
          <View className="mb-6">
            <Text className="text-white text-lg font-semibold mb-3">
              Synopsis
            </Text>
            <Text className="text-gray-300 text-base leading-6">
              {item.overview || "No synopsis available."}
            </Text>
          </View>

          {/* Cast & Crew placeholder */}
          <View className="mb-6">
            <Text className="text-white text-lg font-semibold mb-3">
              Cast & Crew
            </Text>
            <Text className="text-gray-400 text-sm">
              Cast and crew information will be loaded from TMDB API
            </Text>
          </View>

          {/* Similar Content */}
          {similarItems.length > 0 && (
            <HorizontalCarousel
              title={`More Like This`}
              data={similarItems.slice(0, 10)}
              onItemPress={handleSimilarItemPress}
              cardSize="medium"
              showRating
              className="mb-6"
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}