import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { MoviesStackParamList } from "../types/navigation";
import SearchScreen from "../screens/SearchScreen";
import DetailsScreen from "../screens/DetailsScreen";
import PlexIntegrationScreen from "../screens/PlexIntegrationScreen";
import ProvidersBrowserScreen from "../screens/ProvidersBrowserScreen";
import PlexPlayerScreen from "../screens/PlexPlayerScreen";

const Stack = createNativeStackNavigator<MoviesStackParamList>();

export default function SearchStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen
        name="Home"
        component={SearchScreen}
      />
      <Stack.Screen
        name="Details"
        component={DetailsScreen}
      />
      <Stack.Screen
        name="Search"
        component={SearchScreen}
      />
      <Stack.Screen
        name="PlexIntegration"
        component={PlexIntegrationScreen}
      />
      <Stack.Screen
        name="Providers"
        component={ProvidersBrowserScreen}
      />
      <Stack.Screen
        name="PlexPlayer"
        component={PlexPlayerScreen}
        options={{
          headerShown: false,
          presentation: "fullScreenModal",
        }}
      />
    </Stack.Navigator>
  );
}
