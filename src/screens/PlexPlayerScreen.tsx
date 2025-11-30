import React, { useState, useEffect, useRef } from "react";
import { View, Text, Pressable, Dimensions, StatusBar, ActivityIndicator } from "react-native";
import { Video, ResizeMode, AVPlaybackStatus } from "expo-av";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { MoviesStackParamList } from "../types/navigation";
import useSettingsStore from "../state/settingsStore";
import plexService from "../api/plex";

export type PlexPlayerStackParamList = {
  PlexPlayer: {
    ratingKey: string;
    title: string;
    type: "movie" | "tv";
  };
};

type PlexPlayerScreenRouteProp = RouteProp<PlexPlayerStackParamList, "PlexPlayer">;

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function PlexPlayerScreen() {
  const route = useRoute<PlexPlayerScreenRouteProp>();
  const navigation = useNavigation();
  const { ratingKey, title, type: mediaType } = route.params;
  const videoRef = useRef<Video>(null);

  const { plex } = useSettingsStore();
  const [showControls, setShowControls] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [positionMillis, setPositionMillis] = useState(0);
  const [durationMillis, setDurationMillis] = useState(0);

  useEffect(() => {
    loadStreamUrl();

    // Auto-hide controls after 3 seconds
    const timer = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [ratingKey, isPlaying]);

  const loadStreamUrl = async () => {
    try {
      if (!plex.isConnected || !plex.serverUrl || !plex.token) {
        console.error("Plex not configured");
        return;
      }

      plexService.setCredentials(plex.serverUrl, plex.token);

      // Get item details to find media parts
      const itemDetails = await plexService.getItemDetails(ratingKey);

      // Construct the direct play URL
      // Format: {baseUrl}/library/metadata/{ratingKey}/file.ext?X-Plex-Token={token}
      const url = `${plex.serverUrl}/library/metadata/${ratingKey}/file.mp4?X-Plex-Token=${plex.token}`;

      setStreamUrl(url);

      // Start playing after a short delay
      setTimeout(() => {
        setIsPlaying(true);
        setIsBuffering(false);
      }, 500);
    } catch (error) {
      console.error("Error loading Plex stream:", error);
      setIsBuffering(false);
    }
  };

  const toggleControls = () => {
    setShowControls(!showControls);
  };

  const handlePlayPause = async () => {
    if (videoRef.current) {
      if (isPlaying) {
        await videoRef.current.pauseAsync();
      } else {
        await videoRef.current.playAsync();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = async (seconds: number) => {
    if (videoRef.current && durationMillis > 0) {
      const newPosition = Math.max(0, Math.min(positionMillis + seconds * 1000, durationMillis));
      await videoRef.current.setPositionAsync(newPosition);
    }
  };

  const handleClose = () => {
    navigation.goBack();
  };

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setPositionMillis(status.positionMillis);
      setDurationMillis(status.durationMillis || 0);
      setIsPlaying(status.isPlaying);
      setIsBuffering(status.isBuffering);
    }
  };

  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <View className="flex-1 bg-black">
      <StatusBar hidden />

      {/* Video Player Area */}
      <Pressable
        onPress={toggleControls}
        className="flex-1 items-center justify-center"
        style={{ width: screenWidth, height: screenHeight }}
      >
        {/* Video Player */}
        <View className="flex-1 w-full bg-gray-900 items-center justify-center">
          {streamUrl ? (
            <Video
              ref={videoRef}
              source={{ uri: streamUrl }}
              style={{ width: screenWidth, height: screenHeight }}
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay={isPlaying}
              onPlaybackStatusUpdate={onPlaybackStatusUpdate}
              onError={(error) => console.log("Video error", error)}
            />
          ) : (
            <View className="items-center">
              <ActivityIndicator size="large" color="#007AFF" />
              <Text className="text-gray-400 text-lg mt-4">
                Loading from Plex...
              </Text>
            </View>
          )}
        </View>

        {/* Buffering Indicator */}
        {isBuffering && streamUrl && (
          <View className="absolute inset-0 items-center justify-center bg-black/50">
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        )}

        {/* Controls Overlay */}
        {showControls && (
          <View className="absolute inset-0 bg-black/30">
            {/* Top Controls */}
            <SafeAreaView className="absolute top-0 left-0 right-0 z-10">
              <View className="flex-row items-center justify-between p-4">
                <Pressable
                  onPress={handleClose}
                  className="w-10 h-10 bg-black/50 rounded-full items-center justify-center"
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <Ionicons name="close" size={24} color="#FFFFFF" />
                </Pressable>

                <View className="flex-1 mx-4">
                  <Text className="text-white font-semibold text-lg text-center" numberOfLines={1}>
                    {title}
                  </Text>
                  <Text className="text-gray-300 text-sm text-center">
                    Playing from Plex
                  </Text>
                </View>

                <View className="w-10 h-10" />
              </View>
            </SafeAreaView>

            {/* Center Controls */}
            <View className="absolute inset-0 items-center justify-center">
              <View className="flex-row items-center">
                <Pressable
                  onPress={() => handleSeek(-10)}
                  className="w-14 h-14 bg-black/50 rounded-full items-center justify-center mx-4"
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <Ionicons name="play-back" size={28} color="#FFFFFF" />
                </Pressable>

                <Pressable
                  onPress={handlePlayPause}
                  className="w-20 h-20 bg-black/60 rounded-full items-center justify-center mx-4"
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <Ionicons
                    name={isPlaying ? "pause" : "play"}
                    size={40}
                    color="#FFFFFF"
                  />
                </Pressable>

                <Pressable
                  onPress={() => handleSeek(10)}
                  className="w-14 h-14 bg-black/50 rounded-full items-center justify-center mx-4"
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <Ionicons name="play-forward" size={28} color="#FFFFFF" />
                </Pressable>
              </View>
            </View>

            {/* Bottom Controls */}
            <View className="absolute bottom-0 left-0 right-0">
              <SafeAreaView edges={["bottom"]}>
                <View className="p-4">
                  {/* Progress Bar */}
                  {durationMillis > 0 && (
                    <View className="mb-4">
                      <View className="h-1 bg-gray-600 rounded-full">
                        <View
                          className="h-1 bg-blue-500 rounded-full"
                          style={{ width: `${(positionMillis / durationMillis) * 100}%` }}
                        />
                      </View>
                      <View className="flex-row justify-between mt-2">
                        <Text className="text-white text-xs">
                          {formatTime(positionMillis)}
                        </Text>
                        <Text className="text-white text-xs">
                          {formatTime(durationMillis)}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              </SafeAreaView>
            </View>
          </View>
        )}
      </Pressable>
    </View>
  );
}
