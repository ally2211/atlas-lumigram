import { collection, doc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebaseConfig";

export type FavoritePost = {
  id: string;
  imageUrl: string;
  caption?: string;
  createdAt: { seconds: number };
};

/**
 * Adds a post to the user's favorites in Firestore
 */
export const addToFavorites = async (post: FavoritePost): Promise<void> => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not logged in");

  const favoriteRef = doc(db, "users", user.uid, "favorites", post.id);
  await setDoc(favoriteRef, {
    postId: post.id,
    imageUrl: post.imageUrl,
    caption: post.caption ?? "",
    createdAt: post.createdAt,
    favoritedAt: new Date(),
  });
};
