import React from "react";
import { View, Text, Pressable, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { cn } from "../utils/cn";

interface IndexerCardProps {
  title: string;
  subtitle?: string;
  imageUrl?: string | null;
  size?: "small" | "medium" | "large";
  onPress: () => void;
  className?: string;
}

export default function IndexerCard({ title, subtitle, imageUrl, size = "medium", onPress, className }: IndexerCardProps) {
  const sizeClasses = {
    small: "w-24 h-36",
    medium: "w-32 h-48",
    large: "w-40 h-60",
  } as const;

  const textSizeClasses = {
    small: "text-xs",
    medium: "text-sm",
    large: "text-base",
  } as const;

  return (
    <Pressable
      onPress={onPress}
      className={cn("mr-3", className)}
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1, transform: [{ scale: pressed ? 0.95 : 1 }] })}
    >
      <View className={cn("rounded-lg overflow-hidden bg-gray-800", sizeClasses[size])}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} className="w-full h-full" resizeMode="cover" />
        ) : (
          <View className="w-full h-full bg-gray-700 items-center justify-center">
            <Ionicons name="image-outline" size={size === "small" ? 24 : size === "medium" ? 32 : 40} color="#9CA3AF" />
          </View>
        )}
      </View>
      <View className="mt-2 px-1" style={{ width: size === "small" ? 96 : size === "medium" ? 128 : 160 }}>
        <Text className={cn("text-white font-medium", textSizeClasses[size])} numberOfLines={2}>{title}</Text>
        {!!subtitle && <Text className={cn("text-gray-400 mt-1", textSizeClasses[size])}>{subtitle}</Text>}
      </View>
    </Pressable>
  );
}
