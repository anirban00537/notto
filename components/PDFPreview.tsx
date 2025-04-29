import React, { useState } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Pdf from "react-native-pdf";

interface PDFPreviewProps {
  directPlayableUrl: string;
}

const PDFPreview: React.FC<PDFPreviewProps> = ({ directPlayableUrl }) => {
  const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    console.log(directPlayableUrl,"directPlayableUrl")

  return (
    <View style={styles.container}>
      <Pdf
        source={{ uri: directPlayableUrl }}
        onLoadComplete={(numberOfPages) => {
          setTotalPages(numberOfPages);
        }}
        onPageChanged={(page) => {
          setCurrentPage(page);
        }}
        onError={(error) => {
          console.log(error);
        }}
        style={styles.pdf}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    marginVertical: 10,
  },
  pdf: {
    flex: 1,
    width: Dimensions.get("window").width - 32,
    height: 300,
    backgroundColor: "#f0f7ff",
  },
});

export default PDFPreview;
