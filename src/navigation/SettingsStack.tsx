import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SettingsStackParamList } from "../types/navigation";
import SettingsScreen from "../screens/SettingsScreen";
import PlexSettingsScreen from "../screens/PlexSettingsScreen";
import IPTVSettingsScreen from "../screens/IPTVSettingsScreen";
import DownloadSettingsScreen from "../screens/DownloadSettingsScreen";

const Stack = createNativeStackNavigator<SettingsStackParamList>();

export default function SettingsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: "#000000",
        },
        headerTintColor: "#FFFFFF",
        headerTitleStyle: {
          fontWeight: "600",
        },
      }}
    >
      <Stack.Screen 
        name="Main" 
        component={SettingsScreen}
        options={{ 
          title: "Settings",
          headerLargeTitle: true,
        }}
      />
      <Stack.Screen 
        name="PlexSettings" 
        component={PlexSettingsScreen}
        options={{ 
          title: "Plex Settings",
        }}
      />
      <Stack.Screen 
        name="IPTVSettings" 
        component={IPTVSettingsScreen}
        options={{ 
          title: "IPTV Settings",
        }}
      />
      <Stack.Screen 
        name="DownloadSettings" 
        component={DownloadSettingsScreen}
        options={{ 
          title: "Download Settings",
        }}
      />
    </Stack.Navigator>
  );
}