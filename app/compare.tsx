import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { mockRooms } from '../app/data/mockRooms';
import { useRoom } from './context/RoomContext'; // Sử dụng Context để lấy dữ liệu thực tế
import { COLORS } from '../constants/Colors';

export default function CompareRoomsPage() {
  const router = useRouter();
  const { compareList, toggleCompare } = useRoom();
  
  // Lọc danh sách phòng dựa trên IDs trong compareList của Context
  const rooms = mockRooms.filter(r => compareList.includes(r.id));

  // Định nghĩa các tiêu chí so sánh chi tiết hơn
  const features = [
    { 
      label: 'Giá thuê', 
      getValue: (r: any) => `${r.price.toLocaleString('vi-VN')}đ` 
    },
    { 
      label: 'Loại phòng', 
      getValue: (r: any) => r.roomType === 'private' ? 'Phòng riêng' : r.roomType === 'shared' ? 'Phòng chung' : 'Toàn bộ căn' 
    },
    { 
      label: 'Diện tích', 
      getValue: (r: any) => `${r.area} m²` 
    },
    { 
      label: 'Sức chứa', 
      getValue: (r: any) => `Tối đa ${r.maxPeople || 2} người` 
    },
    { 
      label: 'Tiện nghi', 
      getValue: (r: any) => r.amenities.join(' • ') 
    },
    { 
      label: 'Đánh giá', 
      getValue: (r: any) => `⭐ ${r.rating} (${r.reviews} lượt)` 
    },
  ];

  if (rooms.length < 2) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="git-compare-outline" size={80} color="#CCC" />
        <Text style={styles.emptyTitle}>Chưa đủ phòng để so sánh</Text>
        <Text style={styles.emptySub}>Vui lòng chọn ít nhất 2 phòng để thực hiện đối chiếu các thông số.</Text>
        <TouchableOpacity style={styles.btnSearch} onPress={() => router.push('/')}>
          <Text style={styles.btnText}>Tìm phòng ngay</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>So sánh chi tiết ({rooms.length})</Text>
        <View style={{ width: 24 }} /> 
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.table}>
            {/* Hàng Header: Ảnh và Tên phòng */}
            <View style={styles.headerRow}>
              <View style={styles.labelCellHeader}>
                <Text style={styles.labelHeaderText}>Thông tin</Text>
              </View>
              {rooms.map(room => (
                <View key={room.id} style={styles.roomColumnHeader}>
                  <TouchableOpacity 
                    style={styles.removeIcon} 
                    onPress={() => toggleCompare(room.id)}
                  >
                    <Ionicons name="close-circle" size={22} color="#FF4444" />
                  </TouchableOpacity>
                  <Image source={{ uri: room.image }} style={styles.roomImage} />
                  <Text style={styles.roomTitle} numberOfLines={2}>{room.title}</Text>
                </View>
              ))}
            </View>

            {/* Các hàng tiêu chí so sánh */}
            {features.map((feature, idx) => (
              <View key={idx} style={[styles.row, idx % 2 === 0 ? { backgroundColor: '#FFF' } : { backgroundColor: '#F9F9F9' }]}>
                <View style={styles.labelCell}>
                  <Text style={styles.labelCellText}>{feature.label}</Text>
                </View>
                {rooms.map(room => (
                  <View key={room.id} style={styles.valueCell}>
                    <Text style={styles.valueCellText}>{feature.getValue(room)}</Text>
                  </View>
                ))}
              </View>
            ))}

            {/* Hàng Hành động */}
            <View style={styles.actionRow}>
              <View style={styles.labelCell} />
              {rooms.map(room => (
                <View key={room.id} style={styles.roomColumnHeader}>
                  <TouchableOpacity 
                    style={styles.viewBtn} 
                    onPress={() => router.push(`/room-detail/${room.id}`)}
                  >
                    <Text style={styles.viewBtnText}>Chọn phòng này</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#FFF' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    paddingTop: 50, 
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderColor: '#EEE'
  },
  title: { fontSize: 18, fontWeight: 'bold' },
  table: { flexDirection: 'column' },
  headerRow: { flexDirection: 'row', alignItems: 'flex-end', borderBottomWidth: 2, borderColor: '#EEE' },
  labelCellHeader: { width: 100, padding: 12, height: 180, justifyContent: 'flex-end' },
  labelHeaderText: { fontWeight: 'bold', color: '#888', fontSize: 12, textTransform: 'uppercase' },
  roomColumnHeader: { width: 200, padding: 12, alignItems: 'center', position: 'relative' },
  roomImage: { width: 160, height: 100, borderRadius: 10, marginBottom: 10 },
  roomTitle: { fontWeight: 'bold', textAlign: 'center', fontSize: 14, height: 40 },
  removeIcon: { position: 'absolute', top: 5, right: 15, zIndex: 10 },

  row: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#EEE', alignItems: 'center' },
  labelCell: { width: 100, padding: 15, borderRightWidth: 1, borderColor: '#EEE' },
  labelCellText: { fontWeight: '600', color: '#555' },
  valueCell: { width: 200, padding: 15, alignItems: 'center' },
  valueCellText: { textAlign: 'center', color: '#333', lineHeight: 20 },

  actionRow: { flexDirection: 'row', marginTop: 10, paddingBottom: 40 },
  viewBtn: { backgroundColor: COLORS.primary, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  viewBtnText: { color: 'white', fontWeight: 'bold', fontSize: 13 },

  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 20 },
  emptySub: { color: '#888', textAlign: 'center', marginTop: 10, marginBottom: 30, lineHeight: 22 },
  btnSearch: { backgroundColor: COLORS.primary, paddingHorizontal: 30, paddingVertical: 15, borderRadius: 12 },
  btnText: { color: 'white', fontWeight: 'bold' },
});