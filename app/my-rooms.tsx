
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from './context/AuthContext';
import { roomService } from './services/roomService';

// --- COMPONENT CON: NÚT THAO TÁC (Tối ưu hiệu suất) ---
const ActionButton = ({ onPress, icon, label, color, bgColor, borderColor }: any) => (
  <TouchableOpacity 
    style={[styles.actionBtn, { backgroundColor: bgColor, borderColor: borderColor }]} 
    onPress={onPress}
  >
    <Ionicons name={icon} size={16} color={color} />
    <Text style={[styles.actionText, { color: color }]}>{label}</Text>
  </TouchableOpacity>
);

export default function MyRoomsPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // --- 1. LOGIC LẤY DỮ LIỆU ---
  // Dùng useFocusEffect để tự động load lại dữ liệu mỗi khi người dùng quay lại tab này
  useFocusEffect(
    useCallback(() => {
      fetchMyRooms();
    }, [user?.id])
  );

  const fetchMyRooms = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    
    const result = await roomService.getRoomsByUserId(user.id);
    if (result.success) {
      setRooms(result.data);
    } else {
      Alert.alert("Lỗi", "Không thể tải danh sách phòng: " + result.error);
    }
    setLoading(false);
    setRefreshing(false);
  };

  // --- 2. LOGIC LÀM MỚI (PULL TO REFRESH) ---
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMyRooms();
  }, [user?.id]);

  // --- 3. LOGIC XÓA TIN ĐĂNG ---
  const handleDelete = (id: string) => {
    Alert.alert(
      "Xác nhận xóa", 
      "Bài đăng này sẽ bị xóa vĩnh viễn khỏi hệ thống. Bạn chắc chắn chứ?",
      [
        { text: "Hủy", style: "cancel" },
        { 
          text: "Xóa", 
          style: "destructive", 
          onPress: async () => {
            const res = await roomService.deleteRoom(id);
            if (res.success) {
              setRooms(prev => prev.filter(r => r.id !== id));
            } else {
              Alert.alert("Lỗi", "Không thể xóa bài đăng lúc này.");
            }
          } 
        }
      ]
    );
  };

  // --- 4. RENDER GIAO DIỆN TỪNG CARD ---
  const renderItem = useCallback(({ item }: { item: any }) => (
    <View style={styles.card}>
      <Image 
        source={{ uri: item.image || 'https://via.placeholder.com/150?text=No+Image' }} 
        style={styles.roomImage} 
      />
      
      <View style={styles.info}>
        <View style={styles.badgeRow}>
          <View style={[styles.badge, { backgroundColor: item.available !== false ? '#DEF7EC' : '#FEE2E2' }]}>
            <Text style={[styles.badgeText, { color: item.available !== false ? '#03543F' : '#991B1B' }]}>
              {item.available !== false ? '● Đang hiển thị' : '○ Tạm ẩn'}
            </Text>
          </View>
        </View>

        <Text style={styles.roomTitle} numberOfLines={2}>{item.title || 'Phòng chưa đặt tên'}</Text>
        <Text style={styles.price}>
          {Number(item.price || 0).toLocaleString('vi-VN')}
          <Text style={styles.unit}> đ/tháng</Text>
        </Text>
        
        <View style={styles.actionRow}>
          <ActionButton 
            icon="create-outline" label="Sửa" color="#4F46E5" 
            bgColor="#F5F7FF" borderColor="#E0E7FF"
            onPress={() => router.push({ pathname: '/post-room', params: { editId: item.id } })}
          />
          <ActionButton 
            icon="trash-outline" label="Xóa" color="#EF4444" 
            bgColor="#FFF5F5" borderColor="#FEE2E2"
            onPress={() => handleDelete(item.id)}
          />
        </View>
      </View>
    </View>
  ), []);

  // --- 5. HIỂN THỊ TRẠNG THÁI LOADING ---
  if (loading && !refreshing) {
    return (
      <View style={styles.loadingCenter}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={{ marginTop: 12, color: '#64748B' }}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backCircle}>
          <Ionicons name="chevron-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Phòng của tôi</Text>
        <TouchableOpacity onPress={onRefresh} style={styles.backCircle}>
          <Ionicons name="refresh" size={20} color="#4F46E5" />
        </TouchableOpacity>
      </View>

      {/* Danh sách FlatList */}
      <FlatList
        data={rooms}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#4F46E5"]} />
        }
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Ionicons name="home-outline" size={80} color="#E2E8F0" />
            <Text style={styles.emptyTitle}>Bạn chưa đăng tin nào</Text>
            <Text style={styles.emptySub}>Hãy đăng tin ngay để tìm kiếm khách thuê tiềm năng.</Text>
            <TouchableOpacity 
              style={styles.postBtn}
              onPress={() => router.push('/post-room')}
            >
              <Text style={styles.postBtnText}>Đăng tin ngay</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Nút nổi thêm phòng nhanh */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => router.push('/post-room')}
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  loadingCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  roomImage: { width: 110, height: 110, borderRadius: 16, backgroundColor: '#F1F5F9' },
  info: { flex: 1, marginLeft: 15, justifyContent: 'space-between' },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  roomTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginTop: 5 },
  price: { fontSize: 17, fontWeight: '800', color: '#4F46E5', marginTop: 2 },
  unit: { fontSize: 12, color: '#64748B', fontWeight: '400' },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    gap: 5,
  },
  actionText: { fontSize: 13, fontWeight: '600' },
  emptyBox: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: '#1E293B', marginTop: 20 },
  emptySub: { textAlign: 'center', color: '#64748B', marginTop: 10, paddingHorizontal: 40 },
  postBtn: { backgroundColor: '#4F46E5', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 15, marginTop: 25 },
  postBtnText: { color: '#FFF', fontWeight: 'bold' },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 25,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  }
});