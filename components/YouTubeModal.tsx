import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import CommonBottomSheet from "./CommonBottomSheet";
import ProcessingModal from "./ProcessingModal";

interface YouTubeModalProps {
  bottomSheetRef: React.RefObject<any>;
  visible: boolean;
  loading: boolean;
  url: string;
  onUrlChange: (url: string) => void;
  onClose: () => void;
  onSubmit: () => void;
  isSuccess?: boolean;
}

const YouTubeModal: React.FC<YouTubeModalProps> = ({
  bottomSheetRef,
  visible,
  loading,
  url,
  onUrlChange,
  onClose,
  onSubmit,
  isSuccess = false,
}) => {
  const snapPoints = [1, 280];

  return (
    <>
      <CommonBottomSheet
        ref={bottomSheetRef}
        visible={visible}
        snapPoints={snapPoints}
        backgroundStyle={{ backgroundColor: "rgba(240, 247, 255, 0.95)" }}
        handleIndicatorStyle={{ backgroundColor: "#ccc" }}
      >
        <View style={styles.modalHeader}>
          <Text style={styles.modalHeaderText}>Add YouTube Video</Text>
        </View>
        <View style={styles.modalContent}>
          <TextInput
            style={styles.input}
            placeholder="Enter YouTube URL"
            value={url}
            onChangeText={onUrlChange}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />
          <TouchableOpacity
            style={styles.submitButton}
            onPress={onSubmit}
            disabled={loading || !url}
          >
            <Text style={styles.submitButtonText}>Add Video</Text>
          </TouchableOpacity>
        </View>
      </CommonBottomSheet>

      <ProcessingModal visible={loading} type="youtube" isSuccess={isSuccess} />
    </>
  );
};

const styles = StyleSheet.create({
  modalHeader: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    alignItems: "center",
  },
  modalHeaderText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  modalContent: {
    padding: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  submitButton: {
    backgroundColor: "#2c3e50",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default YouTubeModal;
