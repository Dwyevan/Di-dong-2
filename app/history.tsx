import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, Modal, TextInput, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRoom } from './context/RoomContext'; // Đảm bảo đường dẫn đúng tới context của bạn
import { mockRooms } from './data/mockRooms';
import { COLORS } from '../constants/Colors';
import { useState, useEffect } from 'react';

export default function RoomDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  // Sử dụng Centralized State từ RoomContext
  const { 
    favorites, 
    toggleFavorite, 
    addToHistory, 
    addAppointment 
  } = useRoom();

  const room = mockRooms.find(r => r.id === id);

  const [showSchedule, setShowSchedule] = useState(false);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [isLogined] = useState(true); // Giả lập trạng thái đăng nhập

  useEffect(() => {
    if (id) addToHistory(id);
  }, [id]);

  if (!room) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFoundText}>Không tìm thấy thông tin phòng</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={{color: 'white'}}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isFavorite = favorites.includes(room.id);

  // Xử lý gửi tin nhắn
  const handleChat = () => {
    if (!isLogined) {
      Alert.alert("Yêu cầu đăng nhập", "Vui lòng đăng nhập để trao đổi với chủ nhà");
      return;
    }
    // Chuyển hướng đến trang chat hoặc hiện Alert
    Alert.alert("Tin nhắn", `Bắt đầu chat về phòng: ${room.title}`);
  };

  // Xử lý lưu lịch hẹn vào nghiệp vụ hệ thống
  const handleScheduleConfirm = () => {
    if (!date || !time) {
      Alert.alert('Thiếu thông tin', 'Vui lòng chọn ngày và giờ xem phòng');
      return;
    }

    // Gửi dữ liệu vào Context để hiển thị ở trang "Lịch hẹn"
    addAppointment({
      roomId: room.id,
      roomTitle: room.title,
      date: date,
      time: time,
    });

    Alert.alert('Thành công!', `Yêu cầu xem phòng đã được gửi tới chủ nhà.`);
    setShowSchedule(false);
    setDate('');
    setTime('');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* Header với nút Back và Favorite */}
        <View style={styles.headerNav}>
          <TouchableOpacity style={styles.iconCircle} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconCircle} onPress={() => toggleFavorite(room.id)}>
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={24}
              color={isFavorite ? COLORS.danger : 'black'}
            />
          </TouchableOpacity>
        </View>

        <Image source={{ uri: room.image }} style={styles.mainImage} />

        <View style={styles.contentCard}>
          <View style={styles.rowBetween}>
            <Text style={styles.price}>{room.price.toLocaleString('vi-VN')}đ<Text style={styles.unit}>/tháng</Text></Text>
            <View style={styles.ratingBox}>
              <Ionicons name="star" size={16} color="#FFB800" />
              <Text style={styles.ratingText}>{room.rating}</Text>
            </View>
          </View>
          
          <Text style={styles.title}>{room.title}</Text>

          {/* Vị trí */}
          <View style={styles.locationContainer}>
            <Ionicons name="location-sharp" size={20} color={COLORS.primary} />
            <Text style={styles.locationText}>{room.location}</Text>
          </View>

          <View style={styles.divider} />

          {/* Thông số cơ bản */}
          <View style={styles.specGrid}>
            <View style={styles.specItem}>
              <Ionicons name="resize-outline" size={20} color="#666" />
              <Text style={styles.specValue}>{room.area}m²</Text>
            </View>
            <View style={styles.specItem}>
              <Ionicons name="people-outline" size={20} color="#666" />
              <Text style={styles.specValue}>Tối đa {room.maxPeople || 2} người</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Tiện nghi phòng</Text>
          <View style={styles.amenitiesList}>
            {room.amenities.map((amenity, index) => (
              <View key={index} style={styles.amenityTag}>
                <Text style={styles.amenityTagText}>{amenity}</Text>
              </View>
            ))}
          </View>

          {/* Link xem đánh giá */}
          <TouchableOpacity
            style={styles.reviewsLink}
            onPress={() => router.push(`/reviews/${id}`)}
          >
            <Text style={styles.reviewsLinkText}>Xem {room.reviews} đánh giá từ khách thuê</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Footer cố định chứa các nút hành động */}
      <View style={styles.footerActions}>
        <TouchableOpacity style={styles.btnChat} onPress={handleChat}>
          <Ionicons name="chatbubble-ellipses-outline" size={22} color={COLORS.primary} />
          <Text style={styles.btnChatText}>Nhắn tin</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnBook} onPress={() => setShowSchedule(true)}>
          <Text style={styles.btnBookText}>Đặt lịch xem</Text>
        </TouchableOpacity>
      </View>

      {/* Modal đặt lịch */}
      <Modal visible={showSchedule} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
               <Text style={styles.modalTitle}>Chọn thời gian xem phòng</Text>
               <TouchableOpacity onPress={() => setShowSchedule(false)}>
                 <Ionicons name="close" size={24} color="black" />
               </TouchableOpacity>
            </View>
            
            <Text style={styles.inputLabel}>Ngày xem</Text>
            <TextInput style={styles.input} placeholder="Ví dụ: 25/12/2025" value={date} onChangeText={setDate} />
            
            <Text style={styles.inputLabel}>Giờ xem</Text>
            <TextInput style={styles.input} placeholder="Ví dụ: 10:00 sáng" value={time} onChangeText={setTime} />
            
            <TouchableOpacity style={styles.btnConfirm} onPress={handleScheduleConfirm}>
              <Text style={styles.btnConfirmText}>Gửi yêu cầu đặt lịch</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  headerNav: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  iconCircle: {
    backgroundColor: 'white',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowOpacity: 0.2,
  },
  mainImage: { width: '100%', height: 350 },
  contentCard: { 
    marginTop: -30, 
    backgroundColor: 'white', 
    borderTopLeftRadius: 30, 
    borderTopRightRadius: 30, 
    padding: 24,
    minHeight: 500
  },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: { fontSize: 24, fontWeight: 'bold', color: COLORS.primary },
  unit: { fontSize: 14, color: '#888', fontWeight: 'normal' },
  ratingBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF9E6', padding: 6, borderRadius: 8 },
  ratingText: { marginLeft: 4, fontWeight: 'bold', color: '#FFA800' },
  title: { fontSize: 20, fontWeight: 'bold', marginVertical: 12, color: '#1A1A1A' },
  locationContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  locationText: { fontSize: 15, color: '#666', marginLeft: 6, flex: 1 },
  divider: { height: 1, backgroundColor: '#EEE', marginVertical: 20 },
  specGrid: { flexDirection: 'row', gap: 20, marginBottom: 25 },
  specItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  specValue: { fontWeight: '600', color: '#333' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  amenitiesList: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  amenityTag: { backgroundColor: '#F0F2F5', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 10 },
  amenityTagText: { color: '#444', fontSize: 14 },
  reviewsLink: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    marginTop: 30, 
    padding: 15, 
    backgroundColor: COLORS.primary + '08',
    borderRadius: 12
  },
  reviewsLinkText: { color: COLORS.primary, fontWeight: 'bold' },
  
  // Footer
  footerActions: { 
    position: 'absolute', 
    bottom: 0, 
    width: '100%', 
    backgroundColor: 'white', 
    padding: 20, 
    flexDirection: 'row', 
    gap: 15,
    borderTopWidth: 1,
    borderColor: '#EEE'
  },
  btnChat: { 
    flex: 1, 
    borderWidth: 1.5, 
    borderColor: COLORS.primary, 
    borderRadius: 12, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    height: 50 
  },
  btnChatText: { color: COLORS.primary, fontWeight: 'bold', marginLeft: 8 },
  btnBook: { 
    flex: 1.5, 
    backgroundColor: COLORS.primary, 
    borderRadius: 12, 
    alignItems: 'center', 
    justifyContent: 'center', 
    height: 50 
  },
  btnBookText: { color: 'white', fontWeight: 'bold', fontSize: 16 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', padding: 25, borderTopLeftRadius: 25, borderTopRightRadius: 25 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  inputLabel: { fontSize: 14, color: '#666', marginBottom: 8 },
  input: { backgroundColor: '#F5F7FA', padding: 15, borderRadius: 12, marginBottom: 15, fontSize: 16 },
  btnConfirm: { backgroundColor: COLORS.primary, padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  btnConfirmText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  notFoundText: { fontSize: 16, color: '#888' },
  backBtn: { backgroundColor: COLORS.primary, padding: 12, borderRadius: 8, marginTop: 10 }
});