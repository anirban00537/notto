import { StyleSheet, Platform } from "react-native";

export const markdownStyles = StyleSheet.create({
  body: {
    color: "#24292e",
    fontSize: 16,
    lineHeight: 24,
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 8,
    ...Platform.select({
      ios: {
        fontFamily: "System",
      },
      android: {
        fontFamily: "Roboto",
      },
    }),
  },
  paragraph: {
    marginVertical: 8,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  heading1: {
    fontSize: 28,
    fontWeight: "bold",
    marginVertical: 16,
    color: "#1a1a1a",
  },
  heading2: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 14,
    color: "#1a1a1a",
  },
  heading3: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 12,
    color: "#1a1a1a",
  },
  heading4: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
    color: "#1a1a1a",
  },
  heading5: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 8,
    color: "#1a1a1a",
  },
  heading6: {
    fontSize: 14,
    fontWeight: "bold",
    marginVertical: 6,
    color: "#1a1a1a",
  },
  link: {
    color: "#0366d6",
    textDecorationLine: "underline",
  },
  blockquote: {
    backgroundColor: "#f6f8fa",
    borderLeftColor: "#0366d6",
    borderLeftWidth: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginVertical: 8,
  },
  code_inline: {
    backgroundColor: "#f6f8fa",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontFamily: "monospace",
    fontSize: 14,
  },
  code_block: {
    backgroundColor: "#f6f8fa",
    padding: 12,
    borderRadius: 6,
    marginVertical: 8,
    fontFamily: "monospace",
    fontSize: 14,
  },
  bullet_list: {
    marginVertical: 8,
  },
  ordered_list: {
    marginVertical: 8,
  },
  list_item: {
    flexDirection: "row",
    marginVertical: 4,
    alignItems: "flex-start",
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    color: "#24292e",
  },
  strong: {
    fontWeight: "bold",
    color: "#24292e",
  },
  em: {
    fontStyle: "italic",
  },
  image: {
    marginVertical: 8,
    borderRadius: 6,
  },
  hr: {
    backgroundColor: "#e1e4e8",
    height: 1,
    marginVertical: 16,
  },
  table: {
    borderWidth: 1,
    borderColor: "#e1e4e8",
    borderRadius: 6,
    marginVertical: 8,
    width: "100%",
  },
  thead: {
    backgroundColor: "#f6f8fa",
  },
  tr: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e1e4e8",
  },
  th: {
    flex: 1,
    padding: 12,
    fontWeight: "bold",
  },
  td: {
    flex: 1,
    padding: 12,
  },
});
