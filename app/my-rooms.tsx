import React, { createContext, useContext, useState } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  Image, Alert, SafeAreaView, Platform, StatusBar 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// --- PHẦN 1: MOCK DATA (Dữ liệu giả lập để không bị lỗi import) ---
const MOCK_MY_ROOMS = [
  {
    id: '1',
    title: 'Phòng trọ cao cấp Quận 1',
    price: 5500000,
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=500',
    available: true,
    address: '123 Đề Thám, Quận 1',
  },
  {
    id: '2',
    title: 'Căn hộ Studio Full nội thất',
    price: 7200000,
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=500',
    available: false,
    address: '45 Nguyễn Hữu Cảnh, Bình Thạnh',
  }
];

// --- PHẦN 2: GIAO DIỆN CHÍNH ---
export default function MyRoomsPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState(MOCK_MY_ROOMS);

  const handleDelete = (id: string) => {
    Alert.alert("Xác nhận", "Bạn có chắc muốn xóa tin đăng này?", [
      { text: "Hủy", style: "cancel" },
      { 
        text: "Xóa", 
        style: "destructive", 
        onPress: () => setRooms(prev => prev.filter(r => r.id !== id)) 
      }
    ]);
  };

  const renderItem = ({ item }: { item: typeof MOCK_MY_ROOMS[0] }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.roomImage} />
      
      <View style={styles.info}>
        <View style={[styles.badge, { backgroundColor: item.available ? '#DEF7EC' : '#F3F4F6' }]}>
          <Text style={[styles.badgeText, { color: item.available ? '#03543F' : '#4B5563' }]}>
            {item.available ? '● Đang hiển thị' : '○ Tạm ẩn'}
          </Text>
        </View>

        <Text style={styles.roomTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.price}>{item.price.toLocaleString('vi-VN')}đ/tháng</Text>
        
        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={[styles.actionBtn, styles.editBtn]}
            onPress={() => Alert.alert("Thông báo", "Tính năng chỉnh sửa đang phát triển")}
          >
            <Ionicons name="create-outline" size={16} color="#4F46E5" />
            <Text style={styles.editText}>Sửa</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionBtn, styles.deleteBtn]}
            onPress={() => handleDelete(item.id)}
          >
            <Ionicons name="trash-outline" size={16} color="#EF4444" />
            <Text style={styles.deleteText}>Xóa</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backCircle}>
          <Ionicons name="chevron-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Phòng của tôi</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Danh sách */}
      <FlatList
        data={rooms}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Ionicons name="home-outline" size={80} color="#E2E8F0" />
            <Text style={styles.emptyTitle}>Chưa có bài đăng nào</Text>
            <Text style={styles.emptySub}>Đăng tin ngay để tiếp cận hàng ngàn người thuê phòng.</Text>
            <TouchableOpacity 
              style={styles.postBtn}
              onPress={() => router.push('/post-room')}
            >
              <Text style={styles.postBtnText}>Đăng tin ngay</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Nút nổi thêm phòng */}
      {rooms.length > 0 && (
        <TouchableOpacity 
          style={styles.fab}
          onPress={() => router.push('/post-room')}
        >
          <Ionicons name="add" size={32} color="white" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B' },
  
  listContent: { padding: 20, paddingBottom: 100 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  roomImage: { width: 100, height: 100, borderRadius: 16 },
  info: { flex: 1, marginLeft: 15, justifyContent: 'space-between' },
  
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 5,
  },
  badgeText: { fontSize: 10, fontWeight: '700' },
  roomTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  price: { fontSize: 15, fontWeight: '800', color: '#4F46E5', marginTop: 2 },

  actionRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  editBtn: { borderColor: '#E0E7FF', backgroundColor: '#F5F7FF' },
  deleteBtn: { borderColor: '#FEE2E2', backgroundColor: '#FFF5F5' },
  editText: { color: '#4F46E5', fontWeight: '600', fontSize: 12 },
  deleteText: { color: '#EF4444', fontWeight: '600', fontSize: 12 },

  // Empty State
  emptyBox: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: '#1E293B', marginTop: 20 },
  emptySub: { textAlign: 'center', color: '#64748B', marginTop: 10, paddingHorizontal: 40, lineHeight: 22 },
  postBtn: { backgroundColor: '#4F46E5', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 15, marginTop: 25 },
  postBtnText: { color: '#FFF', fontWeight: 'bold' },

  fab: {
    position: 'absolute',
    bottom: 30,
    right: 25,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#4F46E5',
    shadowOpacity: 0.4,
    shadowRadius: 10,
  }
});