import {
  collectionGroup,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "./firebaseConfig";

const PAGE_SIZE = 10;

export type FeedPost = {
  id: string;
  userId: string;
  imageUrl: string;
  caption?: string;
  createdAt: { seconds: number };
};

/**
 * Fetches posts from all users via collection group query on users/.../posts.
 */
export const fetchFeedPage = async (
  lastDoc?: QueryDocumentSnapshot
): Promise<{ posts: FeedPost[]; lastDoc: QueryDocumentSnapshot | null }> => {
  return fetchFromCollectionGroup(lastDoc);
};

async function fetchFromCollectionGroup(
  lastDoc?: QueryDocumentSnapshot
): Promise<{ posts: FeedPost[]; lastDoc: QueryDocumentSnapshot | null }> {
  const postsRef = collectionGroup(db, "posts");
  const q = lastDoc
    ? query(
        postsRef,
        orderBy("createdAt", "desc"),
        limit(PAGE_SIZE),
        startAfter(lastDoc)
      )
    : query(postsRef, orderBy("createdAt", "desc"), limit(PAGE_SIZE));

  const snapshot = await getDocs(q);
  const posts = snapshot.docs.map((doc) => {
    const data = doc.data();
    const userId = (doc.ref as { parent?: { parent?: { id?: string } } }).parent?.parent?.id ?? "";
    return {
      id: doc.id,
      userId,
      imageUrl: data.imageUrl,
      caption: data.caption,
      createdAt: data.createdAt,
    } as FeedPost;
  });

  const newLastDoc = snapshot.docs[snapshot.docs.length - 1] ?? null;
  return { posts, lastDoc: newLastDoc };
}
