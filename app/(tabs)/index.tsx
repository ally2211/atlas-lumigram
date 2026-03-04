import {
  FlatList,
  Image,
  StyleSheet,
  Dimensions,
  Platform,
  RefreshControl,
  View,
  Text,
  ActivityIndicator,
  Pressable,
  Alert,
} from "react-native";
import { useState, useCallback, useRef, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase/firebaseConfig";
import { fetchFeedPage, FeedPost } from "@/firebase/feedService";
import type { QueryDocumentSnapshot } from "firebase/firestore";
import { addToFavorites } from "@/firebase/favoritesService";

const showAlert = (title: string, message?: string) =>
  Platform.OS === "web"
    ? window.alert([title, message].filter(Boolean).join("\n"))
    : Alert.alert(title, message);

const { width } = Dimensions.get("window");
const MAX_IMAGE_SIZE = Platform.select({
  web: 400,
  default: Math.min(width - 32, 360),
});

const DOUBLE_TAP_DELAY = 300;

export default function HomeScreen() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [captionVisibleId, setCaptionVisibleId] = useState<string | null>(null);
  const lastDocRef = useRef<QueryDocumentSnapshot | null>(null);
  const hasMoreRef = useRef(true);
  const lastTapRef = useRef<{ id: string; time: number } | null>(null);
  const longPressHandledRef = useRef(false);
  const addingFavoriteRef = useRef(false);

  const loadPage = useCallback(async (append: boolean) => {
    if (append) {
      if (loadingMore || !hasMoreRef.current || !lastDocRef.current) return;
      setLoadingMore(true);
    } else {
      lastDocRef.current = null;
      hasMoreRef.current = true;
    }

    try {
      const { posts: newPosts, lastDoc } = await fetchFeedPage(
        append ? lastDocRef.current ?? undefined : undefined
      );
      lastDocRef.current = lastDoc;
      hasMoreRef.current = newPosts.length >= 10;

      if (append) {
        setPosts((prev) => {
          const ids = new Set(prev.map((p) => p.id));
          const unique = newPosts.filter((p) => !ids.has(p.id));
          return [...prev, ...unique];
        });
      } else {
        setPosts(newPosts);
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error("Error loading feed:", error);
      showAlert("Error", `Could not load posts: ${msg}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [loadingMore]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadPage(false);
  }, [loadPage]);

  const onEndReached = useCallback(() => {
    if (!loadingMore && hasMoreRef.current) {
      loadPage(true);
    }
  }, [loadPage, loadingMore]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsSignedIn(!!user);
      if (user) {
        loadPage(false);
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePress = async (item: FeedPost) => {
    if (longPressHandledRef.current) {
      longPressHandledRef.current = false;
      return;
    }
    const now = Date.now();
    const last = lastTapRef.current;
    if (last?.id === item.id && now - last.time < DOUBLE_TAP_DELAY) {
      lastTapRef.current = null;
      if (addingFavoriteRef.current) return;
      addingFavoriteRef.current = true;
      try {
        await addToFavorites({
          id: item.id,
          imageUrl: item.imageUrl,
          caption: item.caption,
          createdAt: item.createdAt,
        });
        showAlert("Added to favorites", "This post has been added to your favorites.");
      } catch (error) {
        console.error(error);
        showAlert("Error", "Could not add to favorites.");
      } finally {
        addingFavoriteRef.current = false;
      }
    } else {
      lastTapRef.current = { id: item.id, time: now };
    }
  };

  const handleLongPress = (item: FeedPost) => {
    longPressHandledRef.current = true;
    setCaptionVisibleId((id) => (id === item.id ? null : item.id));
  };

  const renderItem = ({ item }: { item: FeedPost }) => (
    <Pressable
      style={styles.itemWrapper}
      onPress={() => handlePress(item)}
      onLongPress={() => handleLongPress(item)}
    >
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.image}
        resizeMode="cover"
      />
      {captionVisibleId === item.id && (
        <View style={styles.captionOverlay}>
          <Text style={styles.captionText} numberOfLines={3}>
            {item.caption || "No caption"}
          </Text>
        </View>
      )}
    </Pressable>
  );

  const renderFooter = () =>
    loadingMore ? (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#666" />
      </View>
    ) : null;

  if (loading && posts.length === 0) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#666" />
        <Text style={styles.loadingText}>Loading posts...</Text>
      </View>
    );
  }

  if (posts.length === 0) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.emptyText}>
          {isSignedIn === false ? "Sign in to see posts" : "No posts yet"}
        </Text>
        <Text style={styles.emptySubtext}>
          {isSignedIn === false ? "" : "Be the first to add a post!"}
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={posts}
      renderItem={renderItem}
      keyExtractor={(item) => `${item.userId}-${item.id}`}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      ListFooterComponent={renderFooter}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    padding: 16,
    paddingBottom: 32,
    maxWidth: Platform.select({ web: 432, default: undefined }),
    alignSelf: Platform.select({ web: "center" as const, default: undefined }),
  },
  itemWrapper: {
    position: "relative",
    marginBottom: 16,
    alignSelf: "center",
  },
  image: {
    width: MAX_IMAGE_SIZE,
    height: MAX_IMAGE_SIZE,
    borderRadius: 8,
  },
  captionOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    padding: 8,
    borderRadius: 8,
  },
  captionText: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    marginTop: 12,
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
  footer: {
    paddingVertical: 16,
    alignItems: "center",
  },
});
