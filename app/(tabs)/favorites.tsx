import { View, Text, Image, StyleSheet, FlatList, Dimensions } from "react-native";
import { favoritesFeed } from "@/placeholder";

const { width } = Dimensions.get("window");
const NUM_COLUMNS = 3;
const GAP = 2;
const IMAGE_SIZE = (width - GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS;

export default function Favorites() {
  const renderItem = ({ item }: { item: (typeof favoritesFeed)[0] }) => (
    <Image source={{ uri: item.image }} style={styles.gridItem} resizeMode="cover" />
  );

  if (favoritesFeed.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>No favorites yet</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={favoritesFeed}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      numColumns={NUM_COLUMNS}
      contentContainerStyle={styles.grid}
      columnWrapperStyle={styles.row}
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  grid: {
    padding: 0,
    paddingBottom: 20,
  },
  row: {
    flexDirection: "row",
    gap: GAP,
    marginBottom: GAP,
  },
  gridItem: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
  },
});
