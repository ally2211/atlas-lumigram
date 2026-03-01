import { View, Text, Image, StyleSheet, FlatList, Dimensions, Pressable, Alert, Platform } from "react-native";
import { useEffect, useState, useRef } from "react";

const showAlert = (title: string, message?: string) =>
  Platform.OS === "web" ? window.alert([title, message].filter(Boolean).join("\n")) : Alert.alert(title, message);
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db, auth } from "../../firebase/firebaseConfig";

const { width } = Dimensions.get("window");
const NUM_COLUMNS = 3;
const GAP = 2;
const IMAGE_SIZE = (width - GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS;

type Post = {
  id: string;
  imageUrl: string;
  caption?: string;
  createdAt: { seconds: number };
};

const DOUBLE_TAP_DELAY = 300;

export default function Profile() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [captionVisibleId, setCaptionVisibleId] = useState<string | null>(null);
  const lastTapRef = useRef<{ id: string; time: number } | null>(null);
  const longPressHandledRef = useRef(false);

  const handlePress = (item: Post) => {
    if (longPressHandledRef.current) {
      longPressHandledRef.current = false;
      return;
    }
    const now = Date.now();
    const last = lastTapRef.current;
    if (last?.id === item.id && now - last.time < DOUBLE_TAP_DELAY) {
      showAlert("Double tap", "You double tapped this image!");
      lastTapRef.current = null;
    } else {
      lastTapRef.current = { id: item.id, time: now };
    }
  };

  const handleLongPress = (item: Post) => {
    longPressHandledRef.current = true;
    setCaptionVisibleId((id) => (id === item.id ? null : item.id));
  };

  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "users", userId, "posts"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt,
        })) as Post[];
        setPosts(items);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching posts:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const renderItem = ({ item }: { item: Post }) => (
    <Pressable
      style={styles.gridItemWrapper}
      onPress={() => handlePress(item)}
      onLongPress={() => handleLongPress(item)}
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

  if (posts.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>No posts yet</Text>
        <Text style={styles.emptySubtext}>Add photos from the Add Post tab</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={posts}
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
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#666",
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
