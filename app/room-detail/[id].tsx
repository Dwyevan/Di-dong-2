import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/Colors';
import { useFavorites } from '../../hooks/useFavorites';
import { useHistory } from '../../hooks/useHistory';
import { useAuth } from '../context/AuthContext';
import { hp } from '../helpers/responsive';
import { appointmentService } from '../services/appointmentService';
import { roomService } from '../services/roomService';

export default function RoomDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const { favorites, toggleFavorite } = useFavorites();
  const { addToHistory } = useHistory();

  const [room, setRoom] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showSchedule, setShowSchedule] = useState(false);
  const [isDepositMode, setIsDepositMode] = useState(false); 
  const [date, setDate] = useState('');
  const [endDate, setEndDate] = useState(''); 
  const [time, setTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchRoomDetail = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const result = await roomService.getRoomById(id);
        if (result.success) {
          setRoom(result.data);
          addToHistory(id);
        } else {
          Alert.alert("Lỗi", result.error || "Không thể tải chi tiết phòng");
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchRoomDetail();
  }, [id]);

  const handleMessage = async () => {
    if (!user) return Alert.alert("Yêu cầu", "Vui lòng đăng nhập để nhắn tin");
    if (user.id === room.userId) {
      return Alert.alert("Thông báo", "Bạn không thể nhắn tin cho chính mình!");
    }
    setIsSubmitting(true);
    try {
      const result = await roomService.getOrCreateChat(user.id, room.userId, room);
      if (result.success) {
        router.push({
          pathname: '/chat-detail' as any,
          params: { chatId: (result as any).chatId, roomTitle: room.title }
        });
      }
    } catch (error: any) {
      Alert.alert("Lỗi", error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmSchedule = async () => {
    if (!user) return Alert.alert("Yêu cầu", "Vui lòng đăng nhập để thực hiện");
    
    // XỬ LÝ NGHIỆP VỤ ĐẶT CỌC (Chuyển trang)
    if (isDepositMode) {
        if (!date || !endDate) return Alert.alert("Lỗi", "Vui lòng nhập ngày bắt đầu và kết thúc");
        
        setShowSchedule(false);
        // SỬA LỖI GẠCH ĐỎ: Thêm 'as any' cho pathname và đảm bảo params đúng kiểu
        router.push({
          pathname: "/booking" as any,
          params: { 
            id: String(room.id), 
            startDate: date, 
            endDate: endDate 
          }
        });
        return; 
    } 

    // XỬ LÝ NGHIỆP VỤ HẸN XEM (Lưu trực tiếp)
    if (!date || !time) return Alert.alert("Lỗi", "Vui lòng nhập đầy đủ ngày và giờ xem");

    setIsSubmitting(true);
    try {
      const appointmentData = {
        roomId: room.id,
        roomTitle: room.title,
        roomImage: room.picture || room.image || '',
        tenantId: user.id, 
        hostId: room.userId,
        type: 'VIEWING', 
        startDate: date,
        endDate: null,
        bookingTime: time,
        status: 'pending',
        createdAt: new Date(),
      };

      const result = await appointmentService.createBooking(appointmentData);

      if (result.success) {
        Alert.alert("Thành công", "Lịch xem phòng đã được gửi!", [
          { text: "Xem danh sách", onPress: () => router.push('/appointments' as any) },
          { text: "Đóng", style: "cancel" }
        ]);
        setShowSchedule(false);
        setDate(''); setTime('');
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể thực hiện yêu cầu lúc này");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  if (!room) return <View style={styles.center}><Text>Không tìm thấy phòng!</Text></View>;

  const isFavorite = favorites.includes(room.id);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={[styles.navBar, { top: insets.top + 10 }]}>
        <TouchableOpacity style={styles.circularBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.circularBtn} onPress={() => toggleFavorite(room.id)}>
          <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={24} color={isFavorite ? COLORS.danger : "black"} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <Image source={{ uri: room.picture || room.image || 'https://via.placeholder.com/400' }} style={styles.mainImage} />
        
        <View style={styles.infoBox}>
          <View style={styles.rowBetween}>
            <Text style={styles.price}>{typeof room.price === 'number' ? room.price.toLocaleString('vi-VN') : room.price}đ<Text style={styles.unit}>/tháng</Text></Text>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={14} color="#FFD700" /><Text style={styles.ratingText}>{room.rating || '5.0'}</Text>
            </View>
          </View>

          <Text style={styles.title}>{room.title}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={16} color={COLORS.primary} />
            <Text style={styles.locationText}>{room.address}</Text>
          </View>

          <View style={styles.specRow}>
            <View style={styles.specItem}><Ionicons name="resize-outline" size={20} color="#555" /><Text style={styles.specText}>{room.area}m²</Text></View>
            <View style={styles.specItem}><Ionicons name="people-outline" size={20} color="#555" /><Text style={styles.specText}>Tối đa {room.maxPeople} người</Text></View>
          </View>

          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>Tiện ích</Text>
          <View style={styles.amenitiesGrid}>
            {room.amenities?.map((item: string, idx: number) => (
              <View key={idx} style={styles.amenityBox}><Text style={styles.amenityText}>{item}</Text></View>
            ))}
          </View>

          <Text style={[styles.sectionTitle, {marginTop: 24}]}>Mô tả</Text>
          <Text style={styles.description}>{room.description || "Chưa có mô tả chi tiết."}</Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 10 }]}>
        <TouchableOpacity style={styles.chatBtnSmall} onPress={handleMessage} disabled={isSubmitting}>
          <Ionicons name="chatbubble-ellipses-outline" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.bookBtnOutline} 
          onPress={() => { setIsDepositMode(false); setShowSchedule(true); }}
        >
          <Text style={styles.bookBtnOutlineText}>Hẹn xem</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.depositBtn} 
          onPress={() => { setIsDepositMode(true); setShowSchedule(true); }}
        >
          <Text style={styles.bookBtnText}>Đặt cọc</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showSchedule} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{isDepositMode ? "Đặt cọc từ ngày" : "Hẹn lịch xem phòng"}</Text>
              <TouchableOpacity onPress={() => setShowSchedule(false)}><Ionicons name="close" size={28} color="black" /></TouchableOpacity>
            </View>
            
            <Text style={styles.label}>{isDepositMode ? "Ngày bắt đầu" : "Ngày xem"} (DD/MM/YYYY)</Text>
            <TextInput style={styles.input} placeholder="VD: 25/01/2026" value={date} onChangeText={setDate} keyboardType="number-pad" />
            
            {isDepositMode ? (
              <>
                <Text style={styles.label}>Ngày kết thúc (DD/MM/YYYY)</Text>
                <TextInput style={styles.input} placeholder="VD: 25/02/2026" value={endDate} onChangeText={setEndDate} keyboardType="number-pad" />
                <View style={styles.depositNote}><Text style={styles.noteText}>* Lưu ý: Tiền cọc dùng để giữ chỗ phòng trong thời gian này.</Text></View>
              </>
            ) : (
              <>
                <Text style={styles.label}>Giờ xem (HH:MM)</Text>
                <TextInput style={styles.input} placeholder="VD: 15:30" value={time} onChangeText={setTime} keyboardType="number-pad" />
              </>
            )}
            
            <TouchableOpacity style={[styles.confirmBtn, isSubmitting && { opacity: 0.6 }]} onPress={handleConfirmSchedule} disabled={isSubmitting}>
              {isSubmitting ? <ActivityIndicator color="white" /> : <Text style={styles.confirmBtnText}>Xác nhận ngay</Text>}
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

