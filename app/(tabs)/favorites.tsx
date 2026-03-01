import { View, Text, Image, StyleSheet, FlatList, Dimensions, Pressable } from "react-native";
import { useState } from "react";
import { favoritesFeed } from "@/placeholder";

const { width } = Dimensions.get("window");
const NUM_COLUMNS = 3;
const GAP = 2;
const IMAGE_SIZE = (width - GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS;

export default function Favorites() {
  const [captionVisibleId, setCaptionVisibleId] = useState<string | null>(null);

  const renderItem = ({ item }: { item: (typeof favoritesFeed)[0] }) => (
    <Pressable
      style={styles.gridItemWrapper}
      onLongPress={() => setCaptionVisibleId((id) => (id === item.id ? null : item.id))}
    >
      <Image source={{ uri: item.image }} style={styles.gridItem} resizeMode="cover" />
      {captionVisibleId === item.id && (
        <View style={styles.captionOverlay}>
          <Text style={styles.captionText} numberOfLines={3}>
            {item.caption || "No caption"}
          </Text>
        </View>
      )}
    </Pressable>
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
  gridItemWrapper: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    position: "relative",
  },
  gridItem: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
  },
  captionOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    padding: 8,
  },
  captionText: {
    color: "#fff",
    fontSize: 12,
    textAlign: "center",
  },
});
