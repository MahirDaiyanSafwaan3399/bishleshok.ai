import { initializeApp, setLogLevel } from "firebase/app";
import {
    getAuth,
    signInAnonymously,
    signInWithCustomToken,
    onAuthStateChanged,
} from "firebase/auth";
import { getFirestore, collection } from "firebase/firestore";


const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};


export const appId =
    typeof __app_id !== "undefined" ? firebaseConfig.appId : "default-app-id";

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
