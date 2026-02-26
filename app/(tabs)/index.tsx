import { ScrollView, Image, StyleSheet, Dimensions, Platform } from "react-native";

const HOME_IMAGES = [
  require("@/assets/images/home/1.jpg"),
  require("@/assets/images/home/2.jpg"),
  require("@/assets/images/home/3.jpg"),
  require("@/assets/images/home/4.jpg"),
  require("@/assets/images/home/5.jpg"),
  require("@/assets/images/home/6.jpg"),
  require("@/assets/images/home/7.jpg"),
  require("@/assets/images/home/8.jpg"),
  require("@/assets/images/home/9.jpg"),
];

const { width } = Dimensions.get("window");
const MAX_IMAGE_SIZE = Platform.select({
  web: 400,
  default: Math.min(width - 32, 360),
});

export default function HomeScreen() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {HOME_IMAGES.map((source, index) => (
        <Image
          key={index}
          source={source}
          style={styles.image}
          resizeMode="cover"
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    padding: 16,
    paddingBottom: 32,
    maxWidth: Platform.select({ web: 432, default: undefined }),
    alignSelf: Platform.select({ web: "center" as const, default: undefined }),
  },
  image: {
    width: MAX_IMAGE_SIZE,
    height: MAX_IMAGE_SIZE,
    alignSelf: "center",
    borderRadius: 8,
    marginBottom: 16,
  },
});
