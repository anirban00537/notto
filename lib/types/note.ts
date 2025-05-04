export enum NoteType {
  PDF = "pdf",
  AUDIO = "audio",
  YOUTUBE = "youtube",
  TEXT = "text",
  IMAGE = "image",
}

export enum NoteStatus {
  ACTIVE = "active",
  ARCHIVED = "archived",
  DELETED = "deleted",
  DRAFT = "draft",
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

export interface Quiz {
  id: string;
  questions: Question[];
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface StudyNote {
  id: string;
  title: string;
  content: string;
  keyPoints?: string[];
  references?: string[];
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface BaseNote {
  id?: string;
  userId: string;
  title: string;
  description?: string;
  noteType: NoteType;
  tags?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FileNote extends BaseNote {
  fileName: string;
  fileSize: number;
  mimeType: string;
  url: string;
  duration?: number;
}

export interface TextNote extends BaseNote {
  content: string;
}

export interface Note {
  id: string;
  title: string;
  noteType: string;
  createdAt: Date;
  updatedAt: Date;
  sourceUrl?: string;
  note?: string;
  fullText?: string;
  summary?: string;
  quizzes?: Quiz[];
  flashcards?: Flashcard[];
}

export interface CreateNoteDto {
  noteType: string;
  title?: string;
  content?: string;
  youtubeUrl?: string;
  file?: {
    uri: string;
    name?: string;
    type?: string;
    mimeType?: string;
  };
  folderId?: string;
}
