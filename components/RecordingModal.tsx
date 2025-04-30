import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
  Platform,
  ActivityIndicator,
  ScrollView,
  Linking,
  PermissionsAndroid,
  Button,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import Slider from "@react-native-community/slider";

interface RecordingModalProps {
  visible: boolean;
  onClose: () => void;
  onSaveRecording: (uri: string, duration: number) => void;
}

type ModalMode =
  | "idle"
  | "permission_denied"
  | "requesting_permission"
  | "recording"
  | "preview"
  | "error";

const RecordingModal: React.FC<RecordingModalProps> = ({
  visible,
  onClose,
  onSaveRecording,
}) => {
  const [mode, setMode] = useState<ModalMode>("idle");
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [playbackStatus, setPlaybackStatus] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [permissionResponse, setPermissionResponse] =
    useState<Audio.PermissionResponse | null>(null);

  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (visible) {
      checkPermissions();
    } else {
      resetState();
    }
  }, [visible]);

  const checkPermissions = async () => {
    try {
      console.log("Checking permissions...");

      // Handle Android permissions
      try {
        const grants = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ]);

        console.log("Android permissions result:", grants);

        if (
          grants[PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          grants[PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          grants[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] ===
            PermissionsAndroid.RESULTS.GRANTED
        ) {
          console.log("All Android permissions granted");
          setPermissionResponse({
            granted: true,
          } as any);
          setMode("idle");
          await setupAudioMode();
        } else {
          console.log("Some Android permissions denied");
          setMode("permission_denied");
          setErrorMessage(
            "Please grant all required permissions to record audio."
          );
        }
        return;
      } catch (err) {
        console.warn("Error requesting Android permissions:", err);
        setMode("error");
        setErrorMessage("Failed to request required permissions.");
        return;
      }

      // // Handle Web platform - REMOVED
      // if (Platform.OS === "web") { ... }

      // // Handle iOS platform - REMOVED
      // const permission = await Audio.getPermissionsAsync(); ...
    } catch (err) {
      console.error("Error checking permissions:", err);
      setMode("error");
      setErrorMessage("Failed to check microphone permissions.");
    }
  };

  const requestPermissions = async () => {
    try {
      setMode("requesting_permission");
      console.log("Requesting permissions...");

      // For Android, we handle permissions in checkPermissions
      // if (Platform.OS === "android") { // No longer needed
      await checkPermissions();
      // The checkPermissions function will set the mode accordingly
      // No need to handle result here directly
      return;
      // }

      // // For iOS and Web - REMOVED
      // const permission = await Audio.requestPermissionsAsync(); ...
    } catch (err) {
      console.error("Error requesting permissions:", err);
      setMode("error");
      setErrorMessage("Failed to request microphone permissions.");
    }
  };

  const setupAudioMode = async () => {
    try {
      console.log("Setting up audio mode...");
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      console.log("Audio mode set up successfully");
    } catch (err) {
      console.error("Error setting up audio mode:", err);
      throw err;
    }
  };

  const startRecording = async () => {
    let newRecording: Audio.Recording | null = null; // Define here for cleanup
    try {
      console.log("[startRecording] Function called");

      // Set up audio mode first
      console.log("[startRecording] Setting up audio mode...");
      await setupAudioMode();
      console.log("[startRecording] Audio mode set up successfully");

      // Clean up any existing recording
      if (recording) {
        console.log(
          "[startRecording] Cleaning up existing recording instance..."
        );
        await recording.stopAndUnloadAsync();
        console.log("[startRecording] Existing recording cleaned up");
      }

      console.log("[startRecording] Creating new recording instance...");
      const createResult = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      newRecording = createResult.recording; // Assign to outer scope variable
      console.log(
        "[startRecording] New recording instance created: ",
        !!newRecording
      );

      console.log(
        "[startRecording] Updating state: setRecording, setRecordingDuration..."
      );
      setRecording(newRecording);
      setRecordingDuration(0);
      console.log("[startRecording] State updated");

      console.log("[startRecording] Starting recording animation...");
      startRecordingAnimation();
      console.log("[startRecording] Recording animation started");

      // Clear any existing timer
      if (timerIntervalRef.current) {
        console.log("[startRecording] Clearing existing timer interval...");
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
        console.log("[startRecording] Existing timer cleared");
      }

      // Start the timer
      console.log("[startRecording] Setting new timer interval...");
      timerIntervalRef.current = setInterval(() => {
        // console.log('[Timer] Tick'); // Optional: log every tick
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
      console.log(
        "[startRecording] New timer interval set with ID:",
        timerIntervalRef.current
      );

      console.log("[startRecording] Recording process initiated successfully");
    } catch (error) {
      console.error("[startRecording] Error during recording setup:", error);
      setMode("error");
      setErrorMessage(
        `Could not start recording: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      // Attempt to clean up the partially created recording if it exists
      if (newRecording) {
        console.log("[startRecording] Cleaning up recording after error...");
        try {
          await newRecording.stopAndUnloadAsync();
        } catch (cleanupError) {
          console.error(
            "[startRecording] Error during cleanup after error:",
            cleanupError
          );
        }
      }
      resetState(); // Reset state fully
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    console.log("Stopping recording...");
    stopRecordingAnimation();
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      console.log("Recording stopped and stored at", uri);

      // Load the recording for preview
      const { sound: newSound, status } =
        await recording.createNewLoadedSoundAsync(
          { isLooping: false },
          (status) => onPlaybackStatusUpdate(status)
        );

      setSound(newSound);
      setRecordingUri(uri);
      setRecording(null);
      setMode("preview");
    } catch (err) {
      console.error("Failed to stop recording", err);
      setMode("error");
      setErrorMessage("Could not stop recording. Please try again.");
      resetState();
    }
  };

  const playPreview = async () => {
    if (!recordingUri || sound) return;
    console.log("Loading Sound from:", recordingUri);
    try {
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: recordingUri },
        { shouldPlay: true }
      );
      setSound(newSound);
      newSound.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
      console.log("Playback started");
    } catch (error) {
      console.error("Failed to load or play sound", error);
      setMode("error");
      setErrorMessage("Could not play the recording.");
    }
  };

  const pausePreview = async () => {
    if (!sound) return;
    try {
      console.log("Pausing sound");
      await sound.pauseAsync();
    } catch (error) {
      console.error("Failed to pause sound", error);
    }
  };

  const resumePreview = async () => {
    if (!sound) return;
    try {
      console.log("Resuming sound");
      await sound.playAsync();
    } catch (error) {
      console.error("Failed to resume sound", error);
    }
  };

  const seekPreview = async (value: number) => {
    if (!sound || !playbackStatus?.durationMillis) return;
    try {
      const seekPosition = value * playbackStatus.durationMillis;
      await sound.setPositionAsync(seekPosition);
    } catch (error) {
      console.error("Failed to seek sound", error);
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    setPlaybackStatus(status);
    if (status.didJustFinish) {
      unloadSound();
      console.log("Playback finished");
    } else if (status.error) {
      console.error(`Playback Error: ${status.error}`);
      setMode("error");
      setErrorMessage(`Playback error: ${status.error}`);
      unloadSound();
    }
  };

  const unloadSound = async () => {
    console.log("Unloading sound");
    if (sound) {
      try {
        await sound.unloadAsync();
      } catch (error) {
        console.error("Failed to unload sound", error);
      } finally {
        setSound(null);
        setPlaybackStatus(null);
      }
    }
  };

  const handleSave = () => {
    if (recordingUri) {
      onSaveRecording(recordingUri, recordingDuration);
    }
    resetState();
  };

  const handleDiscard = () => {
    resetState();
  };

  const handleRecordAgain = () => {
    resetState(false);
    requestPermissions();
  };

  const handleCancel = () => {
    if (mode === "recording" && recording) {
      stopRecording().then(() => resetState());
    } else {
      resetState();
    }
  };

  const resetState = async (shouldCloseModal = true) => {
    console.log("Resetting state...");
    stopRecordingAnimation();
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (recording) {
      try {
        console.log("Unloading active recording...");
        await recording.stopAndUnloadAsync();
      } catch (e) {
        console.warn("Could not unload active recording:", e);
      }
    }
    await unloadSound();

    setRecording(null);
    setSound(null);
    setRecordingUri(null);
    setRecordingDuration(0);
    setPlaybackStatus(null);
    setErrorMessage(null);
    setMode("idle");

    if (shouldCloseModal) {
      onClose();
    }
  };

  const startRecordingAnimation = () => {
    pulseAnimation.setValue(1);
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
    pulseAnimation.setValue(1);
  };

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const getPlaybackTime = () => {
    const currentPosition = playbackStatus?.positionMillis ?? 0;
    const duration = playbackStatus?.durationMillis ?? recordingDuration * 1000;
    if (duration === 0) return "00:00 / 00:00";

    return `${formatTime(Math.floor(currentPosition / 1000))} / ${formatTime(
      Math.floor(duration / 1000)
    )}`;
  };

  const getSliderValue = () => {
    if (!playbackStatus?.isLoaded || !playbackStatus?.durationMillis) {
      return 0;
    }
    return playbackStatus.positionMillis / playbackStatus.durationMillis;
  };

  const handleStartRecordingClick = async () => {
    try {
      console.log("Start recording button clicked");

      // Only Android logic remains
      // if (Platform.OS === "android") { // No longer needed
      console.log("Android platform assumed");
      try {
        const grants = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ]);

        console.log("Android permissions result:", grants);

        const allGranted = Object.values(grants).every(
          (permission) => permission === PermissionsAndroid.RESULTS.GRANTED
        );

        if (allGranted) {
          console.log(
            "All Android permissions granted, calling startRecording..."
          );
          setMode("recording"); // Set mode before starting
          await startRecording();
        } else {
          console.log("Some Android permissions denied");
          setErrorMessage(
            "Please grant all required permissions to record audio."
          );
          // Optionally set mode back or show specific UI
          setMode("permission_denied");
        }
      } catch (err) {
        console.error("Error requesting Android permissions:", err);
        setErrorMessage("Failed to request required permissions.");
        setMode("error"); // Set mode to error on failure
      }
      // } else if (Platform.OS === 'web') { ... } // REMOVED Web logic
      // } else { // REMOVED iOS logic
      //   console.log("iOS platform detected"); ...
      // }
    } catch (err) {
      console.error("Error in handleStartRecordingClick:", err);
      setErrorMessage("Failed to start recording. Please try again.");
      setMode("error"); // Ensure mode is set to error
    }
  };

  const renderPermissionDenied = () => {
    // Simplified message for Android
    const message =
      "Please grant microphone and storage permissions in your device settings to record audio.";

    const handleOpenSettings = () => {
      // if (Platform.OS === "web") { ... } // REMOVED Web logic
      // else if (Platform.OS === "android") { // No longer needed
      Linking.openSettings();
      // } else if (Platform.OS === "ios") { // REMOVED iOS logic
      //   Linking.openSettings();
      // }
    };

    return (
      <View style={styles.contentContainer}>
        <MaterialCommunityIcons
          name="microphone-off"
          size={64}
          color="#FF6B6B"
        />
        <Text style={styles.permissionTitle}>Permission Required</Text>
        <Text style={styles.permissionText}>{message}</Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={handleOpenSettings}
        >
          <Text style={styles.permissionButtonText}>Open Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderRequestingPermission = () => (
    <View style={styles.contentContainer}>
      <ActivityIndicator size="large" color="#e74c3c" style={styles.spinner} />
      <Text style={styles.infoText}>Requesting microphone access...</Text>
    </View>
  );

  const renderError = () => (
    <View style={styles.contentContainer}>
      <MaterialCommunityIcons
        name="alert-circle-outline"
        size={60}
        color="#e74c3c"
      />
      <Text style={styles.title}>Error</Text>
      <Text style={styles.infoText}>{errorMessage}</Text>
      <TouchableOpacity
        style={[styles.actionButton, styles.retryButton]}
        onPress={() => {
          setMode("idle");
          checkPermissions();
        }}
      >
        <MaterialCommunityIcons name="reload" size={24} color="#fff" />
        <Text style={styles.buttonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  const renderContent = () => {
    console.log("Rendering content, current mode:", mode);

    // Show error message if there is one
    if (errorMessage) {
      return (
        <View style={styles.contentContainer}>
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={60}
            color="#e74c3c"
          />
          <Text style={styles.title}>Error</Text>
          <Text style={styles.infoText}>{errorMessage}</Text>
          <TouchableOpacity
            style={[styles.actionButton, styles.retryButton]}
            onPress={() => {
              console.log("Retry button pressed");
              setErrorMessage(null);
              setMode("idle");
            }}
          >
            <MaterialCommunityIcons name="reload" size={24} color="#fff" />
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Recording in progress
    if (mode === "recording") {
      console.log("[renderContent] Rendering recording UI");
      return (
        <View style={styles.contentContainer}>
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
              onPress={() => {
                console.log("Stop button pressed");
                stopRecording();
              }}
            >
              <MaterialCommunityIcons
                name="stop-circle-outline"
                size={24}
                color="#fff"
              />
              <Text style={styles.buttonText}>Stop</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    // Preview mode
    if (mode === "preview") {
      const isPlaying = playbackStatus?.isPlaying ?? false;
      return (
        <View style={styles.contentContainer}>
          <Text style={styles.title}>Preview Recording</Text>
          <View style={styles.playbackControls}>
            <TouchableOpacity
              style={styles.playPauseButton}
              onPress={() => {
                console.log("Play/Pause button pressed");
                isPlaying
                  ? pausePreview()
                  : sound
                  ? resumePreview()
                  : playPreview();
              }}
            >
              <MaterialCommunityIcons
                name={isPlaying ? "pause" : "play"}
                size={40}
                color="#e74c3c"
              />
            </TouchableOpacity>
            <View style={styles.sliderContainer}>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={1}
                value={getSliderValue()}
                onSlidingComplete={seekPreview}
                minimumTrackTintColor="#e74c3c"
                maximumTrackTintColor="#d3d3d3"
                thumbTintColor="#e74c3c"
                disabled={!playbackStatus?.isLoaded}
              />
              <Text style={styles.playbackTimeText}>{getPlaybackTime()}</Text>
            </View>
          </View>
          <View style={[styles.buttonRow, styles.previewButtonRow]}>
            <TouchableOpacity
              style={[styles.actionButton, styles.discardButton]}
              onPress={handleRecordAgain}
            >
              <MaterialCommunityIcons name="reload" size={20} color="#555" />
              <Text style={[styles.buttonText, styles.discardButtonText]}>
                Record Again
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.saveButton]}
              onPress={handleSave}
            >
              <MaterialCommunityIcons name="check" size={20} color="#fff" />
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    // Default/Initial state - always show record button
    console.log(
      `[renderContent] Rendering default record button. Mode: ${mode}, Visible: ${visible}`
    );
    return (
      <View style={styles.contentContainer}>
        <TouchableOpacity
          onPress={() => {
            console.log("Record button REALLY pressed");
            handleStartRecordingClick();
          }}
        >
          <Text
            style={{ fontSize: 20, padding: 20, backgroundColor: "lightblue" }}
          >
            Start Recordingsssssss
          </Text>
        </TouchableOpacity>
        {/* <Button
          title="Start Recordingsssssss"
          onPress={() => {
            console.log("Record button pressed");
            handleStartRecordingClick();
          }}
          color="#e74c3c"
        /> */}
      </View>
    );
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onShow={() => console.log("Modal is now visible")}
      onRequestClose={() => {
        console.log("Modal close requested");
        handleCancel();
      }}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {mode !== "recording" && mode !== "preview" && (
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                console.log("Close button pressed");
                handleCancel();
              }}
            >
              <MaterialCommunityIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          )}
          {renderContent()}
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
    paddingTop: 40,
    width: "85%",
    maxWidth: 400,
    minHeight: 250,
    alignItems: "center",
    justifyContent: "center",
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
  spinner: {
    marginBottom: 15,
  },
  infoText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 20,
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
  playbackControls: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  playPauseButton: {
    padding: 10,
    marginRight: 15,
  },
  sliderContainer: {
    flex: 1,
    justifyContent: "center",
  },
  slider: {
    width: "100%",
    height: 40,
  },
  playbackTimeText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginTop: -5,
    fontVariant: ["tabular-nums"],
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    marginTop: 10,
  },
  previewButtonRow: {
    justifyContent: "space-around",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    minWidth: 120,
    marginHorizontal: 8,
  },
  stopButton: {
    backgroundColor: "#e74c3c",
    minWidth: 150,
  },
  saveButton: {
    backgroundColor: "#4CAF50",
  },
  discardButton: {
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  cancelButton: {
    backgroundColor: "#aaa",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
  discardButtonText: {
    color: "#555",
  },
  contentContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingVertical: 20,
  },
  permissionButton: {
    backgroundColor: "#2196F3",
    marginVertical: 20,
    minWidth: 220,
  },
  recordButton: {
    backgroundColor: "#e74c3c",
    minWidth: 200,
    height: 50,
  },
  retryButton: {
    backgroundColor: "#2196F3",
    marginTop: 20,
  },
  settingsText: {
    marginTop: 20,
    marginBottom: 10,
    color: "#666",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  settingsInstructions: {
    fontSize: 14,
    color: "#2196F3",
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "500",
  },
  bulletPoints: {
    alignSelf: "flex-start",
    paddingHorizontal: 30,
    marginVertical: 15,
  },
  bulletPoint: {
    fontSize: 14,
    color: "#666",
    marginVertical: 4,
  },
  settingsButton: {
    backgroundColor: "#3498db",
    marginVertical: 10,
    minWidth: 220,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  permissionText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  permissionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
});

export default RecordingModal;
