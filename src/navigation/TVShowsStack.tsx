import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { TVShowsStackParamList } from "../types/navigation";
import TVHomeScreen from "../screens/TVHomeScreen";
import SearchScreen from "../screens/SearchScreen";
import DetailsScreen from "../screens/DetailsScreen";

const Stack = createNativeStackNavigator<TVShowsStackParamList>();

export default function TVShowsStack() {
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
        component={TVHomeScreen}
        options={{ 
          title: "TV Shows",
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
    </Stack.Navigator>
  );
}