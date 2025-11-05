import { initializeApp, setLogLevel } from "firebase/app";
import {
    getAuth,
    signInAnonymously,
    signInWithCustomToken,
    onAuthStateChanged,
} from "firebase/auth";
import { getFirestore, collection } from "firebase/firestore";

// --- Firebase Configuration ---
// This config was taken from your original index.html file.
const firebaseConfig = {
    apiKey: "AIzaSyAKTCCN07XHfFyDy8PD84qsWqkSRUmpfh4",
    authDomain: "bishleshok.firebaseapp.com",
    projectId: "bishleshok",
    storageBucket: "bishleshok.firebasestorage.app",
    messagingSenderId: "643251316933",
    appId: "1:643251316933:web:270ad8097a2400543828ac",
    measurementId: "G-QPMJWMDLWT",
};

// --- App ID Handling ---
// Use the platform-provided __app_id if available, otherwise default.
export const appId =
    typeof __app_id !== "undefined" ? __app_id : "default-app-id";

// --- Firebase Initialization ---
setLogLevel("Debug"); // Enable verbose logging
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

/**
 * Signs in the user (anonymously or with token) and sets up auth state listener.
 * @param {function} onAuthReady - Callback function that receives the userId.
 * @returns {function} - An unsubscribe function for the auth listener.
 */
export const signInUser = (onAuthReady) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
            const userId = user.uid;
            console.log("Firebase Auth Ready. User ID:", userId);
            onAuthReady(userId);
        } else {
            onAuthReady(null);
        }
    });

    // Immediately try to sign in
    (async () => {
        try {
            // Use __initial_auth_token if provided by the platform
            if (
                typeof __initial_auth_token !== "undefined" &&
                __initial_auth_token
            ) {
                await signInWithCustomToken(auth, __initial_auth_token);
            } else {
                await signInAnonymously(auth);
            }
        } catch (e) {
            console.error("Firebase Sign-In Error:", e);
        }
    })();

    return unsubscribe;
};

/**
 * Gets a reference to the user's private data collection.
 * @param {string} userId - The authenticated user's ID.
 * @returns {object} - A Firestore CollectionReference.
 */
export const getDataCollectionRef = (userId) => {
    if (!userId) return null;
    // This path is based on your original onSnapshot query
    return collection(
        db,
        "artifacts",
        appId,
        "users",
        userId,
        "extracted_data"
    );
};
