import React, { useState } from "react";
import { View, Text, ScrollView, TextInput, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import useSettingsStore from "../state/settingsStore";
import { ActionButton, ConnectionStatus } from "../components";

export default function IPTVSettingsScreen() {
  const {
    iptv,
    updateIPTVSettings,
    testIPTVConnection,
    resetIPTVSettings,
  } = useSettingsStore();

  const [serverUrl, setServerUrl] = useState(iptv.serverUrl);
  const [username, setUsername] = useState(iptv.username);
  const [password, setPassword] = useState(iptv.password);
  const [testing, setTesting] = useState(false);

  const normalizeUrl = (url: string) => {
    let u = url.trim();
    if (!/^https?:\/\//i.test(u)) u = `http://${u}`;
    return u.replace(/\/$/, "");
  };

  const handleSave = () => {
    updateIPTVSettings({
      serverUrl: normalizeUrl(serverUrl),
      username: username.trim(),
      password: password.trim(),
      lastError: null,
    });
    Alert.alert("Settings Saved", "IPTV settings have been updated.");
  };

  const handleTestConnection = async () => {
    if (!serverUrl.trim() || !username.trim() || !password.trim()) {
      Alert.alert("Missing Information", "Please fill in all required fields.");
      return;
    }

    // Update settings first
    updateIPTVSettings({
      serverUrl: normalizeUrl(serverUrl),
      username: username.trim(),
      password: password.trim(),
      lastError: null,
    });

    setTesting(true);
    try {
      const success = await testIPTVConnection();
      Alert.alert(
        success ? "Connection Successful" : "Connection Failed",
        success 
          ? "Successfully connected to IPTV service!" 
          : "Could not connect to IPTV service. Please check your credentials."
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
      "Are you sure you want to reset all IPTV settings?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            resetIPTVSettings();
            setServerUrl("");
            setUsername("");
            setPassword("");
            Alert.alert("Settings Reset", "IPTV settings have been reset.");
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {/* Connection Status */}
        <View className="mb-6">
          <ConnectionStatus
            isConnected={iptv.isConnected}
            serviceName="IPTV Service (Xtream Codes)"
            lastChecked={new Date()}
            error={iptv.lastError || undefined}
          />
        </View>

        {/* Xtream Codes Configuration */}
        <View className="mb-6">
          <Text className="text-white text-lg font-semibold mb-4">
            Xtream Codes Configuration
          </Text>
          
          <View className="mb-4">
            <Text className="text-gray-300 text-sm font-medium mb-2">
              Server URL *
            </Text>
            <TextInput
              className="bg-gray-800 text-white p-4 rounded-lg text-base"
              placeholder="http://your-server.com:8080"
              placeholderTextColor="#6B7280"
              value={serverUrl}
              onChangeText={setServerUrl}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
            <Text className="text-gray-400 text-xs mt-1">
              Your IPTV provider's server URL with port
            </Text>
          </View>

          <View className="mb-4">
            <Text className="text-gray-300 text-sm font-medium mb-2">
              Username *
            </Text>
            <TextInput
              className="bg-gray-800 text-white p-4 rounded-lg text-base"
              placeholder="Your IPTV username"
              placeholderTextColor="#6B7280"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View className="mb-4">
            <Text className="text-gray-300 text-sm font-medium mb-2">
              Password *
            </Text>
            <TextInput
              className="bg-gray-800 text-white p-4 rounded-lg text-base"
              placeholder="Your IPTV password"
              placeholderTextColor="#6B7280"
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
            />
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

        {/* Channel Information */}
        {iptv.isConnected && (
          <View className="mb-6">
            <Text className="text-white text-lg font-semibold mb-4">
              Channel Information
            </Text>
            
            <View className="bg-gray-800/50 rounded-lg p-4 mb-4">
              <Text className="text-white font-medium mb-2">
                Available Channels
              </Text>
              <Text className="text-gray-400 text-sm">
                Channel list will be loaded after successful connection
              </Text>
            </View>

            <View className="bg-gray-800/50 rounded-lg p-4">
              <Text className="text-white font-medium mb-2">
                Favorite Channels
              </Text>
              <Text className="text-gray-400 text-sm">
                {iptv.favoriteChannels.length > 0 
                  ? `${iptv.favoriteChannels.length} channels marked as favorites`
                  : "No favorite channels set"
                }
              </Text>
            </View>
          </View>
        )}

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
                  Xtream Codes API
                </Text>
                <Text className="text-blue-200 text-sm leading-5">
                  This app supports IPTV services that use the Xtream Codes API format. 
                  Contact your IPTV provider for the correct server URL, username, and password.
                </Text>
              </View>
            </View>
          </View>

          <View className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 mb-4">
            <View className="flex-row items-start">
              <Ionicons name="warning" size={20} color="#F59E0B" />
              <View className="ml-3 flex-1">
                <Text className="text-yellow-300 font-medium mb-1">
                  Important Notice
                </Text>
                <Text className="text-yellow-200 text-sm leading-5">
                  Make sure you have a legitimate IPTV subscription. 
                  This app does not provide or endorse illegal streaming services.
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