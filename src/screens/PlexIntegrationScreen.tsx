import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import useSettingsStore from "../state/settingsStore";
import { ActionButton, ConnectionStatus, LoadingSpinner, ErrorState } from "../components";
import plexService from "../api/plex";

interface PlexLibrary {
  key: string;
  title: string;
  type: string;
}

interface PlexMediaItem {
  ratingKey: string;
  title: string;
  thumb: string;
  year: number;
}

export default function PlexIntegrationScreen() {
  const { plex, updatePlexSettings } = useSettingsStore();
  
  const [libraries, setLibraries] = useState<PlexLibrary[]>([]);
  const [recentlyAdded, setRecentlyAdded] = useState<PlexMediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (plex.isConnected && plex.serverUrl && plex.token) {
      loadPlexData();
    }
  }, [plex.isConnected, plex.serverUrl, plex.token]);

  const loadPlexData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Configure Plex service
      plexService.setCredentials(plex.serverUrl, plex.token);

      // For demo purposes, use mock data
      // In production, you would use:
      // const [librariesData, recentData] = await Promise.all([
      //   plexService.getLibraries(),
      //   plexService.getRecentlyAdded(),
      // ]);

      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockLibraries = plexService.getMockLibraries();
      const mockRecent = plexService.getMockRecentlyAdded();

      setLibraries(mockLibraries);
      setRecentlyAdded(mockRecent);

    } catch (err) {
      setError("Failed to load Plex data. Please check your connection.");
      console.error("Plex data loading error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLibraryToggle = (libraryKey: string, enabled: boolean) => {
    const currentLibraries = plex.syncLibraries || [];
    const updatedLibraries = enabled
      ? [...currentLibraries, libraryKey]
      : currentLibraries.filter(key => key !== libraryKey);

    updatePlexSettings({ syncLibraries: updatedLibraries });
  };

  const handleSyncNow = async () => {
    if (!plex.isConnected) {
      Alert.alert("Not Connected", "Please connect to your Plex server first.");
      return;
    }

    Alert.alert(
      "Sync Libraries",
      "This will sync your selected Plex libraries with the app. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sync",
          onPress: async () => {
            try {
              setLoading(true);
              // Simulate sync process
              await new Promise(resolve => setTimeout(resolve, 2000));
              Alert.alert("Sync Complete", "Your Plex libraries have been synced successfully!");
            } catch (err) {
              Alert.alert("Sync Failed", "Failed to sync libraries. Please try again.");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  // const handleItemPress = (item: PlexMediaItem) => {
  //   console.log("Plex item pressed:", item);
  //   // In a real app, this would navigate to a Plex-specific details screen
  // };

  if (!plex.isConnected) {
    return (
      <SafeAreaView className="flex-1 bg-black">
        <View className="flex-1 items-center justify-center p-6">
          <Ionicons name="server-outline" size={64} color="#6B7280" />
          <Text className="text-white text-xl font-semibold mt-4 text-center">
            Plex Not Connected
          </Text>
          <Text className="text-gray-400 text-sm mt-2 text-center leading-5">
            Please configure your Plex server connection in Settings to access your media library.
          </Text>
          <ActionButton
            title="Go to Settings"
            icon="settings"
            onPress={() => {
              // Navigation would be handled here
              console.log("Navigate to Plex settings");
            }}
            variant="primary"
            className="mt-6"
          />
        </View>
      </SafeAreaView>
    );
  }

  if (loading && libraries.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-black">
        <LoadingSpinner fullScreen message="Loading Plex libraries..." />
      </SafeAreaView>
    );
  }

  if (error && libraries.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-black">
        <ErrorState
          fullScreen
          message={error}
          onRetry={loadPlexData}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Connection Status */}
        <View className="px-4 mb-6">
          <ConnectionStatus
            isConnected={plex.isConnected}
            serviceName="Plex Media Server"
            lastChecked={new Date()}
          />
        </View>

        {/* Server Info */}
        <View className="px-4 mb-6">
          <Text className="text-white text-lg font-semibold mb-3">
            Server Information
          </Text>
          <View className="bg-gray-800/50 rounded-lg p-4">
            <Text className="text-gray-300 text-sm mb-1">Server URL</Text>
            <Text className="text-white font-medium mb-3">{plex.serverUrl}</Text>
            
            <Text className="text-gray-300 text-sm mb-1">Auto Sync</Text>
            <Text className="text-white font-medium">
              {plex.autoSync ? "Enabled" : "Disabled"}
            </Text>
          </View>
        </View>

        {/* Libraries */}
        {libraries.length > 0 && (
          <View className="px-4 mb-6">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-white text-lg font-semibold">
                Libraries
              </Text>
              <ActionButton
                title="Sync Now"
                icon="refresh"
                onPress={handleSyncNow}
                size="small"
                loading={loading}
              />
            </View>
            
            {libraries.map((library) => {
              const isSelected = plex.syncLibraries?.includes(library.key) || false;
              
              return (
                <View
                  key={library.key}
                  className="flex-row items-center justify-between p-4 bg-gray-800/50 rounded-lg mb-3"
                >
                  <View className="flex-1">
                    <Text className="text-white font-medium">
                      {library.title}
                    </Text>
                    <Text className="text-gray-400 text-sm capitalize">
                      {library.type}
                    </Text>
                  </View>
                  
                  <ActionButton
                    title={isSelected ? "Synced" : "Sync"}
                    icon={isSelected ? "checkmark" : "add"}
                    onPress={() => handleLibraryToggle(library.key, !isSelected)}
                    variant={isSelected ? "primary" : "outline"}
                    size="small"
                  />
                </View>
              );
            })}
          </View>
        )}

        {/* Recently Added */}
        {recentlyAdded.length > 0 && (
          <View className="mb-6">
            <Text className="text-white text-lg font-semibold mb-3 px-4">
              Recently Added to Plex
            </Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16 }}
            >
              {recentlyAdded.map((item) => (
                <View
                  key={item.ratingKey}
                  className="w-32 mr-3"
                >
                  <View className="w-32 h-48 bg-gray-800 rounded-lg items-center justify-center mb-2">
                    <Ionicons name="film-outline" size={32} color="#6B7280" />
                  </View>
                  <Text className="text-white text-sm font-medium" numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text className="text-gray-400 text-xs">
                    {item.year}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Sync Statistics */}
        <View className="px-4 mb-6">
          <Text className="text-white text-lg font-semibold mb-3">
            Sync Statistics
          </Text>
          <View className="bg-gray-800/50 rounded-lg p-4">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-gray-300">Movies Synced</Text>
              <Text className="text-white font-medium">1,247</Text>
            </View>
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-gray-300">TV Shows Synced</Text>
              <Text className="text-white font-medium">89</Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-300">Last Sync</Text>
              <Text className="text-white font-medium">2 hours ago</Text>
            </View>
          </View>
        </View>

        {/* Add some bottom padding */}
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}