import React from "react";
import { View, Text, Pressable, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Movie, TVShow } from "../types/media";
import { cn } from "../utils/cn";

interface MediaCardProps {
  item: Movie | TVShow;
  onPress: () => void;
  size?: "small" | "medium" | "large";
  showTitle?: boolean;
  showRating?: boolean;
  className?: string;
}

export default function MediaCard({ 
  item, 
  onPress, 
  size = "medium", 
  showTitle = true, 
  showRating = false,
  className 
}: MediaCardProps) {
  const isMovie = "title" in item;
  const title = isMovie ? item.title : item.name;
  const year = isMovie 
    ? item.release_date ? new Date(item.release_date).getFullYear() : ""
    : item.first_air_date ? new Date(item.first_air_date).getFullYear() : "";

  const sizeClasses = {
    small: "w-24 h-36",
    medium: "w-32 h-48",
    large: "w-40 h-60",
  };

  const textSizeClasses = {
    small: "text-xs",
    medium: "text-sm",
    large: "text-base",
  };

  const posterUrl = item.poster_path 
    ? `https://image.tmdb.org/t/p/w342${item.poster_path}`
    : null;

  return (
    <Pressable
      onPress={onPress}
      className={cn("mr-3", className)}
      style={({ pressed }) => ({
        opacity: pressed ? 0.7 : 1,
        transform: [{ scale: pressed ? 0.95 : 1 }],
      })}
    >
      <View className={cn("rounded-lg overflow-hidden bg-gray-800", sizeClasses[size])}>
        {posterUrl ? (
          <Image
            source={{ uri: posterUrl }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-full bg-gray-700 items-center justify-center">
            <Ionicons 
              name={isMovie ? "film-outline" : "tv-outline"} 
              size={size === "small" ? 24 : size === "medium" ? 32 : 40} 
              color="#9CA3AF" 
            />
          </View>
        )}
        
        {showRating && (
          <View className="absolute top-2 right-2 bg-black/70 rounded-full px-2 py-1">
            <View className="flex-row items-center">
              <Ionicons name="star" size={12} color="#FCD34D" />
              <Text className="text-white text-xs ml-1 font-medium">
                {item.vote_average.toFixed(1)}
              </Text>
            </View>
          </View>
        )}
      </View>
      
      {showTitle && (
        <View className="mt-2 px-1">
          <Text 
            className={cn("text-white font-medium", textSizeClasses[size])}
            numberOfLines={2}
          >
            {title}
          </Text>
          {year && (
            <Text className={cn("text-gray-400 mt-1", textSizeClasses[size])}>
              {year}
            </Text>
          )}
        </View>
      )}
    </Pressable>
  );
}