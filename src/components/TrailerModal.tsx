import React from "react";
import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

interface TrailerModalProps {
  visible: boolean;
  youTubeKey?: string;
  title?: string;
  onClose: () => void;
}

export default function TrailerModal({ visible, youTubeKey, title, onClose }: TrailerModalProps) {
  if (!visible) return null;

  const url = youTubeKey ? `https://www.youtube.com/embed/${youTubeKey}?autoplay=1` : null;

  return (
    <View className="absolute inset-0 bg-black/90 z-50">
      <SafeAreaView className="flex-1">
        <View className="flex-row items-center justify-between px-4 py-3">
          <Text className="text-white text-lg font-semibold">{title || "Trailer"}</Text>
          <Pressable onPress={onClose} className="px-3 py-2 bg-gray-800 rounded-lg">
            <Text className="text-white">Close</Text>
          </Pressable>
        </View>
        {url ? (
          <WebView source={{ uri: url }} style={{ flex: 1 }} allowsInlineMediaPlayback mediaPlaybackRequiresUserAction={false} />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Text className="text-gray-300">No trailer available</Text>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}
