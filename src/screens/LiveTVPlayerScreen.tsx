import React, { useState, useEffect } from "react";
import { View, Text, Pressable, Dimensions, StatusBar } from "react-native";
import { Video, ResizeMode } from "expo-av";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { LiveTVStackParamList } from "../types/navigation";
import useSettingsStore from "../state/settingsStore";
import { ActionButton } from "../components";
import iptvService from "../api/iptv";

type LiveTVPlayerScreenRouteProp = RouteProp<LiveTVStackParamList, "Player">;

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function LiveTVPlayerScreen() {
  const route = useRoute<LiveTVPlayerScreenRouteProp>();
  const navigation = useNavigation();
  const { channelId } = route.params;

  const { iptv } = useSettingsStore();
  const [showControls, setShowControls] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [channelInfo, setChannelInfo] = useState<any>(null);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);

  useEffect(() => {
    loadChannelInfo();
    
    // Auto-hide controls after 3 seconds
    const timer = setTimeout(() => {
      setShowControls(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [channelId]);

  const loadChannelInfo = async () => {
    try {
      iptvService.setCredentials(iptv.serverUrl, iptv.username, iptv.password);
      let channel = null as any;
      try {
        const channels = await iptvService.getLiveTVChannels();
        channel = channels.find(ch => ch.stream_id.toString() === channelId);
      } catch (e) {
        const mockChannels = iptvService.getMockChannels();
        channel = mockChannels.find(ch => ch.stream_id.toString() === channelId);
      }
      setChannelInfo(channel);
      if (channel) {
        const url = iptvService.getLiveStreamUrl(channel.stream_id, channel.container_extension || "m3u8");
        setStreamUrl(url);
      }
      setTimeout(() => {
        setIsPlaying(true);
      }, 500);
    } catch (error) {
      console.error("Error loading channel info:", error);
    }
  };

  const toggleControls = () => {
    setShowControls(!showControls);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (delta: number) => {
    const newVolume = Math.max(0, Math.min(100, volume + delta));
    setVolume(newVolume);
  };

  const handleClose = () => {
    navigation.goBack();
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
            // @ts-ignore - expo-av supports className
            <Video
              source={{ uri: streamUrl }}
              style={{ width: screenWidth, height: screenHeight }}
              useNativeControls
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay={isPlaying}
              onError={(e: any) => console.log("Video error", e)}
            />
          ) : (
            <View className="items-center">
              <Ionicons name="play-circle-outline" size={64} color="#6B7280" />
              <Text className="text-gray-400 text-lg mt-4">
                Loading stream...
              </Text>
            </View>
          )}
        </View>

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
                  <Text className="text-white font-semibold text-lg text-center">
                    {channelInfo?.name || "Live TV"}
                  </Text>
                  <Text className="text-gray-300 text-sm text-center">
                    {channelInfo?.category_name || ""}
                  </Text>
                </View>

                <View className="w-10 h-10" />
              </View>
            </SafeAreaView>

            {/* Center Controls */}
            <View className="absolute inset-0 items-center justify-center">
              <View className="flex-row items-center space-x-8">
                <Pressable
                  onPress={handlePlayPause}
                  className="w-16 h-16 bg-black/50 rounded-full items-center justify-center"
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <Ionicons
                    name={isPlaying ? "pause" : "play"}
                    size={32}
                    color="#FFFFFF"
                  />
                </Pressable>
              </View>
            </View>

            {/* Bottom Controls */}
            <View className="absolute bottom-0 left-0 right-0">
              <SafeAreaView edges={["bottom"]}>
                <View className="p-4">
                  {/* Volume Control */}
                  <View className="flex-row items-center justify-center mb-4">
                    <Pressable
                      onPress={() => handleVolumeChange(-10)}
                      className="w-10 h-10 bg-black/50 rounded-full items-center justify-center mr-4"
                      style={({ pressed }) => ({
                        opacity: pressed ? 0.7 : 1,
                      })}
                    >
                      <Ionicons name="volume-low" size={20} color="#FFFFFF" />
                    </Pressable>

                    <View className="flex-1 mx-4">
                      <View className="h-1 bg-gray-600 rounded-full">
                        <View
                          className="h-1 bg-blue-500 rounded-full"
                          style={{ width: `${volume}%` }}
                        />
                      </View>
                      <Text className="text-white text-xs text-center mt-1">
                        Volume: {volume}%
                      </Text>
                    </View>

                    <Pressable
                      onPress={() => handleVolumeChange(10)}
                      className="w-10 h-10 bg-black/50 rounded-full items-center justify-center ml-4"
                      style={({ pressed }) => ({
                        opacity: pressed ? 0.7 : 1,
                      })}
                    >
                      <Ionicons name="volume-high" size={20} color="#FFFFFF" />
                    </Pressable>
                  </View>

                  {/* Additional Controls */}
                  <View className="flex-row items-center justify-center space-x-4">
                    <ActionButton
                      title="Fullscreen"
                      icon="expand"
                      onPress={() => console.log("Toggle fullscreen")}
                      size="small"
                      variant="outline"
                    />
                    
                    <ActionButton
                      title="Settings"
                      icon="settings"
                      onPress={() => console.log("Player settings")}
                      size="small"
                      variant="outline"
                    />
                  </View>
                </View>
              </SafeAreaView>
            </View>
          </View>
        )}
      </Pressable>
    </View>
  );
}