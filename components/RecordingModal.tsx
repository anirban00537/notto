import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface RecordingModalProps {
  visible: boolean;
  onClose: () => void;
  onStopRecording: (duration: number) => void; // Callback when stopping
}

const RecordingModal: React.FC<RecordingModalProps> = ({
  visible,
  onClose,
  onStopRecording,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const pulseAnimation = React.useRef(new Animated.Value(1)).current;
  const timerIntervalRef = React.useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (visible) {
      // Reset state when modal becomes visible
      setIsRecording(false);
      setRecordingDuration(0);
      // Automatically start recording when modal opens
      startRecording();
    } else {
      // Clear interval when modal closes
      stopRecordingAnimation();
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
    // Cleanup on unmount
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [visible]);

  useEffect(() => {
    if (isRecording) {
      startRecordingAnimation();
      timerIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } else {
      stopRecordingAnimation();
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isRecording]);

  const startRecordingAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.2,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopRecordingAnimation = () => {
    pulseAnimation.stopAnimation();
    pulseAnimation.setValue(1); // Reset scale
  };

  const startRecording = () => {
    setIsRecording(true);
  };

  const handleStop = () => {
    setIsRecording(false);
    // Pass the final duration back
    onStopRecording(recordingDuration);
    onClose(); // Close the modal
  };

  const handleCancel = () => {
    setIsRecording(false);
    onClose(); // Close the modal without saving
  };

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={handleCancel}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeButton} onPress={handleCancel}>
            <MaterialCommunityIcons name="close" size={24} color="#666" />
          </TouchableOpacity>

          <Text style={styles.title}>Recording Audio</Text>

          <Animated.View
            style={[
              styles.iconContainer,
              { transform: [{ scale: pulseAnimation }] },
            ]}
          >
            <MaterialCommunityIcons
              name="microphone"
              size={60}
              color="#e74c3c"
            />
          </Animated.View>

          <Text style={styles.timerText}>{formatTime(recordingDuration)}</Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.stopButton]}
              onPress={handleStop}
            >
              <MaterialCommunityIcons
                name="stop-circle-outline"
                size={24}
                color="#fff"
              />
              <Text style={styles.buttonText}>Stop & Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    width: windowWidth,
    height: windowHeight,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "85%",
    maxWidth: 400,
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 8,
    zIndex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  iconContainer: {
    marginBottom: 20,
    padding: 15,
    borderRadius: 50,
    backgroundColor: "rgba(231, 76, 60, 0.1)",
  },
  timerText: {
    fontSize: 48,
    fontWeight: "300",
    color: "#333",
    marginBottom: 30,
    fontVariant: ["tabular-nums"],
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    minWidth: 150,
  },
  stopButton: {
    backgroundColor: "#e74c3c",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
});

export default RecordingModal;
