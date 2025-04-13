import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signOut, updateProfile, onAuthStateChanged, User } from "firebase/auth";
import { getFirestore, collection, doc, setDoc, getDoc, updateDoc, query, where, getDocs } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-api-key",
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project"}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project"}.appspot.com`,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "demo-messaging-id",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "demo-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

// Auth functions
const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Check if user document exists in Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid));
    
    if (!userDoc.exists()) {
      // Create new user document in Firestore
      await setDoc(doc(db, "users", user.uid), {
        name: user.displayName,
        email: user.email,
        role: "resident", // Default role
        roomNumber: null,
        preferredLanguage: "en",
        createdAt: new Date()
      });
    }
    
    return user;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

const loginWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Error signing in with email/password:", error);
    throw error;
  }
};

const registerWithEmail = async (email: string, password: string, name: string, role: string = "resident") => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update profile with name
    await updateProfile(user, {
      displayName: name
    });
    
    // Create user document in Firestore
    await setDoc(doc(db, "users", user.uid), {
      name,
      email,
      role,
      roomNumber: null,
      preferredLanguage: "en",
      createdAt: new Date()
    });
    
    return user;
  } catch (error) {
    console.error("Error registering with email/password:", error);
    throw error;
  }
};

const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

// Firestore functions
const getUserData = async (userId: string) => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() };
    }
    return null;
  } catch (error) {
    console.error("Error getting user data:", error);
    throw error;
  }
};

const updateUserData = async (userId: string, data: any) => {
  try {
    await updateDoc(doc(db, "users", userId), data);
  } catch (error) {
    console.error("Error updating user data:", error);
    throw error;
  }
};

// Helper to get user role
const getUserRole = async (user: User) => {
  const userData = await getUserData(user.uid);
  return userData?.role || "resident";
};

// Room-related functions
const getAllRooms = async () => {
  try {
    const roomsSnapshot = await getDocs(collection(db, "rooms"));
    return roomsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting rooms:", error);
    throw error;
  }
};

const getRoomByNumber = async (roomNumber: string) => {
  try {
    const roomsQuery = query(collection(db, "rooms"), where("roomNumber", "==", roomNumber));
    const roomSnapshot = await getDocs(roomsQuery);
    
    if (roomSnapshot.empty) return null;
    
    return { id: roomSnapshot.docs[0].id, ...roomSnapshot.docs[0].data() };
  } catch (error) {
    console.error("Error getting room:", error);
    throw error;
  }
};

// Expense-related functions
const getAllExpenses = async () => {
  try {
    const expensesSnapshot = await getDocs(collection(db, "expenses"));
    return expensesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting expenses:", error);
    throw error;
  }
};

const addExpense = async (expenseData: any, receiptFile: File | null = null) => {
  try {
    // If receipt file is provided, upload it to storage
    let receiptURL = null;
    if (receiptFile) {
      const storageRef = ref(storage, `receipts/${Date.now()}_${receiptFile.name}`);
      await uploadBytes(storageRef, receiptFile);
      receiptURL = await getDownloadURL(storageRef);
    }
    
    // Add expense to Firestore
    const expenseRef = doc(collection(db, "expenses"));
    await setDoc(expenseRef, {
      ...expenseData,
      receiptURL,
      createdAt: new Date()
    });
    
    return { id: expenseRef.id, ...expenseData, receiptURL };
  } catch (error) {
    console.error("Error adding expense:", error);
    throw error;
  }
};

// Payment-related functions
const recordPayment = async (paymentData: any, receiptFile: File | null = null) => {
  try {
    // If receipt file is provided, upload it to storage
    let receiptURL = null;
    if (receiptFile) {
      const storageRef = ref(storage, `payment_receipts/${Date.now()}_${receiptFile.name}`);
      await uploadBytes(storageRef, receiptFile);
      receiptURL = await getDownloadURL(storageRef);
    }
    
    // Add payment to Firestore
    const paymentRef = doc(collection(db, "payments"));
    await setDoc(paymentRef, {
      ...paymentData,
      receiptURL,
      createdAt: new Date()
    });
    
    // Update room's payment history
    const roomDoc = await getRoomByNumber(paymentData.roomNumber);
    if (roomDoc) {
      const roomRef = doc(db, "rooms", roomDoc.id);
      
      // Get current payments array
      const currentRoom = await getDoc(roomRef);
      const payments = currentRoom.data()?.payments || [];
      
      // Update with new payment
      await updateDoc(roomRef, {
        payments: [...payments, {
          id: paymentRef.id,
          amount: paymentData.amount,
          date: paymentData.date,
          method: paymentData.method,
          receiptURL
        }]
      });
    }
    
    return { id: paymentRef.id, ...paymentData, receiptURL };
  } catch (error) {
    console.error("Error recording payment:", error);
    throw error;
  }
};

export {
  auth,
  db,
  storage,
  loginWithGoogle,
  loginWithEmail,
  registerWithEmail,
  logoutUser,
  getUserData,
  updateUserData,
  getUserRole,
  getAllRooms,
  getRoomByNumber,
  getAllExpenses,
  addExpense,
  recordPayment,
  onAuthStateChanged
};
