import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ActionButton from "./ActionButton";
import { cn } from "../utils/cn";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryText?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  fullScreen?: boolean;
  className?: string;
}

export default function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
  retryText = "Try Again",
  icon = "alert-circle-outline",
  fullScreen = false,
  className,
}: ErrorStateProps) {
  const content = (
    <View className={cn("items-center justify-center p-6", className)}>
      <Ionicons name={icon} size={48} color="#EF4444" />
      
      <Text className="text-white text-lg font-semibold mt-4 text-center">
        {title}
      </Text>
      
      <Text className="text-gray-400 text-sm mt-2 text-center leading-5">
        {message}
      </Text>
      
      {onRetry && (
        <ActionButton
          title={retryText}
          onPress={onRetry}
          variant="primary"
          icon="refresh"
          className="mt-6"
        />
      )}
    </View>
  );

  if (fullScreen) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        {content}
      </View>
    );
  }

  return (
    <View className="bg-gray-800/50 rounded-lg mx-4">
      {content}
    </View>
  );
}