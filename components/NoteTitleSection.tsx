import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface NoteTitleSectionProps {
  title: string;
  lastModified: string;
  iconName: keyof typeof MaterialCommunityIcons.glyphMap; // Pass icon name
  iconColor: string;
  iconBackgroundColor: string;
}

export default function NoteTitleSection({
  title,
  lastModified,
  iconName,
  iconColor,
  iconBackgroundColor,
}: NoteTitleSectionProps) {
  return (
    <View style={styles.titleContainer}>
      <View style={styles.titleTextContainer}>
        <Text style={styles.noteTitle} numberOfLines={1} ellipsizeMode="tail">
          {title}
        </Text>
        <View style={styles.iconContainer}>
          <Text style={styles.lastModified}>Last Modified: {lastModified}</Text>
          <View
            style={[
              styles.noteIconContainer,
              { backgroundColor: iconBackgroundColor },
            ]}
          >
            <MaterialCommunityIcons
              name={iconName}
              size={24}
              color={iconColor}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  noteIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    marginLeft: 12,
  },
  titleTextContainer: {
    flex: 1,
  },
  noteTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111",
    marginBottom: 4,
  },
  lastModified: {
    fontSize: 13,
    color: "#888",
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
});
