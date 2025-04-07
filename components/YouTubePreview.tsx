import React, { useState, useCallback } from "react";
import { View, StyleSheet, Alert, Text } from "react-native";
import YoutubeIframe from "react-native-youtube-iframe";

interface YouTubePreviewProps {
  directPlayableUrl: string;
}

export default function YouTubePreview({
  directPlayableUrl,
}: YouTubePreviewProps) {
  const [playing, setPlaying] = useState(false);

  // Extract YouTube video ID from the URL
  const getYouTubeVideoId = (url: string) => {
    if (!url) return null;

    // Regular expression to extract YouTube video ID from different URL formats
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);

    return match && match[2].length === 11 ? match[2] : null;
  };

  const videoId = getYouTubeVideoId(directPlayableUrl);

  // Handle playback state changes
  const onStateChange = useCallback((state: string) => {
    if (state === "ended") {
      setPlaying(false);
    }
  }, []);

  // Handle errors
  const onError = useCallback((error: any) => {
    Alert.alert("YouTube Player Error", error);
  }, []);

  if (!videoId) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          {!directPlayableUrl ? "Missing Video URL" : "Invalid YouTube URL"}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.youtubePreviewContainer}>
      <YoutubeIframe
        height={225}
        play={playing}
        videoId={videoId}
        onChangeState={onStateChange}
        onError={onError}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  youtubePreviewContainer: {
    margin: 16,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#000",
  },
  errorContainer: {
    margin: 16,
    borderRadius: 16,
    backgroundColor: "#f0f0f0",
    aspectRatio: 16 / 9,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "#555",
  },
});
