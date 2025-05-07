import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Platform,
  TouchableOpacity,
  Text,
  Modal,
  Pressable,
} from "react-native";
import Pdf from "react-native-pdf";
import { Typography, FONTS } from "../constants/Typography";
import { Colors } from "@/constants/Colors";

interface PDFPreviewProps {
  directPlayableUrl: string;
  fileName?: string;
}

const PDFPreview: React.FC<PDFPreviewProps> = ({
  directPlayableUrl,
  fileName = "Document",
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);

  const source = {
    uri: directPlayableUrl,
    cache: true,
    ...(Platform.OS === "android" && {
      sourceType: "url",
      cacheFileName: "pdf-" + directPlayableUrl.split("/").pop(),
    }),
  };

  return (
    <View>
      <TouchableOpacity
        style={styles.card}
        onPress={() => setModalVisible(true)}
      >
        <View style={styles.cardLeft}>
          <Text style={[Typography.caption, styles.pdfIndicator]}>PDF</Text>
          <Text
            style={[Typography.body2, styles.fileName]}
            numberOfLines={1}
            ellipsizeMode="middle"
          >
            {fileName}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={[Typography.buttonText, styles.viewButtonText]}>
            View
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text
                style={[Typography.h4, styles.modalTitle]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {fileName}
              </Text>
              <Pressable
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </Pressable>
            </View>

            <View style={styles.pdfContainer}>
              <Pdf
                source={source}
                onLoadComplete={(numberOfPages, filePath) => {
                  console.log(
                    `PDF Loaded - Total pages: ${numberOfPages}, FilePath: ${filePath}`
                  );
                  setTotalPages(numberOfPages);
                }}
                onPageChanged={(page) => {
                  console.log(`Current page: ${page}`);
                  setCurrentPage(page);
                }}
                onError={(error) => {
                  console.log("PDF Error:", JSON.stringify(error));
                }}
                enablePaging={true}
                renderActivityIndicator={(progress) => <View />}
                trustAllCerts={false}
                enableAnnotationRendering={Platform.OS === "android"}
                enableRTL={false}
                fitPolicy={0}
                style={styles.pdf}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.cardBackground,
    borderWidth: 1,
    borderColor: Colors.light.border,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    justifyContent: "space-between",
    borderRadius: 10,
    width: "auto",
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 8,
  },
  pdfIndicator: {
    backgroundColor: Colors.light.tintBackground,
    color: Colors.light.tint,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  fileName: {
    flex: 1,
    color: Colors.light.text,
  },
  viewButton: {
    backgroundColor: Colors.light.tint,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 8,
  },
  viewButtonText: {
    color: Colors.light.background,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: Colors.light.background,
    width: windowWidth * 0.9,
    height: windowHeight * 0.8,
    borderRadius: 12,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  modalTitle: {
    flex: 1,
    marginRight: 16,
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 20,
    color: Colors.light.secondaryText,
    fontFamily: FONTS.medium,
  },
  pdfContainer: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  pdf: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
});

export default PDFPreview;
