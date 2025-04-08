import firestore from "@react-native-firebase/firestore";

// Collection references
const notesCollection = firestore().collection("notes");
const foldersCollection = firestore().collection("folders");

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
  const docRef = await notesCollection.add({
    ...note,
    createdAt: firestore.FieldValue.serverTimestamp(),
  });
  return { ...note, id: docRef.id };
};

export const getNotes = async (userId: string, folderId?: string) => {
  let query = notesCollection.where("userId", "==", userId);

  if (folderId) {
    query = query.where("folderId", "==", folderId);
  }

  const snapshot = await query.get();
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
  })) as Note[];
};

export const updateNote = async (id: string, data: Partial<Note>) => {
  await notesCollection.doc(id).update(data);
};

export const deleteNote = async (id: string) => {
  await notesCollection.doc(id).delete();
};

// Folder operations
export const createFolder = async (folder: Omit<Folder, "id">) => {
  const docRef = await foldersCollection.add(folder);
  return { ...folder, id: docRef.id };
};

export const getFolders = async (userId: string) => {
  const snapshot = await foldersCollection.where("userId", "==", userId).get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Folder[];
};

export const updateFolder = async (id: string, data: Partial<Folder>) => {
  await foldersCollection.doc(id).update(data);
};

export const deleteFolder = async (id: string) => {
  await foldersCollection.doc(id).delete();
};
