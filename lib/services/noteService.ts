import request from "./request";
import { Note, NoteType, NoteStatus, CreateNoteDto } from "@/lib/types/note";
import { ApiResponse } from "@/lib/types/response";
import firestore, {
  FirebaseFirestoreTypes,
} from "@react-native-firebase/firestore";

// API Services
export const getAllNotes = async (params?: {
  page?: number;
  folderId?: string;
  limit?: number;
  userId: string;
  lastVisible?: FirebaseFirestoreTypes.QueryDocumentSnapshot;
}): Promise<
  ApiResponse<{
    notes: Note[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalNotes: number;
      limit: number;
      lastVisible?: FirebaseFirestoreTypes.QueryDocumentSnapshot;
    };
  }>
> => {
  try {
    const pageLimit = params?.limit || 10;
    const currentPage = params?.page || 1;

    // Build query
    let notesQuery = firestore()
      .collection("notes")
      .where("userId", "==", params?.userId)
      .orderBy("createdAt", "desc");

    if (params?.folderId && params.folderId !== "all") {
      notesQuery = notesQuery.where("folderId", "==", params.folderId);
    }

    // Get total count
    const totalCount = await notesQuery.count().get();
    const totalNotes = totalCount.data().count;
    const totalPages = Math.ceil(totalNotes / pageLimit);

    // Add pagination
    if (params?.lastVisible) {
      notesQuery = notesQuery.startAfter(params.lastVisible);
    }

    // Get paginated results
    const snapshot = await notesQuery.limit(pageLimit).get();

    const notes = snapshot.docs.map(
      (doc: FirebaseFirestoreTypes.QueryDocumentSnapshot) => ({
        id: doc.id,
        ...doc.data(),
      })
    ) as Note[];

    // Get the last visible document for next pagination
    const lastVisible = snapshot.docs[snapshot.docs.length - 1];

    return {
      success: true,
      message: "Notes retrieved successfully",
      data: {
        notes,
        pagination: {
          currentPage,
          totalPages,
          totalNotes,
          limit: pageLimit,
          lastVisible,
        },
      },
    };
  } catch (error: any) {
    return {
      success: false,
      message: "Failed to retrieve notes",
      error: error.message,
    };
  }
};

export const getNoteById = async (id: string): Promise<ApiResponse<Note>> => {
  try {
    const noteDoc = await firestore().collection("notes").doc(id).get();

    if (!noteDoc.exists) {
      return {
        success: false,
        message: "Note not found",
      };
    }

    return {
      success: true,
      message: "Note retrieved successfully",
      data: { id: noteDoc.id, ...noteDoc.data() } as Note,
    };
  } catch (error: any) {
    return {
      success: false,
      message: "Failed to retrieve note",
      error: error.message,
    };
  }
};

export const createNote = async (
  newNote: CreateNoteDto
): Promise<ApiResponse<Note>> => {
  // If file is present, use FormData for multipart upload
  if (newNote.file) {
    const formData = new FormData();
    formData.append("noteType", newNote.noteType);
    if (newNote.youtubeUrl) formData.append("youtubeUrl", newNote.youtubeUrl);
    if (newNote.folderId) formData.append("folderId", newNote.folderId);
    formData.append("file", {
      uri: newNote.file.uri,
      name: newNote.file.name || "upload",
      type:
        newNote.file.mimeType ||
        newNote.file.type ||
        "application/octet-stream",
    } as any);
    const response = await request.post("/notes", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  }
  // If YouTube URL is present
  if (newNote.youtubeUrl) {
    const response = await request.post("/notes", {
      noteType: newNote.noteType,
      youtubeUrl: newNote.youtubeUrl,
      folderId: newNote.folderId,
    });
    return response.data;
  }
  // Default (fallback)
  const response = await request.post("/notes", newNote);
  return response.data;
};

export const updateNote = async (
  id: string,
  updateData: Partial<Note>
): Promise<ApiResponse<Note>> => {
  try {
    const noteRef = firestore().collection("notes").doc(id);
    await noteRef.update({
      ...updateData,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });

    const updatedDoc = await noteRef.get();
    return {
      success: true,
      message: "Note updated successfully",
      data: { id: updatedDoc.id, ...updatedDoc.data() } as Note,
    };
  } catch (error: any) {
    return {
      success: false,
      message: "Failed to update note",
      error: error.message,
    };
  }
};

export const deleteNote = async (id: string): Promise<ApiResponse<void>> => {
  try {
    await firestore().collection("notes").doc(id).delete();
    return {
      success: true,
      message: "Note deleted successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      message: "Failed to delete note",
      error: error.message,
    };
  }
};

export const generateLearningMaterials = async (
  id: string
): Promise<ApiResponse<void>> => {
  try {
    // Call the API to generate materials
    const response = await request.post(`/notes/generate-materials/${id}`);
    return {
      success: response.data.success,
      message:
        response.data.message || "Learning materials generated successfully",
    };
  } catch (error: any) {
    console.error("Error generating learning materials:", error);
    return {
      success: false,
      message: "Failed to generate learning materials",
      error: error.message,
    };
  }
};
