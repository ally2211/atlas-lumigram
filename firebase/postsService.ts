// firebase/postsService.ts
import { Platform } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import { collection, addDoc } from "firebase/firestore";
import { auth, db, storage, storageBucket } from "./firebaseConfig";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";


/**
 * Uploads image to Firebase Storage via REST API on native (avoids Blob/ArrayBuffer RN limitations)
 * Uses Firebase SDK on web
 */
export const uploadPostImage = async (imageUri: string): Promise<string> => {
    const user = auth.currentUser;
    if (!user) throw new Error("User not logged in");

    const filename = `posts/${user.uid}/${Date.now()}.jpg`;

    if (Platform.OS === "web") {
        const storageRef = ref(storage, filename);
        const response = await fetch(imageUri);
        const blob = await response.blob();
        await uploadBytes(storageRef, blob, { contentType: "image/jpeg" });
        return await getDownloadURL(storageRef);
    }

    // Native: use Firebase Storage REST API + expo-file-system (no Blob in JS)
    const idToken = await user.getIdToken();
    const encodedPath = encodeURIComponent(filename);
    // v0 API may require appspot.com; config has firebasestorage.app
    const bucketsToTry = [storageBucket, "lumigram-cee46.appspot.com"];

    let result: FileSystem.FileSystemUploadResult | null = null;
    let usedBucket = storageBucket;

    for (const bucket of bucketsToTry) {
        const url = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o?uploadType=media&name=${encodedPath}`;
        result = await FileSystem.uploadAsync(url, imageUri, {
            httpMethod: "POST",
            uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
            headers: {
                Authorization: `Bearer ${idToken}`,
                "Content-Type": "image/jpeg",
            },
        });
        if (result.status === 200) {
            usedBucket = bucket;
            break;
        }
        if (result.status !== 404) {
            const body = typeof result.body === "string" ? result.body : JSON.stringify(result.body);
            throw new Error(`Upload failed: ${result.status} - ${body}`);
        }
    }

    if (!result || result.status !== 200) {
        throw new Error("Upload failed: 404 Not Found. Check Firebase Storage bucket in Console.");
    }

    const data = typeof result.body === "string" ? JSON.parse(result.body) : result.body;
    const token = data.downloadTokens;
    const path = data.name || filename;
    const encodedName = encodeURIComponent(path);
    return `https://firebasestorage.googleapis.com/v0/b/${usedBucket}/o/${encodedName}?alt=media&token=${token}`;
};

/**
 * Creates a post in Firestore. Writes to both:
 * - users/{userId}/posts (for profile, collection group feed)
 * - posts (top-level, for feed fallback)
 */
export const createPost = async (imageUrl: string, caption: string) => {
    const user = auth.currentUser;

    if (!user) throw new Error("User not logged in");

    const postData = {
        userId: user.uid,
        imageUrl,
        caption,
        createdAt: new Date(),
    };

    const userPostsRef = collection(db, "users", user.uid, "posts");
    const topPostsRef = collection(db, "posts");
    await Promise.all([
        addDoc(userPostsRef, { imageUrl, caption, createdAt: postData.createdAt }),
        addDoc(topPostsRef, postData),
    ]);
};