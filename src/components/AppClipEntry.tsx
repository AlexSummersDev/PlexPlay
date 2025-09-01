import React from "react";
import { View, Text, Pressable, Alert } from "react-native";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAppClip } from "../hooks/useAppClip";

interface AppClipEntryProps {
  onOpenFullApp?: () => void;
}

export default function AppClipEntry({ onOpenFullApp }: AppClipEntryProps) {
  const insets = useSafeAreaInsets();
  const { isLoading, clipParams, experience, openFullApp } = useAppClip();

  const handleGetFullApp = async () => {
    try {
      if (onOpenFullApp) {
        onOpenFullApp();
        return;
      }
      
      await openFullApp();
    } catch (error) {
      console.error("Error opening full app:", error);
      Alert.alert("Error", "Unable to open the full app. Please try again.");
    }
  };

  const handleQuickAction = () => {
    // Handle specific App Clip actions based on URL parameters
    console.log("App Clip params:", clipParams);
    console.log("App Clip experience:", experience);
    
    // Perform the main App Clip action
    const actionTitle = experience?.title || "Quick Action";
    const actionSubtitle = experience?.subtitle || "This is your streamlined App Clip experience!";
    
    Alert.alert(
      actionTitle,
      actionSubtitle,
      [
        { text: "Get Full App", onPress: handleGetFullApp },
        { text: "Continue", style: "default" }
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaProvider>
        <View className="flex-1 bg-white justify-center items-center">
          <Text className="text-lg text-gray-600">Loading...</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <View 
        className="flex-1 bg-white"
        style={{ paddingTop: insets.top }}
      >
        {/* App Clip Header */}
        <View className="px-6 py-4 border-b border-gray-200">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-blue-500 rounded-lg justify-center items-center mr-3">
                <Ionicons name="flash" size={20} color="white" />
              </View>
              <View>
                <Text className="text-lg font-semibold text-gray-900">Vibecode</Text>
                <Text className="text-sm text-gray-500">App Clip</Text>
              </View>
            </View>
            <Pressable
              onPress={handleGetFullApp}
              className="px-4 py-2 bg-blue-500 rounded-full"
            >
              <Text className="text-white text-sm font-medium">Get App</Text>
            </Pressable>
          </View>
        </View>

        {/* Main Content */}
        <View className="flex-1 px-6 py-8">
          <View className="items-center mb-8">
            <View className="w-20 h-20 bg-blue-100 rounded-full justify-center items-center mb-4">
              <Ionicons name="rocket" size={32} color="#3B82F6" />
            </View>
            <Text className="text-2xl font-bold text-gray-900 text-center mb-2">
              {experience?.title || "Quick Access"}
            </Text>
            <Text className="text-gray-600 text-center">
              {experience?.subtitle || "Get started instantly with this streamlined experience"}
            </Text>
          </View>

          {/* Quick Action Button */}
          <Pressable
            onPress={handleQuickAction}
            className="bg-blue-500 rounded-xl py-4 px-6 mb-6 active:bg-blue-600"
          >
            <View className="flex-row items-center justify-center">
              <Ionicons name="play" size={20} color="white" />
              <Text className="text-white text-lg font-semibold ml-2">
                Start Quick Action
              </Text>
            </View>
          </Pressable>

          {/* App Clip Info */}
          <View className="bg-gray-50 rounded-xl p-4">
            <Text className="text-sm text-gray-600 text-center">
              This is a lightweight version of Vibecode. For the full experience with all features, get the complete app.
            </Text>
          </View>
        </View>

        {/* Bottom CTA */}
        <View className="px-6 pb-6" style={{ paddingBottom: insets.bottom + 24 }}>
          <Pressable
            onPress={handleGetFullApp}
            className="border border-blue-500 rounded-xl py-3 px-6"
          >
            <Text className="text-blue-500 text-center font-medium">
              Download Full App
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaProvider>
  );
}