import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { LiveTVStackParamList } from "../types/navigation";
import LiveTVScreen from "../screens/LiveTVScreen";
import LiveTVPlayerScreen from "../screens/LiveTVPlayerScreen";

const Stack = createNativeStackNavigator<LiveTVStackParamList>();

export default function LiveTVStack() {
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
        name="Channels" 
        component={LiveTVScreen}
        options={{ 
          title: "Live TV",
          headerLargeTitle: true,
        }}
      />
      <Stack.Screen 
        name="Player" 
        component={LiveTVPlayerScreen}
        options={{ 
          title: "",
          headerShown: false,
          presentation: "fullScreenModal",
        }}
      />
    </Stack.Navigator>
  );
}