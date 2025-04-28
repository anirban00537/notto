import React, { useState, useRef } from "react";
import { View, Text, StyleSheet, Alert, Platform, Modal, TextInput, ActivityIndicator, Pressable, Animated } from "react-native";
import { pick, types as docTypes } from '@react-native-documents/picker';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import CommonBottomSheet from './CommonBottomSheet';
import { router } from "expo-router";
import { useUser } from "../app/context/UserContext";
import { createNote } from "../lib/services";
import { CreateNoteDto, NoteType, NoteStatus } from "../lib/types/note";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface NoteOptionsModalProps {
  bottomSheetRef: React.RefObject<any>;
  onAddYouTube: () => void;
}

type ModalOptionButtonProps = {
  onPress: () => void;
  disabled?: boolean;
  icon: React.ReactNode;
  label: string;
};

const ModalOptionButton: React.FC<ModalOptionButtonProps> = ({ onPress, disabled, icon, label }) => {
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

  const createNoteMutation = useMutation({
    mutationFn: createNote,
    onSuccess: (newNote) => {
      console.log('Note created:', newNote);
      bottomSheetRef.current?.close();
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      // Support both {id} and {data: {id}}
      const noteId = newNote?.data?.id;
      if (noteId) {
        router.push(`/note/${noteId}`);
      }
    },
    onError: (error) => {
      Alert.alert("Error", "Failed to create note. Please try again.");
      console.error("Error creating note:", error);
    },
  });

  const handlePickFile = async (type: NoteType) => {
    setIsPicking(true);
    try {
      let pickerTypes: string[] = [];
      if (type === NoteType.PDF) pickerTypes = [docTypes.pdf];
      if (type === NoteType.AUDIO) pickerTypes = [docTypes.audio];
      const [result] = await pick({
        type: pickerTypes,
        allowMultiSelection: false,
        mode: 'import',
      });
      if (result) {
        const noteDto: CreateNoteDto = {
          noteType: type,
          file: {
            uri: result.uri || '',
            name: result.name || 'upload',
            mimeType: result.type || 'application/octet-stream',
            type: result.type || 'application/octet-stream',
          },
        };
        createNoteMutation.mutate(noteDto);
      }
    } catch (e) {
      Alert.alert("Error", "File selection failed.");
    } finally {
      setIsPicking(false);
    }
  };

  // Define snap points for the bottom sheet
  const snapPoints = [1, 320]; // 1px (closed), 320px (open)

  return (
    <CommonBottomSheet
      ref={bottomSheetRef}
      visible={false} // controlled by parent via ref
      snapPoints={snapPoints}
      backgroundStyle={{ backgroundColor: '#fff' }}
      handleIndicatorStyle={{ backgroundColor: '#ccc' }}
    >
      <View style={styles.modalHeader}>
          <Text style={styles.modalHeaderText}>Create New Note</Text>
        </View>
        <View style={styles.modalContent}>
          <ModalOptionButton
            onPress={() => handlePickFile(NoteType.PDF)}
            disabled={isPicking}
            icon={<MaterialCommunityIcons
              name="file-pdf-box"
              size={24}
              color="#d32f2f"
              style={styles.modalOptionIcon}
            />}
            label="Import PDF"
          />
          <ModalOptionButton
            onPress={() => handlePickFile(NoteType.AUDIO)}
            disabled={isPicking}
            icon={<MaterialCommunityIcons
              name="file-music-outline"
              size={24}
              color="#1976d2"
              style={styles.modalOptionIcon}
            />}
            label="Import Audio"
          />
          <ModalOptionButton
            onPress={onAddYouTube}
            disabled={isPicking}
            icon={<MaterialCommunityIcons
              name="youtube"
              size={24}
              color="#ff0000"
              style={styles.modalOptionIcon}
            />}
            label="Add YouTube Video"
          />
        </View>
    </CommonBottomSheet>
  );
};

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.7,
  },
  modalHeader: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    alignItems: "center",
    backgroundColor: "#fff",
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