// ... Styles giữ nguyên như code cũ của bạn
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  navBar: { position: 'absolute', left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between', zIndex: 50 },
  circularBtn: { backgroundColor: 'white', width: 45, height: 45, borderRadius: 23, justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: '#000', shadowOpacity: 0.15 },
  mainImage: { width: '100%', height: hp(40) },
  infoBox: { padding: 24, marginTop: -30, backgroundColor: 'white', borderTopLeftRadius: 35, borderTopRightRadius: 35, elevation: 5 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: { fontSize: 26, fontWeight: '800', color: COLORS.primary },
  unit: { fontSize: 16, color: '#999', fontWeight: '400' },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF9E6', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  ratingText: { marginLeft: 5, fontWeight: '700', color: '#FFA800', fontSize: 15 },
  title: { fontSize: 22, fontWeight: 'bold', marginTop: 12, color: '#1A1A1A' },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  locationText: { color: '#777', marginLeft: 6, fontSize: 15 },
  specRow: { flexDirection: 'row', marginTop: 24, gap: 15 },
  specItem: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FB', padding: 12, borderRadius: 15, gap: 10 },
  specText: { fontWeight: '600', color: '#333', fontSize: 14 },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 25 },
  sectionTitle: { fontSize: 19, fontWeight: 'bold', color: '#1A1A1A' },
  amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 },
  amenityBox: { backgroundColor: '#F0F4F8', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 12 },
  amenityText: { color: '#4A5568', fontSize: 14, fontWeight: '500' },
  description: { lineHeight: 24, color: '#555', fontSize: 15, marginTop: 10 },
  footer: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: 'white', flexDirection: 'row', padding: 20, gap: 12, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  chatBtnSmall: { width: 56, height: 56, borderWidth: 2, borderColor: COLORS.primary, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  bookBtnOutline: { flex: 1, borderWidth: 2, borderColor: COLORS.primary, borderRadius: 18, height: 56, justifyContent: 'center', alignItems: 'center' },
  bookBtnOutlineText: { color: COLORS.primary, fontWeight: '700', fontSize: 16 },
  depositBtn: { flex: 1.2, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', borderRadius: 18, height: 56, elevation: 4 },
  bookBtnText: { color: 'white', fontWeight: '700', fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', padding: 30, borderTopLeftRadius: 40, borderTopRightRadius: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  modalTitle: { fontSize: 22, fontWeight: 'bold' },
  label: { fontSize: 15, fontWeight: '600', marginBottom: 8, color: '#444' },
  input: { backgroundColor: '#F5F7FA', padding: 16, borderRadius: 15, marginBottom: 20, fontSize: 16, borderWidth: 1, borderColor: '#EEE' },
  confirmBtn: { backgroundColor: COLORS.primary, padding: 18, borderRadius: 18, alignItems: 'center', marginTop: 10 },
  confirmBtnText: { color: 'white', fontWeight: 'bold', fontSize: 17 },
  depositNote: { backgroundColor: '#FFF5F5', padding: 10, borderRadius: 10, marginBottom: 20 },
  noteText: { color: COLORS.danger, fontSize: 12, fontStyle: 'italic' }
});