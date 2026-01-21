import {
    addDoc,
    collection,
    doc,
    getDoc,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    Timestamp,
    updateDoc,
    where
} from "firebase/firestore";
import { db } from "../lib/firebase";

const COLLECTION_NAME = "appointments";

// --- Định nghĩa Kiểu dữ liệu ---
export type BookingType = 'view' | 'stay';
export type AppointmentStatus = 'pending' | 'waiting_deposit' | 'confirmed' | 'contracted' | 'cancelled' | 'completed';
export type DepositStatus = 'unpaid' | 'pending_approval' | 'paid';

export interface AppointmentResponse {
    success: boolean;
    data?: any;
    error?: string;
}

export interface UpdateRentalParams {
    bookingType: BookingType;
    status: AppointmentStatus;
    checkInDate: string;
    checkOutDate: string;
    depositAmount: number;
    totalPrice: number;
    depositStatus?: DepositStatus;
}

// --- Service xử lý logic ---
export const appointmentService = {
    // 1. Tạo mới yêu cầu đặt cọc/xem phòng
    createBooking: async (data: any): Promise<AppointmentResponse> => {
        try {
            await addDoc(collection(db, COLLECTION_NAME), {
                ...data,
                bookingType: (data.bookingType as BookingType) || 'view',
                status: 'pending' as AppointmentStatus,
                depositStatus: 'unpaid' as DepositStatus,
                evidenceImage: "",
                createdAt: serverTimestamp(),
            });
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    },

    // 2. Lấy chi tiết 1 lịch hẹn (Dùng để xem hồ sơ CCCD/Thông tin đã cọc)
    getAppointmentById: async (id: string): Promise<AppointmentResponse> => {
        try {
            const docRef = doc(db, COLLECTION_NAME, id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
            }
            return { success: false, error: "Không tìm thấy dữ liệu" };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    },

    // 3. Lấy danh sách cá nhân (Realtime)
    getMyAppointments: (userId: string, callback: (data: any[]) => void) => {
        const q = query(
            collection(db, COLLECTION_NAME),
            where("tenantId", "==", userId),
            orderBy("createdAt", "desc")
        );

        return onSnapshot(q, (snapshot) => {
            const appointments = snapshot.docs.map(docSnap => {
                const item = docSnap.data();
                let dateStr = item.date || 'Chưa rõ';
                let timeStr = item.time || '';
                
                if (item.bookingDate instanceof Timestamp) {
                    const d = item.bookingDate.toDate();
                    dateStr = d.toLocaleDateString('vi-VN');
                    timeStr = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                }

                return {
                    id: docSnap.id,
                    ...item,
                    roomImage: item.roomImage || item.imageUrl || (item.images && item.images[0]) || 'https://via.placeholder.com/150',
                    date: dateStr,
                    time: timeStr,
                };
            });
            callback(appointments);
        }, (error) => console.error("Firebase Index Error:", error));
    },

    // 4. Cập nhật trạng thái tổng quát
    updateAppointmentStatus: async (id: string, status: AppointmentStatus): Promise<AppointmentResponse> => {
        try {
            const docRef = doc(db, COLLECTION_NAME, id);
            await updateDoc(docRef, {
                status: status,
                updatedAt: serverTimestamp(),
            });
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    },

    // 5. Xác nhận đã nhận tiền cọc (Chuyển sang trạng thái đã ký hợp đồng)
    confirmDepositPaid: async (appointmentId: string): Promise<AppointmentResponse> => {
        try {
            const docRef = doc(db, COLLECTION_NAME, appointmentId);
            await updateDoc(docRef, {
                depositStatus: 'paid' as DepositStatus,
                status: 'contracted' as AppointmentStatus,
                updatedAt: serverTimestamp(),
            });
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    },

    // 6. Hủy lịch hẹn
    cancelAppointment: async (id: string): Promise<AppointmentResponse> => {
        try {
            const docRef = doc(db, COLLECTION_NAME, id);
            await updateDoc(docRef, {
                status: 'cancelled' as AppointmentStatus,
                cancelledAt: serverTimestamp()
            });
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }
};