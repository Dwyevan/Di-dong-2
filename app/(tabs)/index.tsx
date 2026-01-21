import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
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
import { useFavorites } from '../../hooks/useFavorites'; // Đã tích hợp hook thực tế
import { useAuth } from '../context/AuthContext';
import { roomService } from '../services/roomService';

const { width } = Dimensions.get('window');

const CATEGORIES = [
  { id: 'all', name: 'Tất cả', icon: 'grid' },
  { id: 'Phòng riêng', name: 'Phòng trọ', icon: 'bed' },
  { id: 'Nguyên căn', name: 'Nhà nguyên căn', icon: 'home' },
  { id: 'Ở ghép', name: 'Ở ghép', icon: 'people' },
];

export default function HomePage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { favorites, toggleFavorite } = useFavorites();

  const [allRooms, setAllRooms] = useState<any[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('all');

  const fetchRooms = async () => {
    try {
      const result = await roomService.getAllRooms();
      if (result.success) {
        setAllRooms(result.data);
        setFilteredRooms(result.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    const result = allRooms.filter(room => {
      const title = room.title?.toLowerCase() || '';
      const address = room.address?.toLowerCase() || '';
      const matchesSearch = title.includes(search.toLowerCase()) || address.includes(search.toLowerCase());
      const matchesCat = activeCat === 'all' || room.roomType === activeCat;
      return matchesSearch && matchesCat;
    });
    setFilteredRooms(result);
  }, [search, activeCat, allRooms]);

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

  const renderHeader = () => (
    <View style={styles.headerContent}>
      {/* Top Header */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.subGreeting}>Xin chào 👋</Text>
          <Text style={styles.greeting}>{user?.fullName || 'Khách hàng'}</Text>
        </View>
        <TouchableOpacity style={styles.notifBtn} onPress={() => router.push('/notifications')}>
          <Ionicons name="notifications-outline" size={24} color="#1E293B" />
          <View style={styles.notifBadge} />
        </TouchableOpacity>
      </View>

      {/* Search Box */}
      <View style={styles.searchSection}>
        <View style={styles.searchInner}>
          <Ionicons name="search-outline" size={20} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm khu vực, tên đường..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <TouchableOpacity style={styles.filterBtn} onPress={handleGoToListings}>
          <Ionicons name="options" size={22} color="white" />
        </TouchableOpacity>
      </View>

      {/* Categories */}
      <View style={styles.catContainer}>
        <FlatList
          data={CATEGORIES}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              onPress={() => setActiveCat(item.id)}
              style={[styles.catCard, activeCat === item.id && styles.catCardActive]}
            >
              <View style={[styles.catIconBox, activeCat === item.id && styles.catIconBoxActive]}>
                <Ionicons 
                    name={item.icon as any} 
                    size={20} 
                    color={activeCat === item.id ? 'white' : COLORS.primary} 
                />
              </View>
              <Text style={[styles.catLabel, activeCat === item.id && styles.catLabelActive]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
        />
      </View>

      {/* Section Title */}
      <View style={styles.sectionHeader}>
        <View>
            <Text style={styles.sectionTitle}>Gợi ý cho bạn</Text>
            <Text style={styles.sectionSub}>Phòng trống mới nhất hôm nay</Text>
        </View>
        <TouchableOpacity onPress={handleGoToListings}>
          <Text style={styles.seeAllText}>Xem thêm</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      
      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredRooms}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
          }
          renderItem={({ item }) => (
            <View style={styles.cardContainer}>
              <RoomCard
                room={item}
                onViewRoom={() => router.push(`/room-detail/${item.id}`)}
                isFavorite={favorites.includes(item.id)} 
                onToggleFavorite={toggleFavorite}
              />
            </View>
          )}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={<View style={{ height: 40 }} />}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={60} color="#E2E8F0" />
              <Text style={styles.emptyText}>Rất tiếc, chưa có phòng nào phù hợp.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  headerContent: { backgroundColor: '#FFF', paddingBottom: 10, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginTop: 10 },
  subGreeting: { fontSize: 14, color: '#64748B', fontWeight: '500' },
  greeting: { fontSize: 22, fontWeight: '900', color: '#1E293B', marginTop: 2 },
  notifBtn: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  notifBadge: { position: 'absolute', top: 14, right: 14, width: 8, height: 8, backgroundColor: '#EF4444', borderRadius: 4, borderWidth: 1.5, borderColor: '#FFF' },
  
  searchSection: { flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginTop: 20 },
  searchInner: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 18, paddingHorizontal: 16, height: 56 },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: '#1E293B', fontWeight: '500' },
  filterBtn: { backgroundColor: COLORS.primary, width: 56, height: 56, borderRadius: 18, justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: COLORS.primary, shadowOpacity: 0.3, shadowRadius: 8 },
  
  catContainer: { marginTop: 25 },
  catCard: { alignItems: 'center', backgroundColor: '#FFF', padding: 8, borderRadius: 20, width: 90, borderWidth: 1, borderColor: '#F1F5F9' },
  catCardActive: { borderColor: COLORS.primary, backgroundColor: '#F0F9FF' },
  catIconBox: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  catIconBoxActive: { backgroundColor: COLORS.primary },
  catLabel: { fontSize: 11, fontWeight: '700', color: '#64748B' },
  catLabelActive: { color: COLORS.primary },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: 20, marginTop: 30, marginBottom: 15 },
  sectionTitle: { fontSize: 19, fontWeight: '900', color: '#1E293B' },
  sectionSub: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  seeAllText: { color: COLORS.primary, fontWeight: '700', fontSize: 13 },
  
  cardContainer: { paddingHorizontal: 20, marginBottom: 18 },
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { alignItems: 'center', marginTop: 60, gap: 10 },
  emptyText: { color: '#94A3B8', fontSize: 14, fontWeight: '500' }
});