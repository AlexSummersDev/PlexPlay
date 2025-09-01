import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Movie, TVShow } from "../types/media";
import MediaCard from "./MediaCard";
import { cn } from "../utils/cn";

interface HorizontalCarouselProps {
  title: string;
  data: (Movie | TVShow)[];
  onItemPress: (item: Movie | TVShow) => void;
  onSeeAllPress?: () => void;
  loading?: boolean;
  error?: string;
  emptyMessage?: string;
  cardSize?: "small" | "medium" | "large";
  showRating?: boolean;
  className?: string;
}

export default function HorizontalCarousel({
  title,
  data,
  onItemPress,
  onSeeAllPress,
  loading = false,
  error,
  emptyMessage = "No items available",
  cardSize = "medium",
  showRating = false,
  className,
}: HorizontalCarouselProps) {
  if (error) {
    return (
      <View className={cn("mb-6", className)}>
        <Text className="text-white text-lg font-semibold mb-3 px-4">
          {title}
        </Text>
        <View className="bg-red-900/20 border border-red-500/30 rounded-lg mx-4 p-4">
          <View className="flex-row items-center">
            <Ionicons name="alert-circle-outline" size={20} color="#EF4444" />
            <Text className="text-red-400 ml-2 flex-1">
              {error}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View className={cn("mb-6", className)}>
        <Text className="text-white text-lg font-semibold mb-3 px-4">
          {title}
        </Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        >
          {Array.from({ length: 5 }).map((_, index) => (
            <View
              key={index}
              className={cn(
                "mr-3 rounded-lg bg-gray-800 animate-pulse",
                cardSize === "small" ? "w-24 h-36" : 
                cardSize === "medium" ? "w-32 h-48" : "w-40 h-60"
              )}
            />
          ))}
        </ScrollView>
      </View>
    );
  }

  if (data.length === 0) {
    return (
      <View className={cn("mb-6", className)}>
        <Text className="text-white text-lg font-semibold mb-3 px-4">
          {title}
        </Text>
        <View className="bg-gray-800/50 rounded-lg mx-4 p-6">
          <View className="items-center">
            <Ionicons name="film-outline" size={32} color="#6B7280" />
            <Text className="text-gray-400 mt-2 text-center">
              {emptyMessage}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className={cn("mb-6", className)}>
      <View className="flex-row items-center justify-between mb-3 px-4">
        <Text className="text-white text-lg font-semibold">
          {title}
        </Text>
        {onSeeAllPress && (
          <Pressable
            onPress={onSeeAllPress}
            className="flex-row items-center"
            style={({ pressed }) => ({
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text className="text-blue-400 text-sm font-medium mr-1">
              See All
            </Text>
            <Ionicons name="chevron-forward" size={16} color="#60A5FA" />
          </Pressable>
        )}
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        decelerationRate="fast"
        snapToInterval={cardSize === "small" ? 108 : cardSize === "medium" ? 140 : 172}
        snapToAlignment="start"
      >
        {data.map((item, index) => (
          <MediaCard
            key={`${item.id}-${index}`}
            item={item}
            onPress={() => onItemPress(item)}
            size={cardSize}
            showRating={showRating}
          />
        ))}
      </ScrollView>
    </View>
  );
}