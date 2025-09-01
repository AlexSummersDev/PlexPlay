import React from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { cn } from "../utils/cn";

interface LoadingSpinnerProps {
  size?: "small" | "large";
  color?: string;
  message?: string;
  fullScreen?: boolean;
  className?: string;
}

export default function LoadingSpinner({
  size = "large",
  color = "#60A5FA",
  message,
  fullScreen = false,
  className,
}: LoadingSpinnerProps) {
  const content = (
    <View className={cn("items-center justify-center", className)}>
      <ActivityIndicator size={size} color={color} />
      {message && (
        <Text className="text-gray-400 text-sm mt-3 text-center">
          {message}
        </Text>
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

  return content;
}