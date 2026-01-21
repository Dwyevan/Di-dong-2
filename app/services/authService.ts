import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

export const authService = {
  // 1. Đăng ký tài khoản mới
  register: async (email: string, pass: string, fullName: string, phone: string = '') => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      const user = userCredential.user;
      
      // Cập nhật tên hiển thị trong Auth
      await updateProfile(user, { displayName: fullName });
      
      // Lưu thông tin bổ sung vào Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        fullName: fullName,
        email: email.toLowerCase().trim(),
        phone: phone,
        createdAt: serverTimestamp(),
      });
      
      return { success: true, user: user };
    } catch (error: any) {
      let msg = "Lỗi đăng ký";
      if (error.code === 'auth/email-already-in-use') msg = "Email này đã được sử dụng";
      if (error.code === 'auth/weak-password') msg = "Mật khẩu quá yếu (tối thiểu 6 ký tự)";
      if (error.code === 'auth/invalid-email') msg = "Định dạng email không hợp lệ";
      return { success: false, error: msg };
    }
  },

  // 2. Đăng nhập
  login: async (email: string, pass: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), pass);
      const user = userCredential.user;
      
      // Lấy thêm dữ liệu (như số điện thoại) từ Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const extraData = userDoc.exists() ? userDoc.data() : null;

      return { 
        success: true, 
        user: { ...user, phone: extraData?.phone || '' } 
      };
    } catch (error: any) {
      console.log("Mã lỗi Firebase:", error.code);
      let msg = "Email hoặc mật khẩu không chính xác";
      if (error.code === 'auth/user-not-found') msg = "Tài khoản không tồn tại";
      if (error.code === 'auth/wrong-password') msg = "Mật khẩu không chính xác";
      return { success: false, error: msg };
    }
  },

  // 3. Quên mật khẩu (Gửi email đặt lại mật khẩu)
  // Hàm này sẽ gửi 1 link về email người dùng để họ tự đổi mật khẩu mới
  forgotPassword: async (email: string) => {
    try {
      if (!email || email.trim() === "") {
        return { success: false, error: "Vui lòng nhập địa chỉ email" };
      }
      
      await sendPasswordResetEmail(auth, email.trim());
      return { success: true };
    } catch (error: any) {
      console.log("Lỗi Forgot Password:", error.code);
      let msg = "Không thể gửi email đặt lại mật khẩu";
      
      // Một số mã lỗi phổ biến từ Firebase
      if (error.code === 'auth/user-not-found') {
        msg = "Email này chưa được đăng ký trên hệ thống";
      } else if (error.code === 'auth/invalid-email') {
        msg = "Định dạng email không hợp lệ";
      } else if (error.code === 'auth/too-many-requests') {
        msg = "Thao tác quá nhanh, vui lòng thử lại sau vài phút";
      }
      
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