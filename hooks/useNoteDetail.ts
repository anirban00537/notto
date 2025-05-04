import { useRef, useState, useEffect, useCallback } from "react";
import { ScrollView } from "react-native";
import { useRouter } from "expo-router";
import {
  getNoteById,
  generateLearningMaterials,
  deleteNote,
} from "../lib/services/noteService";
import { Note } from "../lib/types/note";
import { ApiResponse } from "../lib/types/response";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export type ContentTab =
  | "note"
  | "transcript"
  | "summary"
  | "quiz"
  | "flashcards";

interface IconProps {
  name: string;
  color: string;
  bgColor: string;
}

export interface NoteDetailHook {
  note: Note | null;
  loading: boolean;
  activeContentTab: ContentTab;
  scrollViewRef: React.RefObject<ScrollView>;
  iconProps: IconProps;
  handleTabPress: (tab: ContentTab) => void;
  handleOptionsPress: () => void;
  handleNoteToolsPress: () => void;
  handleEditNotePress: () => void;
  handleBackPress: () => void;
  isGenerating: boolean;
  generationError: string | null;
  handleGenerateMaterials: () => Promise<void>;
  handleDeleteNote: () => Promise<void>;
}

export function useNoteDetail(noteId: string): NoteDetailHook {
  const router = useRouter();
  const queryClient = useQueryClient();
  const scrollViewRef = useRef<ScrollView>(null);
  const [activeContentTab, setActiveContentTab] = useState<ContentTab>("note");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Query for fetching note details
  const { data: note, isLoading: loading } = useQuery({
    queryKey: ["note", noteId],
    queryFn: async () => {
      const response = await getNoteById(noteId);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    },
  });

  // Delete note mutation
  const deleteMutation = useMutation({
    mutationFn: deleteNote,
    onSuccess: () => {
      // Invalidate and refetch notes list
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      router.back();
    },
  });

  const handleDeleteNote = async () => {
    await deleteMutation.mutateAsync(noteId);
  };

  const handleBackPress = () => {
    router.back();
  };

  const handleOptionsPress = () => {
    // Implement options menu functionality
  };

  const handleTabPress = (tab: ContentTab) => {
    setActiveContentTab(tab);
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleNoteToolsPress = () => {
    // Implement note tools functionality
  };

  const handleEditNotePress = () => {
    // Implement edit note functionality
  };

  const handleGenerateMaterials = async () => {
    if (!noteId) return;
    setIsGenerating(true);
    setGenerationError(null);
    try {
      const response = await generateLearningMaterials(noteId);
      if (!response.success) {
        throw new Error(response.message);
      }
      // Implement materials generation
    } catch (error: any) {
      console.error("Error generating learning materials:", error);
      setGenerationError(
        error.message || "Failed to generate materials. Please try again."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Get icon properties based on note type
  const iconProps = {
    name: note?.noteType || "note-text",
    color: "#4285F4",
    bgColor: "#E8F0FE",
  };

  return {
    note,
    loading,
    activeContentTab,
    scrollViewRef,
    iconProps,
    handleTabPress,
    handleOptionsPress,
    handleNoteToolsPress,
    handleEditNotePress,
    handleBackPress,
    isGenerating,
    generationError,
    handleGenerateMaterials,
    handleDeleteNote,
  };
}
