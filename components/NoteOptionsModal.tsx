import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Platform,
  Modal,
  TextInput,
  ActivityIndicator,
  Pressable,
  Animated,
  Easing,
  TouchableOpacity,
} from "react-native";
import { pick, types as docTypes } from "@react-native-documents/picker";
import * as ImagePicker from "expo-image-picker";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import CommonBottomSheet from "./CommonBottomSheet";
import { router } from "expo-router";
import { useUser } from "../app/context/UserContext";
import { createNote } from "../lib/services";
import { CreateNoteDto, NoteType, NoteStatus, Note } from "../lib/types/note";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import ProcessingModal from "./ProcessingModal";
import * as ExpoAV from "expo-av";
const { Audio } = ExpoAV;

interface NoteOptionsModalProps {
  bottomSheetRef: React.RefObject<any>;
  onAddYouTube: () => void;
  selectedFolderId?: string;
}

// Define a potential API response structure (matching useNotes)
interface CreateNoteResponse {
  data?: Note;
  id?: string;
  noteType?: NoteType;
}

type ModalOptionButtonProps = {
  onPress: () => void;
  disabled?: boolean;
  icon: React.ReactNode;
  label: string;
};

const ModalOptionButton: React.FC<ModalOptionButtonProps> = ({
  onPress,
  disabled,
  icon,
  label,
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const animateIn = () => {
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 40,
      bounciness: 10,
    }).start();
  };
  const animateOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 40,
      bounciness: 10,
    }).start();
  };
  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        style={({ pressed }) => [styles.modalOption, pressed && styles.pressed]}
        onPress={onPress}
        disabled={disabled}
        onPressIn={animateIn}
        onPressOut={animateOut}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        {icon}
        <Text style={styles.modalOptionText}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
};

