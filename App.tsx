import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { View, Text } from "react-native";
import TabNavigator from "./src/navigation/TabNavigator";
import AppClipEntry from "./src/components/AppClipEntry";
import { useAppClip } from "./src/hooks/useAppClip";

/*
IMPORTANT NOTICE: DO NOT REMOVE
There are already environment keys in the project. 
Before telling the user to add them, check if you already have access to the required keys through bash.
Directly access them with process.env.${key}

Correct usage:
process.env.EXPO_PUBLIC_VIBECODE_{key}
//directly access the key

Incorrect usage:
import { OPENAI_API_KEY } from '@env';
//don't use @env, its depreicated

Incorrect usage:
import Constants from 'expo-constants';
const openai_api_key = Constants.expoConfig.extra.apikey;
//don't use expo-constants, its depreicated

*/

export default function App() {
  const { isClip, isLoading } = useAppClip();

  // Show loading while detecting App Clip status
  if (isLoading) {
    return (
      <GestureHandlerRootView className="flex-1">
        <SafeAreaProvider>
          <View className="flex-1 justify-center items-center bg-white">
            <Text className="text-lg text-gray-600">Loading...</Text>
          </View>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  // Render App Clip experience
  if (isClip) {
    return (
      <GestureHandlerRootView className="flex-1">
        <AppClipEntry />
        <StatusBar style="dark" />
      </GestureHandlerRootView>
    );
  }

  // Render full app experience
  return (
    <GestureHandlerRootView className="flex-1">
      <SafeAreaProvider>
        <NavigationContainer>
          <TabNavigator />
          <StatusBar style="light" />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
