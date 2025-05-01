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

// Enhanced Waveform Animation Component
const WaveformAnimation = () => {
  const numDots = 70; // Keep number of dots
  const baseDuration = 800;
  const animatedValues = useRef(
    [...Array(numDots)].map(() => new Animated.Value(0))
  ).current;

  useEffect(() => {
    const animations = animatedValues.map((val, index) => {
      const randomDuration = baseDuration + Math.random() * 400 - 200; // Randomize duration +/- 200ms
      const randomDelay = Math.random() * (baseDuration / 2); // Randomize start delay

      return Animated.loop(
        Animated.sequence([
          Animated.timing(val, {
            toValue: 1,
            duration: randomDuration / 2,
            easing: Easing.bezier(0.42, 0, 0.58, 1), // Smoother easing
            delay: randomDelay,
            useNativeDriver: true,
          }),
          Animated.timing(val, {
            toValue: 0,
            duration: randomDuration / 2,
            easing: Easing.bezier(0.42, 0, 0.58, 1),
            useNativeDriver: true,
          }),
        ])
      );
    });

    animations.forEach((anim) => anim.start());

    return () => {
      animations.forEach((anim) => anim.stop());
    };
  }, [animatedValues]); // Dependency array remains the same

  return (
    <View style={styles.waveformContainer}>
      <View style={styles.dotsContainer}>
        {animatedValues.map((val, index) => {
          // Interpolate scale with more variation and intensity
          const scale = val.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0.5, 1 + Math.random() * 1.0, 0.5], // Random peak scale up to 2.0x (increased intensity)
          });
          // Interpolate opacity for smoother fade
          const opacity = val.interpolate({
            inputRange: [0, 0.1, 0.9, 1],
            outputRange: [0.3, 1, 1, 0.3], // Fade in/out more gently
          });

          // More complex positioning with increased amplitude
          const sin1 = Math.sin((index / numDots) * Math.PI * 2) * 25; // Increased amplitude for base wave
          const sin2 =
            Math.sin((index / numDots) * Math.PI * 4 + Math.PI / 2) * 12; // Increased amplitude for second wave
          const randomOffset = (Math.random() - 0.5) * 8; // Increased random jitter
          const bottomPosition = sin1 + sin2 + randomOffset + 20; // Increased base offset

          return (
            <Animated.View
              key={index}
              style={[
                styles.dot,
                {
                  opacity,
                  transform: [{ scale }],
                  bottom: bottomPosition,
                },
              ]}
            />
          );
        })}
      </View>
    </View>
  );
};

export default function RecordScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<"idle" | "recording" | "stopped" | "error">(
    "idle"
  );
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      if (recording) {
        recording.stopAndUnloadAsync();
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
        setRecording(null);
      }
      setRecordingUri(null);

      await setupAudioMode();

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(newRecording);
      setMode("recording");
      setRecordingDuration(0);

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

      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      console.log("Recording stopped and stored at", uri);

      setRecordingUri(uri);
      setRecording(null);
      setMode("stopped");
    } catch (err) {
      console.error("Failed to stop recording", err);
      setErrorMessage("Could not stop recording. Please try again.");
      setMode("error");
    }
  };

  const handleGenerateNotes = async () => {
    if (!recordingUri) {
      Alert.alert("Error", "No recording available to generate notes from.");
      return;
    }

    try {
      setIsProcessing(true);

      const fileName = recordingUri.split("/").pop() || "recording.m4a";

      const noteDto: CreateNoteDto = {
        noteType: NoteType.AUDIO,
        file: {
          uri: recordingUri,
          name: fileName,
          type: "audio/m4a",
          mimeType: "audio/m4a",
        },
      };

      createNoteMutation.mutate(noteDto);
    } catch (err) {
      console.error("Failed to generate notes:", err);
      setIsProcessing(false);
      Alert.alert("Error", "Failed to generate notes. Please try again.");
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
        <Text style={styles.buttonTextWhite}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  const renderRecordingUI = () => (
    <View style={styles.recordingContainer}>
      <WaveformAnimation />
      <View style={styles.controlsContainer}>
        <Text style={styles.timerText}>{formatTime(recordingDuration)}</Text>
        <TouchableOpacity
          style={styles.stopButtonOuter}
          onPress={mode === "recording" ? stopRecording : undefined}
          disabled={mode !== "recording"}
          activeOpacity={0.8}
        >
          <View style={styles.stopButtonInner} />
        </TouchableOpacity>
      </View>
      {mode === "stopped" && (
        <TouchableOpacity
          style={[
            styles.generateButton,
            (isProcessing || createNoteMutation.isPending) &&
              styles.disabledButton,
          ]}
          onPress={handleGenerateNotes}
          disabled={isProcessing || createNoteMutation.isPending}
          activeOpacity={0.8}
        >
          {isProcessing || createNoteMutation.isPending ? (
            <ActivityIndicator
              color="#FFF"
              size="small"
              style={{ marginRight: 8 }}
            />
          ) : null}
          <Text style={styles.buttonTextWhite}>
            {isProcessing || createNoteMutation.isPending
              ? "Generating..."
              : "Generate Notes"}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderIdle = () => (
    <View style={styles.centerContainer}>
      <View style={styles.recordingHint}>
        <MaterialCommunityIcons
          name="microphone"
          size={48}
          color="#FFF"
          style={styles.hintIcon}
        />
        <Text style={styles.hintText}>
          Tap the button below to start recording
        </Text>
      </View>
      <TouchableOpacity
        style={styles.startButton}
        onPress={startRecording}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons name="microphone" size={32} color="#FFF" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          disabled={isProcessing || mode === "recording"}
        >
          <MaterialCommunityIcons name="chevron-left" size={30} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Live Recording</Text>
        <View style={styles.headerRight} />
      </View>

      {mode === "error" && renderError()}
      {(mode === "recording" || mode === "stopped") && renderRecordingUI()}
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
    backgroundColor: "#121212",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#121212",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFF",
  },
  backButton: {
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
    backgroundColor: "#121212",
  },
  recordingContainer: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
    backgroundColor: "#121212",
  },
  waveformContainer: {
    height: 150,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
    overflow: "hidden", // Hide parts of dots that go too high/low if needed
  },
  dotsContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 100, // Increased height significantly to accommodate larger amplitude
    width: "95%",
    justifyContent: "space-around",
  },
  dot: {
    width: 8, // Increased dot size back to 8
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4A90E2",
  },
  controlsContainer: {
    alignItems: "center",
    width: "100%",
  },
  recordingHint: {
    alignItems: "center",
    marginBottom: 60,
    padding: 20,
  },
  hintIcon: {
    marginBottom: 16,
  },
  hintText: {
    fontSize: 16,
    color: "#AAA",
    textAlign: "center",
    lineHeight: 22,
  },
  timerText: {
    fontSize: 48,
    fontWeight: "300",
    color: "#FFF",
    marginBottom: 40,
    fontVariant: ["tabular-nums"],
  },
  startButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#4A90E2",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  stopButtonOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
  },
  stopButtonInner: {
    width: 35,
    height: 35,
    backgroundColor: "#4A90E2",
    borderRadius: 4,
  },
  buttonTextWhite: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
  },
  generateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4A90E2",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    minWidth: "80%",
    marginTop: "auto",
  },
  disabledButton: {
    opacity: 0.5,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#FFF",
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: "#AAA",
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  retryButton: {
    backgroundColor: "#4A90E2",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
});
