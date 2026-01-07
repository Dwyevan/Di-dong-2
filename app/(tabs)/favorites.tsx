import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useFavorites } from '../../hooks/useFavorites';
import RoomCard from '../../components/RoomCard';
import { mockRooms } from '../data/mockRooms'; // Đảm bảo đúng đường dẫn
import { useRouter } from 'expo-router';
import { COLORS } from '../../constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function FavoritesPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { favorites, toggleFavorite, clearAllFavorites } = useFavorites(); // Giả sử hook có clearAll

  // Lọc danh sách phòng yêu thích từ dữ liệu mock
  const favoriteRooms = mockRooms.filter(room => favorites.includes(room.id));

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
      {/* HEADER NÂNG CẤP */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Bộ sưu tập</Text>
          <Text style={styles.subTitle}>Bạn đang có {favoriteRooms.length} phòng yêu thích</Text>
        </View>
        {/* Nút xóa nhanh nếu cần thiết */}
        {favoriteRooms.length > 1 && (
           <TouchableOpacity onPress={() => clearAllFavorites?.()}>
              <Text style={styles.clearText}>Xóa tất cả</Text>
           </TouchableOpacity>
        )}
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
              onToggleFavorite={() => toggleFavorite(item.id)}
              onViewRoom={() => router.push(`/room-detail/${item.id}`)}
            />
          </View>
        )}
        // Thêm footer để không bị che bởi Bottom Tabs
        ListFooterComponent={<View style={{ height: 100 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA', // Màu nền sáng hơn để nổi bật Card
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  subTitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  clearText: {
    color: COLORS.danger || '#FF3B30',
    fontWeight: '600',
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  row: {
    justifyContent: 'space-between',
  },
  cardWrapper: {
    width: '48%', // Chia cột chính xác hơn cho grid 2 cột
    marginBottom: 15,
  },
  // Empty States styles
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
  emptyText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  emptySub: {
    fontSize: 15,
    color: '#999',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  exploreBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 30,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  exploreBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});