const NoteOptionsModal: React.FC<NoteOptionsModalProps> = ({
  bottomSheetRef,
  onAddYouTube,
  selectedFolderId,
}) => {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [isPicking, setIsPicking] = useState(false);
  const [processingType, setProcessingType] = useState<
    "pdf" | "audio" | "youtube" | "image" | null
  >(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<ExpoAV.Audio.Recording | null>(
    null
  );
  const [recordingDuration, setRecordingDuration] = useState(0);

  // Animated values for equalizer
  const barCount = 5;
  const barAnimations = useRef(
    Array(barCount)
      .fill(0)
      .map(() => new Animated.Value(0))
  ).current;

  useEffect(() => {
    if (isRecording) {
      // Start equalizer animation
      const animations = barAnimations.map((anim) =>
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 1,
              duration: 500 + Math.random() * 500, // Random duration for each bar
              easing: Easing.linear,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: 500 + Math.random() * 500,
              easing: Easing.linear,
              useNativeDriver: true,
            }),
          ])
        )
      );
      Animated.stagger(100, animations).start();
    } else {
      // Stop animations
      barAnimations.forEach((anim) => anim.stopAnimation());
    }
  }, [isRecording]);

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(newRecording);
      setIsRecording(true);

      // Start duration counter
      const interval = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);

      return () => clearInterval(interval);
    } catch (err) {
      console.error("Failed to start recording", err);
      Alert.alert("Error", "Failed to start recording");
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return;

      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      setRecordingDuration(0);

      if (uri) {
        const noteDto: CreateNoteDto = {
          noteType: NoteType.AUDIO,
          file: {
            uri,
            name: `recording-${Date.now()}.m4a`,
            mimeType: "audio/m4a",
            type: "audio/m4a",
          },
          ...(selectedFolderId &&
            selectedFolderId !== "all" && { folderId: selectedFolderId }),
        };
        bottomSheetRef.current?.close();
        createNoteMutation.mutate(noteDto);
      }
    } catch (err) {
      console.error("Failed to stop recording", err);
      Alert.alert("Error", "Failed to stop recording");
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Animated values for scaling
  const scalePDF = useRef(new Animated.Value(1)).current;
  const scaleAudio = useRef(new Animated.Value(1)).current;
  const scaleYouTube = useRef(new Animated.Value(1)).current;

  const animateIn = (scaleAnim: Animated.Value) => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 40,
      bounciness: 10,
    }).start();
  };
  const animateOut = (scaleAnim: Animated.Value) => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 40,
      bounciness: 10,
    }).start();
  };

  const createNoteMutation = useMutation<
    CreateNoteResponse,
    Error,
    CreateNoteDto
  >({
    mutationFn: createNote,
    onSuccess: (newNote: CreateNoteResponse) => {
      console.log("Note created:", newNote);
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      if (selectedFolderId && selectedFolderId !== "all") {
        queryClient.invalidateQueries({
          queryKey: ["notes", { folderId: selectedFolderId }],
        });
      }

      const noteData = newNote?.data;
      const noteId = noteData?.id || newNote?.id;

      if (noteId) {
        setIsSuccess(true);
        setTimeout(() => {
          setProcessingType(null);
          setIsSuccess(false);
          router.push(`/note/${noteId}`);
        }, 1500);
      } else {
        console.error(
          "Failed to get new note ID for navigation from response:",
          newNote
        );
      }
    },
    onError: (error: Error) => {
      setProcessingType(null);
      Alert.alert(
        "Error",
        `Failed to create note: ${error.message || "Please try again."}`
      );
      console.error("Error creating note:", error);
    },
  });

  const handlePickFile = async (type: NoteType) => {
    setIsPicking(true);
    try {
      let pickerTypes: string[] = [];
      if (type === NoteType.PDF) {
        pickerTypes = [docTypes.pdf];
        setProcessingType("pdf");
      }
      if (type === NoteType.AUDIO) {
        pickerTypes = [docTypes.audio];
        setProcessingType("audio");
      }

      const [result] = await pick({
        type: pickerTypes,
        allowMultiSelection: false,
        mode: "import",
      });

      if (result) {
        const noteDto: CreateNoteDto = {
          noteType: type,
          file: {
            uri: result.uri || "",
            name: result.name || "upload",
            mimeType: result.type || "application/octet-stream",
            type: result.type || "application/octet-stream",
          },
          ...(selectedFolderId &&
            selectedFolderId !== "all" && { folderId: selectedFolderId }),
        };
        bottomSheetRef.current?.close();
        createNoteMutation.mutate(noteDto);
      }
    } catch (e: any) {
      if (!(e.code && e.code === "DOCUMENT_PICKER_CANCELED")) {
        setProcessingType(null);
        Alert.alert(
          "Error",
          `File selection/creation failed: ${e.message || "Unknown error"}`
        );
      }
    } finally {
      setIsPicking(false);
    }
  };

  const handleTakePhoto = async () => {
    setIsPicking(true);
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Camera permission is required to take photos."
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageAsset = result.assets[0];
        setProcessingType("image");

        const uriParts = imageAsset.uri.split(".");
        const fileType = uriParts[uriParts.length - 1];
        const mimeType = `image/${fileType}`;
        const fileName = imageAsset.uri.split("/").pop() || `photo.${fileType}`;

        const noteDto: CreateNoteDto = {
          noteType: NoteType.IMAGE,
          file: {
            uri: imageAsset.uri,
            name: fileName,
            mimeType: mimeType,
            type: mimeType,
          },
          ...(selectedFolderId &&
            selectedFolderId !== "all" && { folderId: selectedFolderId }),
        };
        bottomSheetRef.current?.close();
        createNoteMutation.mutate(noteDto);
      }
    } catch (e: any) {
      setProcessingType(null);
      Alert.alert(
        "Error",
        `Could not take photo: ${e.message || "Unknown error"}`
      );
    } finally {
      setIsPicking(false);
    }
  };

  // Define snap points for the bottom sheet
  const snapPoints = [1, 450]; // Increased size for the new option

  return (
    <>
      <CommonBottomSheet
        containerStyle={styles.bottomSheetContainer}
        ref={bottomSheetRef}
        visible={false}
        snapPoints={snapPoints}
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.handleIndicator}
      >
        <View style={styles.modalHeader}>
          <Text style={styles.modalHeaderText}>Create New Note</Text>
        </View>
        <View style={styles.modalContent}>
          {isRecording ? (
            <View style={styles.recordingContainer}>
              <Text style={styles.recordingTimer}>
                {formatDuration(recordingDuration)}
              </Text>
              <View style={styles.equalizerContainer}>
                {barAnimations.map((anim, index) => (
                  <Animated.View
                    key={index}
                    style={[
                      styles.equalizerBar,
                      {
                        transform: [
                          {
                            scaleY: anim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0.3, 1],
                            }),
                          },
                        ],
                      },
                    ]}
                  />
                ))}
              </View>
              <TouchableOpacity
                style={styles.stopButton}
                onPress={stopRecording}
              >
                <MaterialCommunityIcons
                  name="stop-circle"
                  size={64}
                  color="#d32f2f"
                />
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <ModalOptionButton
                onPress={() => handlePickFile(NoteType.PDF)}
                disabled={isPicking || createNoteMutation.isPending}
                icon={
                  <MaterialCommunityIcons
                    name="file-pdf-box"
                    size={24}
                    color="#d32f2f"
                    style={styles.modalOptionIcon}
                  />
                }
                label="Import PDF"
              />
              <ModalOptionButton
                onPress={() => handlePickFile(NoteType.AUDIO)}
                disabled={isPicking || createNoteMutation.isPending}
                icon={
                  <MaterialCommunityIcons
                    name="file-music-outline"
                    size={24}
                    color="#1976d2"
                    style={styles.modalOptionIcon}
                  />
                }
                label="Import Audio"
              />
              <ModalOptionButton
                onPress={startRecording}
                disabled={isPicking || createNoteMutation.isPending}
                icon={
                  <MaterialCommunityIcons
                    name="microphone"
                    size={24}
                    color="#2c3e50"
                    style={styles.modalOptionIcon}
                  />
                }
                label="Record Audio"
              />
              <ModalOptionButton
                onPress={() => {
                  bottomSheetRef.current?.close();
                  onAddYouTube();
                }}
                disabled={isPicking || createNoteMutation.isPending}
                icon={
                  <MaterialCommunityIcons
                    name="youtube"
                    size={24}
                    color="#ff0000"
                    style={styles.modalOptionIcon}
                  />
                }
                label="Add YouTube Video"
              />
              <ModalOptionButton
                onPress={handleTakePhoto}
                disabled={isPicking || createNoteMutation.isPending}
                icon={
                  <MaterialCommunityIcons
                    name="camera-outline"
                    size={24}
                    color="#9C27B0"
                    style={styles.modalOptionIcon}
                  />
                }
                label="Take Photo"
              />
            </>
          )}
        </View>
      </CommonBottomSheet>

      <ProcessingModal
        visible={!!processingType}
        type={processingType || "pdf"}
        isSuccess={isSuccess}
      />
    </>
  );
};

