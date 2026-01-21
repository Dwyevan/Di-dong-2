import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import RoomCard from '../../components/RoomCard';
import { COLORS } from '../../constants/Colors';
import { useAuth } from '../context/AuthContext'; // Lấy userId người dùng
import { roomService } from '../services/roomService'; // Sử dụng Service thực tế

export default function FavoritesPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth(); // Lấy thông tin user hiện tại

  const [favoriteRooms, setFavoriteRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // --- HÀM LẤY DỮ LIỆU THỰC TẾ TỪ FIREBASE ---
  const fetchFavorites = async () => {
    if (!user?.id) return;
    setLoading(true);
    
    // Gọi hàm getFavoriteRooms đã viết trong roomService
    const result = await roomService.getFavoriteRooms(user.id);
    
    if (result.success) {
      setFavoriteRooms(result.data);
    }
    setLoading(false);
  };

  // Tự động load lại mỗi khi người dùng vào tab này
  useFocusEffect(
    useCallback(() => {
      fetchFavorites();
    }, [user?.id])
  );

  // Hàm xử lý khi bỏ yêu thích (Xóa khỏi Firebase)
  const handleToggleFavorite = async (roomId: string) => {
    // Gọi API xóa favorite
    // Sau khi xóa xong, cập nhật lại danh sách tại chỗ để UX mượt mà
    setFavoriteRooms(prev => prev.filter(item => item.id !== roomId));
    // Code gọi Service xóa ở đây...
  };

  // Giao diện khi đang tải
  if (loading) {
    return (
      <View style={styles.loadingCenter}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // Giao diện khi danh sách trống
  if (favoriteRooms.length === 0) {
    return (
      <View style={[styles.emptyContainer, { paddingTop: insets.top }]}>
        <View style={styles.emptyIconCircle}>
          <Ionicons name="heart-dislike-outline" size={80} color={COLORS.primary} />
        </View>
        <Text style={styles.emptyText}>Danh sách trống</Text>
        <Text style={styles.emptySub}>
          Bạn chưa lưu phòng nào. Hãy khám phá và nhấn thả tim để lưu lại nhé!
        </Text>
        <TouchableOpacity 
          style={styles.exploreBtn} 
          onPress={() => router.push('/(tabs)')}
        >
          <Text style={styles.exploreBtnText}>Khám phá ngay</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Bộ sưu tập</Text>
          <Text style={styles.subTitle}>Bạn đang có {favoriteRooms.length} phòng yêu thích</Text>
        </View>
      </View>

      <FlatList
        data={favoriteRooms}
        keyExtractor={item => item.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <RoomCard
              room={item}
              isFavorite={true}
              onToggleFavorite={() => handleToggleFavorite(item.id)}
              onViewRoom={() => router.push(`/room-detail/${item.id}`)}
            />
          </View>
        )}
        ListFooterComponent={<View style={{ height: 100 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  loadingCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  title: { fontSize: 26, fontWeight: 'bold', color: '#1A1A1A' },
  subTitle: { fontSize: 14, color: '#666', marginTop: 4 },
  listContent: { paddingHorizontal: 15, paddingTop: 10 },
  row: { justifyContent: 'space-between' },
  cardWrapper: { width: '48%', marginBottom: 15 },
  emptyContainer: {
    flex: 1,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptyIconCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#FFF0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyText: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  emptySub: { fontSize: 15, color: '#999', textAlign: 'center', lineHeight: 22, marginBottom: 30 },
  exploreBtn: {
    backgroundColor: '#4F46E5', // Thay COLORS.primary bằng mã màu thực tế nếu lỗi
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 30,
    elevation: 5,
  },
  exploreBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});