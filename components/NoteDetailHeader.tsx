import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
  Modal,
  Pressable,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Typography, FONTS } from "../constants/Typography";
import { Colors } from "@/constants/Colors";

interface NoteDetailHeaderProps {
  title: string;
  onBackPress: () => void;
  onOptionsPress: () => void;
  onDelete?: () => Promise<void>;
}

export default function NoteDetailHeader({
  title,
  onBackPress,
  onOptionsPress,
  onDelete,
}: NoteDetailHeaderProps) {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const handleDelete = async () => {
    setIsDropdownVisible(false);
    Alert.alert(
      "Delete Note",
      "Are you sure you want to delete this note? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              if (onDelete) {
                await onDelete();
              }
            } catch (error) {
              console.error("Error deleting note:", error);
              Alert.alert("Error", "Failed to delete note. Please try again.");
            }
          },
        },
      ]
    );
  };

  const HeaderContent = () => (
    <View style={styles.headerContent}>
      <View style={styles.leftSection}>
        <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
          <MaterialCommunityIcons
            name="chevron-left"
            size={30}
            color="#2c3e50"
          />
        </TouchableOpacity>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          scrollEnabled={true}
        >
          <Text
            style={[Typography.body1, styles.headerTitle]}
            numberOfLines={1}
          >
            {title}
          </Text>
        </ScrollView>
      </View>

      <View style={styles.rightSection}>
        <TouchableOpacity
          onPress={() => setIsDropdownVisible(true)}
          style={styles.optionsButton}
        >
          <MaterialCommunityIcons
            name="dots-horizontal"
            size={28}
            color="#2c3e50"
          />
        </TouchableOpacity>

        <Modal
          visible={isDropdownVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsDropdownVisible(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setIsDropdownVisible(false)}
          >
            <View
              style={[
                styles.dropdownMenu,
                {
                  top: Platform.OS === "ios" ? 100 : 60,
                  right: 20,
                },
              ]}
            >
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={handleDelete}
              >
                <MaterialCommunityIcons
                  name="delete-outline"
                  size={24}
                  color="#ff4444"
                />
                <Text style={[Typography.body1, styles.dropdownItemText]}>
                  Delete Note
                </Text>
              </TouchableOpacity>
              {/* Add more dropdown items here */}
            </View>
          </Pressable>
        </Modal>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {Platform.OS === "ios" ? (
        <BlurView intensity={50} tint="light" style={styles.header}>
          <HeaderContent />
        </BlurView>
      ) : (
        <View style={[styles.header, styles.androidHeader]}>
          <HeaderContent />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    zIndex: 10,
    backgroundColor: Colors.light.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  header: {
    position: "relative",
    backgroundColor: Colors.light.background,
  },
  androidHeader: {
    backgroundColor: Colors.light.background,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "transparent",
  },
  optionsButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "transparent",
  },
  headerTitle: {
    color: "#2c3e50",
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  dropdownMenu: {
    position: "absolute",
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 8,
    minWidth: 180,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
  },
  dropdownItemText: {
    marginLeft: 12,
    color: "#ff4444",
  },
});
