import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Typography, FONTS } from "../constants/Typography";
import { Colors } from "../constants/Colors";

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
          <MaterialCommunityIcons
            name="account"
            size={22}
            color={Colors.light.icon}
          />
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
    paddingHorizontal: 24,
    backgroundColor: Colors.light.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontFamily: FONTS.semiBold,
    color: Colors.light.tint,
  },
  aiText: {
    fontSize: 24,
    fontFamily: FONTS.semiBold,
    color: Colors.light.tintLight,
    marginLeft: 2,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  proButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 10,
    paddingVertical: 6,
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
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
});