const styles = StyleSheet.create({
  bottomSheetContainer: {
    zIndex: 100,
  },
  bottomSheetBackground: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handleIndicator: {
    backgroundColor: "#E0E0E0",
    width: 40,
    height: 4,
    borderRadius: 2,
    marginTop: 10,
  },
  pressed: {
    opacity: 0.7,
  },
  modalHeader: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  modalHeaderText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1A1A1A",
    letterSpacing: 0.15,
  },
  modalContent: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: "#FFFFFF",
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    marginVertical: 4,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  modalOptionIcon: {
    marginRight: 16,
    width: 28,
    height: 28,
    textAlign: "center",
    lineHeight: 28,
  },
  modalOptionText: {
    fontSize: 16,
    color: "#2C3E50",
    fontWeight: "500",
    letterSpacing: 0.1,
  },
  recordingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
    backgroundColor: "#FFFFFF",
  },
  recordingTimer: {
    fontSize: 48,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 24,
    fontVariant: ["tabular-nums"],
    letterSpacing: 1,
  },
  equalizerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 100,
    gap: 6,
    marginBottom: 32,
  },
  equalizerBar: {
    width: 4,
    height: 60,
    backgroundColor: "#2C3E50",
    borderRadius: 4,
  },
  stopButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(211, 47, 47, 0.08)",
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  youtubeModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  youtubeModalContent: {
    width: "85%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  youtubeModalTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
    color: "#1A1A1A",
    letterSpacing: 0.15,
  },
  youtubeInput: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: "#F8F9FA",
  },
  youtubeButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  youtubeButtonText: {
    fontSize: 16,
    color: "#1976D2",
    fontWeight: "600",
    letterSpacing: 0.1,
  },
});

export default NoteOptionsModal;
