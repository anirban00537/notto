import { Flashcard as NoteFlashcard } from "../types/note";

export interface UIFlashcard {
  question: string;
  answer: string;
  hints: string[];
}

export function mapNoteFlashcardsToUIFlashcards(
  flashcards: (NoteFlashcard | UIFlashcard)[]
): UIFlashcard[] {
  return flashcards.map((flashcard) => {
    // If the flashcard already has the correct structure (question, answer, hints)
    if (
      "question" in flashcard &&
      "answer" in flashcard &&
      "hints" in flashcard
    ) {
      return flashcard as UIFlashcard;
    }

    // Otherwise, map from the Note flashcard structure
    const noteFlashcard = flashcard as NoteFlashcard;
    return {
      question: noteFlashcard.front,
      answer: noteFlashcard.back,
      hints: [], // Since the original flashcard doesn't have hints
    };
  });
}
