import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import AuthComponent from "./auth";

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  icon?: string;
}

export default function App() {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [activeTab, setActiveTab] = useState<"notes" | "folders">("notes");
  const [notes, setNotes] = useState<Note[]>([
    {
      id: "1",
      title: "Top UI Kits for Modern App Development",
      content:
        "In this video, the speaker emphasizes the importance of modern UI design...",
      createdAt: new Date(2025, 3, 3),
      icon: "palette",
    },
  ]);

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(setUser);
    return subscriber;
  }, []);

  if (!user) {
    return <AuthComponent />;
  }

  const renderNoteIcon = (icon?: string) => {
    if (icon === "palette") {
      return (
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="palette" size={24} color="#EB6C3E" />
        </View>
      );
    }
    return null;
  };

  const formatDate = (date: Date) => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${months[date.getMonth()]} ${date.getDate()} ${date.getFullYear()}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notto</Text>
        <TouchableOpacity style={styles.proButton}>
          <MaterialCommunityIcons name="rocket" size={16} color="#fff" />
          <Text style={styles.proText}>PRO</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.profileButton}>
          <MaterialCommunityIcons name="account" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "notes" && styles.activeTab]}
          onPress={() => setActiveTab("notes")}
        >
          <MaterialCommunityIcons
            name="pencil"
            size={18}
            color={activeTab === "notes" ? "#000" : "#888"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "notes" && styles.activeTabText,
            ]}
          >
            All Notes
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "folders" && styles.activeTab]}
          onPress={() => setActiveTab("folders")}
        >
          <MaterialCommunityIcons
            name="folder-outline"
            size={18}
            color={activeTab === "folders" ? "#000" : "#888"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "folders" && styles.activeTabText,
            ]}
          >
            Folders
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Notes</Text>

      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.noteCard}>
            {renderNoteIcon(item.icon)}
            <View style={styles.noteContent}>
              <Text style={styles.noteTitle}>{item.title}</Text>
              <Text style={styles.notePreview} numberOfLines={1}>
                {item.content}
              </Text>
            </View>
            <Text style={styles.noteDate}>{formatDate(item.createdAt)}</Text>
          </TouchableOpacity>
        )}
      />

      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.recordButton}>
          <MaterialCommunityIcons name="record" size={24} color="#f44336" />
          <Text style={styles.recordButtonText}>Record</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.newNoteButton}>
          <MaterialCommunityIcons
            name="pencil-outline"
            size={24}
            color="#333"
          />
          <Text style={styles.actionButtonText}>New Note</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: "#f5f5f5",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  proButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#333",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 12,
  },
  proText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 4,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    backgroundColor: "#e8e8e8",
    borderRadius: 30,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 30,
  },
  activeTab: {
    backgroundColor: "#fff",
  },
  tabText: {
    marginLeft: 6,
    fontSize: 16,
    color: "#888",
  },
  activeTabText: {
    color: "#000",
    fontWeight: "500",
  },
  sectionTitle: {
    fontSize: 18,
    color: "#999",
    marginLeft: 20,
    marginBottom: 10,
  },
  noteCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FFF5EC",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  noteContent: {
    flex: 1,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  notePreview: {
    fontSize: 14,
    color: "#999",
  },
  noteDate: {
    fontSize: 12,
    color: "#999",
    marginLeft: 10,
  },
  bottomActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 10,
  },
  recordButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#333",
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: "45%",
  },
  newNoteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e8e8e8",
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: "45%",
  },
  actionButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  recordButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "500",
    color: "#fff",
  },
});
