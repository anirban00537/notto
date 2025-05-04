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
            color="rgba(44, 62, 80, 0.9)"
          />
        </TouchableOpacity>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          scrollEnabled={true}
        >
          <Text style={styles.headerTitle} numberOfLines={1}>
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
            color="rgba(44, 62, 80, 0.9)"
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
                <Text style={styles.dropdownItemText}>Delete Note</Text>
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
    backgroundColor: "rgba(240, 247, 255, 0.45)",
  },
  header: {
    position: "relative",
    backgroundColor: "rgba(240, 247, 255, 0.25)",
  },
  androidHeader: {
    backgroundColor: "rgba(240, 247, 255, 0.65)",
    backdropFilter: "blur(10px)",
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
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
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  optionsButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "rgba(44, 62, 80, 0.9)",
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  dropdownMenu: {
    position: "absolute",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 8,
    minWidth: 180,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
  },
  dropdownItemText: {
    marginLeft: 12,
    fontSize: 16,
    color: "#ff4444",
    fontWeight: "500",
  },
});
