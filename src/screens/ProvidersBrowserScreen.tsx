import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { HorizontalCarousel, LoadingSpinner, ErrorState } from "../components";
import { ExtendedTMDBService, mockMovies, mockTVShows } from "../api/tmdb";

const PROVIDERS: { id: number; name: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 337, name: "Disney+", icon: "logo-disney" as any },
  { id: 8, name: "Netflix", icon: "logo-netflix" as any },
  { id: 9, name: "Prime Video", icon: "logo-amazon" as any },
  { id: 531, name: "Paramount+", icon: "film-outline" },
  { id: 384, name: "Max", icon: "videocam-outline" },
  { id: 15, name: "Hulu", icon: "tv-outline" },
];

export default function ProvidersBrowserScreen() {
  const [selectedProviderIds, setSelectedProviderIds] = useState<number[]>([337]);
  const navigation = useNavigation<any>();
  const [region, setRegion] = useState("US");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fallbackUsed, setFallbackUsed] = useState(false);

  const [movies, setMovies] = useState<any[]>([]);
  const [shows, setShows] = useState<any[]>([]);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use extended service when API key exists; otherwise fallback to existing mock
      // @ts-ignore access env decision via tmdbService private
      const svc = new ExtendedTMDBService();
      const [m, t] = await Promise.all([
        svc.discoverMoviesByProviders(selectedProviderIds, region, 1),
        svc.discoverTVByProviders(selectedProviderIds, region, 1),
      ]);
      setMovies(m.results || []);
      setShows(t.results || []);
    } catch (e) {
      // Fallback to mocks with a helpful banner
      setError(null);
      setFallbackUsed(true);
      setMovies(mockMovies);
      setShows(mockTVShows);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [selectedProviderIds.join(","), region]);

  const toggleProvider = (id: number) => {
    setSelectedProviderIds((prev) => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <View className="px-4 pt-2">
        <Text className="text-white text-2xl font-bold mb-3">Browse by Service</Text>

        {fallbackUsed && (
          <View className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3 mb-3">
            <Text className="text-blue-200 text-sm mb-2">Showing demo data. Add a TMDB API key to see live results.</Text>
            <Pressable
              onPress={() => navigation.navigate("Settings")}
              className="self-start bg-blue-600 rounded-lg px-3 py-1"
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <Text className="text-white text-sm">Open Settings</Text>
            </Pressable>
          </View>
        )}

        <FlatList
          data={PROVIDERS}
          keyExtractor={(i) => i.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => toggleProvider(item.id)}
              className={`px-4 py-2 rounded-full mr-3 ${selectedProviderIds.includes(item.id) ? "bg-blue-600" : "bg-gray-700"}`}
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <Text className={`text-sm font-medium ${selectedProviderIds.includes(item.id) ? "text-white" : "text-gray-300"}`}>
                {item.name}
              </Text>
            </Pressable>
          )}
        />
      </View>

      {loading ? (
        <LoadingSpinner fullScreen message="Loading services..." />
      ) : error ? (
        <ErrorState fullScreen={false} message={error} onRetry={load} />
      ) : (
        <FlatList
          data={[{ key: "movies" }, { key: "shows" }]}
          keyExtractor={(i) => i.key}
          renderItem={({ item }) => (
            <View className="mt-4">
              {item.key === "movies" ? (
                <HorizontalCarousel
                  title="Movies"
                  data={movies}
                  onItemPress={() => {}}
                  showRating
                />
              ) : (
                <HorizontalCarousel
                  title="TV Shows"
                  data={shows}
                  onItemPress={() => {}}
                  showRating
                />
              )}
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}
