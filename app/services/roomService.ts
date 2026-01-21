// import { db } from '../lib/firebase'; 
// import { 
//   collection, 
//   getDocs, 
//   getDoc,
//   doc,
//   query, 
//   where,
//   addDoc, 
//   serverTimestamp 
// } from 'firebase/firestore';

// interface ServiceResponse {
//   success: boolean;
//   data: any;
//   error: any;
// }

// export const roomService = {
//   // 1. Lấy tất cả phòng (Dùng cho trang chủ index.tsx)
//   getAllRooms: async (): Promise<ServiceResponse> => {
//     try {
//       const colRef = collection(db, 'room');
//       const querySnapshot = await getDocs(colRef);
//       const rooms = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//       return { success: true, data: rooms, error: null };
//     } catch (error: any) {
//       return { success: false, data: [], error: error.message };
//     }
//   },

//   // 2. Lấy chi tiết một phòng (Dùng cho app/room-detail/[id].tsx)
//   getRoomById: async (roomId: string): Promise<ServiceResponse> => {
//     try {
//       const docRef = doc(db, 'room', roomId);
//       const docSnap = await getDoc(docRef);
//       if (docSnap.exists()) {
//         return { success: true, data: { id: docSnap.id, ...docSnap.data() }, error: null };
//       }
//       return { success: false, data: null, error: "Không tìm thấy phòng" };
//     } catch (error: any) {
//       return { success: false, data: null, error: error.message };
//     }
//   },

//   // 3. Lấy danh sách phòng theo mảng ID (Dùng cho trang Yêu thích favorites.tsx)
//   getRoomsByIds: async (ids: string[]): Promise<ServiceResponse> => {
//     if (!ids || ids.length === 0) return { success: true, data: [], error: null };
//     try {
//       const colRef = collection(db, 'room');
//       // Firebase giới hạn lệnh 'in' tối đa 10 IDs/lần
//       const q = query(colRef, where("__name__", "in", ids.slice(0, 10)));
//       const querySnapshot = await getDocs(q);
//       const rooms = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//       return { success: true, data: rooms, error: null };
//     } catch (error: any) {
//       return { success: false, data: [], error: error.message };
//     }
//   },

//   // 4. Đăng phòng mới (Dùng cho app/post-room.tsx)
//   createRoom: async (roomData: any): Promise<ServiceResponse> => {
//     try {
//       const colRef = collection(db, 'room');
//       const docRef = await addDoc(colRef, {
//         ...roomData,
//         createdAt: serverTimestamp(),
//       });
//       return { success: true, data: { id: docRef.id }, error: null };
//     } catch (error: any) {
//       return { success: false, data: null, error: error.message };
//     }
//   }
// };
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where
} from 'firebase/firestore';
import { db } from '../lib/firebase';

interface ServiceResponse {
  success: boolean;
  data: any;
  error: any;
  chatId?: string;
}

