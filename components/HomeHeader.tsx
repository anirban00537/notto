import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Folder } from "../lib/types/folder";

interface HomeHeaderProps {
  selectedFolder: Folder;
  onFolderPress: () => void;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({
  selectedFolder,
  onFolderPress,
}) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.folderButton}
        onPress={onFolderPress}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons name="folder-outline" size={22} color="#555" />
        <Text style={styles.folderName}>{selectedFolder.name}</Text>
        <MaterialCommunityIcons name="chevron-down" size={20} color="#555" />
      </TouchableOpacity>
      <View style={styles.headerRight}>
        <TouchableOpacity style={styles.proButton}>
          <MaterialCommunityIcons name="rocket-launch" size={14} color="#fff" />
          <Text style={styles.proText}>PRO</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => router.push("/settings")}
        >
          <MaterialCommunityIcons name="cog-outline" size={22} color="#555" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 2,
    paddingHorizontal: 2,
    backgroundColor: "#f0f7ff",
  },
  folderButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f7ff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    flex: 1,
    marginRight: 16,
  },
  folderName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: "#111",
    marginLeft: 10,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  proButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2c3e50",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 20,
    marginRight: 16,
  },
  proText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 6,
    fontSize: 12,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
});
