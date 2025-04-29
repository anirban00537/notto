import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
  TouchableOpacity,
  Modal,
  Pressable,
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
  const [modalVisible, setModalVisible] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

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
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.audioIndicator}>AUDIO</Text>
        <Text style={styles.fileName} numberOfLines={1} ellipsizeMode="middle">
          {fileName}
        </Text>
      </View>

      <View style={styles.playerContainer}>
        <TouchableOpacity
          style={styles.playButton}
          onPress={handlePlayPause}
          disabled={isLoading}
        >
          <MaterialCommunityIcons
            name={isLoading ? "loading" : isPlaying ? "pause" : "play"}
            size={24}
            color="#fff"
          />
        </TouchableOpacity>

        <View style={styles.sliderContainer}>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={duration}
            value={position}
            onSlidingComplete={handleSliderChange}
            minimumTrackTintColor="#2c3e50"
            maximumTrackTintColor="#d0d0d0"
            thumbTintColor="#2c3e50"
          />
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>{formatTime(position)}</Text>
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    padding: 12,
    marginVertical: 4,
    marginHorizontal: 16,
    borderRadius: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  audioIndicator: {
    backgroundColor: "#f0f7ff",
    color: "#2c3e50",
    fontSize: 12,
    fontWeight: "600",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  fileName: {
    flex: 1,
    fontSize: 14,
    color: "#333",
  },
  playerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  playButton: {
    backgroundColor: "#2c3e50",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  sliderContainer: {
    flex: 1,
  },
  slider: {
    height: 40,
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: -8,
  },
  timeText: {
    fontSize: 12,
    color: "#666",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    width: windowWidth * 0.9,
    borderRadius: 12,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    marginRight: 16,
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 20,
    color: "#666",
    fontWeight: "600",
  },
  audioPlayerContainer: {
    padding: 20,
    alignItems: "center",
  },
});

export default AudioPreview;
