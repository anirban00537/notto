import request from "./request";
import { Note, NoteType, NoteStatus, CreateNoteDto } from "../types/note";


// API Services
export const getAllNotes = async (folderId?: string) => {
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
