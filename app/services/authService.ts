// import { 
//   createUserWithEmailAndPassword, 
//   signInWithEmailAndPassword, 
//   signOut,
//   updateProfile 
// } from 'firebase/auth';
// import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'; // Thêm các hàm Firestore
// import { auth, db } from '../lib/firebase'; 

// export const authService = {
//   // 1. Đăng ký tài khoản mới + Lưu vào Firestore
//   register: async (email: string, pass: string, fullName: string, phone: string = '') => {
//     try {
//       const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
//       const user = userCredential.user;

//       // Cập nhật Profile trên Firebase Auth (Chỉ lưu tên và ảnh)
//       await updateProfile(user, { displayName: fullName });

//       // LƯU THÊM VÀO FIRESTORE (Để giữ số điện thoại và ngày tạo)
//       await setDoc(doc(db, 'users', user.uid), {
//         uid: user.uid,
//         fullName: fullName,
//         email: email.toLowerCase(),
//         phone: phone,
//         createdAt: serverTimestamp(),
//       });

//       return { success: true, user: user };
//     } catch (error: any) {
//       let msg = "Lỗi đăng ký";
//       if (error.code === 'auth/email-already-in-use') msg = "Email này đã được sử dụng";
//       if (error.code === 'auth/weak-password') msg = "Mật khẩu quá yếu (tối thiểu 6 ký tự)";
//       return { success: false, error: msg };
//     }
//   },

//   // 2. Đăng nhập + Lấy thông tin bổ sung
//   login: async (email: string, pass: string) => {
//     try {
//       const userCredential = await signInWithEmailAndPassword(auth, email, pass);
//       const user = userCredential.user;

//       // (Tùy chọn) Lấy thêm phone từ Firestore nếu cần
//       const userDoc = await getDoc(doc(db, 'users', user.uid));
//       const extraData = userDoc.exists() ? userDoc.data() : null;

//       return { 
//         success: true, 
//         user: { 
//           ...user, 
//           phone: extraData?.phone || '' // Đính kèm phone vào object trả về
//         } 
//       };
//     } catch (error: any) {
//       let msg = "Lỗi đăng nhập";
//       if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
//         msg = "Email hoặc mật khẩu không chính xác";
//       }
//       return { success: false, error: msg };
//     }
//   },

//   // 3. Đăng xuất
//   logout: async () => {
//     try {
//       await signOut(auth);
//       return { success: true };
//     } catch (error) {
//       return { success: false };
//     }
//   }
// };
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail // Thêm hàm này
  ,

  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

export const authService = {
  // 1. Đăng ký
  register: async (email: string, pass: string, fullName: string, phone: string = '') => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      const user = userCredential.user;
      await updateProfile(user, { displayName: fullName });
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        fullName: fullName,
        email: email.toLowerCase(),
        phone: phone,
        createdAt: serverTimestamp(),
      });
      return { success: true, user: user };
    } catch (error: any) {
      let msg = "Lỗi đăng ký";
      if (error.code === 'auth/email-already-in-use') msg = "Email này đã được sử dụng";
      return { success: false, error: msg };
    }
  },

  // 2. Đăng nhập (Phải trả về lỗi cụ thể để Alert hiển thị)
  login: async (email: string, pass: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), pass);
      const user = userCredential.user;
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const extraData = userDoc.exists() ? userDoc.data() : null;

      return { 
        success: true, 
        user: { ...user, phone: extraData?.phone || '' } 
      };
    } catch (error: any) {
      console.log("Mã lỗi Firebase:", error.code);
      // Trả về thông báo lỗi để LoginPage dùng Alert.alert hiển thị
      return { success: false, error: "Email hoặc mật khẩu không chính xác" };
    }
  },

  // 3. Quên mật khẩu (Gửi email đặt lại mật khẩu)
  forgotPassword: async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email.trim());
      return { success: true };
    } catch (error: any) {
      let msg = "Không thể gửi email đặt lại mật khẩu";
      if (error.code === 'auth/user-not-found') msg = "Email này chưa được đăng ký trên hệ thống";
      return { success: false, error: msg };
    }
  },

  // 4. Đăng xuất
  logout: async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  }
};