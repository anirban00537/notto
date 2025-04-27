import { useRef, useState, useEffect, useCallback } from "react";
import { ScrollView } from "react-native";
import { useRouter } from "expo-router";
import {
  getNoteById,
  generateLearningMaterials,
} from "../lib/services/noteService";

type ContentTab =
  | "note"
  | "transcript"
  | "chat"
  | "summary"
  | "quiz"
  | "flashcards";

interface IconProps {
  name: string;
  color: string;
  bgColor: string;
}

export interface NoteDetailHook {
  note: any;
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
}

export function useNoteDetail(noteId: string): NoteDetailHook {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const [note, setNote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeContentTab, setActiveContentTab] = useState<ContentTab>("note");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const fetchNote = useCallback(async () => {
    if (!noteId) return;
    setLoading(true);
    try {
      const data = await getNoteById(noteId);
      setNote(data?.data);
    } catch (e) {
      console.error("Error fetching note:", e);
      setNote(null);
    } finally {
      setLoading(false);
    }
  }, [noteId]);

  useEffect(() => {
    fetchNote();
  }, [noteId, fetchNote]);

  const getIconProps = (iconType?: string): IconProps => {
    switch (iconType) {
      case "pdf":
        return { name: "file-pdf-box", color: "#D32F2F", bgColor: "#FFEBEE" };
      case "audio":
        return {
          name: "file-music-outline",
          color: "#1976D2",
          bgColor: "#E3F2FD",
        };
      case "youtube":
        return { name: "youtube", color: "#FF0000", bgColor: "#FFEBEE" };
      case "palette":
        return { name: "palette", color: "#EB6C3E", bgColor: "#FFF5EC" };
      default:
        return { name: "note-text-outline", color: "#888", bgColor: "#f0f0f0" };
    }
  };

  const handleTabPress = (tab: ContentTab) => {
    setActiveContentTab(tab);
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleOptionsPress = () => console.log("Options pressed");
  const handleNoteToolsPress = () => console.log("Note Tools pressed");
  const handleEditNotePress = () => console.log("Edit Note pressed");
  const handleBackPress = () => router.back();

  const handleGenerateMaterials = async () => {
    if (!noteId) return;
    setIsGenerating(true);
    setGenerationError(null);
    try {
      const updatedNoteData = await generateLearningMaterials(noteId);
      // Update note state directly with the response data
      if (updatedNoteData && updatedNoteData.data) {
        setNote(updatedNoteData.data);
      }
    } catch (error) {
      console.error("Error generating learning materials:", error);
      setGenerationError("Failed to generate materials. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const iconProps = getIconProps(note?.noteType || note?.icon);

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
  };
}
