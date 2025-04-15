export enum NoteType {
  PDF = 'pdf',
  AUDIO = 'audio',
  YOUTUBE = 'youtube',
  TEXT = 'text'
}

export enum NoteStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  DELETED = 'deleted',
  DRAFT = 'draft'
}

export interface Flashcard {
  question: string;
  answer: string;
  hints?: string[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

export interface Quiz {
  title: string;
  questions: QuizQuestion[];
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
  userId: string;
  folderId?: string;
  folder?: string;
  title: string;
  description?: string;
  noteType: NoteType;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  url?: string;
  duration?: number;
  status: NoteStatus;
  studyNote?: StudyNote;
  flashcards?: Flashcard[];
  quizzes?: Quiz[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  metadata?: Record<string, any>;
  tags?: string[];
  isPublic?: boolean;
  collaborators?: string[];
  version?: number;
  lastEditedBy?: string;
}

export interface CreateNoteDto extends Partial<Note> {
  userId: string;
  title: string;
  noteType: NoteType;
  status?: NoteStatus;
}