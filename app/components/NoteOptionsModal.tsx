import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Modalize } from "react-native-modalize";

interface NoteOptionsModalProps {
  modalRef: React.RefObject<Modalize>;
  onOptionPress: (option: string) => void;
}

const NoteOptionsModal: React.FC<NoteOptionsModalProps> = ({
  modalRef,
  onOptionPress,
}) => {
  return (
    <Modalize
      ref={modalRef}
      adjustToContentHeight
      HeaderComponent={
        <View style={styles.modalHeader}>
          <Text style={styles.modalHeaderText}>Create New Note</Text>
        </View>
      }
    >
      <View style={styles.modalContent}>
        <TouchableOpacity
          style={styles.modalOption}
          onPress={() => onOptionPress("PDF")}
        >
          <MaterialCommunityIcons
            name="file-pdf-box"
            size={24}
            color="#d32f2f"
            style={styles.modalOptionIcon}
          />
          <Text style={styles.modalOptionText}>Import PDF</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.modalOption}
          onPress={() => onOptionPress("Audio")}
        >
          <MaterialCommunityIcons
            name="file-music-outline"
            size={24}
            color="#1976d2"
            style={styles.modalOptionIcon}
          />
          <Text style={styles.modalOptionText}>Import Audio</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.modalOption}
          onPress={() => onOptionPress("YouTube")}
        >
          <MaterialCommunityIcons
            name="youtube"
            size={24}
            color="#ff0000"
            style={styles.modalOptionIcon}
          />
          <Text style={styles.modalOptionText}>Add YouTube Video</Text>
        </TouchableOpacity>
      </View>
    </Modalize>
  );
};

const styles = StyleSheet.create({
  modalHeader: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  modalHeaderText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  modalContent: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
  },
  modalOptionIcon: {
    marginRight: 16,
  },
  modalOptionText: {
    fontSize: 16,
    color: "#333",
  },
});

export default NoteOptionsModal;
