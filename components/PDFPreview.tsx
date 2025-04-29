import React, { useState } from "react";
import { View, StyleSheet, Dimensions, Platform } from "react-native";
import Pdf from "react-native-pdf";

interface PDFPreviewProps {
  directPlayableUrl: string;
}

const PDFPreview: React.FC<PDFPreviewProps> = ({ directPlayableUrl }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  console.log("Attempting to load PDF from URL:", directPlayableUrl);

  const source = {
    uri: directPlayableUrl,
    cache: true,
    ...(Platform.OS === "android" && {
      sourceType: "url",
      cacheFileName: "pdf-" + directPlayableUrl.split("/").pop(),
    }),
  };

  return (
    <View style={styles.container}>
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
  );
};

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const styles = StyleSheet.create({
  container: {
    width: windowWidth,
    height: windowHeight * 0.7,
    backgroundColor: "#f0f7ff",
    marginVertical: 10,
  },
  pdf: {
    width: windowWidth,
    height: windowHeight * 0.7,
    minHeight: 500,
    backgroundColor: "#f0f7ff",
  },
});

export default PDFPreview;
