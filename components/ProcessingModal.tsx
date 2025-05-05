import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Dimensions,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Typography, FONTS } from "../constants/Typography";

interface ProcessingModalProps {
  visible: boolean;
  isSuccess?: boolean;
  type: "pdf" | "audio" | "youtube" | "image";
}

const ProcessingModal: React.FC<ProcessingModalProps> = ({
  visible,
  isSuccess = false,
  type,
}) => {
  const getTitle = () => {
    if (isSuccess) return "Processing Complete!";

    switch (type) {
      case "pdf":
        return "Processing PDF";
      case "audio":
        return "Processing Audio";
      case "youtube":
        return "Processing Video";
      case "image":
        return "Processing Image";
    }
  };

  const getMessage = () => {
    if (isSuccess) return "Your content has been processed successfully.";
    return "Please wait while we process your content...";
  };

  const getIcon = () => {
    if (isSuccess) return "check-circle-outline";

    switch (type) {
      case "pdf":
        return "file-pdf-box";
      case "audio":
        return "file-music-outline";
      case "youtube":
        return "youtube";
      case "image":
        return "image-outline";
    }
  };

  const getColor = () => {
    if (isSuccess) return "#4CAF50";

    switch (type) {
      case "pdf":
        return "#d32f2f";
      case "audio":
        return "#1976d2";
      case "youtube":
        return "#ff0000";
      case "image":
        return "#9C27B0";
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <MaterialCommunityIcons
            name={getIcon()}
            size={40}
            color={getColor()}
            style={styles.icon}
          />

          {!isSuccess && (
            <ActivityIndicator
              size="large"
              color={getColor()}
              style={styles.spinner}
            />
          )}

          <Text style={[Typography.h3, styles.title]}>{getTitle()}</Text>
          <Text style={[Typography.body1, styles.message]}>{getMessage()}</Text>
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
  },
  icon: {
    marginBottom: 16,
  },
  spinner: {
    marginVertical: 16,
  },
  title: {
    color: "#2c3e50",
    marginBottom: 8,
    textAlign: "center",
  },
  message: {
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
  },
});

export default ProcessingModal;
