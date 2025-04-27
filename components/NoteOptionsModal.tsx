import React, { useState, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform, Modal, TextInput, ActivityIndicator } from "react-native";
import { pick, types as docTypes } from '@react-native-documents/picker';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Modalize } from "react-native-modalize";
import { router } from "expo-router";
import { useUser } from "../app/context/UserContext";
import { createNote } from "../lib/services";
import { CreateNoteDto, NoteType, NoteStatus } from "../lib/types/note";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface NoteOptionsModalProps {
  modalRef: React.RefObject<Modalize>;
  onAddYouTube: () => void;
}

const NoteOptionsModal: React.FC<NoteOptionsModalProps> = ({
  modalRef,
  onAddYouTube,
}) => {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [isPicking, setIsPicking] = useState(false);


  const createNoteMutation = useMutation({
    mutationFn: createNote,
    onSuccess: (newNote) => {
      console.log('Note created:', newNote);
      modalRef.current?.close();
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

  return (
    <Modalize
      ref={modalRef}
      adjustToContentHeight
      HeaderComponent={
        <View style={styles.modalHeader}>
          <Text style={styles.modalHeaderText}>Create New Note</Text>
        </View>
      }
    >
      <View style={styles.modalContent}>
        <TouchableOpacity
          style={styles.modalOption}
          onPress={() => handlePickFile(NoteType.PDF)}
          disabled={isPicking}
        >
          <MaterialCommunityIcons
            name="file-pdf-box"
            size={24}
            color="#d32f2f"
            style={styles.modalOptionIcon}
          />
          <Text style={styles.modalOptionText}>Import PDF</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.modalOption}
          onPress={() => handlePickFile(NoteType.AUDIO)}
          disabled={isPicking}
        >
          <MaterialCommunityIcons
            name="file-music-outline"
            size={24}
            color="#1976d2"
            style={styles.modalOptionIcon}
          />
          <Text style={styles.modalOptionText}>Import Audio</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.modalOption}
          onPress={onAddYouTube}
          disabled={isPicking}
        >
          <MaterialCommunityIcons
            name="youtube"
            size={24}
            color="#ff0000"
            style={styles.modalOptionIcon}
          />
          <Text style={styles.modalOptionText}>Add YouTube Video</Text>
        </TouchableOpacity>
      </View>

    </Modalize>
  );
};

const styles = StyleSheet.create({
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
