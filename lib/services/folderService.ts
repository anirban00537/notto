import firestore from "@react-native-firebase/firestore";
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

export interface Folder {
  id: string;
  name: string;
  userId: string;
}

const foldersCollection = collection(firestore(), "folders");

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
