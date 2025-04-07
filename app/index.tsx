import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import AuthComponent from "./auth";

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
}

export default function App() {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [notes, setNotes] = useState<Note[]>([
    {
      id: "1",
      title: "Welcome to Notto",
      content: "Start creating your notes here!",
      createdAt: new Date(),
    },
    {
      id: "2",
      title: "Meeting Notes",
      content: "Discuss project timeline",
      createdAt: new Date(),
    },
    {
      id: "3",
      title: "Shopping List",
      content: "Milk, eggs, bread",
      createdAt: new Date(),
    },
  ]);

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(setUser);
    return subscriber;
  }, []);

  if (!user) {
    return <AuthComponent />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Notes</Text>
        <TouchableOpacity onPress={() => auth().signOut()}>
          <MaterialCommunityIcons name="logout" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.noteCard}>
            <Text style={styles.noteTitle}>{item.title}</Text>
            <Text style={styles.noteContent} numberOfLines={2}>
              {item.content}
            </Text>
            <Text style={styles.noteDate}>
              {item.createdAt.toLocaleDateString()}
            </Text>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity style={styles.fab}>
        <MaterialCommunityIcons name="plus" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  noteCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  noteContent: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  noteDate: {
    fontSize: 12,
    color: "#999",
    textAlign: "right",
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#4285F4",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});
