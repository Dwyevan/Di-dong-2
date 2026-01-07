import { db } from '../lib/firebase'; 
import { 
  collection, 
  getDocs, 
  getDoc,
  doc,
  query, 
  where,
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';

interface ServiceResponse {
  success: boolean;
  data: any;
  error: any;
}

export const roomService = {
  // 1. Lấy tất cả phòng (Dùng cho trang chủ index.tsx)
  getAllRooms: async (): Promise<ServiceResponse> => {
    try {
      const colRef = collection(db, 'room');
      const querySnapshot = await getDocs(colRef);
      const rooms = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return { success: true, data: rooms, error: null };
    } catch (error: any) {
      return { success: false, data: [], error: error.message };
    }
  },

  // 2. Lấy chi tiết một phòng (Dùng cho app/room-detail/[id].tsx)
  getRoomById: async (roomId: string): Promise<ServiceResponse> => {
    try {
      const docRef = doc(db, 'room', roomId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { success: true, data: { id: docSnap.id, ...docSnap.data() }, error: null };
      }
      return { success: false, data: null, error: "Không tìm thấy phòng" };
    } catch (error: any) {
      return { success: false, data: null, error: error.message };
    }
  },

  // 3. Lấy danh sách phòng theo mảng ID (Dùng cho trang Yêu thích favorites.tsx)
  getRoomsByIds: async (ids: string[]): Promise<ServiceResponse> => {
    if (!ids || ids.length === 0) return { success: true, data: [], error: null };
    try {
      const colRef = collection(db, 'room');
      // Firebase giới hạn lệnh 'in' tối đa 10 IDs/lần
      const q = query(colRef, where("__name__", "in", ids.slice(0, 10)));
      const querySnapshot = await getDocs(q);
      const rooms = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return { success: true, data: rooms, error: null };
    } catch (error: any) {
      return { success: false, data: [], error: error.message };
    }
  },

  // 4. Đăng phòng mới (Dùng cho app/post-room.tsx)
  createRoom: async (roomData: any): Promise<ServiceResponse> => {
    try {
      const colRef = collection(db, 'room');
      const docRef = await addDoc(colRef, {
        ...roomData,
        createdAt: serverTimestamp(),
      });
      return { success: true, data: { id: docRef.id }, error: null };
    } catch (error: any) {
      return { success: false, data: null, error: error.message };
    }
  }
};