export const roomService = {
  // 1. Lấy tất cả phòng
  getAllRooms: async (): Promise<ServiceResponse> => {
    try {
      const colRef = collection(db, 'rooms'); 
      const q = query(colRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const rooms = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return { success: true, data: rooms, error: null };
    } catch (error: any) {
      console.error("Lỗi lấy danh sách phòng:", error);
      return { success: false, data: [], error: error.message };
    }
  },

  // 2. Tìm kiếm phòng nâng cao (Kèm lọc theo loại và giá)
  searchRooms: async (searchTerm: string, filters?: { roomType?: string, maxPrice?: number }): Promise<ServiceResponse> => {
    try {
      const colRef = collection(db, 'rooms');
      // Lấy toàn bộ để filter tại client giúp tìm kiếm text mượt mà hơn (do Firestore hạn chế tìm keyword)
      const q = query(colRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const allRooms = querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));

      const filteredResults = allRooms.filter((room: any) => {
        // Lọc theo từ khóa (Tiêu đề hoặc Địa chỉ)
        const matchesSearch = searchTerm === "" || 
          (room.title?.toLowerCase() || "").includes(searchTerm.toLowerCase()) || 
          (room.address?.toLowerCase() || "").includes(searchTerm.toLowerCase());

        // Lọc theo loại phòng
        const matchesType = !filters?.roomType || filters.roomType === 'all' || 
          room.roomType === filters.roomType;

        // Lọc theo giá (Chuyển đổi về số để so sánh)
        const roomPrice = Number(room.price) || 0;
        const matchesPrice = !filters?.maxPrice || roomPrice <= filters.maxPrice;

        return matchesSearch && matchesType && matchesPrice;
      });

      return { success: true, data: filteredResults, error: null };
    } catch (error: any) {
      console.error("Lỗi tìm kiếm:", error);
      return { success: false, data: [], error: error.message };
    }
  },

  // 3. Lấy phòng yêu thích
  getFavoriteRooms: async (userId: string): Promise<ServiceResponse> => {
    try {
      const favRef = collection(db, 'favorites');
      const qFav = query(favRef, where("userId", "==", userId));
      const favSnapshot = await getDocs(qFav);
      
      const favoriteRoomIds = favSnapshot.docs.map(doc => doc.data().roomId);
      if (favoriteRoomIds.length === 0) return { success: true, data: [], error: null };

      const roomsRef = collection(db, 'rooms');
      const qRooms = query(roomsRef, where("__name__", "in", favoriteRoomIds.slice(0, 10)));
      const roomsSnapshot = await getDocs(qRooms);
      
      const rooms = roomsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return { success: true, data: rooms, error: null };
    } catch (error: any) {
      return { success: false, data: [], error: error.message };
    }
  },

  // 4. Lấy phòng theo UserId
  getRoomsByUserId: async (userId: string): Promise<ServiceResponse> => {
    try {
      const colRef = collection(db, 'rooms');
      const q = query(colRef, where("userId", "==", userId), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const rooms = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return { success: true, data: rooms, error: null };
    } catch (error: any) {
      return { success: false, data: [], error: error.message };
    }
  },

  // 5. Chi tiết một phòng
  getRoomById: async (roomId: string): Promise<ServiceResponse> => {
    try {
      const docRef = doc(db, 'rooms', roomId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { success: true, data: { id: docSnap.id, ...docSnap.data() }, error: null };
      }
      return { success: false, data: null, error: "Không tìm thấy phòng" };
    } catch (error: any) {
      return { success: false, data: null, error: error.message };
    }
  },

  // 6. Tạo, Sửa, Xóa
  createRoom: async (roomData: any): Promise<ServiceResponse> => {
    try {
      const colRef = collection(db, 'rooms');
      const docRef = await addDoc(colRef, { ...roomData, createdAt: serverTimestamp() });
      return { success: true, data: { id: docRef.id }, error: null };
    } catch (error: any) {
      return { success: false, data: null, error: error.message };
    }
  },

  updateRoom: async (roomId: string, updateData: any): Promise<ServiceResponse> => {
    try {
      const docRef = doc(db, 'rooms', roomId);
      await updateDoc(docRef, { ...updateData, updatedAt: serverTimestamp() });
      return { success: true, data: roomId, error: null };
    } catch (error: any) {
      return { success: false, data: null, error: error.message };
    }
  },

  deleteRoom: async (roomId: string): Promise<ServiceResponse> => {
    try {
      const docRef = doc(db, 'rooms', roomId);
      await deleteDoc(docRef);
      return { success: true, data: roomId, error: null };
    } catch (error: any) {
      return { success: false, data: null, error: error.message };
    }
  },

  // 7. Hẹn lịch & Chat
  createAppointment: async (appointmentData: any): Promise<ServiceResponse> => {
    try {
      const colRef = collection(db, 'appointments');
      const docRef = await addDoc(colRef, {
        ...appointmentData,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      return { success: true, data: docRef.id, error: null };
    } catch (error: any) {
      return { success: false, data: null, error: error.message };
    }
  },

  getOrCreateChat: async (userId: string, ownerId: string, roomId: string): Promise<ServiceResponse> => {
    try {
      const chatRef = collection(db, 'chats');
      const q = query(chatRef, 
        where("participants", "array-contains", userId),
        where("roomId", "==", roomId)
      );
      const snap = await getDocs(q);
      
      if (!snap.empty) {
        return { success: true, data: snap.docs[0].id, error: null };
      }

      const newChat = await addDoc(chatRef, {
        participants: [userId, ownerId],
        roomId: roomId,
        lastMessage: "",
        updatedAt: serverTimestamp()
      });
      return { success: true, data: newChat.id, error: null };
    } catch (error: any) {
      return { success: false, data: null, error: error.message };
    }
  }
};