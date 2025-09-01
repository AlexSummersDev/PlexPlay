import React from "react";
import { Pressable, Text, View, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { cn } from "../utils/cn";

interface ActionButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "danger";
  size?: "small" | "medium" | "large";
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
}

export default function ActionButton({
  title,
  onPress,
  variant = "primary",
  size = "medium",
  icon,
  loading = false,
  disabled = false,
  fullWidth = false,
  className,
}: ActionButtonProps) {
  const isDisabled = disabled || loading;

  const variantClasses = {
    primary: "bg-blue-600 border-blue-600",
    secondary: "bg-gray-600 border-gray-600",
    outline: "bg-transparent border-gray-400",
    danger: "bg-red-600 border-red-600",
  };

  const variantTextClasses = {
    primary: "text-white",
    secondary: "text-white",
    outline: "text-gray-300",
    danger: "text-white",
  };

  const sizeClasses = {
    small: "px-3 py-2",
    medium: "px-4 py-3",
    large: "px-6 py-4",
  };

  const textSizeClasses = {
    small: "text-sm",
    medium: "text-base",
    large: "text-lg",
  };

  const iconSizes = {
    small: 16,
    medium: 20,
    large: 24,
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={cn(
        "border rounded-lg items-center justify-center",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && "w-full",
        isDisabled && "opacity-50",
        className
      )}
      style={({ pressed }) => ({
        opacity: pressed && !isDisabled ? 0.8 : undefined,
        transform: [{ scale: pressed && !isDisabled ? 0.98 : 1 }],
      })}
    >
      <View className="flex-row items-center">
        {loading ? (
          <ActivityIndicator 
            size="small" 
            color={variant === "outline" ? "#9CA3AF" : "#FFFFFF"} 
          />
        ) : (
          <>
            {icon && (
              <Ionicons
                name={icon}
                size={iconSizes[size]}
                color={variant === "outline" ? "#9CA3AF" : "#FFFFFF"}
                style={{ marginRight: title ? 8 : 0 }}
              />
            )}
            {title && (
              <Text
                className={cn(
                  "font-semibold",
                  variantTextClasses[variant],
                  textSizeClasses[size]
                )}
              >
                {title}
              </Text>
            )}
          </>
        )}
      </View>
    </Pressable>
  );
}