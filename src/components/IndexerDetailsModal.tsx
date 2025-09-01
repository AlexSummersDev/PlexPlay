import React from "react";
import { View, Text, Image, Modal, ScrollView } from "react-native";
import { ActionButton } from "./index";

interface IndexerDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  kind: "movie" | "tv";
  data: {
    title?: string;
    name?: string;
    year?: number;
    overview?: string;
    imageUrl?: string;
    tmdbId?: number;
    tvdbId?: number;
  };
  onPrimary?: () => Promise<void> | void;
  primaryDisabled?: boolean;
  primaryTitle?: string;
}

export default function IndexerDetailsModal({ visible, onClose, kind, data, onPrimary, primaryDisabled, primaryTitle }: IndexerDetailsModalProps) {
  const displayTitle = data.title || data.name || "";
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-black/60">
        <View className="bg-gray-900 rounded-2xl p-5 w-11/12 max-h-[80%]">
          <ScrollView className="" showsVerticalScrollIndicator={false}>
            <View className="flex-row">
              <View className="w-32 h-48 rounded-lg overflow-hidden bg-gray-800 mr-4">
                {data.imageUrl ? (
                  <Image source={{ uri: data.imageUrl }} className="w-full h-full" resizeMode="cover" />
                ) : (
                  <View className="w-full h-full bg-gray-800" />
                )}
              </View>
              <View className="flex-1">
                <Text className="text-white text-xl font-bold" numberOfLines={2}>{displayTitle}</Text>
                {!!data.year && <Text className="text-gray-400 mt-2">{data.year}</Text>}
              </View>
            </View>
            {!!data.overview && (
              <Text className="text-gray-300 mt-4" numberOfLines={6}>{data.overview}</Text>
            )}
          </ScrollView>

          <View className="mt-4">
            <ActionButton
              title={primaryTitle || (kind === "movie" ? "Add to Radarr" : "Add to Sonarr")}
              icon="add"
              onPress={onPrimary || (() => {})}
              variant="primary"
              fullWidth
              disabled={primaryDisabled}
              className="mb-3"
            />
            <ActionButton
              title="Close"
              icon="close"
              onPress={onClose}
              variant="secondary"
              fullWidth
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}
