import React, { useRef, useEffect } from "react";
import { View, Text, Pressable, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

interface TrailerModalProps {
  visible: boolean;
  youTubeKey?: string;
  title?: string;
  onClose: () => void;
}

export default function TrailerModal({ visible, youTubeKey, title, onClose }: TrailerModalProps) {
  const webViewRef = useRef<WebView>(null);

  if (!visible) return null;

  const youtubeUrl = youTubeKey ? `https://www.youtube.com/watch?v=${youTubeKey}` : null;
  const embedUrl = youTubeKey ? `https://www.youtube.com/embed/${youTubeKey}?autoplay=1&playsinline=1` : null;

  const handleWatchOnYouTube = () => {
    if (youtubeUrl) {
      Linking.openURL(youtubeUrl);
    }
  };

  // Enhanced HTML with better controls and configuration
  const htmlContent = embedUrl ? `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            background: #000;
            overflow: hidden;
          }
          .container {
            position: relative;
            width: 100vw;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          iframe {
            width: 100%;
            height: 100%;
            border: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <iframe
            src="${embedUrl}"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
            playsinline
          ></iframe>
        </div>
      </body>
    </html>
  ` : null;

  return (
    <View className="absolute inset-0 bg-black z-50">
      <SafeAreaView className="flex-1">
        <View className="flex-row items-center justify-between px-4 py-3 bg-black">
          <Text className="text-white text-lg font-semibold">{title || "Trailer"}</Text>
          <Pressable onPress={onClose} className="px-3 py-2 bg-gray-800 rounded-lg">
            <Text className="text-white">Close</Text>
          </Pressable>
        </View>
        {htmlContent ? (
          <>
            <WebView
              ref={webViewRef}
              source={{ html: htmlContent }}
              style={{ flex: 1, backgroundColor: '#000' }}
              allowsInlineMediaPlayback
              mediaPlaybackRequiresUserAction={false}
              javaScriptEnabled
              domStorageEnabled
              allowsFullscreenVideo
              scrollEnabled={false}
              bounces={false}
            />
            <View className="px-4 py-3 bg-black border-t border-gray-800">
              <Pressable
                onPress={handleWatchOnYouTube}
                className="py-3 px-4 bg-gray-800 rounded-lg"
              >
                <Text className="text-white text-center font-medium">Watch on YouTube</Text>
              </Pressable>
            </View>
          </>
        ) : (
          <View className="flex-1 items-center justify-center bg-black">
            <Text className="text-gray-300">No trailer available</Text>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}
