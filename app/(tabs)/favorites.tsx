import { View, Text, Image, StyleSheet, FlatList, Dimensions, Pressable } from "react-native";
import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db, auth } from "../../firebase/firebaseConfig";

const { width } = Dimensions.get("window");
const NUM_COLUMNS = 3;
const GAP = 2;
const IMAGE_SIZE = (width - GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS;

type FavoriteItem = {
  id: string;
  imageUrl: string;
  caption?: string;
};

export default function Favorites() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [captionVisibleId, setCaptionVisibleId] = useState<string | null>(null);

  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "users", userId, "favorites"),
      orderBy("favoritedAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: data.postId || doc.id,
            imageUrl: data.imageUrl,
            caption: data.caption,
          } as FavoriteItem;
        });
        setFavorites(items);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching favorites:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const renderItem = ({ item }: { item: FavoriteItem }) => (
    <Pressable
      style={styles.gridItemWrapper}
      onLongPress={() => setCaptionVisibleId((id) => (id === item.id ? null : item.id))}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.gridItem} resizeMode="cover" />
      {captionVisibleId === item.id && (
        <View style={styles.captionOverlay}>
          <Text style={styles.captionText} numberOfLines={3}>
            {item.caption || "No caption"}
          </Text>
        </View>
      )}
    </Pressable>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (favorites.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>No favorites yet</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={favorites}
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
  loadingText: {
    fontSize: 16,
    color: "#666",
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
