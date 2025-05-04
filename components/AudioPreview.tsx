import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Audio } from "expo-av";
import Slider from "@react-native-community/slider";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface AudioPreviewProps {
  directPlayableUrl: string;
  fileName?: string;
}

const AudioPreview: React.FC<AudioPreviewProps> = ({
  directPlayableUrl,
  fileName = "Audio Recording",
}) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Format time from milliseconds to MM:SS
  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  async function loadSound() {
    try {
      setIsLoading(true);
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: directPlayableUrl },
        { shouldPlay: false },
        onPlaybackStatusUpdate
      );
      setSound(newSound);
      const status = await newSound.getStatusAsync();
      if (status.isLoaded) {
        setDuration(status.durationMillis || 0);
      }
    } catch (error) {
      console.log("Error loading sound:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setIsPlaying(status.isPlaying);
      if (status.didJustFinish) {
        setIsPlaying(false);
        setPosition(0);
      }
    }
  };

  async function handlePlayPause() {
    try {
      if (!sound) {
        await loadSound();
        return;
      }

      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
    } catch (error) {
      console.log("Error playing/pausing:", error);
    }
  }

  async function handleSliderChange(value: number) {
    if (sound) {
      await sound.setPositionAsync(value);
    }
  }

  useEffect(() => {
    loadSound();
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [directPlayableUrl]);

  return (
    <View style={styles.container}>
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressIndicator,
            { width: duration > 0 ? `${(position / duration) * 100}%` : "0%" },
          ]}
        />
      </View>

      <View style={styles.content}>
        <TouchableOpacity
          style={styles.playButtonContainer}
          onPress={handlePlayPause}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <View style={styles.playButton}>
              <MaterialCommunityIcons
                name={isPlaying ? "pause" : "play"}
                size={20}
                color="#fff"
              />
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.infoContainer}>
          <Text
            style={styles.fileName}
            numberOfLines={1}
            ellipsizeMode="middle"
          >
            {fileName}
          </Text>

          <View style={styles.sliderRow}>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={duration}
              value={position}
              onSlidingComplete={handleSliderChange}
              minimumTrackTintColor="#2c3e50"
              maximumTrackTintColor="rgba(0,0,0,0.1)"
              thumbTintColor="#2c3e50"
            />
          </View>

          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>{formatTime(position)}</Text>
            <View style={styles.controlsContainer}>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={() =>
                  sound?.setPositionAsync(Math.max(0, position - 10000))
                }
              >
                <MaterialCommunityIcons
                  name="rewind-10"
                  size={16}
                  color="#2c3e50"
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.controlButton}
                onPress={() =>
                  sound?.setPositionAsync(Math.min(duration, position + 30000))
                }
              >
                <MaterialCommunityIcons
                  name="fast-forward-30"
                  size={16}
                  color="#2c3e50"
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    borderRadius: 0,
    overflow: "hidden",
    position: "relative",
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  progressBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "rgba(0,0,0,0.05)",
    zIndex: 10,
  },
  progressIndicator: {
    height: "100%",
    backgroundColor: "#2c3e50",
  },
  content: {
    flexDirection: "row",
    padding: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  playButtonContainer: {
    marginRight: 12,
  },
  playButton: {
    backgroundColor: "#2c3e50",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  infoContainer: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 4,
  },
  sliderRow: {
    paddingRight: 8,
  },
  slider: {
    height: 30,
    marginHorizontal: -6,
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timeText: {
    fontSize: 12,
    color: "#666",
  },
  controlsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  controlButton: {
    paddingHorizontal: 10,
  },
});

export default AudioPreview;
