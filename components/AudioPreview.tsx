import React, { useState, useRef, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Audio } from "expo-av";

// Initialize Audio module
Audio.setAudioModeAsync({
  allowsRecordingIOS: false,
  staysActiveInBackground: true,
  playsInSilentModeIOS: true,
  shouldDuckAndroid: true,
  playThroughEarpieceAndroid: false,
});

interface AudioPreviewProps {
  directPlayableUrl: string;
}

export default function AudioPreview({ directPlayableUrl }: AudioPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function playSound() {
    try {
      if (sound) {
        if (isPlaying) {
          await sound.pauseAsync();
          setIsPlaying(false);
        } else {
          await sound.playAsync();
          setIsPlaying(true);
        }
      } else {
        // Load the audio file
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: directPlayableUrl },
          { shouldPlay: true },
          (status) => {
            if (status.isLoaded) {
              setIsPlaying(status.isPlaying);
            } else if (status.error) {
              setError("Failed to load audio");
            }
          }
        );

        setSound(newSound);
        setIsPlaying(true);
        setError(null);
      }
    } catch (error) {
      console.error("Error playing audio:", error);
      setError("Failed to play audio");
      setIsPlaying(false);
    }
  }

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  useEffect(() => {
    // Reset state when URL changes
    setSound(null);
    setIsPlaying(false);
    setError(null);
  }, [directPlayableUrl]);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.playButton}
        onPress={playSound}
        disabled={!!error}
      >
        <MaterialCommunityIcons
          name={isPlaying ? "pause" : error ? "alert" : "play"}
          size={32}
          color={error ? "#e74c3c" : "#2c3e50"}
        />
        <Text style={[styles.playText, error && styles.errorText]}>
          {error || (isPlaying ? "Pause Audio" : "Play Audio")}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  errorText: {
    color: "#e74c3c",
  },
  container: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  playButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    backgroundColor: "#e6f0ff",
    borderRadius: 8,
  },
  playText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#2c3e50",
    fontWeight: "600",
  },
});
