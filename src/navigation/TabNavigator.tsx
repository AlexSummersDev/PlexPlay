import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { RootTabParamList } from "../types/navigation";
import MoviesStack from "./MoviesStack";
import TVShowsStack from "./TVShowsStack";
import LiveTVStack from "./LiveTVStack";
import SettingsStack from "./SettingsStack";

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === "Movies") {
            iconName = focused ? "film" : "film-outline";
          } else if (route.name === "TVShows") {
            iconName = focused ? "tv" : "tv-outline";
          } else if (route.name === "LiveTV") {
            iconName = focused ? "radio" : "radio-outline";
          } else if (route.name === "Settings") {
            iconName = focused ? "settings" : "settings-outline";
          } else {
            iconName = "help-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "#8E8E93",
        tabBarStyle: {
          backgroundColor: "#000000",
          borderTopColor: "#1C1C1E",
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Movies" 
        component={MoviesStack}
        options={{ tabBarLabel: "Movies" }}
      />
      <Tab.Screen 
        name="TVShows" 
        component={TVShowsStack}
        options={{ tabBarLabel: "TV Shows" }}
      />
      <Tab.Screen 
        name="LiveTV" 
        component={LiveTVStack}
        options={{ tabBarLabel: "Live TV" }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsStack}
        options={{ tabBarLabel: "Settings" }}
      />
    </Tab.Navigator>
  );
}