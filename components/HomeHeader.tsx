import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Typography, FONTS } from "../constants/Typography";

export const HomeHeader: React.FC = () => {
  return (
    <View style={styles.header}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Notto</Text>
        <Text style={styles.aiText}>AI</Text>
      </View>
      <View style={styles.headerRight}>
        <TouchableOpacity style={styles.proButton}>
          <MaterialCommunityIcons name="rocket-launch" size={14} color="#fff" />
          <Text style={[Typography.buttonText, styles.proText]}>PRO</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => router.push("/settings")}
        >
          <MaterialCommunityIcons name="account" size={22} color="#555" />
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
    paddingVertical: 16,
    paddingHorizontal: 32,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontFamily: FONTS.semiBold,
    color: "#000000",
  },
  aiText: {
    fontSize: 24,
    fontFamily: FONTS.semiBold,
    color: "#3498db",
    marginLeft: 4,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  proButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#000000",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    marginRight: 16,
  },
  proText: {
    color: "#fff",
    marginLeft: 6,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
});
