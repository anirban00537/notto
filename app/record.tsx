import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Platform,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import Slider from "@react-native-community/slider";
import { useRouter } from "expo-router";
import { PermissionsAndroid } from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createNote } from "../lib/services";
import { CreateNoteDto, NoteType, Note } from "../lib/types/note";
import ProcessingModal from "../components/ProcessingModal";

interface CreateNoteResponse {
  data?: Note;
  id?: string;
  noteType?: NoteType;
}

export default function RecordScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<"idle" | "recording" | "preview" | "error">(
    "idle"
  );
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [playbackStatus, setPlaybackStatus] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Create note mutation
  const createNoteMutation = useMutation<
    CreateNoteResponse,
    Error,
    CreateNoteDto
  >({
    mutationFn: createNote,
    onSuccess: (newNote: CreateNoteResponse) => {
      console.log("Note created:", newNote);
      queryClient.invalidateQueries({ queryKey: ["notes"] });

      const noteData = newNote?.data;
      const noteId = noteData?.id || newNote?.id;

      if (noteId) {
        setIsSuccess(true);
        setTimeout(() => {
          setIsProcessing(false);
          setIsSuccess(false);
          router.replace(`/note/${noteId}`);
        }, 1500);
      } else {
        console.error(
          "Failed to get new note ID for navigation from response:",
          newNote
        );
        setIsProcessing(false);
        Alert.alert("Error", "Failed to create note. Please try again.");
      }
    },
    onError: (error: Error) => {
      setIsProcessing(false);
      Alert.alert(
        "Error",
        `Failed to create note: ${error.message || "Please try again."}`
      );
      console.error("Error creating note:", error);
    },
  });

  useEffect(() => {
    checkPermissions();
    return () => {
      // Cleanup
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      if (recording) {
        recording.stopAndUnloadAsync();
      }
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const checkPermissions = async () => {
    try {
      if (Platform.OS === "android") {
        const grants = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        ]);

        const allGranted = Object.values(grants).every(
          (permission) => permission === PermissionsAndroid.RESULTS.GRANTED
        );

        if (!allGranted) {
          setErrorMessage(
            "Please grant all required permissions to record audio."
          );
          setMode("error");
          return;
        }
      } else if (Platform.OS === "web") {
        if (window.location.protocol !== "https:") {
          setErrorMessage(
            "Audio recording requires a secure connection (HTTPS)."
          );
          setMode("error");
          return;
        }
      }

      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        setErrorMessage("Microphone permission is required to record audio.");
        setMode("error");
        return;
      }

      await setupAudioMode();
    } catch (err) {
      console.error("Error checking permissions:", err);
      setErrorMessage("Failed to check microphone permissions.");
      setMode("error");
    }
  };

  const setupAudioMode = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    } catch (err) {
      console.error("Error setting up audio mode:", err);
      setErrorMessage("Failed to initialize audio system.");
      setMode("error");
    }
  };

  const startRecording = async () => {
    try {
      if (recording) {
        await recording.stopAndUnloadAsync();
      }
      if (sound) {
        await sound.unloadAsync();
      }

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(newRecording);
      setMode("recording");
      setRecordingDuration(0);
      startRecordingAnimation();

      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      timerIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Failed to start recording", err);
      setErrorMessage("Could not start recording. Please try again.");
      setMode("error");
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return;

      stopRecordingAnimation();
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      console.log("Recording stopped and stored at", uri);

      const { sound: newSound } = await recording.createNewLoadedSoundAsync(
        { isLooping: false },
        onPlaybackStatusUpdate
      );

      setSound(newSound);
      setRecordingUri(uri);
      setRecording(null);
      setMode("preview");
    } catch (err) {
      console.error("Failed to stop recording", err);
      setErrorMessage("Could not stop recording. Please try again.");
      setMode("error");
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

  const playPreview = async () => {
    if (!sound) return;
    try {
      await sound.playAsync();
    } catch (err) {
      console.error("Failed to play recording", err);
      setErrorMessage("Could not play the recording.");
      setMode("error");
    }
  };

  const pausePreview = async () => {
    if (!sound) return;
    try {
      await sound.pauseAsync();
    } catch (err) {
      console.error("Failed to pause playback", err);
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    setPlaybackStatus(status);
    if (status.didJustFinish) {
      sound?.unloadAsync();
    }
  };

  const handleSave = async () => {
    if (!recordingUri) return;

    try {
      setIsProcessing(true);

      // Get the filename from the URI
      const fileName = recordingUri.split("/").pop() || "recording.m4a";

      // Create the note DTO
      const noteDto: CreateNoteDto = {
        noteType: NoteType.AUDIO,
        file: {
          uri: recordingUri,
          name: fileName,
          type: "audio/m4a",
          mimeType: "audio/m4a",
        },
      };

      // Submit the mutation
      createNoteMutation.mutate(noteDto);
    } catch (err) {
      console.error("Failed to save recording:", err);
      setIsProcessing(false);
      Alert.alert("Error", "Failed to save recording. Please try again.");
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const renderError = () => (
    <View style={styles.centerContainer}>
      <MaterialCommunityIcons name="alert-circle" size={64} color="#FF6B6B" />
      <Text style={styles.errorTitle}>Error</Text>
      <Text style={styles.errorText}>{errorMessage}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={checkPermissions}>
        <Text style={styles.buttonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  const renderRecording = () => (
    <View style={styles.centerContainer}>
      <Animated.View
        style={[
          styles.recordingIndicator,
          { transform: [{ scale: pulseAnimation }] },
        ]}
      >
        <MaterialCommunityIcons name="microphone" size={64} color="#2c3e50" />
      </Animated.View>
      <Text style={styles.timerText}>{formatTime(recordingDuration)}</Text>
      <TouchableOpacity
        style={styles.stopButton}
        onPress={stopRecording}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons name="stop-circle" size={32} color="#FFF" />
        <Text style={styles.buttonText}>Stop Recording</Text>
      </TouchableOpacity>
    </View>
  );

  const renderPreview = () => {
    const isPlaying = playbackStatus?.isPlaying;
    return (
      <View style={styles.centerContainer}>
        <View style={styles.previewHeader}>
          <MaterialCommunityIcons name="waveform" size={24} color="#2c3e50" />
          <Text style={styles.previewTitle}>Preview Recording</Text>
        </View>
        <View style={styles.previewCard}>
          <TouchableOpacity
            style={styles.playButton}
            onPress={isPlaying ? pausePreview : playPreview}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name={isPlaying ? "pause" : "play"}
              size={48}
              color="#2c3e50"
            />
          </TouchableOpacity>
          <Text style={styles.durationText}>
            {formatTime(recordingDuration)}
          </Text>
        </View>
        <View style={styles.previewActions}>
          <TouchableOpacity
            style={styles.discardButton}
            onPress={() => setMode("idle")}
            disabled={isProcessing}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="delete-outline"
              size={24}
              color="#666"
            />
            <Text style={styles.discardButtonText}>Discard</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.createNoteButton,
              isProcessing && styles.disabledButton,
            ]}
            onPress={handleSave}
            disabled={isProcessing}
            activeOpacity={0.8}
          >
            {isProcessing ? (
              <ActivityIndicator
                color="#FFF"
                size="small"
                style={{ marginRight: 8 }}
              />
            ) : (
              <MaterialCommunityIcons name="note-plus" size={24} color="#FFF" />
            )}
            <Text style={styles.buttonText}>
              {isProcessing ? "Creating..." : "Create Note"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderIdle = () => (
    <View style={styles.centerContainer}>
      <View style={styles.recordingHint}>
        <MaterialCommunityIcons
          name="microphone"
          size={32}
          color="#2c3e50"
          style={styles.hintIcon}
        />
        <Text style={styles.hintText}>
          Tap the button below to start recording your note
        </Text>
      </View>
      <TouchableOpacity
        style={styles.startButton}
        onPress={startRecording}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons name="microphone-plus" size={32} color="#FFF" />
        <Text style={styles.buttonText}>Start Recording</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0f7ff" />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.back()}
          disabled={isProcessing}
        >
          <MaterialCommunityIcons name="close" size={24} color="#2c3e50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Voice Recording</Text>
        <View style={styles.headerRight} />
      </View>

      {mode === "error" && renderError()}
      {mode === "recording" && renderRecording()}
      {mode === "preview" && renderPreview()}
      {mode === "idle" && renderIdle()}

      <ProcessingModal
        visible={isProcessing}
        type="audio"
        isSuccess={isSuccess}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f7ff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
    backgroundColor: "#f0f7ff",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2c3e50",
  },
  closeButton: {
    padding: 8,
  },
  headerRight: {
    width: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    backgroundColor: "#f0f7ff",
  },
  recordingHint: {
    alignItems: "center",
    marginBottom: 40,
    padding: 20,
    backgroundColor: "rgba(44, 62, 80, 0.05)",
    borderRadius: 16,
  },
  hintIcon: {
    marginBottom: 12,
  },
  hintText: {
    fontSize: 16,
    color: "#2c3e50",
    textAlign: "center",
    lineHeight: 22,
  },
  recordingIndicator: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(44, 62, 80, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  timerText: {
    fontSize: 48,
    fontWeight: "300",
    color: "#2c3e50",
    marginBottom: 32,
    fontVariant: ["tabular-nums"],
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2c3e50",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    minWidth: 200,
  },
  stopButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2c3e50",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    minWidth: 200,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
  },
  previewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  previewTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#2c3e50",
    marginLeft: 12,
  },
  previewCard: {
    backgroundColor: "white",
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    width: "100%",
    marginBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(44, 62, 80, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  durationText: {
    fontSize: 18,
    color: "#2c3e50",
    fontWeight: "500",
  },
  previewActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    paddingHorizontal: 16,
  },
  createNoteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2c3e50",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    minWidth: 160,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  discardButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    minWidth: 140,
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  discardButtonText: {
    color: "#666",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
  },
  disabledButton: {
    opacity: 0.7,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#2c3e50",
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  retryButton: {
    backgroundColor: "#2c3e50",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
});
