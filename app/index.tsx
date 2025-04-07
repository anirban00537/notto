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
  Platform,
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
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notto</Text>
        <TouchableOpacity style={styles.proButton}>
          <MaterialCommunityIcons name="rocket-launch" size={16} color="#fff" />
          <Text style={styles.proText}>PRO</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.profileButton}>
          <MaterialCommunityIcons name="account" size={24} color="#555" />
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
            color={activeTab === "notes" ? "#222" : "#888"}
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
            color={activeTab === "folders" ? "#222" : "#888"}
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
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
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
        <TouchableOpacity style={styles.recordButton} activeOpacity={0.8}>
          <MaterialCommunityIcons
            name="record-circle"
            size={24}
            color="#f44336"
          />
          <Text style={styles.recordButtonText}>Record</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.newNoteButton} activeOpacity={0.8}>
          <MaterialCommunityIcons name="pencil-plus" size={24} color="#222" />
          <Text style={[styles.actionButtonText, { color: "#222" }]}>
            New Note
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 24,
    backgroundColor: "#f8f9fa",
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#222",
    flex: 1,
    letterSpacing: -0.5,
  },
  proButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#222",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 24,
    marginRight: 16,
  },
  proText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 6,
    fontSize: 14,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 24,
    backgroundColor: "#eef0f2",
    borderRadius: 30,
    padding: 5,
    marginBottom: 20,
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
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  tabText: {
    marginLeft: 6,
    fontSize: 16,
    color: "#888",
  },
  activeTabText: {
    color: "#222",
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 18,
    color: "#666",
    marginLeft: 24,
    marginBottom: 12,
    fontWeight: "500",
  },
  listContent: {
    paddingBottom: 16,
  },
  noteCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 24,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FFF5EC",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  noteContent: {
    flex: 1,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  notePreview: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  noteDate: {
    fontSize: 12,
    color: "#888",
    marginLeft: 10,
  },
  bottomActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingBottom: 34,
    paddingTop: 12,
  },
  recordButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#222",
    borderRadius: 28,
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: "48%",
  },
  newNoteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 28,
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: "48%",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
  },
  actionButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  recordButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
