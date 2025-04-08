import firestore, {
  FirebaseFirestoreTypes,
} from "@react-native-firebase/firestore";
import {
  collection,
  query,
  where,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "@react-native-firebase/firestore";

// Collection references
const notesCollection = collection(firestore(), "notes");
const foldersCollection = collection(firestore(), "folders");

// Note types
export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  icon?: string;
  folderId?: string;
  userId: string;
}

export interface Folder {
  id: string;
  name: string;
  userId: string;
}

// Note operations
export const createNote = async (note: Omit<Note, "id">) => {
  const docRef = await addDoc(notesCollection, {
    ...note,
    createdAt: firestore.FieldValue.serverTimestamp(),
  });
  return { ...note, id: docRef.id };
};

export const getNotes = async (userId: string, folderId?: string) => {
  let q = query(notesCollection, where("userId", "==", userId));

  if (folderId) {
    q = query(q, where("folderId", "==", folderId));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
  })) as Note[];
};

export const updateNote = async (id: string, data: Partial<Note>) => {
  const docRef = doc(notesCollection, id);
  await updateDoc(docRef, data);
};

export const deleteNote = async (id: string) => {
  const docRef = doc(notesCollection, id);
  await deleteDoc(docRef);
};

// Folder operations
export const createFolder = async (folder: Omit<Folder, "id">) => {
  const docRef = await addDoc(foldersCollection, folder);
  return { ...folder, id: docRef.id };
};

export const getFolders = async (userId: string) => {
  const q = query(foldersCollection, where("userId", "==", userId));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Folder[];
};

export const updateFolder = async (id: string, data: Partial<Folder>) => {
  const docRef = doc(foldersCollection, id);
  await updateDoc(docRef, data);
};

export const deleteFolder = async (id: string) => {
  const docRef = doc(foldersCollection, id);
  await deleteDoc(docRef);
};
