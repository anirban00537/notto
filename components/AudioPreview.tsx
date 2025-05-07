import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  GestureResponderEvent,
  LayoutRectangle,
} from "react-native";
import { Audio } from "expo-av";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Typography, FONTS } from "../constants/Typography";
import { Colors } from "@/constants/Colors";

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
  const [waveLayout, setWaveLayout] = useState<LayoutRectangle | null>(null);
  const waveContainerRef = useRef<View>(null);

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
        if (position >= duration - 50) {
          await sound.setPositionAsync(0);
          setPosition(0);
        }
        await sound.playAsync();
      }
    } catch (error) {
      console.log("Error playing/pausing:", error);
    }
  }

  async function handleSeek(direction: "backward" | "forward") {
    if (sound) {
      const seekAmount = direction === "backward" ? -10000 : 30000;
      const newPosition = Math.max(
        0,
        Math.min(duration, position + seekAmount)
      );
      await sound.setPositionAsync(newPosition);
    }
  }

  // Generate static wave data for visualization
  const waveData = useMemo(() => {
    const numberOfBars = 80;

    // Generate wave pattern with variation but not completely random
    return Array.from({ length: numberOfBars }, (_, i) => {
      // Create a pattern that varies but is somewhat predictable
      const baseHeight = 0.4;
      const variation1 = Math.sin(i * 0.2) * 0.15;
      const variation2 = Math.sin(i * 0.5) * 0.1;
      const variation3 = Math.cos(i * 0.3) * 0.1;

      // Small random component for natural look
      const smallRandom = Math.random() * 0.1 - 0.05;

      return Math.min(
        0.9,
        Math.max(
          0.2,
          baseHeight + variation1 + variation2 + variation3 + smallRandom
        )
      );
    });
  }, []);

  useEffect(() => {
    loadSound();
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [directPlayableUrl]);

  // Calculate which bars should be filled based on current position
  const progressPercentage = duration > 0 ? position / duration : 0;
  const filledBars = Math.ceil(waveData.length * progressPercentage);

  // Handle seek when user taps on the wave
  const handleWavePress = (event: GestureResponderEvent) => {
    if (sound && duration > 0 && waveLayout) {
      const { locationX } = event.nativeEvent;
      const containerWidth = waveLayout.width;

      if (containerWidth > 0) {
        const percentage = Math.max(0, Math.min(1, locationX / containerWidth));
        const newPosition = percentage * duration;
        sound.setPositionAsync(newPosition);
      }
    }
  };

  const handleWaveLayout = (event: any) => {
    setWaveLayout(event.nativeEvent.layout);
  };

  return (
    <View style={styles.container}>
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
            style={[Typography.body2, styles.fileName]}
            numberOfLines={1}
            ellipsizeMode="middle"
          >
            {fileName}
          </Text>

          <TouchableOpacity
            ref={waveContainerRef}
            style={styles.waveContainer}
            activeOpacity={0.8}
            onPress={handleWavePress}
            onLayout={handleWaveLayout}
          >
            {waveData.map((height, index) => (
              <View
                key={index}
                style={[
                  styles.waveBar,
                  {
                    height: `${Math.max(15, height * 100)}%`,
                    backgroundColor: index < filledBars ? "#000" : "#DCDCDC",
                    marginHorizontal: 0.5,
                  },
                ]}
              />
            ))}
          </TouchableOpacity>

          <View style={styles.timeRow}>
            <Text style={[Typography.caption, styles.timeText]}>
              {formatTime(position)}
            </Text>

            <View style={styles.controlsContainer}>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={() => handleSeek("backward")}
              >
                <MaterialCommunityIcons
                  name="rewind-10"
                  size={18}
                  color="#000"
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.controlButton}
                onPress={() => handleSeek("forward")}
              >
                <MaterialCommunityIcons
                  name="fast-forward-30"
                  size={18}
                  color="#000"
                />
              </TouchableOpacity>
            </View>

            <Text style={[Typography.caption, styles.timeText]}>
              {formatTime(duration)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.background,
    width: "100%",
    overflow: "hidden",
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  content: {
    flexDirection: "row",
    padding: 14,
    alignItems: "center",
  },
  playButtonContainer: {
    marginRight: 12,
  },
  playButton: {
    backgroundColor: "#000",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  infoContainer: {
    flex: 1,
    justifyContent: "center",
  },
  fileName: {
    color: "#111",
    marginBottom: 8,
  },
  waveContainer: {
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 0,
  },
  waveBar: {
    flex: 1,
    width: 2,
    borderRadius: 1,
    alignSelf: "center",
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  timeText: {
    color: "#8E8E93",
    fontVariant: ["tabular-nums"],
  },
  controlsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  controlButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
});

export default AudioPreview;
