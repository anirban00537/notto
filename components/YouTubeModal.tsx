import React, { useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Modalize } from "react-native-modalize";

interface YouTubeModalProps {
  visible: boolean;
  loading: boolean;
  url: string;
  onUrlChange: (url: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

const YouTubeModal: React.FC<YouTubeModalProps> = ({
  visible,
  loading,
  url,
  onUrlChange,
  onClose,
  onSubmit,
}) => {
  const modalRef = useRef<Modalize>(null);

  React.useEffect(() => {
    if (visible) {
      modalRef.current?.open();
    } else {
      modalRef.current?.close();
    }
  }, [visible]);

  return (
    <Modalize
      ref={modalRef}
      adjustToContentHeight
      panGestureEnabled={!loading}
      closeOnOverlayTap={!loading}
      withHandle={false}
      onClose={onClose}
    >
      <View style={styles.youtubeModalContent}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={styles.youtubeModalTitle}>Add YouTube Video</Text>
          <TouchableOpacity onPress={onClose} disabled={loading}>
            <Text style={{ color: "#1976d2", fontSize: 16, fontWeight: "600" }}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
        {loading ? (
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              minHeight: 80,
            }}
          >
            <Text style={{ marginBottom: 12, fontSize: 16 }}>
              Processing...
            </Text>
            <View style={{ marginBottom: 8 }}>
              <ActivityIndicator size="large" color="#1976d2" />
            </View>
          </View>
        ) : (
          <>
            <TextInput
              style={styles.youtubeInput}
              placeholder="Paste YouTube URL"
              value={url}
              onChangeText={onUrlChange}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              editable={!loading}
            />
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity
                style={[styles.actionButton, styles.editNoteButton]}
                onPress={onSubmit}
                disabled={loading}
              >
                <Text style={styles.editNoteButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </Modalize>
  );
};

const styles = StyleSheet.create({
  youtubeModalContent: {
    width: "100%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 24,
    paddingBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  youtubeModalTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 24,
    color: "#1a1a1a",
    textAlign: "center",
    position: "relative",
  },
  youtubeInput: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    fontSize: 16,
    backgroundColor: "#f8f9fa",
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 4,
  },
  editNoteButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e6f0ff",
  },
  editNoteButtonText: {
    color: "#2c3e50",
    fontSize: 15,
    fontWeight: "600",
  },
});

export default YouTubeModal;
