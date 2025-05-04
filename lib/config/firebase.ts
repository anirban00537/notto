import firestore from "@react-native-firebase/firestore";
import storage from "@react-native-firebase/storage";
import auth from "@react-native-firebase/auth";

export const db = firestore();
export const storageInstance = storage();
export const authInstance = auth();

export default {
  db,
  storage: storageInstance,
  auth: authInstance,
};
