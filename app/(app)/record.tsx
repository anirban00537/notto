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
  Dimensions,
  Image,
  AppState,
  BackHandler,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { useRouter, useNavigation } from "expo-router";
import { PermissionsAndroid } from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createNote } from "../../lib/services";
import { CreateNoteDto, NoteType, Note } from "../../lib/types/note";
import ProcessingModal from "../../components/ProcessingModal";
import { LinearGradient } from "expo-linear-gradient";
import { Typography, FONTS } from "../../constants/Typography";
import { Colors } from "../../constants/Colors";

interface CreateNoteResponse {
  data?: Note;
  id?: string;
  noteType?: NoteType;
}

// Enhanced Waveform Animation Component
const WaveformAnimation = ({ isRecording }: { isRecording: boolean }) => {
  const numBars = 60;
  const baseDuration = isRecording ? 800 : 1200;
  const maxHeight = 100;
  const minHeight = 5;
  const scrollDelayFactor = isRecording ? 15 : 25;

  const animatedValues = useRef(
    [...Array(numBars)].map(() => new Animated.Value(minHeight / maxHeight))
  ).current;

  useEffect(() => {
    const animations = animatedValues.map((val, index) => {
      const randomDuration = baseDuration + Math.random() * 200 - 100;
      const randomTargetScale = isRecording
        ? minHeight / maxHeight + Math.random() * (1.5 - minHeight / maxHeight)
        : minHeight / maxHeight + Math.random() * (0.9 - minHeight / maxHeight);
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
      <LinearGradient
        colors={["rgba(44, 62, 80, 0.03)", "rgba(44, 62, 80, 0.07)"]}
        style={styles.waveformBackground}
      />
      <View style={styles.dotsContainer}>
        {animatedValues.map((animatedScaleY, index) => {
          const isMiddle = index > numBars * 0.3 && index < numBars * 0.7;
          return (
            <Animated.View
              key={index}
              style={[
                styles.bar,
                isMiddle && styles.barMiddle,
                { transform: [{ scaleY: animatedScaleY }] },
                isRecording &&
                  (isMiddle ? styles.activeBarMiddle : styles.activeBar),
              ]}
            />
          );
        })}
      </View>
    </View>
  );
};

// Pulsating Record Button Component
const PulsatingRecordButton = ({ onPress }: { onPress: () => void }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.pulsingButtonContainer}>
      <Animated.View
        style={[
          styles.pulseEffect,
          {
            transform: [{ scale: pulseAnim }],
            opacity: pulseAnim.interpolate({
              inputRange: [1, 1.2],
              outputRange: [0.5, 0],
            }),
          },
        ]}
      />
      <TouchableOpacity
        style={styles.startButton}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons name="microphone" size={32} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
};

export default function RecordScreen() {
  const router = useRouter();
  const navigation = useNavigation();
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
  const [appActive, setAppActive] = useState(true);
  const appStateRef = useRef(AppState.currentState);
  const hasAttemptedCleanupRef = useRef(false);
  const recordingCleanedUpRef = useRef(true);

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

  // Handle Android back button specifically
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        console.log("Android back button pressed");

        // If currently recording, show alert and prevent navigation
        if (mode === "recording") {
          Alert.alert(
            "Recording in Progress",
            "Are you sure you want to stop recording and leave this screen?",
            [
              {
                text: "Continue Recording",
                style: "cancel",
              },
              {
                text: "Stop & Leave",
                style: "destructive",
                onPress: async () => {
                  // Stop recording first, then navigate
                  try {
                    await stopRecording();
                    await releaseMicrophoneAndCleanup();
                    // Allow a small delay for cleanup before navigation
                    setTimeout(() => {
                      router.back();
                    }, 300);
                  } catch (err) {
                    console.warn("Error during cleanup after alert:", err);
                    releaseMicrophoneAndCleanup();
                    router.back();
                  }
                },
              },
            ]
          );
          // Return true to prevent default back navigation
          return true;
        }

        // Not recording, perform cleanup and allow navigation
        releaseMicrophoneAndCleanup();
        return false; // Allow default back navigation
      }
    );

    return () => backHandler.remove();
  }, [mode]);

  // Prevent navigation when recording is active (for Expo Router navigation)
  useEffect(() => {
    if (mode === "recording") {
      // Set up a listener to prevent navigation
      const unsubscribe = navigation.addListener("beforeRemove", (e: any) => {
        // Prevent default navigation behavior
        e.preventDefault();

        // Show alert to confirm leaving
        Alert.alert(
          "Recording in Progress",
          "Are you sure you want to stop recording and leave this screen?",
          [
            {
              text: "Continue Recording",
              style: "cancel",
              onPress: () => {
                // Do nothing, just continue recording
              },
            },
            {
              text: "Stop & Leave",
              style: "destructive",
              onPress: async () => {
                // Stop recording and allow navigation
                try {
                  await stopRecording();
                  await releaseMicrophoneAndCleanup();
                  // Delay to ensure cleanup completes
                  setTimeout(() => {
                    // Allow navigation by removing the block and navigating
                    unsubscribe();
                    navigation.dispatch(e.data.action);
                  }, 300);
                } catch (err) {
                  console.warn("Error during cleanup before navigation:", err);
                  // Clean up and attempt navigation anyway
                  releaseMicrophoneAndCleanup();
                  unsubscribe();
                  navigation.dispatch(e.data.action);
                }
              },
            },
          ]
        );
      });

      // Clean up listener when component unmounts or recording stops
      return unsubscribe;
    }
  }, [mode, navigation]);

  // Monitor AppState to detect when app goes to background/foreground
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appStateRef.current === "active" &&
        nextAppState.match(/inactive|background/)
      ) {
        // App is going to background
        console.log(
          "App going to background - releasing microphone and cleaning up"
        );

        // If recording, show alert if possible (won't work if app is completely backgrounded)
        if (mode === "recording" && Platform.OS === "android") {
          try {
            // For Android, try to alert the user that recording will be stopped
            Alert.alert(
              "Recording Stopped",
              "Your recording has been stopped because you left the app.",
              [{ text: "OK" }]
            );
          } catch (err) {
            console.warn("Could not show alert when leaving app:", err);
          }
        }

        releaseMicrophoneAndCleanup();
      } else if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        // App coming to foreground
        console.log("App coming to foreground - resetting state");
        resetRecordingScreen();
      }

      appStateRef.current = nextAppState;
      setAppActive(nextAppState === "active");
    });

    return () => {
      subscription.remove();
    };
  }, [mode]); // Add mode as dependency to check recording state

  // Use useEffect for initial setup and cleanup
  useEffect(() => {
    hasAttemptedCleanupRef.current = false;

    // Completely reset everything when component mounts
    resetRecordingScreen();

    // Cleanup when component unmounts
    return () => {
      console.log("Component unmounting - final cleanup");
      releaseMicrophoneAndCleanup();
    };
  }, []);

  const resetRecordingScreen = async () => {
    console.log("Resetting record screen to initial state");

    try {
      // Reset all state variables first
      setMode("idle");
      setRecordingDuration(0);
      setRecordingUri(null);
      setPlaybackPosition(0);
      setIsPlaying(false);
      setErrorMessage(null);
      setIsProcessing(false);
      setIsSuccess(false);
      setRecording(null);
      setSound(null);

      // Then do a complete cleanup
      await releaseMicrophoneAndCleanup();

      // Finally check permissions and setup
      await checkPermissions();

      // Mark that we've cleaned up properly
      recordingCleanedUpRef.current = true;
    } catch (error) {
      console.error("Error resetting record screen:", error);
      setMode("error");
      setErrorMessage(
        "Failed to initialize recording. Please restart the app and try again."
      );
    }
  };

  // Add a specific function to release the microphone
  const releaseMicrophoneAndCleanup = async () => {
    console.log(
      "CRITICAL: Releasing microphone and cleaning up audio resources"
    );

    // First stop any active recording
    if (recording) {
      try {
        console.log("Stopping active recording to release microphone");
        await recording.stopAndUnloadAsync();
      } catch (err) {
        console.warn("Error stopping recording:", err);
      } finally {
        setRecording(null);
      }
    }

    // Forcefully reset audio mode multiple times with different settings
    // This helps ensure the microphone is truly released at the OS level
    try {
      console.log("Forcefully releasing microphone - step 1");
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: false,
        staysActiveInBackground: false,
        shouldDuckAndroid: false,
        playThroughEarpieceAndroid: false,
      });

      // Short delay between audio mode changes
      await new Promise((resolve) => setTimeout(resolve, 100));

      console.log("Forcefully releasing microphone - step 2");
      // Try a different configuration to ensure release
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: false,
        staysActiveInBackground: false,
        shouldDuckAndroid: false,
        playThroughEarpieceAndroid: false,
        interruptionModeIOS: 1,
        interruptionModeAndroid: 1,
      });

      // Try to call internal methods to force cleanup
      const AudioModule = Audio as any;
      if (AudioModule._cleanupForUnloadedRecorders) {
        console.log("Calling _cleanupForUnloadedRecorders");
        await AudioModule._cleanupForUnloadedRecorders();
      }

      if (AudioModule._unloadAllAndStopPlaying) {
        console.log("Calling _unloadAllAndStopPlaying");
        await AudioModule._unloadAllAndStopPlaying();
      }
    } catch (err) {
      console.warn("Error releasing microphone:", err);
    }

    // Run the regular cleanup after microphone release
    await forceFullCleanup();

    // Set extra flag to ensure we know the microphone has been released
    recordingCleanedUpRef.current = true;
  };

  const forceFullCleanup = async () => {
    console.log("Performing complete audio system cleanup");

    // Prevent multiple cleanups in quick succession
    if (hasAttemptedCleanupRef.current) {
      console.log("Cleanup already attempted, skipping");
      return;
    }

    hasAttemptedCleanupRef.current = true;

    // Reset state variables related to recording
    setIsPlaying(false);
    setPlaybackPosition(0);

    // Clean up timers
    cleanupTimers();

    try {
      // Clean up recording first
      if (recording) {
        console.log("Cleaning up active recording");
        try {
          await recording.stopAndUnloadAsync();
        } catch (err) {
          console.warn("Error stopping recording:", err);
        } finally {
          setRecording(null);
        }
      }

      // Clean up sound
      if (sound) {
        try {
          await sound.unloadAsync();
        } catch (err) {
          console.warn("Error unloading sound:", err);
        } finally {
          setSound(null);
        }
      }

      // Force manual cleanup of any existing recordings
      try {
        const AudioRecording = Audio.Recording as any;
        if (AudioRecording._cleanupForUnloadedRecorders) {
          console.log("Forcing cleanup of all recording instances");
          await AudioRecording._cleanupForUnloadedRecorders();
        }
      } catch (err) {
        console.warn("Error during recording cleanup:", err);
      }

      // Reset audio mode with all options explicitly set
      try {
        console.log("Resetting audio mode");
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: false,
          staysActiveInBackground: false,
          shouldDuckAndroid: false,
          playThroughEarpieceAndroid: false,
          interruptionModeIOS: 1,
          interruptionModeAndroid: 1,
        });
      } catch (err) {
        console.warn("Error resetting audio mode:", err);
      }

      // Additional platform-specific cleanup
      if (Platform.OS === "android") {
        // On Android, we need to ensure the recording session is truly released
        console.log("Performing Android-specific cleanup");

        try {
          // Reset audio mode a second time with different settings
          // This can help release the microphone on some Android devices
          await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            playsInSilentModeIOS: false,
            staysActiveInBackground: false,
            shouldDuckAndroid: true,
            playThroughEarpieceAndroid: false,
            interruptionModeIOS: 2,
            interruptionModeAndroid: 2,
          });
        } catch (err) {
          console.warn("Error during secondary audio mode reset:", err);
        }

        try {
          // Try to force garbage collection of native resources
          if (global.gc) {
            console.log("Forcing garbage collection");
            global.gc();
          }
        } catch (err) {
          console.warn("Could not force garbage collection:", err);
        }

        // Add a small delay to let the system release resources
        await new Promise((resolve) => setTimeout(resolve, 800));
      }

      // Reset the cleanup flag after a delay
      setTimeout(() => {
        hasAttemptedCleanupRef.current = false;
        recordingCleanedUpRef.current = true;
        console.log("Cleanup completed, reset flags");
      }, 1000);
    } catch (err) {
      console.warn("Error during full cleanup:", err);
      // Even on error, reset the flags after a delay
      setTimeout(() => {
        hasAttemptedCleanupRef.current = false;
        recordingCleanedUpRef.current = true;
      }, 1500);
    }
  };

  const cleanupTimers = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (playbackTimerRef.current) {
      clearInterval(playbackTimerRef.current);
      playbackTimerRef.current = null;
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
    // Prevent recording if we haven't properly cleaned up
    if (!recordingCleanedUpRef.current) {
      console.log("Cannot start recording - previous session not cleaned up");
      setErrorMessage(
        "Cannot start recording right now. Please wait a moment and try again."
      );
      setMode("error");
      return;
    }

    try {
      // Mark that we're going to start recording
      recordingCleanedUpRef.current = false;
      vibrate();

      // Force cleanup of any existing recordings including microphone release
      await releaseMicrophoneAndCleanup();

      // Add an additional delay to ensure cleanup is complete
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log("Setting up audio mode...");
      // Reset Audio settings for recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        interruptionModeIOS: 1,
        interruptionModeAndroid: 1,
      });

      console.log("Creating new recording...");
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      console.log("Recording created successfully");
      setRecording(newRecording);
      setMode("recording");
      setRecordingDuration(0);
      setRecordingUri(null);
      setPlaybackPosition(0);

      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      timerIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error("Failed to start recording", err);

      // Try to clean up after error including microphone release
      try {
        await releaseMicrophoneAndCleanup();
      } catch (cleanupErr) {
        console.warn("Error during post-error cleanup:", cleanupErr);
      }

      setErrorMessage(
        `Could not start recording: ${
          err?.message || "Unknown error"
        }. Please try again.`
      );
      setMode("error");

      // Reset the cleanup flag after error
      recordingCleanedUpRef.current = true;
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return;
      vibrate();

      cleanupTimers();
      console.log("Stopping recording...");
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      console.log("Recording stopped and stored at", uri);

      setRecordingUri(uri);
      setRecording(null);
      setMode("stopped");

      // Load the sound for playback
      if (uri) {
        console.log("Loading sound for playback");
        // Cleanup any existing sound first
        if (sound) {
          try {
            await sound.unloadAsync();
            setSound(null);
          } catch (err) {
            console.warn("Error cleaning up previous sound:", err);
          }
        }

        try {
          const { sound: newSound } = await Audio.Sound.createAsync({ uri });
          setSound(newSound);
          // Allow recording again
          recordingCleanedUpRef.current = true;
        } catch (err) {
          console.warn("Error creating sound from recording:", err);
          // Make sure we can record again even if playback fails
          recordingCleanedUpRef.current = true;
        }
      } else {
        // No URI means we need to reset state to allow recording again
        recordingCleanedUpRef.current = true;
      }
    } catch (err: any) {
      console.error("Failed to stop recording", err);
      setErrorMessage(
        `Could not stop recording: ${
          err?.message || "Unknown error"
        }. Please try again.`
      );
      setMode("error");

      // Reset the recording state so we can try again
      await releaseMicrophoneAndCleanup();
      recordingCleanedUpRef.current = true;
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

      // Reset the sound if there's an error
      await releaseMicrophoneAndCleanup();
      setMode("stopped");
    }
  };

  const handleDiscard = async () => {
    vibrate();
    await releaseMicrophoneAndCleanup();
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
      <Text style={[Typography.h3, styles.errorTitle]}>Error</Text>
      <Text style={[Typography.body1, styles.errorText]}>{errorMessage}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={checkPermissions}>
        <Text style={[Typography.buttonText, styles.buttonTextWhite]}>
          Try Again
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderRecordingUI = () => (
    <View style={styles.recordingContainer}>
      {/* Decorative circles */}
      <View style={[styles.decorCircle, styles.decorCircle1]} />
      <View style={[styles.decorCircle, styles.decorCircle2]} />

      {/* Timer display with animated background */}
      <View style={styles.timerContainer}>
        <Text style={[Typography.h1, styles.timerText]}>
          {mode === "playing"
            ? formatTime(playbackPosition)
            : formatTime(recordingDuration)}
        </Text>
        {mode === "recording" && (
          <View style={styles.recordingIndicator}>
            <View style={styles.recordingDot} />
            <Text style={[Typography.body2, styles.recordingIndicatorText]}>
              Recording
            </Text>
          </View>
        )}
      </View>

      <WaveformAnimation isRecording={mode === "recording"} />

      <View style={styles.controlsContainer}>
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
          <Text style={[Typography.buttonText, styles.buttonTextWhite]}>
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
      {/* Decorative elements */}
      <View style={[styles.decorCircle, styles.decorCircle1]} />
      <View style={[styles.decorCircle, styles.decorCircle2]} />

      <View style={styles.recordingHint}>
        <LinearGradient
          colors={["rgba(44, 62, 80, 0.05)", "rgba(44, 62, 80, 0.1)"]}
          style={[styles.hintBackground, { borderRadius: 15 }]}
        />
        <MaterialCommunityIcons
          name="microphone"
          size={48}
          color="#000000"
          style={styles.hintIcon}
        />
        <Text style={[Typography.h4, styles.hintText]}>
          Tap the button below to start recording
        </Text>
      </View>

      <PulsatingRecordButton onPress={startRecording} />
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
            color="#000000"
          />
        </TouchableOpacity>
        <Text style={[Typography.h3, styles.headerTitle]}>
          {mode === "recording" ? "Recording..." : "Voice Notes"}
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

const { width, height } = Dimensions.get("window");

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
    color: "#000000",
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
    position: "relative",
    overflow: "hidden",
  },
  recordingContainer: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
    backgroundColor: "#ffffff",
    position: "relative",
    overflow: "hidden",
  },
  decorCircle: {
    position: "absolute",
    borderRadius: 1000,
    backgroundColor: "rgba(44, 62, 80, 0.03)",
  },
  decorCircle1: {
    width: width * 0.8,
    height: width * 0.8,
    top: -width * 0.4,
    left: -width * 0.2,
  },
  decorCircle2: {
    width: width * 0.7,
    height: width * 0.7,
    bottom: -width * 0.2,
    right: -width * 0.2,
    backgroundColor: "rgba(255, 107, 107, 0.03)",
  },
  waveformContainer: {
    height: 170,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
    overflow: "hidden",
    position: "relative",
  },
  waveformBackground: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 16,
  },
  dotsContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 100,
    width: "95%",
    justifyContent: "space-around",
    overflow: "hidden",
  },
  bar: {
    width: 3,
    height: 100,
    borderRadius: 4,
    backgroundColor: "#4A90E2",
    opacity: 0.7,
  },
  barMiddle: {
    width: 5,
    backgroundColor: "#4A90E2",
    opacity: 0.9,
  },
  activeBar: {
    backgroundColor: "#FF6B6B",
  },
  activeBarMiddle: {
    backgroundColor: "#FF4A4A",
    width: 5,
  },
  controlsContainer: {
    alignItems: "center",
    width: "100%",
  },
  recordingHint: {
    alignItems: "center",
    marginBottom: 60,
    padding: 30,
    position: "relative",
    borderRadius: 15,
    width: "90%",
  },
  hintBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  hintIcon: {
    marginBottom: 16,
    color: "#000000",
  },
  hintText: {
    color: "#000000",
    textAlign: "center",
    lineHeight: 24,
  },
  timerContainer: {
    alignItems: "center",
    marginBottom: 20,
    width: "100%",
    paddingVertical: 16,
    backgroundColor: "rgba(44, 62, 80, 0.03)",
    borderRadius: 16,
  },
  timerText: {
    color: "#000000",
    fontVariant: ["tabular-nums"],
    letterSpacing: 2,
  },
  recordingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FF4A4A",
    marginRight: 8,
    opacity: 0.8,
  },
  recordingIndicatorText: {
    color: "#FF4A4A",
  },
  pulsingButtonContainer: {
    position: "relative",
    width: 100,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  pulseEffect: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#2c3e50",
  },
  startButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 0,
  },
  stopButtonOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  stopButtonInner: {
    width: 35,
    height: 35,
    backgroundColor: "#FF6B6B",
    borderRadius: 4,
  },
  buttonTextWhite: {
    color: "#FFF",
    marginLeft: 8,
  },
  generateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000000",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    minWidth: "80%",
    marginTop: 40,
  },
  disabledButton: {
    opacity: 0.5,
  },
  errorTitle: {
    color: "#111",
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    color: "#555",
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  retryButton: {
    backgroundColor: "#000000",
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
    borderColor: "#000000",
  },
});
