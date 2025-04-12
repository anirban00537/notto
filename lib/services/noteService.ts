import request from "./request";

// Types
export interface Note {
  id: string;
  title: string;
  content: string;
  userId: string;
  folderId?: string;
  icon?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface CreateNoteDto {
  title: string;
  content: string;
  userId: string;
  folderId?: string;
  icon?: string;
}

// API Services
export const getAllNotes = async (userId: string, folderId?: string) => {
  const params = folderId ? { folderId } : {};
  const response = await request.get("/notes", { params });
  return response.data;
};

export const getNoteById = async (id: string) => {
  const response = await request.get(`/notes/${id}`);
  return response.data;
};

export const createNote = async (newNote: CreateNoteDto) => {
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
