import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, Switch, TextInput, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { SettingsStackParamList } from "../types/navigation";
import useSettingsStore from "../state/settingsStore";
import { ConnectionStatus } from "../components";

type SettingsScreenNavigationProp = NativeStackNavigationProp<SettingsStackParamList, "Main">;

interface SettingsItemProps {
  title: string;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  showChevron?: boolean;
}

function SettingsItem({ 
  title, 
  subtitle, 
  icon, 
  onPress, 
  rightElement, 
  showChevron = true 
}: SettingsItemProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center p-4 bg-gray-800/50 rounded-lg mb-3"
      style={({ pressed }) => ({
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <View className="w-10 h-10 bg-gray-700 rounded-full items-center justify-center mr-4">
        <Ionicons name={icon} size={20} color="#60A5FA" />
      </View>
      
      <View className="flex-1">
        <Text className="text-white font-medium text-base">
          {title}
        </Text>
        {subtitle && (
          <Text className="text-gray-400 text-sm mt-1">
            {subtitle}
          </Text>
        )}
      </View>
      
      {rightElement || (showChevron && onPress && (
        <Ionicons name="chevron-forward" size={20} color="#6B7280" />
      ))}
    </Pressable>
  );
}

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

function SettingsSection({ title, children }: SettingsSectionProps) {
  return (
    <View className="mb-6">
      <Text className="text-gray-400 text-sm font-medium uppercase tracking-wide mb-3 px-1">
        {title}
      </Text>
      {children}
    </View>
  );
}

export default function SettingsScreen() {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  
  const {
    app,
    plex,
    iptv,
    downloads,
    updateAppSettings,
  } = useSettingsStore();

  const [tmdbKey, setTmdbKey] = useState(app.tmdbApiKey || "");
  const [status, setStatus] = useState<{ visible: boolean; title: string; message: string }>({ visible: false, title: "", message: "" });
  const showStatus = (title: string, message: string) => setStatus({ visible: true, title, message });

  const handleThemeToggle = (value: boolean) => {
    updateAppSettings({ theme: value ? "dark" : "light" });
  };

  const handleNotificationsToggle = (value: boolean) => {
    updateAppSettings({ notifications: value });
  };

  const handleAutoPlayToggle = (value: boolean) => {
    updateAppSettings({ autoPlay: value });
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {/* General Settings */}
        <SettingsSection title="General">
          <SettingsItem
            title="Dark Mode"
            subtitle="Use dark theme throughout the app"
            icon="moon"
            rightElement={
              <Switch
                value={app.theme === "dark"}
                onValueChange={handleThemeToggle}
                trackColor={{ false: "#374151", true: "#3B82F6" }}
                thumbColor="#FFFFFF"
              />
            }
            showChevron={false}
          />
          
          <SettingsItem
            title="Notifications"
            subtitle="Receive download and streaming notifications"
            icon="notifications"
            rightElement={
              <Switch
                value={app.notifications}
                onValueChange={handleNotificationsToggle}
                trackColor={{ false: "#374151", true: "#3B82F6" }}
                thumbColor="#FFFFFF"
              />
            }
            showChevron={false}
          />
          
          <SettingsItem
            title="Auto Play"
            subtitle="Automatically play trailers and previews"
            icon="play"
            rightElement={
              <Switch
                value={app.autoPlay}
                onValueChange={handleAutoPlayToggle}
                trackColor={{ false: "#374151", true: "#3B82F6" }}
                thumbColor="#FFFFFF"
              />
            }
            showChevron={false}
          />
          
          <SettingsItem
            title="Video Quality"
            subtitle={`Default: ${app.videoQuality}`}
            icon="videocam"
            onPress={() => {
              // In a real app, this would open a quality selection modal
              console.log("Video quality settings");
            }}
          />
        </SettingsSection>

        {/* TMDB API */}
        <SettingsSection title="TMDB API">
          <View className="bg-gray-800/50 rounded-lg p-4 mb-3">
            <Text className="text-gray-300 text-sm font-medium mb-2">API Key</Text>
            <TextInput
              className="bg-gray-800 text-white p-3 rounded-lg text-base"
              placeholder="Paste your TMDB API key"
              placeholderTextColor="#6B7280"
              value={tmdbKey}
              onChangeText={setTmdbKey}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <View className="flex-row mt-3">
              <Pressable
                onPress={async () => {
                  const ok = await (await import("../api/tmdb")).testTMDBKey(tmdbKey);
                  showStatus(ok ? "TMDB Key Valid" : "TMDB Key Invalid", ok ? "The key works. Save to apply globally." : "Please double-check and try again.");
                }}
                className="bg-gray-700 rounded-lg px-4 py-2 mr-2"
                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
              >
                <Text className="text-white">Test Key</Text>
              </Pressable>
              <Pressable
                onPress={async () => {
                  updateAppSettings({ tmdbApiKey: tmdbKey.trim() });
                  const { setTMDBRuntimeApiKey } = await import("../api/tmdb");
                  setTMDBRuntimeApiKey(tmdbKey.trim());
                  showStatus("TMDB Key Saved", "Live providers and trailers will use this key.");
                }}
                className="bg-blue-600 rounded-lg px-4 py-2"
                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
              >
                <Text className="text-white">Save Key</Text>
              </Pressable>
            </View>
            <Text className="text-gray-400 text-xs mt-2">Tip: You can also set EXPO_PUBLIC_TMDB_API_KEY in env.</Text>
          </View>
        </SettingsSection>

        {/* Integrations */}
        <SettingsSection title="Integrations">
          <SettingsItem
            title="Plex Settings"
            subtitle={plex.isConnected ? "Connected" : "Not connected"}
            icon="server"
            onPress={() => navigation.navigate("PlexSettings")}
          />
          
          <SettingsItem
            title="IPTV Settings"
            subtitle={iptv.isConnected ? "Connected" : "Not connected"}
            icon="tv"
            onPress={() => navigation.navigate("IPTVSettings")}
          />
          
          <SettingsItem
            title="Download Settings"
            subtitle="Configure Radarr, Sonarr, and NZBGet"
            icon="download"
            onPress={() => navigation.navigate("DownloadSettings")}
          />
        </SettingsSection>

        {/* Connection Status */}
        <SettingsSection title="Connection Status">
          <ConnectionStatus
            isConnected={plex.isConnected}
            serviceName="Plex Media Server"
            className="mb-3"
          />
          
          <ConnectionStatus
            isConnected={iptv.isConnected}
            serviceName="IPTV Service"
            className="mb-3"
          />
          
          <ConnectionStatus
            isConnected={downloads.radarr.isConnected}
            serviceName="Radarr (Movies)"
            className="mb-3"
          />
          
          <ConnectionStatus
            isConnected={downloads.sonarr.isConnected}
            serviceName="Sonarr (TV Shows)"
            className="mb-3"
          />
          
          <ConnectionStatus
            isConnected={downloads.nzbget.isConnected}
            serviceName="NZBGet (Downloads)"
            className="mb-3"
          />
        </SettingsSection>

        {/* About */}
        <SettingsSection title="About">
          <SettingsItem
            title="App Version"
            subtitle="1.0.0"
            icon="information-circle"
            showChevron={false}
          />
          
          <SettingsItem
            title="Privacy Policy"
            icon="shield-checkmark"
            onPress={() => {
              console.log("Privacy policy");
            }}
          />
          
          <SettingsItem
            title="Terms of Service"
            icon="document-text"
            onPress={() => {
              console.log("Terms of service");
            }}
          />
          
          <SettingsItem
            title="Support"
            subtitle="Get help and report issues"
            icon="help-circle"
            onPress={() => {
              console.log("Support");
            }}
          />
        </SettingsSection>

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
            <Pressable
              onPress={() => setStatus({ visible: false, title: "", message: "" })}
              className="bg-blue-600 rounded-lg px-4 py-2 self-stretch items-center"
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <Text className="text-white">OK</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}