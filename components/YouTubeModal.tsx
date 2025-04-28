import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import CommonBottomSheet from './CommonBottomSheet';

interface YouTubeModalProps {
  bottomSheetRef: React.RefObject<any>;
  visible: boolean;
  loading: boolean;
  url: string;
  onUrlChange: (url: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

const YouTubeModal: React.FC<YouTubeModalProps> = ({
  bottomSheetRef,
  visible,
  loading,
  url,
  onUrlChange,
  onClose,
  onSubmit,
}) => {
  const snapPoints = [1, 340]; // closed, open height

  return (
    <CommonBottomSheet
      ref={bottomSheetRef}
      visible={visible}
      snapPoints={snapPoints}
      backgroundStyle={{ backgroundColor: '#fff' }}
      handleIndicatorStyle={{ backgroundColor: '#ccc' }}
      onClose={onClose}
    >
        <View style={styles.youtubeModalContent}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 24,
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
                style={[styles.actionButton, styles.submitButton]}
                onPress={onSubmit}
                disabled={loading}
              >
                <Text style={styles.submitButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
        </View>
    </CommonBottomSheet>
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
    color: "#1a1a1a",
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
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginHorizontal: 0,
  },
  submitButton: {
    backgroundColor: "#2c3e50",
    width: "100%",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
});

export default YouTubeModal;
