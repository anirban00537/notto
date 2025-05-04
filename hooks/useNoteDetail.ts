import { useRef, useState, useEffect, useCallback } from "react";
import { ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import {
  getNoteById,
  generateLearningMaterials,
  deleteNote,
} from "../lib/services/noteService";
import { Note } from "../lib/types/note";
import { ApiResponse } from "../lib/types/response";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TabName } from "../components/ContentTabs";

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
  activeTab: TabName;
  scrollViewRef: React.RefObject<ScrollView>;
  iconProps: IconProps;
  handleTabPress: (tab: TabName) => void;
  handleSwipeChange: (tab: TabName) => void;
  handleOptionsPress: () => void;
  handleNoteToolsPress: () => void;
  handleEditNotePress: () => void;
  handleBackPress: () => void;
  isGenerating: boolean;
  generationError: string | null;
  handleGenerateMaterials: () => Promise<void>;
  handleDeleteNote: () => Promise<void>;
  onDelete: () => Promise<void>;
}

export function useNoteDetail(noteId: string): NoteDetailHook {
  const router = useRouter();
  const queryClient = useQueryClient();
  const scrollViewRef = useRef<ScrollView>(null);
  const [activeContentTab, setActiveContentTab] = useState<ContentTab>("note");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Query for fetching note details
  const {
    data: note,
    isLoading: loading,
    refetch,
  } = useQuery<Note, Error>({
    queryKey: ["note", noteId],
    queryFn: async (): Promise<Note> => {
      const response = await getNoteById(noteId);
      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch note");
      }
      return response.data;
    },
  });
  console.log("note", note);

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

  const onDelete = async () => {
    try {
      await handleDeleteNote();
      router.back();
    } catch (error) {
      console.error("Error deleting note:", error);
      Alert.alert("Error", "Failed to delete note. Please try again.");
    }
  };

  const handleBackPress = () => {
    router.back();
  };

  const handleOptionsPress = () => {
    // Implement options menu functionality
  };

  const handleTabPress = (tab: TabName) => {
    setActiveContentTab(tab as ContentTab);
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleSwipeChange = (tab: TabName) => {
    handleTabPress(tab);
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
      // Refetch note details after successful generation
      queryClient.invalidateQueries({ queryKey: ["note", noteId] });
      await refetch();
      console.log("Materials generated and note refetched");
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
  const iconProps: IconProps = {
    name: "note-text-outline" as any,
    color: "#2c3e50",
    bgColor: "#f5f7fa",
  };

  // Show error alert if generation fails
  useEffect(() => {
    if (generationError) {
      Alert.alert("Generation Error", generationError);
    }
  }, [generationError]);

  return {
    note: note || null,
    loading,
    activeTab: activeContentTab as TabName,
    scrollViewRef,
    iconProps,
    handleTabPress,
    handleSwipeChange,
    handleOptionsPress,
    handleNoteToolsPress,
    handleEditNotePress,
    handleBackPress,
    isGenerating,
    generationError,
    handleGenerateMaterials,
    handleDeleteNote,
    onDelete,
  };
}
