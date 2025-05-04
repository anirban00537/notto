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
  Vibration,
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
const WaveformAnimation = ({ isRecording }: { isRecording: boolean }) => {
  const numBars = 50;
  const baseDuration = isRecording ? 800 : 1200;
  const maxHeight = 80;
  const minHeight = 5;
  const scrollDelayFactor = isRecording ? 15 : 25;

  const animatedValues = useRef(
    [...Array(numBars)].map(() => new Animated.Value(minHeight / maxHeight))
  ).current;

  useEffect(() => {
    const animations = animatedValues.map((val, index) => {
      const randomDuration = baseDuration + Math.random() * 200 - 100;
      const randomTargetScale = isRecording
        ? minHeight / maxHeight + Math.random() * (1.2 - minHeight / maxHeight)
        : minHeight / maxHeight + Math.random() * (0.8 - minHeight / maxHeight);
      const scrollDelay = index * scrollDelayFactor;

      return Animated.loop(
        Animated.sequence([
          Animated.timing(val, {
            toValue: randomTargetScale,
            duration: randomDuration / 2,
            easing: Easing.bezier(0.42, 0, 0.58, 1),
            delay: scrollDelay,
            useNativeDriver: true,
          }),
          Animated.timing(val, {
            toValue: minHeight / maxHeight,
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
  }, [isRecording, animatedValues, minHeight, maxHeight, scrollDelayFactor]);

  return (
    <View style={styles.waveformContainer}>
      <View style={styles.dotsContainer}>
        {animatedValues.map((animatedScaleY, index) => {
          return (
            <Animated.View
              key={index}
              style={[
                styles.bar,
                { transform: [{ scaleY: animatedScaleY }] },
                isRecording && styles.activeBar,
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
  const [mode, setMode] = useState<
    "idle" | "recording" | "stopped" | "error" | "playing"
  >("idle");
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState(0);

  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const playbackTimerRef = useRef<NodeJS.Timeout | null>(null);

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
      cleanupTimers();
      cleanupRecording();
      cleanupSound();
    };
  }, []);

  const cleanupTimers = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    if (playbackTimerRef.current) {
      clearInterval(playbackTimerRef.current);
    }
  };

  const cleanupRecording = async () => {
    if (recording) {
      await recording.stopAndUnloadAsync();
    }
  };

  const cleanupSound = async () => {
    if (sound) {
      await sound.unloadAsync();
    }
  };

  const vibrate = () => {
    if (Platform.OS !== "web") {
      Vibration.vibrate(50);
    }
  };

  const checkPermissions = async () => {
    try {
      if (Platform.OS === "android") {
        // Request only RECORD_AUDIO permission for Android
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: "Microphone Permission",
            message:
              "This app needs access to your microphone to record audio.",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK",
          }
        );

        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          setErrorMessage("Microphone permission is required to record audio.");
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

      await setupAudioMode();
    } catch (err: any) {
      // Add ': any' to allow accessing err.message
      console.error("Error checking permissions:", err);
      // Use err.message or fallback
      setErrorMessage(
        `Failed to check permissions: ${err?.message || "Unknown error"}`
      );
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
    } catch (err: any) {
      // Add ': any'
      console.error("Error setting up audio mode:", err);
      setErrorMessage(
        `Failed to initialize audio system: ${err?.message || "Unknown error"}`
      );
      setMode("error");
    }
  };

  const startRecording = async () => {
    try {
      vibrate();
      await cleanupRecording();
      await cleanupSound();
      setRecordingUri(null);
      setPlaybackPosition(0);

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
    } catch (err: any) {
      console.error("Failed to start recording", err);
      setErrorMessage(
        `Could not start recording: ${
          err?.message || "Unknown error"
        }. Please try again.`
      );
      setMode("error");
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return;
      vibrate();

      cleanupTimers();
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      console.log("Recording stopped and stored at", uri);

      setRecordingUri(uri);
      setRecording(null);
      setMode("stopped");

      // Load the sound for playback
      if (uri) {
        const { sound: newSound } = await Audio.Sound.createAsync({ uri });
        setSound(newSound);
      }
    } catch (err: any) {
      console.error("Failed to stop recording", err);
      setErrorMessage(
        `Could not stop recording: ${
          err?.message || "Unknown error"
        }. Please try again.`
      );
      setMode("error");
    }
  };

  const handlePlayPause = async () => {
    if (!sound) return;

    try {
      if (isPlaying) {
        vibrate();
        await sound.pauseAsync();
        setIsPlaying(false);
        if (playbackTimerRef.current) {
          clearInterval(playbackTimerRef.current);
        }
      } else {
        vibrate();
        await sound.playAsync();
        setIsPlaying(true);
        setMode("playing");

        playbackTimerRef.current = setInterval(async () => {
          const status = await sound.getStatusAsync();
          if (status.isLoaded) {
            setPlaybackPosition(status.positionMillis / 1000);
            if (status.didJustFinish) {
              setIsPlaying(false);
              setPlaybackPosition(0);
              setMode("stopped");
              clearInterval(playbackTimerRef.current!);
            }
          }
        }, 100);
      }
    } catch (error) {
      console.error("Playback error:", error);
      Alert.alert("Error", "Failed to play recording");
    }
  };

  const handleDiscard = async () => {
    vibrate();
    await cleanupSound();
    setRecordingUri(null);
    setRecordingDuration(0);
    setPlaybackPosition(0);
    setMode("idle");
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
    } catch (err: any) {
      // Add ': any'
      console.error("Failed to generate notes:", err);
      setIsProcessing(false);
      Alert.alert(
        "Error",
        `Failed to generate notes: ${
          err?.message || "Unknown error"
        }. Please try again.`
      );
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
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
      <WaveformAnimation isRecording={mode === "recording"} />
      <View style={styles.controlsContainer}>
        <Text style={styles.timerText}>
          {mode === "playing"
            ? formatTime(playbackPosition)
            : formatTime(recordingDuration)}
        </Text>

        {mode === "recording" ? (
          <TouchableOpacity
            style={styles.stopButtonOuter}
            onPress={stopRecording}
            activeOpacity={0.8}
          >
            <View style={styles.stopButtonInner} />
          </TouchableOpacity>
        ) : mode === "stopped" || mode === "playing" ? (
          <View style={styles.playbackControls}>
            <TouchableOpacity
              style={styles.discardButton}
              onPress={handleDiscard}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name="delete-outline"
                size={24}
                color="#FF6B6B"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.playButton}
              onPress={handlePlayPause}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name={isPlaying ? "pause" : "play"}
                size={32}
                color="#2c3e50"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.reRecordButton}
              onPress={startRecording}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="record" size={24} color="#2c3e50" />
            </TouchableOpacity>
          </View>
        ) : null}
      </View>

      {(mode === "stopped" || mode === "playing") && (
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
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          disabled={isProcessing || mode === "recording"}
        >
          <MaterialCommunityIcons
            name="chevron-left"
            size={30}
            color="#2c3e50"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {mode === "recording" ? "Recording..." : "Live Recording"}
        </Text>
        <View style={styles.headerRight} />
      </View>

      {mode === "error" && renderError()}
      {(mode === "recording" || mode === "stopped" || mode === "playing") &&
        renderRecordingUI()}
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
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111",
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
    backgroundColor: "#ffffff",
  },
  recordingContainer: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
    backgroundColor: "#ffffff",
  },
  waveformContainer: {
    height: 150,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
    overflow: "hidden",
  },
  dotsContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 80,
    width: "95%",
    justifyContent: "space-around",
    overflow: "hidden",
  },
  bar: {
    width: 4,
    height: 80,
    borderRadius: 2,
    backgroundColor: "#4A90E2",
  },
  activeBar: {
    backgroundColor: "#FF6B6B",
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
    color: "#2c3e50",
  },
  hintText: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    lineHeight: 22,
  },
  timerText: {
    fontSize: 48,
    fontWeight: "300",
    color: "#111",
    marginBottom: 40,
    fontVariant: ["tabular-nums"],
  },
  startButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#2c3e50",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 0,
  },
  stopButtonOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#2c3e50",
    justifyContent: "center",
    alignItems: "center",
  },
  stopButtonInner: {
    width: 35,
    height: 35,
    backgroundColor: "#FF6B6B",
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
    backgroundColor: "#2c3e50",
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
    color: "#111",
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: "#555",
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
  playbackControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    gap: 32,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e5ea",
  },
  discardButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FF6B6B",
  },
  reRecordButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2c3e50",
  },
});
