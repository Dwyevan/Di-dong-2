import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";


// Cấu hình lấy từ Firebase Console của bạn
const firebaseConfig = { 
  apiKey: "AIzaSyDBxmf5CFBZl9_PZ3NdVipf6Vv59cn8cQM", 
  authDomain: "roomrentapp-92a8d.firebaseapp.com", 
  projectId: "roomrentapp-92a8d", 
  storageBucket: "roomrentapp-92a8d.firebasestorage.app", 
  messagingSenderId: "473038805598", 
  appId: "1:473038805598:web:8036635fba73527abd32cf", 
  measurementId: "G-M4R4VTDJV3" 
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);

// Khởi tạo và Xuất (export) các dịch vụ để dùng ở các file khác
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;