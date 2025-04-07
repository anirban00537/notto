import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface YouTubePreviewProps {
  thumbnailUrl: string;
  videoTitle: string;
  onWatchPress: () => void;
}

export default function YouTubePreview({
  thumbnailUrl,
  videoTitle,
  onWatchPress,
}: YouTubePreviewProps) {
  // Extracting the truncated title logic here if needed, or pass truncated title as prop
  const displayTitle =
    videoTitle.length > 25 ? videoTitle.substring(0, 25) + " ..." : videoTitle;

  return (
    <View style={styles.youtubePreviewContainer}>
      <Image source={{ uri: thumbnailUrl }} style={styles.youtubeThumbnail} />
      <View style={styles.thumbnailOverlay} />
      <Text style={styles.videoTitle}>{displayTitle}</Text>
      <TouchableOpacity style={styles.watchButton} onPress={onWatchPress}>
        <MaterialCommunityIcons
          name="youtube"
          size={20}
          color="#FF0000"
          style={{ marginRight: 6 }}
        />
        <Text style={styles.watchButtonText}>Watch on YouTube</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  youtubePreviewContainer: {
    margin: 16,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#000",
  },
  youtubeThumbnail: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  thumbnailOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: 16,
  },
  videoTitle: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  watchButton: {
    position: "absolute",
    bottom: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  watchButtonText: {
    color: "#000",
    fontWeight: "600",
    fontSize: 14,
  },
});
