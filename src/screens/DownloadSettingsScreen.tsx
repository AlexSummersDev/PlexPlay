import React, { useState } from "react";
import { View, Text, ScrollView, TextInput, Pressable, Modal, FlatList } from "react-native";
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
  onServerUrlChange: (url: string) => void;
  // API key (Radarr/Sonarr)
  apiKey?: string;
  onApiKeyChange?: (key: string) => void;
  // Username/password (NZBGet)
  username?: string;
  password?: string;
  onUsernameChange?: (v: string) => void;
  onPasswordChange?: (v: string) => void;
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
  username,
  password,
  onServerUrlChange,
  onApiKeyChange,
  onUsernameChange,
  onPasswordChange,
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

          {service === "nzbget" ? (
            <>
              <View className="mb-4">
                <Text className="text-gray-300 text-sm font-medium mb-2">
                  Username *
                </Text>
                <TextInput
                  className="bg-gray-800 text-white p-3 rounded-lg text-base"
                  placeholder="nzbget"
                  placeholderTextColor="#6B7280"
                  value={typeof username === "string" ? username : ""}
                  onChangeText={onUsernameChange as any}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              <View className="mb-4">
                <Text className="text-gray-300 text-sm font-medium mb-2">
                  Password *
                </Text>
                <TextInput
                  className="bg-gray-800 text-white p-3 rounded-lg text-base"
                  placeholder="Your NZBGet password"
                  placeholderTextColor="#6B7280"
                  value={typeof password === "string" ? password : ""}
                  onChangeText={onPasswordChange as any}
                  autoCapitalize="none"
                  autoCorrect={false}
                  secureTextEntry
                />
              </View>
            </>
          ) : (
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
          )}

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
  const [nzbgetUsername, setNzbgetUsername] = useState(downloads.nzbget.username || "");
  const [nzbgetPassword, setNzbgetPassword] = useState(downloads.nzbget.password || "");
  const [radarrUrl, setRadarrUrl] = useState(downloads.radarr.serverUrl);
  const [radarrKey, setRadarrKey] = useState(downloads.radarr.apiKey);
  const [sonarrUrl, setSonarrUrl] = useState(downloads.sonarr.serverUrl);
  const [sonarrKey, setSonarrKey] = useState(downloads.sonarr.apiKey);

  const [testingNzbget, setTestingNzbget] = useState(false);
  const [testingRadarr, setTestingRadarr] = useState(false);
  const [testingSonarr, setTestingSonarr] = useState(false);

  const [status, setStatus] = useState<{ visible: boolean; title: string; message: string }>({
    visible: false,
    title: "",
    message: "",
  });
  const showStatus = (title: string, message: string) => setStatus({ visible: true, title, message });

  // Radarr/Sonarr selection state
  const [radarrProfiles, setRadarrProfiles] = useState<Array<{ id: number; name: string }>>([]);
  const [radarrRoots, setRadarrRoots] = useState<Array<{ id: number; path: string }>>([]);
  const [sonarrProfiles, setSonarrProfiles] = useState<Array<{ id: number; name: string }>>([]);
  const [sonarrRoots, setSonarrRoots] = useState<Array<{ id: number; path: string }>>([]);

  const [showRadarrProfileModal, setShowRadarrProfileModal] = useState(false);
  const [showRadarrRootModal, setShowRadarrRootModal] = useState(false);
  const [showSonarrProfileModal, setShowSonarrProfileModal] = useState(false);
  const [showSonarrRootModal, setShowSonarrRootModal] = useState(false);

  const [radarrProfileName, setRadarrProfileName] = useState(downloads.radarr.qualityProfile || "");
  const [radarrProfileId, setRadarrProfileId] = useState(downloads.radarr.qualityProfileId || 0);
  const [radarrRootPath, setRadarrRootPath] = useState(downloads.radarr.rootFolderPath || downloads.radarr.rootFolder || "");

  const [sonarrProfileName, setSonarrProfileName] = useState(downloads.sonarr.qualityProfile || "");
  const [sonarrProfileId, setSonarrProfileId] = useState(downloads.sonarr.qualityProfileId || 0);
  const [sonarrRootPath, setSonarrRootPath] = useState(downloads.sonarr.rootFolderPath || downloads.sonarr.rootFolder || "");

  const openRadarrProfiles = async () => {
    if (!radarrUrl.trim() || !radarrKey.trim()) {
      showStatus("Radarr Not Configured", "Enter Radarr URL and API key first.");
      return;
    }
    try {
      const svc = (await import("../api/radarr")).default;
      svc.setCredentials(radarrUrl.trim(), radarrKey.trim());
      const list = await svc.getQualityProfiles();
      setRadarrProfiles(list.map((p: any) => ({ id: p.id, name: p.name })));
      setShowRadarrProfileModal(true);
    } catch (e) {
      showStatus("Failed to Load Profiles", "Could not fetch Radarr quality profiles.");
    }
  };

  const openRadarrRoots = async () => {
    if (!radarrUrl.trim() || !radarrKey.trim()) {
      showStatus("Radarr Not Configured", "Enter Radarr URL and API key first.");
      return;
    }
    try {
      const svc = (await import("../api/radarr")).default;
      svc.setCredentials(radarrUrl.trim(), radarrKey.trim());
      const list = await svc.getRootFolders();
      setRadarrRoots(list.map((r: any) => ({ id: r.id, path: r.path })));
      setShowRadarrRootModal(true);
    } catch (e) {
      showStatus("Failed to Load Folders", "Could not fetch Radarr root folders.");
    }
  };

  const openSonarrProfiles = async () => {
    if (!sonarrUrl.trim() || !sonarrKey.trim()) {
      showStatus("Sonarr Not Configured", "Enter Sonarr URL and API key first.");
      return;
    }
    try {
      const svc = (await import("../api/sonarr")).default;
      svc.setCredentials(sonarrUrl.trim(), sonarrKey.trim());
      const list = await svc.getQualityProfiles();
      setSonarrProfiles(list.map((p: any) => ({ id: p.id, name: p.name })));
      setShowSonarrProfileModal(true);
    } catch (e) {
      showStatus("Failed to Load Profiles", "Could not fetch Sonarr quality profiles.");
    }
  };

  const openSonarrRoots = async () => {
    if (!sonarrUrl.trim() || !sonarrKey.trim()) {
      showStatus("Sonarr Not Configured", "Enter Sonarr URL and API key first.");
      return;
    }
    try {
      const svc = (await import("../api/sonarr")).default;
      svc.setCredentials(sonarrUrl.trim(), sonarrKey.trim());
      const list = await svc.getRootFolders();
      setSonarrRoots(list.map((r: any) => ({ id: r.id, path: r.path })));
      setShowSonarrRootModal(true);
    } catch (e) {
      showStatus("Failed to Load Folders", "Could not fetch Sonarr root folders.");
    }
  };

  const handleTestNzbget = async () => {
    if (!nzbgetUrl.trim() || !nzbgetUsername.trim() || !nzbgetPassword.trim()) {
      showStatus("Missing Information", "Please enter server URL, username, and password.");
      return;
    }

    updateDownloadSettings({
      nzbget: {
        ...downloads.nzbget,
        serverUrl: nzbgetUrl.trim(),
        username: nzbgetUsername.trim(),
        password: nzbgetPassword.trim(),
      },
    });

    setTestingNzbget(true);
    try {
      const success = await testNZBGetConnection();
      showStatus(
        success ? "NZBGet Connected" : "NZBGet Connection Failed",
        success
          ? "Successfully connected to NZBGet."
          : "Could not connect. Please check your settings."
      );
    } finally {
      setTestingNzbget(false);
    }
  };

  const handleTestRadarr = async () => {
    if (!radarrUrl.trim() || !radarrKey.trim()) {
      showStatus("Missing Information", "Please enter both server URL and API key.");
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
      showStatus(
        success ? "Radarr Connected" : "Radarr Connection Failed",
        success
          ? "Successfully connected to Radarr."
          : "Could not connect. Please check your settings."
      );
    } finally {
      setTestingRadarr(false);
    }
  };

  const handleTestSonarr = async () => {
    if (!sonarrUrl.trim() || !sonarrKey.trim()) {
      showStatus("Missing Information", "Please enter both server URL and API key.");
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
      showStatus(
        success ? "Sonarr Connected" : "Sonarr Connection Failed",
        success
          ? "Successfully connected to Sonarr."
          : "Could not connect. Please check your settings."
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
        username: nzbgetUsername.trim(),
        password: nzbgetPassword.trim(),
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
    showStatus("Settings Saved", "All download settings have been updated.");
  };

  const handleReset = () => {
    resetDownloadSettings();
    setNzbgetUrl("");
    setNzbgetUsername("");
    setNzbgetPassword("");
    setRadarrUrl("");
    setRadarrKey("");
    setSonarrUrl("");
    setSonarrKey("");
    showStatus("Settings Reset", "Download settings have been reset.");
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
          username={nzbgetUsername}
          password={nzbgetPassword}
          onServerUrlChange={setNzbgetUrl}
          onUsernameChange={setNzbgetUsername}
          onPasswordChange={setNzbgetPassword}
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
                Quality Profile: {radarrProfileName || "Not set"}
              </Text>
              <Pressable
                onPress={openRadarrProfiles}
                className="mt-2 bg-gray-800 rounded-lg px-3 py-2 self-start"
                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
              >
                <Text className="text-blue-300 text-sm">Select Quality Profile</Text>
              </Pressable>
              <Text className="text-gray-400 text-sm mt-3">
                Root Folder: {radarrRootPath || "Not set"}
              </Text>
              <Pressable
                onPress={openRadarrRoots}
                className="mt-2 bg-gray-800 rounded-lg px-3 py-2 self-start"
                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
              >
                <Text className="text-blue-300 text-sm">Select Root Folder</Text>
              </Pressable>
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
                Quality Profile: {sonarrProfileName || "Not set"}
              </Text>
              <Pressable
                onPress={openSonarrProfiles}
                className="mt-2 bg-gray-800 rounded-lg px-3 py-2 self-start"
                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
              >
                <Text className="text-blue-300 text-sm">Select Quality Profile</Text>
              </Pressable>
              <Text className="text-gray-400 text-sm mt-3">
                Root Folder: {sonarrRootPath || "Not set"}
              </Text>
              <Pressable
                onPress={openSonarrRoots}
                className="mt-2 bg-gray-800 rounded-lg px-3 py-2 self-start"
                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
              >
                <Text className="text-blue-300 text-sm">Select Root Folder</Text>
              </Pressable>
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

      {/* Status Modal */}
      <Modal
        visible={status.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setStatus({ visible: false, title: "", message: "" })}
      >
        <View className="flex-1 items-center justify-center bg-black/60">
          <View className="bg-gray-900 rounded-xl p-5 w-11/12">
            <Text className="text-white text-lg font-semibold mb-2">{status.title}</Text>
            <Text className="text-gray-300 mb-4">{status.message}</Text>
            <ActionButton
              title="OK"
              icon="checkmark"
              onPress={() => setStatus({ visible: false, title: "", message: "" })}
              variant="primary"
              fullWidth
            />
          </View>
        </View>
      </Modal>

      {/* Radarr Quality Profile Modal */}
      <Modal
        visible={showRadarrProfileModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRadarrProfileModal(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/60">
          <View className="bg-gray-900 rounded-xl p-5 w-11/12 max-h-[70%]">
            <Text className="text-white text-lg font-semibold mb-3">Select Radarr Quality Profile</Text>
            <ScrollView className="max-h-[60%]">
              {radarrProfiles.map((p) => (
                <Pressable
                  key={p.id}
                  onPress={() => {
                    setRadarrProfileName(p.name);
                    setRadarrProfileId(p.id);
                    updateDownloadSettings({
                      radarr: { ...downloads.radarr, qualityProfile: p.name, qualityProfileId: p.id },
                    });
                    setShowRadarrProfileModal(false);
                  }}
                  className="py-3 border-b border-gray-800"
                >
                  <Text className="text-gray-200 text-base">{p.name}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <ActionButton title="Close" icon="close" onPress={() => setShowRadarrProfileModal(false)} variant="secondary" fullWidth />
          </View>
        </View>
      </Modal>

      {/* Radarr Root Folder Modal */}
      <Modal
        visible={showRadarrRootModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRadarrRootModal(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/60">
          <View className="bg-gray-900 rounded-xl p-5 w-11/12 max-h-[70%]">
            <Text className="text-white text-lg font-semibold mb-3">Select Radarr Root Folder</Text>
            <ScrollView className="max-h-[60%]">
              {radarrRoots.map((r) => (
                <Pressable
                  key={r.id}
                  onPress={() => {
                    setRadarrRootPath(r.path);
                    updateDownloadSettings({
                      radarr: { ...downloads.radarr, rootFolder: r.path, rootFolderPath: r.path },
                    });
                    setShowRadarrRootModal(false);
                  }}
                  className="py-3 border-b border-gray-800"
                >
                  <Text className="text-gray-200 text-base">{r.path}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <ActionButton title="Close" icon="close" onPress={() => setShowRadarrRootModal(false)} variant="secondary" fullWidth />
          </View>
        </View>
      </Modal>

      {/* Sonarr Quality Profile Modal */}
      <Modal
        visible={showSonarrProfileModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSonarrProfileModal(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/60">
          <View className="bg-gray-900 rounded-xl p-5 w-11/12 max-h-[70%]">
            <Text className="text-white text-lg font-semibold mb-3">Select Sonarr Quality Profile</Text>
            <ScrollView className="max-h-[60%]">
              {sonarrProfiles.map((p) => (
                <Pressable
                  key={p.id}
                  onPress={() => {
                    setSonarrProfileName(p.name);
                    setSonarrProfileId(p.id);
                    updateDownloadSettings({
                      sonarr: { ...downloads.sonarr, qualityProfile: p.name, qualityProfileId: p.id },
                    });
                    setShowSonarrProfileModal(false);
                  }}
                  className="py-3 border-b border-gray-800"
                >
                  <Text className="text-gray-200 text-base">{p.name}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <ActionButton title="Close" icon="close" onPress={() => setShowSonarrProfileModal(false)} variant="secondary" fullWidth />
          </View>
        </View>
      </Modal>

      {/* Sonarr Root Folder Modal */}
      <Modal
        visible={showSonarrRootModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSonarrRootModal(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/60">
          <View className="bg-gray-900 rounded-xl p-5 w-11/12 max-h-[70%]">
            <Text className="text-white text-lg font-semibold mb-3">Select Sonarr Root Folder</Text>
            <ScrollView className="max-h-[60%]">
              {sonarrRoots.map((r) => (
                <Pressable
                  key={r.id}
                  onPress={() => {
                    setSonarrRootPath(r.path);
                    updateDownloadSettings({
                      sonarr: { ...downloads.sonarr, rootFolder: r.path, rootFolderPath: r.path },
                    });
                    setShowSonarrRootModal(false);
                  }}
                  className="py-3 border-b border-gray-800"
                >
                  <Text className="text-gray-200 text-base">{r.path}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <ActionButton title="Close" icon="close" onPress={() => setShowSonarrRootModal(false)} variant="secondary" fullWidth />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}