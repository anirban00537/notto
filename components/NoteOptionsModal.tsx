import React, { useState, useRef } from "react";
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

interface NoteOptionsModalProps {
  bottomSheetRef: React.RefObject<any>;
  onAddYouTube: () => void;
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
}) => {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [isPicking, setIsPicking] = useState(false);
  const [processingType, setProcessingType] = useState<
    "pdf" | "audio" | "youtube" | "image" | null
  >(null);
  const [isSuccess, setIsSuccess] = useState(false);

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
        quality: 0.5, // Reduce quality to save space/upload time
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageAsset = result.assets[0];
        setProcessingType("image");

        // Determine filename and type
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
  const snapPoints = [1, 380]; // Increased size for the new option

  return (
    <>
      <CommonBottomSheet
        containerStyle={styles.bottomSheetContainer}
        ref={bottomSheetRef}
        visible={false}
        snapPoints={snapPoints}
        backgroundStyle={{ backgroundColor: "rgba(240, 247, 255, 0.95)" }}
        handleIndicatorStyle={{ backgroundColor: "#ccc" }}
      >
        <View style={styles.modalHeader}>
          <Text style={styles.modalHeaderText}>Create New Note</Text>
        </View>
        <View style={styles.modalContent}>
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
                color="#9C27B0" // Purple color
                style={styles.modalOptionIcon}
              />
            }
            label="Take Photo"
          />
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
  pressed: {
    opacity: 0.7,
  },
  modalHeader: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    alignItems: "center",
    backgroundColor: "rgba(240, 247, 255, 0.95)",
  },
  modalHeaderText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  modalContent: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
  },
  modalOptionIcon: {
    marginRight: 16,
  },
  modalOptionText: {
    fontSize: 16,
    color: "#333",
  },
  youtubeModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  youtubeModalContent: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  youtubeModalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#333",
  },
  youtubeInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginBottom: 16,
    fontSize: 16,
  },
  youtubeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  youtubeButtonText: {
    fontSize: 16,
    color: "#1976d2",
    fontWeight: "600",
  },
});

export default NoteOptionsModal;
