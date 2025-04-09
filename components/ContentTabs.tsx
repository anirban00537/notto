import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type TabName = "note" | "transcript" | "chat";

const TABS: {
  name: TabName;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}[] = [
  { name: "note", label: "Note", icon: "note-text-outline" },
  { name: "transcript", label: "Transcript", icon: "script-text-outline" },
  { name: "chat", label: "Chat", icon: "message-text-outline" },
];

interface ContentTabsProps {
  activeTab: TabName;
  onTabPress: (tab: TabName) => void;
}

export default function ContentTabs({
  activeTab,
  onTabPress,
}: ContentTabsProps) {
  return (
    <View style={styles.container}>
      <View style={styles.tabsContainer}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.name}
            style={[styles.tab, activeTab === tab.name && styles.activeTab]}
            onPress={() => onTabPress(tab.name)}
            activeOpacity={0.7}
          >
            <View style={styles.tabContent}>
              <MaterialCommunityIcons
                name={tab.icon}
                size={16}
                color={activeTab === tab.name ? "#fff" : "#2c3e50"}
                style={styles.tabIcon}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.name && styles.activeTabText,
                ]}
              >
                {tab.label}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "transparent",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 10,
    padding: 3,
    borderWidth: 1,
    borderColor: "rgba(230, 240, 255, 0.5)",
  },
  tab: {
    flex: 1,
    borderRadius: 8,
    overflow: "hidden",
    marginHorizontal: 2,
  },
  activeTab: {
    backgroundColor: "#2c3e50",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  tabContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    paddingHorizontal: 6,
  },
  tabIcon: {
    marginRight: 3,
  },
  tabText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#2c3e50",
  },
  activeTabText: {
    color: "#fff",
  },
});
