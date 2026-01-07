import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, 
  Alert, Modal, TextInput, KeyboardAvoidingView, Platform, 
  TouchableWithoutFeedback, Keyboard, StatusBar 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFavorites } from '../../hooks/useFavorites';
import { useHistory } from '../../hooks/useHistory';
import { mockRooms } from '../data/mockRooms'; 
import { COLORS } from '../../constants/Colors';
import { hp } from '../helpers/responsive';

export default function RoomDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  // Hooks
  const { favorites, toggleFavorite } = useFavorites();
  const { addToHistory } = useHistory();
  const room = mockRooms.find(r => r.id === id);

  // State
  const [showSchedule, setShowSchedule] = useState(false);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [isLogined] = useState(true);

  useEffect(() => {
    if (id) addToHistory(id);
  }, [id]);

  // SỬA LỖI CENTER: Nếu không thấy phòng
  if (!room) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={50} color="#ccc" />
        <Text style={{marginTop: 10, color: '#666'}}>Không tìm thấy thông tin phòng!</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={{color: 'white', fontWeight: 'bold'}}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isFavorite = favorites.includes(room.id);

  // SỬA LỖI handleMessage
  const handleMessage = () => {
    if (!isLogined) {
      Alert.alert("Thông báo", "Vui lòng đăng nhập để chat với chủ nhà");
      return;
    }
    Alert.alert("Tin nhắn", `Đang kết nối với chủ nhà phòng: ${room.title}`);
  };

  const handleConfirmSchedule = () => {
    if (!date || !time) return Alert.alert("Lỗi", "Vui lòng nhập ngày và giờ");
    Alert.alert("Thành công", `Yêu cầu xem phòng đã được gửi!`);
    setShowSchedule(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header Buttons */}
      <View style={[styles.navBar, { top: insets.top + 10 }]}>
        <TouchableOpacity style={styles.circularBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.circularBtn} onPress={() => toggleFavorite(room.id)}>
          <Ionicons 
            name={isFavorite ? "heart" : "heart-outline"} 
            size={24} 
            color={isFavorite ? COLORS.danger : "black"} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <Image source={{ uri: room.image }} style={styles.mainImage} />
        
        <View style={styles.infoBox}>
          {/* SỬA LỖI rowBetween */}
          <View style={styles.rowBetween}>
            <Text style={styles.price}>{room.price.toLocaleString()}đ<Text style={styles.unit}>/tháng</Text></Text>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text style={styles.ratingText}>{room.rating}</Text>
            </View>
          </View>

          <Text style={styles.title}>{room.title}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={16} color={COLORS.primary} />
            <Text style={styles.locationText}>{room.location}</Text>
          </View>

          {/* SỬA LỖI maxPeople */}
          <View style={styles.specRow}>
            <View style={styles.specItem}>
              <Ionicons name="resize-outline" size={20} color="#555" />
              <Text style={styles.specText}>{room.area}m²</Text>
            </View>
            <View style={styles.specItem}>
              <Ionicons name="people-outline" size={20} color="#555" />
              <Text style={styles.specText}>Tối đa {room.maxPeople || 2} người</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Tiện ích</Text>
          <View style={styles.amenitiesGrid}>
            {room.amenities.map((item, idx) => (
              <View key={idx} style={styles.amenityBox}>
                <Text style={styles.amenityText}>{item}</Text>
              </View>
            ))}
          </View>

          <Text style={[styles.sectionTitle, {marginTop: 20}]}>Mô tả</Text>
          <Text style={styles.description}>
            {room.description || "Phòng sạch sẽ, thoáng mát, an ninh tốt. Gần các trường đại học và khu mua sắm sầm uất. Điện nước tính theo giá nhà nước."}
          </Text>
        </View>
      </ScrollView>

      {/* Footer Actions */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 10 }]}>
        <TouchableOpacity style={styles.chatBtn} onPress={handleMessage}>
          <Ionicons name="chatbubble-ellipses-outline" size={22} color={COLORS.primary} />
          <Text style={styles.chatBtnText}>Nhắn tin</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bookBtn} onPress={() => setShowSchedule(true)}>
          <Text style={styles.bookBtnText}>Đặt lịch xem</Text>
        </TouchableOpacity>
      </View>

      {/* Modal Lịch hẹn */}
      <Modal visible={showSchedule} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Hẹn lịch xem phòng</Text>
              <TouchableOpacity onPress={() => setShowSchedule(false)}>
                <Ionicons name="close" size={24} color="black" />
              </TouchableOpacity>
            </View>
            <TextInput style={styles.input} placeholder="Ngày xem (VD: 25/12)" value={date} onChangeText={setDate} />
            <TextInput style={styles.input} placeholder="Giờ xem (VD: 15:00)" value={time} onChangeText={setTime} />
            <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirmSchedule}>
              <Text style={styles.confirmBtnText}>Gửi yêu cầu</Text>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  // FIX LỖI center
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  backBtn: { backgroundColor: COLORS.primary, padding: 12, borderRadius: 10, marginTop: 15 },
  
  navBar: { position: 'absolute', left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between', zIndex: 50 },
  circularBtn: { backgroundColor: 'white', width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center', elevation: 5, shadowOpacity: 0.2 },
  mainImage: { width: '100%', height: hp(38) },
  infoBox: { padding: 20, marginTop: -20, backgroundColor: 'white', borderTopLeftRadius: 25, borderTopRightRadius: 25 },
  
  // FIX LỖI rowBetween
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  
  price: { fontSize: 24, fontWeight: 'bold', color: COLORS.primary },
  unit: { fontSize: 14, color: '#888', fontWeight: 'normal' },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF9E6', padding: 5, borderRadius: 8 },
  ratingText: { marginLeft: 4, fontWeight: 'bold', color: '#FFA800' },
  title: { fontSize: 20, fontWeight: 'bold', marginTop: 10 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  locationText: { color: '#666', marginLeft: 5, fontSize: 14 },
  specRow: { flexDirection: 'row', marginTop: 20, gap: 20 },
  specItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F7FA', padding: 10, borderRadius: 12, gap: 8 },
  specText: { fontWeight: '600', color: '#444' },
  divider: { height: 1, backgroundColor: '#EEE', marginVertical: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  amenityBox: { backgroundColor: '#F0F2F5', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  amenityText: { color: '#555', fontSize: 13 },
  description: { lineHeight: 22, color: '#666' },
  footer: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: 'white', flexDirection: 'row', padding: 16, gap: 12, borderTopWidth: 1, borderTopColor: '#EEE' },
  chatBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: COLORS.primary, borderRadius: 15, height: 54 },
  chatBtnText: { color: COLORS.primary, fontWeight: 'bold', marginLeft: 5 },
  bookBtn: { flex: 1.5, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', borderRadius: 15 },
  bookBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', padding: 25, borderTopLeftRadius: 30, borderTopRightRadius: 30 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  input: { backgroundColor: '#F5F7FA', padding: 15, borderRadius: 12, marginBottom: 15 },
  confirmBtn: { backgroundColor: COLORS.primary, padding: 18, borderRadius: 15, alignItems: 'center' },
  confirmBtnText: { color: 'white', fontWeight: 'bold' }
});