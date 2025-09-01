import React, { useState } from "react";
import { View, Text, ScrollView, TextInput, Alert, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import useSettingsStore from "../state/settingsStore";
import { ActionButton, ConnectionStatus } from "../components";

type ServiceType = "nzbget" | "radarr" | "sonarr";

interface ServiceConfigProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  service: ServiceType;
  isConnected: boolean;
  serverUrl: string;
  apiKey: string;
  onServerUrlChange: (url: string) => void;
  onApiKeyChange: (key: string) => void;
  onTest: () => void;
  testing: boolean;
  additionalFields?: React.ReactNode;
}

function ServiceConfig({
  title,
  icon,
  service,
  isConnected,
  serverUrl,
  apiKey,
  onServerUrlChange,
  onApiKeyChange,
  onTest,
  testing,
  additionalFields,
}: ServiceConfigProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View className="mb-6">
      <Pressable
        onPress={() => setExpanded(!expanded)}
        className="flex-row items-center justify-between p-4 bg-gray-800/50 rounded-lg mb-3"
        style={({ pressed }) => ({
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <View className="flex-row items-center flex-1">
          <View className="w-10 h-10 bg-gray-700 rounded-full items-center justify-center mr-3">
            <Ionicons name={icon} size={20} color="#60A5FA" />
          </View>
          <View className="flex-1">
            <Text className="text-white font-medium text-base">
              {title}
            </Text>
            <Text className="text-gray-400 text-sm">
              {isConnected ? "Connected" : "Not connected"}
            </Text>
          </View>
        </View>
        <Ionicons 
          name={expanded ? "chevron-up" : "chevron-down"} 
          size={20} 
          color="#6B7280" 
        />
      </Pressable>

      {expanded && (
        <View className="bg-gray-800/30 rounded-lg p-4">
          <ConnectionStatus
            isConnected={isConnected}
            serviceName={title}
            className="mb-4"
          />

          <View className="mb-4">
            <Text className="text-gray-300 text-sm font-medium mb-2">
              Server URL *
            </Text>
            <TextInput
              className="bg-gray-800 text-white p-3 rounded-lg text-base"
              placeholder={`http://localhost:${service === "nzbget" ? "6789" : service === "radarr" ? "7878" : "8989"}`}
              placeholderTextColor="#6B7280"
              value={serverUrl}
              onChangeText={onServerUrlChange}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
          </View>

          <View className="mb-4">
            <Text className="text-gray-300 text-sm font-medium mb-2">
              API Key *
            </Text>
            <TextInput
              className="bg-gray-800 text-white p-3 rounded-lg text-base"
              placeholder="Your API key"
              placeholderTextColor="#6B7280"
              value={apiKey}
              onChangeText={onApiKeyChange}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
            />
          </View>

          {additionalFields}

          <ActionButton
            title="Test Connection"
            icon="checkmark-circle"
            onPress={onTest}
            loading={testing}
            variant="primary"
            fullWidth
          />
        </View>
      )}
    </View>
  );
}

export default function DownloadSettingsScreen() {
  const {
    downloads,
    updateDownloadSettings,
    testNZBGetConnection,
    testRadarrConnection,
    testSonarrConnection,
    resetDownloadSettings,
  } = useSettingsStore();

  const [nzbgetUrl, setNzbgetUrl] = useState(downloads.nzbget.serverUrl);
  const [nzbgetKey, setNzbgetKey] = useState(downloads.nzbget.apiKey);
  const [radarrUrl, setRadarrUrl] = useState(downloads.radarr.serverUrl);
  const [radarrKey, setRadarrKey] = useState(downloads.radarr.apiKey);
  const [sonarrUrl, setSonarrUrl] = useState(downloads.sonarr.serverUrl);
  const [sonarrKey, setSonarrKey] = useState(downloads.sonarr.apiKey);

  const [testingNzbget, setTestingNzbget] = useState(false);
  const [testingRadarr, setTestingRadarr] = useState(false);
  const [testingSonarr, setTestingSonarr] = useState(false);

  const handleTestNzbget = async () => {
    if (!nzbgetUrl.trim() || !nzbgetKey.trim()) {
      Alert.alert("Missing Information", "Please enter both server URL and API key.");
      return;
    }

    updateDownloadSettings({
      nzbget: {
        ...downloads.nzbget,
        serverUrl: nzbgetUrl.trim(),
        apiKey: nzbgetKey.trim(),
      },
    });

    setTestingNzbget(true);
    try {
      const success = await testNZBGetConnection();
      Alert.alert(
        success ? "NZBGet Connected" : "NZBGet Connection Failed",
        success 
          ? "Successfully connected to NZBGet!" 
          : "Could not connect to NZBGet. Please check your settings."
      );
    } finally {
      setTestingNzbget(false);
    }
  };

  const handleTestRadarr = async () => {
    if (!radarrUrl.trim() || !radarrKey.trim()) {
      Alert.alert("Missing Information", "Please enter both server URL and API key.");
      return;
    }

    updateDownloadSettings({
      radarr: {
        ...downloads.radarr,
        serverUrl: radarrUrl.trim(),
        apiKey: radarrKey.trim(),
      },
    });

    setTestingRadarr(true);
    try {
      const success = await testRadarrConnection();
      Alert.alert(
        success ? "Radarr Connected" : "Radarr Connection Failed",
        success 
          ? "Successfully connected to Radarr!" 
          : "Could not connect to Radarr. Please check your settings."
      );
    } finally {
      setTestingRadarr(false);
    }
  };

  const handleTestSonarr = async () => {
    if (!sonarrUrl.trim() || !sonarrKey.trim()) {
      Alert.alert("Missing Information", "Please enter both server URL and API key.");
      return;
    }

    updateDownloadSettings({
      sonarr: {
        ...downloads.sonarr,
        serverUrl: sonarrUrl.trim(),
        apiKey: sonarrKey.trim(),
      },
    });

    setTestingSonarr(true);
    try {
      const success = await testSonarrConnection();
      Alert.alert(
        success ? "Sonarr Connected" : "Sonarr Connection Failed",
        success 
          ? "Successfully connected to Sonarr!" 
          : "Could not connect to Sonarr. Please check your settings."
      );
    } finally {
      setTestingSonarr(false);
    }
  };

  const handleSaveAll = () => {
    updateDownloadSettings({
      nzbget: {
        ...downloads.nzbget,
        serverUrl: nzbgetUrl.trim(),
        apiKey: nzbgetKey.trim(),
      },
      radarr: {
        ...downloads.radarr,
        serverUrl: radarrUrl.trim(),
        apiKey: radarrKey.trim(),
      },
      sonarr: {
        ...downloads.sonarr,
        serverUrl: sonarrUrl.trim(),
        apiKey: sonarrKey.trim(),
      },
    });
    Alert.alert("Settings Saved", "All download settings have been updated.");
  };

  const handleReset = () => {
    Alert.alert(
      "Reset Settings",
      "Are you sure you want to reset all download settings?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            resetDownloadSettings();
            setNzbgetUrl("");
            setNzbgetKey("");
            setRadarrUrl("");
            setRadarrKey("");
            setSonarrUrl("");
            setSonarrKey("");
            Alert.alert("Settings Reset", "Download settings have been reset.");
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <Text className="text-gray-400 text-sm mb-6 leading-5">
          Configure your download automation services. These integrations allow the app to automatically download movies and TV shows.
        </Text>

        {/* NZBGet Configuration */}
        <ServiceConfig
          title="NZBGet"
          icon="download"
          service="nzbget"
          isConnected={downloads.nzbget.isConnected}
          serverUrl={nzbgetUrl}
          apiKey={nzbgetKey}
          onServerUrlChange={setNzbgetUrl}
          onApiKeyChange={setNzbgetKey}
          onTest={handleTestNzbget}
          testing={testingNzbget}
        />

        {/* Radarr Configuration */}
        <ServiceConfig
          title="Radarr (Movies)"
          icon="film"
          service="radarr"
          isConnected={downloads.radarr.isConnected}
          serverUrl={radarrUrl}
          apiKey={radarrKey}
          onServerUrlChange={setRadarrUrl}
          onApiKeyChange={setRadarrKey}
          onTest={handleTestRadarr}
          testing={testingRadarr}
          additionalFields={
            <View className="mb-4">
              <Text className="text-gray-400 text-sm">
                Quality Profile: {downloads.radarr.qualityProfile || "Not set"}
              </Text>
              <Text className="text-gray-400 text-sm">
                Root Folder: {downloads.radarr.rootFolder || "Not set"}
              </Text>
            </View>
          }
        />

        {/* Sonarr Configuration */}
        <ServiceConfig
          title="Sonarr (TV Shows)"
          icon="tv"
          service="sonarr"
          isConnected={downloads.sonarr.isConnected}
          serverUrl={sonarrUrl}
          apiKey={sonarrKey}
          onServerUrlChange={setSonarrUrl}
          onApiKeyChange={setSonarrKey}
          onTest={handleTestSonarr}
          testing={testingSonarr}
          additionalFields={
            <View className="mb-4">
              <Text className="text-gray-400 text-sm">
                Quality Profile: {downloads.sonarr.qualityProfile || "Not set"}
              </Text>
              <Text className="text-gray-400 text-sm">
                Root Folder: {downloads.sonarr.rootFolder || "Not set"}
              </Text>
            </View>
          }
        />

        {/* Action Buttons */}
        <View className="mb-6">
          <ActionButton
            title="Save All Settings"
            icon="save"
            onPress={handleSaveAll}
            variant="primary"
            fullWidth
            className="mb-3"
          />
          
          <ActionButton
            title="Reset All Settings"
            icon="refresh"
            onPress={handleReset}
            variant="danger"
            fullWidth
          />
        </View>

        {/* Help Section */}
        <View className="mb-6">
          <Text className="text-white text-lg font-semibold mb-4">
            Help & Information
          </Text>
          
          <View className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
            <View className="flex-row items-start">
              <Ionicons name="information-circle" size={20} color="#60A5FA" />
              <View className="ml-3 flex-1">
                <Text className="text-blue-300 font-medium mb-2">
                  Download Automation
                </Text>
                <Text className="text-blue-200 text-sm leading-5 mb-2">
                  • <Text className="font-medium">NZBGet:</Text> Downloads and extracts files from Usenet
                </Text>
                <Text className="text-blue-200 text-sm leading-5 mb-2">
                  • <Text className="font-medium">Radarr:</Text> Manages movie downloads and library organization
                </Text>
                <Text className="text-blue-200 text-sm leading-5">
                  • <Text className="font-medium">Sonarr:</Text> Manages TV show downloads and library organization
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Add some bottom padding */}
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}