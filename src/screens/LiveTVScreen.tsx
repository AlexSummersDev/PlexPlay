import React, { useState, useEffect } from "react";
import { View, Text, FlatList, Pressable, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { LiveTVStackParamList } from "../types/navigation";
import useSettingsStore from "../state/settingsStore";
import { SearchBar, LoadingSpinner, ErrorState, ActionButton } from "../components";
import iptvService from "../api/iptv";

type LiveTVScreenNavigationProp = NativeStackNavigationProp<LiveTVStackParamList, "Channels">;

interface IPTVChannel {
  num: number;
  name: string;
  stream_id: number;
  stream_icon: string;
  category_name: string;
}

interface ChannelItemProps {
  channel: IPTVChannel;
  onPress: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

function ChannelItem({ channel, onPress, isFavorite, onToggleFavorite }: ChannelItemProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center p-4 bg-gray-800/50 rounded-lg mb-3 mx-4"
      style={({ pressed }) => ({
        opacity: pressed ? 0.7 : 1,
      })}
    >
      {/* Channel Logo */}
      <View className="w-12 h-12 bg-gray-700 rounded-lg mr-4 items-center justify-center">
        {channel.stream_icon ? (
          <Image
            source={{ uri: channel.stream_icon }}
            className="w-full h-full rounded-lg"
            resizeMode="contain"
          />
        ) : (
          <Ionicons name="tv" size={20} color="#9CA3AF" />
        )}
      </View>

      {/* Channel Info */}
      <View className="flex-1">
        <View className="flex-row items-center mb-1">
          <Text className="text-white font-semibold text-base mr-2">
            {channel.name}
          </Text>
          <Text className="text-gray-400 text-sm">
            #{channel.num}
          </Text>
        </View>
        <Text className="text-gray-400 text-sm">
          {channel.category_name}
        </Text>
      </View>

      {/* Favorite Button */}
      <Pressable
        onPress={onToggleFavorite}
        className="p-2 mr-2"
        style={({ pressed }) => ({
          opacity: pressed ? 0.5 : 1,
        })}
      >
        <Ionicons
          name={isFavorite ? "heart" : "heart-outline"}
          size={20}
          color={isFavorite ? "#EF4444" : "#6B7280"}
        />
      </Pressable>

      {/* Play Button */}
      <View className="w-8 h-8 bg-blue-600 rounded-full items-center justify-center">
        <Ionicons name="play" size={16} color="#FFFFFF" />
      </View>
    </Pressable>
  );
}

export default function LiveTVScreen() {
  const navigation = useNavigation<LiveTVScreenNavigationProp>();
  const { iptv, updateIPTVSettings } = useSettingsStore();

  const [channels, setChannels] = useState<IPTVChannel[]>([]);
  const [filteredChannels, setFilteredChannels] = useState<IPTVChannel[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (iptv.isConnected) {
      loadChannels();
    }
  }, [iptv.isConnected]);

  useEffect(() => {
    filterChannels();
  }, [channels, selectedCategory, searchQuery]);

  const loadChannels = async () => {
    try {
      setLoading(true);
      setError(null);

      // Configure service with current credentials
      iptvService.setCredentials(iptv.serverUrl, iptv.username, iptv.password);

      let channelsData: IPTVChannel[] = [];
      let categoriesData: { category_name: string }[] = [];

      try {
        const cats = await iptvService.getLiveTVCategories();
        categoriesData = cats as any;
        channelsData = await iptvService.getLiveTVChannels();
      } catch (e) {
        // Fallback to mock data if provider fails
        channelsData = iptvService.getMockChannels() as any;
        categoriesData = iptvService.getMockCategories() as any;
      }

      setChannels(channelsData);
      setCategories(["All", ...categoriesData.map((cat: any) => cat.category_name)]);

    } catch (err) {
      setError("Failed to load channels. Please check your IPTV connection.");
      console.error("IPTV channels loading error:", err);
    } finally {
      setLoading(false);
    }
  };

  const filterChannels = () => {
    let filtered = channels;

    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter(channel => channel.category_name === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(channel =>
        channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        channel.category_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredChannels(filtered);
  };

  const handleChannelPress = (channel: IPTVChannel) => {
    navigation.navigate("Player", { channelId: channel.stream_id.toString() });
  };

  const handleToggleFavorite = (channelId: number) => {
    const currentFavorites = iptv.favoriteChannels || [];
    const channelIdStr = channelId.toString();
    const isFavorite = currentFavorites.includes(channelIdStr);

    const updatedFavorites = isFavorite
      ? currentFavorites.filter(id => id !== channelIdStr)
      : [...currentFavorites, channelIdStr];

    updateIPTVSettings({ favoriteChannels: updatedFavorites });
  };

  const handleCategoryPress = (category: string) => {
    setSelectedCategory(category);
  };

  if (!iptv.isConnected) {
    return (
      <SafeAreaView className="flex-1 bg-black">
        <View className="flex-1 items-center justify-center p-6">
          <Ionicons name="tv-outline" size={64} color="#6B7280" />
          <Text className="text-white text-xl font-semibold mt-4 text-center">
            IPTV Not Connected
          </Text>
          <Text className="text-gray-400 text-sm mt-2 text-center leading-5">
            Please configure your IPTV service in Settings to access live TV channels.
          </Text>
          <ActionButton
            title="Go to Settings"
            icon="settings"
            onPress={() => {
              // Navigation would be handled here
              console.log("Navigate to IPTV settings");
            }}
            variant="primary"
            className="mt-6"
          />
        </View>
      </SafeAreaView>
    );
  }

  if (loading && channels.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-black">
        <LoadingSpinner fullScreen message="Loading channels..." />
      </SafeAreaView>
    );
  }

  if (error && channels.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-black">
        <ErrorState
          fullScreen
          message={error}
          onRetry={loadChannels}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      {/* Search Bar */}
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search channels..."
        className="mb-4"
      />

      {/* Category Filter */}
      <View className="mb-4">
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          keyExtractor={(item) => item}
          renderItem={({ item: category }) => (
            <Pressable
              onPress={() => handleCategoryPress(category)}
              className={`px-4 py-2 rounded-full mr-3 ${
                selectedCategory === category ? "bg-blue-600" : "bg-gray-700"
              }`}
              style={({ pressed }) => ({
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Text className={`text-sm font-medium ${
                selectedCategory === category ? "text-white" : "text-gray-300"
              }`}>
                {category}
              </Text>
            </Pressable>
          )}
        />
      </View>

      {/* Channel Count */}
      {filteredChannels.length > 0 && (
        <Text className="text-gray-400 text-sm px-4 mb-3">
          {filteredChannels.length} channel{filteredChannels.length !== 1 ? "s" : ""} available
        </Text>
      )}

      {/* Channels List */}
      <FlatList
        data={filteredChannels}
        keyExtractor={(item) => item.stream_id.toString()}
        renderItem={({ item }) => (
          <ChannelItem
            channel={item}
            onPress={() => handleChannelPress(item)}
            isFavorite={iptv.favoriteChannels?.includes(item.stream_id.toString()) || false}
            onToggleFavorite={() => handleToggleFavorite(item.stream_id)}
          />
        )}
        ListEmptyComponent={() => (
          <View className="flex-1 items-center justify-center p-6 mt-20">
            <Ionicons name="tv-outline" size={48} color="#6B7280" />
            <Text className="text-white text-lg font-semibold mt-4 text-center">
              No Channels Found
            </Text>
            <Text className="text-gray-400 text-sm mt-2 text-center">
              {searchQuery.trim() 
                ? "Try adjusting your search terms or category filter"
                : "No channels available in this category"
              }
            </Text>
          </View>
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
      />
    </SafeAreaView>
  );
}