import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { cn } from "../utils/cn";

interface ConnectionStatusProps {
  isConnected: boolean;
  serviceName: string;
  lastChecked?: Date;
  error?: string;
  className?: string;
}

export default function ConnectionStatus({
  isConnected,
  serviceName,
  lastChecked,
  error,
  className,
}: ConnectionStatusProps) {
  const statusColor = isConnected ? "#10B981" : "#EF4444";
  const statusText = isConnected ? "Connected" : "Disconnected";
  const statusIcon = isConnected ? "checkmark-circle" : "close-circle";

  const formatLastChecked = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <View className={cn("bg-gray-800 rounded-lg p-4", className)}>
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-white font-medium text-base">
          {serviceName}
        </Text>
        <View className="flex-row items-center">
          <Ionicons 
            name={statusIcon} 
            size={16} 
            color={statusColor} 
          />
          <Text 
            className="ml-2 text-sm font-medium"
            style={{ color: statusColor }}
          >
            {statusText}
          </Text>
        </View>
      </View>
      
      {lastChecked && (
        <Text className="text-gray-400 text-xs">
          Last checked: {formatLastChecked(lastChecked)}
        </Text>
      )}
      
      {error && !isConnected && (
        <View className="mt-2 p-2 bg-red-900/20 border border-red-500/30 rounded">
          <Text className="text-red-400 text-xs">
            {error}
          </Text>
        </View>
      )}
    </View>
  );
}