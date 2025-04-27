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

interface AudioModalProps {
  visible: boolean;
  loading: boolean;
  url: string;
  onUrlChange: (url: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

const AudioModal: React.FC<AudioModalProps> = ({
  visible,
  loading,
  url,
  onUrlChange,
  onClose,
  onSubmit,
}) => {
  const modalRef = useRef<Modalize>(null);
  const [step, setStep] = React.useState(1);

  React.useEffect(() => {
    if (visible) {
      modalRef.current?.open();
      setStep(1); // Reset step on open
    } else {
      modalRef.current?.close();
    }
  }, [visible]);

  const handleSelectFile = () => {
    setStep(2);
  };

  return (
    <Modalize
      ref={modalRef}
      adjustToContentHeight
      panGestureEnabled={!loading}
      closeOnOverlayTap={!loading}
      withHandle={false}
      onClose={onClose}
    >
      <View style={styles.audioModalContent}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 24,
          }}
        >
          <Text style={styles.audioModalTitle}>Add Audio</Text>
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
        ) : step === 1 ? (
          <TouchableOpacity
            style={styles.fileSelectArea}
            onPress={handleSelectFile}
            activeOpacity={0.7}
            disabled={loading}
          >
            <Text style={styles.fileSelectText}>Select Audio File</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TextInput
              style={styles.audioInput}
              placeholder="Paste Audio URL"
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
    </Modalize>
  );
};

const styles = StyleSheet.create({
  audioModalContent: { 
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
  audioModalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  audioInput: {
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
  fileSelectArea: {
    borderWidth: 2,
    borderColor: '#1976d2',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    backgroundColor: '#f0f7ff',
  },
  fileSelectText: {
    color: '#1976d2',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AudioModal;
