import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { MoviesStackParamList } from "../types/navigation";
import HomeScreen from "../screens/HomeScreen";
import SearchScreen from "../screens/SearchScreen";
import DetailsScreen from "../screens/DetailsScreen";
import PlexIntegrationScreen from "../screens/PlexIntegrationScreen";

const Stack = createNativeStackNavigator<MoviesStackParamList>();

export default function MoviesStack() {
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
        headerLargeTitle: true,
      }}
    >
      <Stack.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ 
          title: "Movies",
          headerLargeTitle: true,
        }}
      />
      <Stack.Screen 
        name="Search" 
        component={SearchScreen}
        options={{ 
          title: "Search",
          headerLargeTitle: false,
        }}
      />
      <Stack.Screen 
        name="Details" 
        component={DetailsScreen}
        options={{ 
          title: "",
          headerLargeTitle: false,
          headerTransparent: true,
        }}
      />
      <Stack.Screen 
        name="PlexIntegration" 
        component={PlexIntegrationScreen}
        options={{ 
          title: "Plex Integration",
          presentation: "modal",
        }}
      />
    </Stack.Navigator>
  );
}