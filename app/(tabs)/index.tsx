import { 
  View, Text, StyleSheet, FlatList, TextInput, 
  TouchableOpacity, StatusBar, Dimensions 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import RoomCard from '../../components/RoomCard';
import { mockRooms } from '../data/mockRooms';
import { COLORS } from '../../constants/Colors';
// GIẢ SỬ BẠN CÓ HOOK NÀY (Nếu chưa có tôi sẽ hướng dẫn tạo ở bước dưới)
import { useFavorites } from '../../hooks/useFavorites'; 

const { width } = Dimensions.get('window');

const CATEGORIES = [
  { id: 'all', name: 'Tất cả', icon: 'grid-outline' },
  { id: 'private', name: 'Phòng riêng', icon: 'person-outline' },
  { id: 'entire', name: 'Nguyên căn', icon: 'business-outline' },
  { id: 'shared', name: 'Ở ghép', icon: 'people-outline' },
];

export default function HomePage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('all');
  
  // Lấy logic yêu thích từ Hook
  const { favorites, toggleFavorite } = useFavorites();

  const displayRooms = useMemo(() => {
    return mockRooms.filter(room => {
      const matchesSearch = room.title.toLowerCase().includes(search.toLowerCase()) || 
                           room.location.toLowerCase().includes(search.toLowerCase());
      const matchesCat = activeCat === 'all' || room.roomType === activeCat;
      return matchesSearch && matchesCat;
    });
  }, [search, activeCat]);

  const handleGoToListings = () => {
    router.push({
      pathname: '/listings',
      params: { initialType: activeCat, initialSearch: search }
    });
  };

  const renderHeader = () => (
    <View>
      <View style={styles.header}>
        <View>
          <Text style={styles.subGreeting}>Chào mừng bạn quay lại,</Text>
          <Text style={styles.greeting}>Khám phá không gian mới</Text>
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
            onSubmitEditing={handleGoToListings}
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

      <View style={styles.banner}>
        <View style={styles.bannerInfo}>
          <Text style={styles.bannerTitle}>Hỗ trợ tìm phòng sạch</Text>
          <Text style={styles.bannerSub}>Cam kết không thu phí môi giới</Text>
          <TouchableOpacity style={styles.bannerBtn}>
            <Text style={styles.bannerBtnText}>Xem ngay</Text>
          </TouchableOpacity>
        </View>
        <Ionicons name="shield-checkmark" size={60} color="rgba(255,255,255,0.3)" />
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
      
      <FlatList
        data={displayRooms}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.cardPadding}>
            <RoomCard
              room={item}
              onViewRoom={() => router.push(`/room-detail/${item.id}`)}
              // --- TRUYỀN CÁC PROPS BỊ THIẾU Ở ĐÂY ---
              isFavorite={favorites.includes(item.id)}
              onToggleFavorite={(id) => toggleFavorite(id)}
              // Bạn có thể truyền thêm onToggleCompare nếu cần
            />
          </View>
        )}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={<View style={{ height: 100 }} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Ionicons name="search-outline" size={50} color="#DDD" />
            <Text style={styles.emptyText}>Rất tiếc, không tìm thấy kết quả nào</Text>
          </View>
        }
      />
    </View>
  );
}

// Giữ nguyên phần styles của bạn bên dưới...
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDFDFD' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20,
    marginTop: 15
  },
  subGreeting: { fontSize: 13, color: '#888', fontWeight: '500' },
  greeting: { fontSize: 20, fontWeight: 'bold', color: '#1A1A1A', marginTop: 2 },
  iconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#F0F0F0' },
  notifBadge: { position: 'absolute', top: 12, right: 13, width: 8, height: 8, backgroundColor: '#FF5A5F', borderRadius: 4, borderWidth: 1.5, borderColor: 'white' },
  
  searchSection: { flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginVertical: 20 },
  searchContainer: {
    flex: 1, flexDirection: 'row', alignItems: 'center', 
    backgroundColor: '#F2F4F7', borderRadius: 16, paddingHorizontal: 15, height: 54
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15, fontWeight: '500' },
  filterBtn: { backgroundColor: COLORS.primary, width: 54, height: 54, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  
  catWrapper: { marginBottom: 20 },
  catItem: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', 
    paddingHorizontal: 18, paddingVertical: 10, borderRadius: 25, marginRight: 10,
    borderWidth: 1, borderColor: '#EEE'
  },
  catItemActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  catText: { fontWeight: '600', color: '#666', marginLeft: 6, fontSize: 13 },
  catTextActive: { color: 'white' },
  
  banner: { 
    backgroundColor: COLORS.primary, marginHorizontal: 20, borderRadius: 20, 
    padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 25
  },
  bannerInfo: { flex: 1 },
  bannerTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  bannerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 4 },
  bannerBtn: { backgroundColor: 'white', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 10, marginTop: 12, alignSelf: 'flex-start' },
  bannerBtnText: { color: COLORS.primary, fontWeight: 'bold', fontSize: 12 },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A' },
  seeAll: { color: COLORS.primary, fontWeight: '600', fontSize: 13 },
  
  cardPadding: { paddingHorizontal: 20, marginBottom: 20 },
  emptyBox: { alignItems: 'center', marginTop: 40 },
  emptyText: { color: '#AAA', marginTop: 10, fontSize: 14 }
});