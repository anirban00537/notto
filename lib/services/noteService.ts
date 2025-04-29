import request from "./request";
import { Note, NoteType, NoteStatus, CreateNoteDto } from "../types/note";

// API Services
export const getAllNotes = async (params?: {
  page?: number;
  folderId?: string;
  limit?: number; // Optional limit, defaults on backend
}) => {
  const queryParams = new URLSearchParams();
  if (params?.page) {
    queryParams.append("page", params.page.toString());
  }
  if (params?.limit) {
    // Backend defaults to 10, only send if explicitly provided
    queryParams.append("limit", params.limit.toString());
  }
  if (params?.folderId && params.folderId !== "all") {
    // Assuming the backend expects 'folderId' query param for filtering
    queryParams.append("folderId", params.folderId);
  }

  const queryString = queryParams.toString();
  const url = `/notes${queryString ? `?${queryString}` : ""}`;

  console.log(`Fetching notes from URL: ${url}`); // Log the URL being requested

  const response = await request.get(url);
  return response.data; // Assuming response.data matches NotesApiResponse structure
};

export const getNoteById = async (id: string) => {
  const response = await request.get(`/notes/${id}`);
  return response.data;
};

export const createNote = async (newNote: CreateNoteDto) => {
  // If file is present, use FormData for multipart upload
  if (newNote.file) {
    const formData = new FormData();
    formData.append("noteType", newNote.noteType);
    if (newNote.youtubeUrl) formData.append("youtubeUrl", newNote.youtubeUrl);
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
    });
    return response.data;
  }
  // Default (fallback)
  const response = await request.post("/notes", newNote);
  return response.data;
};

export const updateNote = async (
  id: string,
  updateData: Partial<CreateNoteDto>
) => {
  const response = await request.put(`/notes/${id}`, updateData);
  return response.data;
};

export const deleteNote = async (id: string) => {
  await request.delete(`/notes/${id}`);
};

export const generateLearningMaterials = async (id: string) => {
  const response = await request.post(`/notes/generate-materials/${id}`);
  console.log("Generated materials response:", response.data); // Log the response as requested
  return response.data;
};
