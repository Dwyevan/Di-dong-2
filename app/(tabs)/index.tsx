import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import RoomCard from '../../components/RoomCard';
import { COLORS } from '../../constants/Colors';
import { useAuth } from '../context/AuthContext'; // Lấy thông tin user đăng nhập
import { roomService } from '../services/roomService'; // Sử dụng Service thực

const CATEGORIES = [
  { id: 'all', name: 'Tất cả', icon: 'grid-outline' },
  { id: 'Phòng riêng', name: 'Phòng riêng', icon: 'person-outline' },
  { id: 'Nguyên căn', name: 'Nguyên căn', icon: 'business-outline' },
  { id: 'Ở ghép', name: 'Ở ghép', icon: 'people-outline' },
];

export default function HomePage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  // --- STATE QUẢN LÝ DỮ LIỆU ---
  const [allRooms, setAllRooms] = useState<any[]>([]);      // Gốc từ Firebase
  const [filteredRooms, setFilteredRooms] = useState<any[]>([]); // Hiển thị sau lọc
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('all');

  // --- 1. LẤY DỮ LIỆU TỪ FIREBASE ---
  const fetchRooms = async () => {
    const result = await roomService.getAllRooms();
    if (result.success) {
      setAllRooms(result.data);
      setFilteredRooms(result.data);
    }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  // --- 2. LOGIC LỌC TẠI CHỖ (SEARCH & CATEGORY) ---
  useEffect(() => {
    const result = allRooms.filter(room => {
      const title = room.title?.toLowerCase() || '';
      const address = room.address?.toLowerCase() || '';
      const matchesSearch = title.includes(search.toLowerCase()) || 
                           address.includes(search.toLowerCase());
      
      const matchesCat = activeCat === 'all' || room.category === activeCat;
      return matchesSearch && matchesCat;
    });
    setFilteredRooms(result);
  }, [search, activeCat, allRooms]);

  // --- 3. XỬ LÝ LÀM MỚI (PULL TO REFRESH) ---
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchRooms();
  }, []);

  const handleGoToListings = () => {
    router.push({
      pathname: '/listings',
      params: { initialType: activeCat, initialSearch: search }
    });
  };

  // --- RENDER HEADER ---
  const renderHeader = () => (
    <View>
      <View style={styles.header}>
        <View>
          <Text style={styles.subGreeting}>Chào mừng bạn quay lại,</Text>
          <Text style={styles.greeting}>{user?.fullName || 'Khách hàng'}</Text>
        </View>
        <TouchableOpacity style={styles.iconCircle} onPress={() => router.push('/notifications')}>
          <Ionicons name="notifications-outline" size={22} color="#333" />
          <View style={styles.notifBadge} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Bạn muốn ở đâu hôm nay?"
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <TouchableOpacity style={styles.filterBtn} onPress={handleGoToListings}>
          <Ionicons name="options-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.catWrapper}>
        <FlatList
          data={CATEGORIES}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              onPress={() => setActiveCat(item.id)}
              style={[styles.catItem, activeCat === item.id && styles.catItemActive]}
            >
              <Ionicons 
                name={item.icon as any} 
                size={18} 
                color={activeCat === item.id ? 'white' : COLORS.primary} 
              />
              <Text style={[styles.catText, activeCat === item.id && styles.catTextActive]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Gợi ý phổ biến</Text>
        <TouchableOpacity onPress={handleGoToListings}>
          <Text style={styles.seeAll}>Xem tất cả</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredRooms}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
          }
          renderItem={({ item }) => (
            <View style={styles.cardPadding}>
              <RoomCard
                room={item}
                onViewRoom={() => router.push(`/room-detail/${item.id}`)}
                // Khi tích hợp Firebase đầy đủ, bạn sẽ cần hook useFavorites thực tế tại đây
                isFavorite={false} 
                onToggleFavorite={(id) => console.log('Toggle', id)}
              />
            </View>
          )}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={<View style={{ height: 100 }} />}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons name="search-outline" size={50} color="#DDD" />
              <Text style={styles.emptyText}>Không tìm thấy phòng nào phù hợp</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDFDFD' },
  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginTop: 15 },
  subGreeting: { fontSize: 13, color: '#888', fontWeight: '500' },
  greeting: { fontSize: 20, fontWeight: 'bold', color: '#1A1A1A', marginTop: 2 },
  iconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#F0F0F0' },
  notifBadge: { position: 'absolute', top: 12, right: 13, width: 8, height: 8, backgroundColor: '#FF5A5F', borderRadius: 4, borderWidth: 1.5, borderColor: 'white' },
  searchSection: { flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginVertical: 20 },
  searchContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F2F4F7', borderRadius: 16, paddingHorizontal: 15, height: 54 },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15, fontWeight: '500' },
  filterBtn: { backgroundColor: COLORS.primary, width: 54, height: 54, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  catWrapper: { marginBottom: 20 },
  catItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 25, marginRight: 10, borderWidth: 1, borderColor: '#EEE' },
  catItemActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  catText: { fontWeight: '600', color: '#666', marginLeft: 6, fontSize: 13 },
  catTextActive: { color: 'white' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A' },
  seeAll: { color: COLORS.primary, fontWeight: '600', fontSize: 13 },
  cardPadding: { paddingHorizontal: 20, marginBottom: 20 },
  emptyBox: { alignItems: 'center', marginTop: 40 },
  emptyText: { color: '#AAA', marginTop: 10, fontSize: 14 }
});