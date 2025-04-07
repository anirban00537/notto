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
          <MaterialCommunityIcons name="account" size={22} color="#555" />
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
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 24,
    backgroundColor: "#fff",
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: "700",
    color: "#111",
    flex: 1,
    letterSpacing: -0.5,
  },
  proButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111",
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
    borderWidth: 1,
    borderColor: "#eee",
  },
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 24,
    borderRadius: 30,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#eee",
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 26,
  },
  activeTab: {
    backgroundColor: "#f5f5f5",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  tabText: {
    marginLeft: 6,
    fontSize: 16,
    color: "#aaa",
  },
  activeTabText: {
    color: "#111",
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 18,
    color: "#555",
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
    marginHorizontal: 24,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
    color: "#111",
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  notePreview: {
    fontSize: 14,
    color: "#777",
    lineHeight: 20,
  },
  noteDate: {
    fontSize: 12,
    color: "#aaa",
    marginLeft: 10,
  },
  bottomActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === "ios" ? 34 : 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "#fff",
  },
  recordButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111",
    borderRadius: 28,
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: "48%",
  },
  newNoteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 28,
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: "48%",
  },
  actionButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
  },
  recordButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
