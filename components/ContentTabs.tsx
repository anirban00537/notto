import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type TabName = "note" | "transcript" | "summary";

interface ContentTabsProps {
  activeTab: TabName;
  onTabPress: (tabName: TabName) => void;
}

const TABS: {
  name: TabName;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}[] = [
  { name: "note", label: "Note", icon: "note-text-outline" },
  { name: "transcript", label: "Transcript", icon: "script-text-outline" },
  { name: "summary", label: "Summary", icon: "text-short" },
];

export default function ContentTabs({
  activeTab,
  onTabPress,
}: ContentTabsProps) {
  return (
    <View style={styles.contentTabContainer}>
      {TABS.map((tab) => {
        const isActive = activeTab === tab.name;
        return (
          <TouchableOpacity
            key={tab.name}
            style={[styles.contentTab, isActive && styles.contentTabActive]}
            onPress={() => onTabPress(tab.name)}
          >
            <MaterialCommunityIcons
              name={tab.icon}
              size={18}
              color={isActive ? "#fff" : "#888"}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.contentTabText,
                isActive && styles.contentTabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  contentTabContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    justifyContent: "flex-start",
  },
  contentTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  contentTabActive: {
    backgroundColor: "#111",
  },
  contentTabText: {
    fontSize: 15,
    color: "#555",
  },
  contentTabTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
});
