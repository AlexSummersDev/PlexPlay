import React, { useState } from "react";
import { View, Text, ScrollView, TextInput, Switch, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import useSettingsStore from "../state/settingsStore";
import { ActionButton, ConnectionStatus } from "../components";

export default function PlexSettingsScreen() {
  const {
    plex,
    updatePlexSettings,
    testPlexConnection,
    resetPlexSettings,
  } = useSettingsStore();

  const [serverUrl, setServerUrl] = useState(plex.serverUrl);
  const [token, setToken] = useState(plex.token);
  const [testing, setTesting] = useState(false);

  const handleSave = () => {
    updatePlexSettings({
      serverUrl: serverUrl.trim(),
      token: token.trim(),
    });
    Alert.alert("Settings Saved", "Plex settings have been updated.");
  };

  const handleTestConnection = async () => {
    if (!serverUrl.trim() || !token.trim()) {
      Alert.alert("Missing Information", "Please enter both server URL and token.");
      return;
    }

    // Update settings first
    updatePlexSettings({
      serverUrl: serverUrl.trim(),
      token: token.trim(),
    });

    setTesting(true);
    try {
      const success = await testPlexConnection();
      Alert.alert(
        success ? "Connection Successful" : "Connection Failed",
        success 
          ? "Successfully connected to Plex server!" 
          : "Could not connect to Plex server. Please check your settings."
      );
    } catch (error) {
      Alert.alert("Connection Error", "An error occurred while testing the connection.");
    } finally {
      setTesting(false);
    }
  };

  const handleReset = () => {
    Alert.alert(
      "Reset Settings",
      "Are you sure you want to reset all Plex settings?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            resetPlexSettings();
            setServerUrl("");
            setToken("");
            Alert.alert("Settings Reset", "Plex settings have been reset.");
          },
        },
      ]
    );
  };

  const handleAutoSyncToggle = (value: boolean) => {
    updatePlexSettings({ autoSync: value });
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {/* Connection Status */}
        <View className="mb-6">
          <ConnectionStatus
            isConnected={plex.isConnected}
            serviceName="Plex Media Server"
            lastChecked={new Date()}
          />
        </View>

        {/* Server Configuration */}
        <View className="mb-6">
          <Text className="text-white text-lg font-semibold mb-4">
            Server Configuration
          </Text>
          
          <View className="mb-4">
            <Text className="text-gray-300 text-sm font-medium mb-2">
              Server URL
            </Text>
            <TextInput
              className="bg-gray-800 text-white p-4 rounded-lg text-base"
              placeholder="http://192.168.1.100:32400"
              placeholderTextColor="#6B7280"
              value={serverUrl}
              onChangeText={setServerUrl}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
            <Text className="text-gray-400 text-xs mt-1">
              Include http:// or https:// and port number
            </Text>
          </View>

          <View className="mb-4">
            <Text className="text-gray-300 text-sm font-medium mb-2">
              Plex Token
            </Text>
            <TextInput
              className="bg-gray-800 text-white p-4 rounded-lg text-base"
              placeholder="Your Plex authentication token"
              placeholderTextColor="#6B7280"
              value={token}
              onChangeText={setToken}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
            />
            <Text className="text-gray-400 text-xs mt-1">
              Get your token from plex.tv/claim or your server settings
            </Text>
          </View>

          <View className="flex-row space-x-3">
            <ActionButton
              title="Test Connection"
              icon="checkmark-circle"
              onPress={handleTestConnection}
              loading={testing}
              variant="primary"
              className="flex-1"
            />
            <ActionButton
              title="Save"
              icon="save"
              onPress={handleSave}
              variant="secondary"
              className="flex-1"
            />
          </View>
        </View>

        {/* Library Settings */}
        <View className="mb-6">
          <Text className="text-white text-lg font-semibold mb-4">
            Library Settings
          </Text>
          
          <View className="bg-gray-800/50 rounded-lg p-4 mb-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-white font-medium">
                  Auto Sync Libraries
                </Text>
                <Text className="text-gray-400 text-sm mt-1">
                  Automatically sync your Plex libraries
                </Text>
              </View>
              <Switch
                value={plex.autoSync}
                onValueChange={handleAutoSyncToggle}
                trackColor={{ false: "#374151", true: "#3B82F6" }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>

          {plex.isConnected && (
            <View className="bg-gray-800/50 rounded-lg p-4">
              <Text className="text-white font-medium mb-2">
                Available Libraries
              </Text>
              <Text className="text-gray-400 text-sm">
                Library selection will be available after connecting to your Plex server
              </Text>
            </View>
          )}
        </View>

        {/* Help Section */}
        <View className="mb-6">
          <Text className="text-white text-lg font-semibold mb-4">
            Help & Information
          </Text>
          
          <View className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-4">
            <View className="flex-row items-start">
              <Ionicons name="information-circle" size={20} color="#60A5FA" />
              <View className="ml-3 flex-1">
                <Text className="text-blue-300 font-medium mb-1">
                  How to get your Plex Token
                </Text>
                <Text className="text-blue-200 text-sm leading-5">
                  1. Visit plex.tv/claim in your browser{"\n"}
                  2. Sign in to your Plex account{"\n"}
                  3. Copy the claim token that appears{"\n"}
                  4. Paste it in the token field above
                </Text>
              </View>
            </View>
          </View>

          <ActionButton
            title="Reset All Settings"
            icon="refresh"
            onPress={handleReset}
            variant="danger"
            fullWidth
          />
        </View>

        {/* Add some bottom padding */}
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}