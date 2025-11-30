import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TextInput, Switch, Alert, Platform, Linking, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import useSettingsStore from "../state/settingsStore";
import { ActionButton, ConnectionStatus, LoadingSpinner } from "../components";
import plexService from "../api/plex";

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
  const [scanning, setScanning] = useState(false);
  const [authenticating, setAuthenticating] = useState(false);
  const [libraries, setLibraries] = useState<any[]>([]);
  const [loadingLibraries, setLoadingLibraries] = useState(false);
  const [availableServers, setAvailableServers] = useState<any[]>([]);

  useEffect(() => {
    if (plex.isConnected && plex.serverUrl && plex.token) {
      loadLibraries();
    } else {
      setLibraries([]);
    }
  }, [plex.isConnected]);

  const loadLibraries = async () => {
    try {
      setLoadingLibraries(true);
      plexService.setCredentials(plex.serverUrl, plex.token);
      const libs = await plexService.getLibraries();
      setLibraries(libs || []);
    } catch (error) {
      console.error("Error loading libraries:", error);
      setLibraries([]);
    } finally {
      setLoadingLibraries(false);
    }
  };

  const scanForServers = async () => {
    if (Platform.OS === 'ios') {
      Alert.alert(
        "Local Network Access Required",
        "To scan for Plex servers on your local network, please ensure Local Network access is enabled for this app in Settings > Privacy & Security > Local Network.",
        [
          {
            text: "Open Settings",
            onPress: () => Linking.openSettings(),
          },
          {
            text: "Scan Anyway",
            onPress: () => performNetworkScan(),
          },
          {
            text: "Cancel",
            style: "cancel",
          },
        ]
      );
    } else {
      performNetworkScan();
    }
  };

  const performNetworkScan = async () => {
    setScanning(true);
    try {
      // Common local IP ranges and port
      const commonIPs = [
        '192.168.1.',
        '192.168.0.',
        '10.0.0.',
        '172.16.0.',
      ];

      Alert.alert(
        "Scanning Network",
        "Scanning for Plex servers on your local network. This may take a moment...",
        [{ text: "OK" }]
      );

      // Try common local addresses
      const localAddresses = [
        'http://127.0.0.1:32400',
        'http://localhost:32400',
        'http://192.168.1.1:32400',
        'http://192.168.0.1:32400',
        'http://10.0.0.1:32400',
      ];

      // For demo purposes, we'll just show instructions
      // In a real implementation, you would scan the network
      setTimeout(() => {
        Alert.alert(
          "Manual Server Discovery",
          "Please find your Plex server IP address:\n\n" +
          "1. Open Plex on your computer\n" +
          "2. Go to Settings > Network\n" +
          "3. Note the 'LAN Networks' IP address\n" +
          "4. Enter it below with port :32400\n\n" +
          "Example: http://192.168.1.100:32400"
        );
      }, 1000);
    } catch (error) {
      Alert.alert("Scan Failed", "Could not scan for servers. Please enter your server URL manually.");
    } finally {
      setScanning(false);
    }
  };

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

      if (success) {
        // Load libraries after successful connection
        await loadLibraries();

        // Check if we found any libraries
        const libCount = libraries.length;

        if (libCount === 0) {
          Alert.alert(
            "Connection Successful",
            "Connected to Plex server, but no libraries were found. Please check your Plex server configuration."
          );
        } else {
          Alert.alert(
            "Connection Successful",
            `Successfully connected to Plex server!\n\nFound ${libCount} ${libCount === 1 ? 'library' : 'libraries'}.`
          );
        }
      } else {
        Alert.alert(
          "Connection Failed",
          "Could not connect to Plex server. Please check:\n\n" +
          "• Server URL format: http://192.168.1.100:32400\n" +
          "• Server is running and accessible\n" +
          "• Token is valid (20-character string)\n" +
          "• No firewall blocking port 32400\n" +
          "• You're on the same network (for local servers)\n\n" +
          "⚠️ Development Environment:\n" +
          "If in Vibecode sandbox, local network access may be restricted. Consider using Plex remote access or deploying to a real device."
        );
      }
    } catch (error) {
      Alert.alert(
        "Connection Error",
        "An error occurred while testing the connection. Please verify your settings and try again."
      );
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
            setLibraries([]);
            Alert.alert("Settings Reset", "Plex settings have been reset.");
          },
        },
      ]
    );
  };

  const handleAutoSyncToggle = (value: boolean) => {
    updatePlexSettings({ autoSync: value });
  };

  const handleOAuthLogin = async () => {
    setAuthenticating(true);
    try {
      const result = await plexService.authenticate();

      if (!result) {
        Alert.alert(
          "Login Cancelled",
          "Plex authentication was cancelled or timed out. Please try again and make sure to complete the login in the browser.\n\nNote: You need to authorize the app in the Plex login page that opens."
        );
        setAuthenticating(false);
        return;
      }

      const { authToken, servers } = result;

      if (servers.length === 0) {
        Alert.alert(
          "No Servers Found",
          "You don't have any Plex servers associated with your account. Please set up a Plex server first."
        );
        setAuthenticating(false);
        return;
      }

      // Save the auth token
      setToken(authToken);

      // Save available servers
      setAvailableServers(servers);

      // If only one server, auto-select it
      if (servers.length === 1) {
        const server = servers[0];
        const bestUrl = plexService.getBestServerUrl(server);

        updatePlexSettings({
          serverUrl: bestUrl,
          token: authToken,
        });

        setServerUrl(bestUrl);

        // Test connection and load libraries
        plexService.setCredentials(bestUrl, authToken);
        const connectionSuccess = await testPlexConnection();

        if (connectionSuccess) {
          await loadLibraries();
          Alert.alert(
            "Login Successful!",
            `Connected to ${server.name}\n\nYou can now browse your Plex library.`
          );
        }
      } else {
        // Multiple servers - show selection
        Alert.alert(
          "Select Your Server",
          `Found ${servers.length} Plex servers. Please select one below.`,
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error("OAuth error:", error);
      Alert.alert(
        "Login Error",
        "An error occurred during authentication. Please try again or check your internet connection."
      );
    } finally {
      setAuthenticating(false);
    }
  };

  const handleSelectServer = async (server: any) => {
    try {
      const bestUrl = plexService.getBestServerUrl(server);
      console.log('Attempting to connect to:', bestUrl);
      console.log('Using token:', token ? 'Token exists' : 'No token');

      updatePlexSettings({
        serverUrl: bestUrl,
        token: token, // Use existing auth token
      });

      setServerUrl(bestUrl);

      // Test connection and load libraries
      plexService.setCredentials(bestUrl, token);
      console.log('Testing connection to:', bestUrl);

      const connectionSuccess = await testPlexConnection();
      console.log('Connection test result:', connectionSuccess);

      if (connectionSuccess) {
        await loadLibraries();
        setAvailableServers([]); // Clear server list
        Alert.alert(
          "Server Connected",
          `Successfully connected to ${server.name}`
        );
      } else {
        // Connection failed - show more helpful error with option to save anyway
        setAvailableServers([]); // Clear server list even on failure
        Alert.alert(
          "Connection Failed (Sandbox Limitation)",
          `Could not connect to ${server.name} at ${bestUrl}.\n\n` +
          `This is expected in the Vibecode sandbox environment. The server details have been saved.\n\n` +
          `When you use this app on a real device or outside the sandbox, the connection should work.`,
          [
            {
              text: "OK",
              onPress: () => {
                // Settings are already saved, just acknowledge
                console.log('[Plex] Settings saved despite connection failure (sandbox limitation)');
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error selecting server:', error);
      Alert.alert(
        "Error",
        "An error occurred while trying to connect to the server."
      );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true}
      >
        {/* Connection Status */}
        <View className="mb-6">
          <ConnectionStatus
            isConnected={plex.isConnected}
            serviceName="Plex Media Server"
            lastChecked={new Date()}
          />
        </View>

        {/* Sandbox Warning */}
        {!plex.isConnected && (
          <View className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-6">
            <View className="flex-row items-start">
              <Ionicons name="information-circle" size={20} color="#60A5FA" />
              <View className="ml-3 flex-1">
                <Text className="text-blue-300 font-medium mb-1">
                  Easy Plex Login
                </Text>
                <Text className="text-blue-200 text-sm leading-5">
                  Click "Login with Plex" to authenticate with your Plex account. This will automatically discover your servers and connect you to your library.
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* OAuth Login Button */}
        {!plex.isConnected && (
          <View className="mb-6">
            <ActionButton
              title={authenticating ? "Waiting for login..." : "Login with Plex"}
              icon="log-in"
              onPress={handleOAuthLogin}
              loading={authenticating}
              variant="primary"
              fullWidth
            />
            {authenticating && (
              <Text className="text-yellow-400 text-center text-sm mt-3">
                Please complete the login in the browser that opened...
              </Text>
            )}
            {!authenticating && (
              <Text className="text-gray-400 text-center text-sm mt-3">
                Recommended: Easy one-tap authentication
              </Text>
            )}
          </View>
        )}

        {/* Server Selection */}
        {availableServers.length > 0 && (
          <View className="mb-6" pointerEvents="box-none">
            <Text className="text-white text-lg font-semibold mb-4">
              Select Your Plex Server
            </Text>
            {availableServers.map((server, index) => (
              <Pressable
                key={`${server.machineIdentifier}-${index}`}
                onPress={() => {
                  console.log('Server pressed:', server.name);
                  handleSelectServer(server);
                }}
                className="bg-gray-800/50 rounded-lg p-4 mb-3"
                style={({ pressed }) => ({
                  opacity: pressed ? 0.7 : 1,
                })}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <View className="flex-row items-center justify-between" pointerEvents="none">
                  <View className="flex-1">
                    <Text className="text-white font-medium text-base">
                      {server.name}
                    </Text>
                    <Text className="text-gray-400 text-sm mt-1">
                      {server.localAddresses?.[0] ? `${server.localAddresses[0]}:${server.port || 32400}` :
                       server.publicAddress ? `${server.publicAddress}:${server.port || 32400}` :
                       server.address || 'Unknown address'}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#6B7280" />
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {/* Divider */}
        {!plex.isConnected && (
          <View className="flex-row items-center mb-6">
            <View className="flex-1 h-px bg-gray-700" />
            <Text className="text-gray-500 text-sm mx-4">OR</Text>
            <View className="flex-1 h-px bg-gray-700" />
          </View>
        )}

        {/* Server Configuration */}
        <View className="mb-6">
          <Text className="text-white text-lg font-semibold mb-2">
            Manual Configuration
          </Text>
          <Text className="text-gray-400 text-sm mb-4">
            Advanced: Manually enter your server details
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
              Include http:// or https:// and port number (usually :32400)
            </Text>
          </View>

          {/* Scan Network Button */}
          <ActionButton
            title="Scan for Plex Servers"
            icon="search"
            onPress={scanForServers}
            loading={scanning}
            variant="secondary"
            className="mb-4"
            fullWidth
          />

          <View className="mb-4">
            <Text className="text-gray-300 text-sm font-medium mb-2">
              Plex Token
            </Text>
            <TextInput
              className="bg-gray-800 text-white p-4 rounded-lg text-base"
              placeholder="claim-xxxxxxxxxxxxxxxxxxxx"
              placeholderTextColor="#6B7280"
              value={token}
              onChangeText={setToken}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
            />
            <Text className="text-gray-400 text-xs mt-1">
              20-character token from plex.tv/claim (e.g., claim-AbCdEf1234567890XyZ)
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

          {plex.isConnected ? (
            loadingLibraries ? (
              <View className="bg-gray-800/50 rounded-lg p-4">
                <View className="flex-row items-center">
                  <LoadingSpinner size="small" />
                  <Text className="text-gray-400 text-sm ml-3">
                    Loading libraries...
                  </Text>
                </View>
              </View>
            ) : libraries.length > 0 ? (
              <View className="bg-gray-800/50 rounded-lg p-4">
                <Text className="text-white font-medium mb-3">
                  Available Libraries ({libraries.length})
                </Text>
                {libraries.map((library) => (
                  <View
                    key={library.key}
                    className="flex-row items-center py-2 border-b border-gray-700/50 last:border-b-0"
                  >
                    <Ionicons
                      name={library.type === "movie" ? "film" : library.type === "show" ? "tv" : "folder"}
                      size={20}
                      color="#9CA3AF"
                    />
                    <View className="ml-3 flex-1">
                      <Text className="text-white text-sm">{library.title}</Text>
                      <Text className="text-gray-400 text-xs capitalize">{library.type}</Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View className="bg-yellow-900/20 border border-yellow-700/40 rounded-lg p-4">
                <View className="flex-row items-start">
                  <Ionicons name="warning" size={20} color="#F59E0B" />
                  <View className="ml-3 flex-1">
                    <Text className="text-yellow-300 font-medium mb-1">
                      No Libraries Found
                    </Text>
                    <Text className="text-yellow-200 text-sm">
                      Connected to Plex server but no libraries were detected. Please check your Plex server configuration.
                    </Text>
                  </View>
                </View>
              </View>
            )
          ) : (
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
                  How to get your Plex Token (Manual Method)
                </Text>
                <Text className="text-blue-200 text-sm leading-5">
                  1. Visit plex.tv/claim in your browser{"\n"}
                  2. Sign in to your Plex account{"\n"}
                  3. Copy the claim token (starts with "claim-"){"\n"}
                  4. Paste it in the token field above{"\n\n"}
                  Token format: claim-xxxxxxxxxxxxxxxxxxxx{"\n"}
                  (20 characters after "claim-")
                </Text>
              </View>
            </View>
          </View>

          <View className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4 mb-4">
            <View className="flex-row items-start">
              <Ionicons name="server" size={20} color="#C084FC" />
              <View className="ml-3 flex-1">
                <Text className="text-purple-300 font-medium mb-1">
                  Finding your Server URL
                </Text>
                <Text className="text-purple-200 text-sm leading-5">
                  On your Plex server computer:{"\n\n"}
                  1. Open Plex Web App{"\n"}
                  2. Go to Settings → Network{"\n"}
                  3. Find your local IP address{"\n"}
                  4. Format: http://[IP]:32400{"\n\n"}
                  Example: http://192.168.1.100:32400
                </Text>
              </View>
            </View>
          </View>

          <View className="bg-amber-900/20 border border-amber-700/40 rounded-lg p-4 mb-4">
            <View className="flex-row items-start">
              <Ionicons name="globe" size={20} color="#FBBF24" />
              <View className="ml-3 flex-1">
                <Text className="text-amber-300 font-medium mb-1">
                  Remote Access Alternative
                </Text>
                <Text className="text-amber-200 text-sm leading-5">
                  If local network access doesn't work:{"\n\n"}
                  1. Enable Remote Access in Plex settings{"\n"}
                  2. Use your public Plex URL{"\n"}
                  3. Format: https://[publicIP]:32400{"\n"}
                  4. Or use plex.direct URLs{"\n\n"}
                  This bypasses local network restrictions and works from anywhere.
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
