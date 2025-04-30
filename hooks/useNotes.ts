import { useState, useRef } from "react";
import {
  useInfiniteQuery,
  useQueryClient,
  useMutation,
  InfiniteData
} from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { getAllNotes, createNote } from "../lib/services/noteService";
import { CreateNoteDto, Note, NoteType } from "../lib/types/note";
import { Alert } from "react-native";

// Define the API response structure
interface NotesApiResponse {
  message: string;
  data: Note[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalNotes: number;
    limit: number;
  };
}

interface CreateNoteResponse {
  data?: Note;
  id?: string;
  noteType?: NoteType;
}

export function useNotes(userId: string | undefined, folderId: string) {
  const [youtubeModalVisible, setYoutubeModalVisible] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [youtubeLoading, setYoutubeLoading] = useState(false);
  const [youtubeSuccess, setYoutubeSuccess] = useState(false);
  const youtubeBottomSheetRef = useRef<any>(null);
  const queryClient = useQueryClient();
  const router = useRouter();

  // Fetching Notes Query using useInfiniteQuery
  const {
    data,
    isLoading: isNotesLoading,
    isError: isNotesError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery<NotesApiResponse, Error, InfiniteData<NotesApiResponse, unknown>, readonly [string, { userId: string | undefined; folderId: string; }], number>({
    queryKey: ["notes", { userId, folderId }],
    queryFn: async (context) => {
      const pageParam = context.pageParam as number;
      const limit = 6; // Set the desired limit for notes per page
      console.log(
        `Fetching notes page: ${pageParam}, limit: ${limit} for userId: ${userId}, folderId: ${folderId}`
      );
      const response = await getAllNotes({ page: pageParam, folderId, limit });
      console.log(
        `Data received for page ${pageParam}:`,
        JSON.stringify(
          response.data.map((note: Note) => note.id),
          null,
          2
        )
      );
      return response; // Expecting the response structure: { data: Note[], pagination: {...} }
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.currentPage < lastPage.pagination.totalPages) {
        return lastPage.pagination.currentPage + 1;
      }
      return undefined; // No more pages
    },
    initialPageParam: 1,
    enabled: !!userId,
    refetchOnWindowFocus: false,
    structuralSharing: false,
  });

  // Flatten the pages data into a single array of notes
  const notes = data?.pages.flatMap((page: NotesApiResponse) => page.data) ?? [];

  // Create Note Mutation
  const createNoteMutation = useMutation<
    CreateNoteResponse,
    Error,
    CreateNoteDto
  >({
    mutationFn: (newNoteData: CreateNoteDto): Promise<CreateNoteResponse> => createNote(newNoteData),
    onSuccess: (newNoteResponse: CreateNoteResponse) => {
      console.log("Note creation successful:", newNoteResponse);
      // Invalidate the infinite notes query to refetch from page 1
      queryClient.invalidateQueries({
        queryKey: ["notes", { userId, folderId }],
      });

      const noteData = newNoteResponse?.data;
      const noteId = noteData?.id ?? newNoteResponse?.id;

      const noteType = noteData?.noteType || newNoteResponse?.noteType;
      if (noteType === NoteType.YOUTUBE) {
        // Reset state and maybe show success briefly before closing modal
        setYoutubeSuccess(true);
        setTimeout(() => {
          setYoutubeSuccess(false);
          setYoutubeLoading(false);
          setYoutubeModalVisible(false);
          setYoutubeUrl("");
          if (noteId) {
            router.push(`/note/${noteId}`);
          }
        }, 1500);
      } else if (noteId) {
        // For PDF/Audio, navigate immediately after success is shown in NoteOptionsModal
        // The processing modal in NoteOptionsModal handles the success display
        // Navigation is triggered from there after a delay
      } else {
        console.error(
          "Failed to get new note ID for navigation from response:",
          newNoteResponse
        );
      }
    },
    onError: (error: any) => {
      console.error("Error creating note:", error);
      Alert.alert("Error", error.message || "Failed to create note");
      // Ensure loading state is reset even on error
      const variables = (createNoteMutation.error?.cause as any)?.variables as
        | CreateNoteDto
        | undefined;
      if (variables?.noteType === NoteType.YOUTUBE) {
        setYoutubeLoading(false);
        setYoutubeSuccess(false); // Ensure success state is reset on error
        // Decide if you want to keep modal open or close on error
      }
      // PDF/Audio errors are handled in NoteOptionsModal
    },
  });

  // Handlers for YouTube Modal
  const handleAddYouTube = () => {
    setYoutubeUrl("");
    setYoutubeModalVisible(true);
  };

  const handleCloseYouTubeModal = () => {
    setYoutubeModalVisible(false);
    setYoutubeUrl("");
  };

  const handleSubmitYouTube = async () => {
    if (!youtubeUrl) return;
    setYoutubeLoading(true);
    setYoutubeSuccess(false); // Reset success state on new submission
    try {
      const noteDto: CreateNoteDto = {
        noteType: NoteType.YOUTUBE,
        youtubeUrl: youtubeUrl,
      };
      // Use the mutation to create the note
      createNoteMutation.mutate(noteDto);
    } catch (error: any) {
      // This catch might not be necessary if mutation handles errors
      Alert.alert("Error", error.message || "Failed to submit YouTube note");
      setYoutubeLoading(false);
    }
  };

  return {
    notes, // Use the flattened notes array
    isNotesLoading,
    isNotesError,
    // YouTube Modal State & Handlers
    youtubeModalVisible,
    youtubeUrl,
    youtubeLoading,
    youtubeSuccess,
    setYoutubeUrl,
    handleAddYouTube,
    handleCloseYouTubeModal,
    handleSubmitYouTube,
    // Pagination handlers
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetchNotes: refetch, // Use refetch from useInfiniteQuery
  } satisfies {
    notes: Note[];
    isNotesLoading: boolean;
    isNotesError: boolean;
    youtubeModalVisible: boolean;
    youtubeUrl: string;
    youtubeLoading: boolean;
    youtubeSuccess: boolean;
    setYoutubeUrl: (url: string) => void;
    handleAddYouTube: () => void;
    handleCloseYouTubeModal: () => void;
    handleSubmitYouTube: () => void;
    fetchNextPage: () => void;
    hasNextPage: boolean | undefined;
    isFetchingNextPage: boolean;
    refetchNotes: () => void;
  };
}
