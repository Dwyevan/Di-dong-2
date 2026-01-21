import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import RoomCard from '../../components/RoomCard';
import { COLORS } from '../../constants/Colors';
import { useCompare } from '../../hooks/useCompare';
import { useFavorites } from '../../hooks/useFavorites';
import { roomService } from '../services/roomService';

export default function ListingsPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { favorites, toggleFavorite } = useFavorites();
  const { compareList, toggleCompare } = useCompare();
  
  // --- STATES ---
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters State
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState('');
  const [priceMax, setPriceMax] = useState(20000000);
  const [roomType, setRoomType] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // --- ACTIONS ---
  const fetchRooms = useCallback(async (isRefreshing = false) => {
    if (isRefreshing) setRefreshing(true);
    else setLoading(true);

    try {
      const result = await roomService.getAllRooms();
      if (result.success) setRooms(result.data);
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  // Logic lọc dữ liệu chuyên nghiệp
  const filteredRooms = useMemo(() => {
    const searchLower = search.trim().toLowerCase();
    
    let result = rooms.filter(room => {
      const matchesSearch = !searchLower || 
        room.title?.toLowerCase().includes(searchLower) || 
        room.address?.toLowerCase().includes(searchLower);
      
      const roomPrice = Number(room.price) || 0;
      const matchesPrice = roomPrice <= priceMax;
      const matchesType = roomType === 'all' || room.roomType === roomType;
      
      return matchesSearch && matchesPrice && matchesType;
    });

    // Sorting logic
    return [...result].sort((a, b) => {
      if (sortBy === 'priceAsc') return a.price - b.price;
      if (sortBy === 'priceDesc') return b.price - a.price;
      // Mặc định mới nhất dựa trên createdAt (Firestore Timestamp)
      return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
    });
  }, [rooms, search, priceMax, roomType, sortBy]);

  const resetFilters = () => {
    setPriceMax(20000000);
    setRoomType('all');
    setSortBy('newest');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header Chuyên nghiệp */}
      <View style={styles.headerContainer}>
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={20} color="#64748B" />
            <TextInput
              style={styles.searchInput}
              placeholder="Khu vực, tên đường, dự án..."
              placeholderTextColor="#94A3B8"
              value={search}
              onChangeText={setSearch}
              clearButtonMode="while-editing"
            />
          </View>
          <TouchableOpacity 
            style={[styles.filterBtn, (priceMax < 20000000 || roomType !== 'all') && styles.filterBtnActive]} 
            onPress={() => setShowFilters(true)}
          >
            <Ionicons name="funnel-outline" size={20} color={showFilters ? COLORS.primary : "#1E293B"} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Thanh công cụ nhỏ */}
      <View style={styles.toolBar}>
        <Text style={styles.resultText}>
          Hiển thị <Text style={styles.boldText}>{filteredRooms.length}</Text> phòng trống
        </Text>
        <TouchableOpacity 
          style={styles.sortToggle}
          onPress={() => setSortBy(prev => prev === 'priceAsc' ? 'priceDesc' : 'priceAsc')}
        >
          <Text style={styles.sortLabel}>Giá</Text>
          <Ionicons 
            name={sortBy === 'priceAsc' ? "chevron-up" : "chevron-down"} 
            size={16} 
            color={COLORS.primary} 
          />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang cập nhật danh sách...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredRooms}
          keyExtractor={item => item.id}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => fetchRooms(true)} tintColor={COLORS.primary} />
          }
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <RoomCard
                room={item}
                isFavorite={favorites.includes(item.id)}
                onToggleFavorite={toggleFavorite}
                isCompared={compareList.includes(item.id)}
                onToggleCompare={toggleCompare}
                onViewRoom={() => router.push(`/room-detail/${item.id}`)}
              />
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons name="search-outline" size={64} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>Không có kết quả</Text>
              <Text style={styles.emptySub}>Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</Text>
              <TouchableOpacity style={styles.resetLink} onPress={resetFilters}>
                <Text style={styles.resetLinkText}>Xóa tất cả bộ lọc</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {/* Nút so sánh Floating Chuyên nghiệp */}
      {compareList.length > 0 && (
        <TouchableOpacity
          style={styles.floatingCompare}
          onPress={() => router.push('/compare')}
          activeOpacity={0.8}
        >
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{compareList.length}</Text>
          </View>
          <Text style={styles.floatingText}>So sánh ngay</Text>
          <Ionicons name="arrow-forward" size={18} color="white" />
        </TouchableOpacity>
      )}

      {/* Filter Modal đã tối ưu */}
      <Modal visible={showFilters} animationType="fade" transparent>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheet, { paddingBottom: insets.bottom + 16 }]}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Bộ lọc tìm kiếm</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Ionicons name="close-circle" size={28} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.sectionTitle}>Ngân sách tối đa</Text>
              <Text style={styles.priceValue}>{priceMax.toLocaleString()} VNĐ</Text>
              <View style={styles.chipGrid}>
                {[3000000, 5000000, 10000000, 15000000, 20000000].map(p => (
                  <TouchableOpacity 
                    key={p} 
                    style={[styles.chip, priceMax === p && styles.chipActive]}
                    onPress={() => setPriceMax(p)}
                  >
                    <Text style={[styles.chipText, priceMax === p && styles.chipTextActive]}>
                      {p >= 1000000 ? `${p/1000000}Tr` : p.toLocaleString()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.sectionTitle}>Hình thức cho thuê</Text>
              <View style={styles.typeList}>
                {[
                  { id: 'all', label: 'Tất cả loại hình', icon: 'business' },
                  { id: 'private', label: 'Phòng trọ riêng lẻ', icon: 'person' },
                  { id: 'shared', label: 'Ở ghép (Shared)', icon: 'people' },
                  { id: 'entire', label: 'Nguyên căn / Chung cư', icon: 'home' },
                ].map(type => (
                  <TouchableOpacity 
                    key={type.id} 
                    style={[styles.typeItem, roomType === type.id && styles.typeItemActive]}
                    onPress={() => setRoomType(type.id)}
                  >
                    <Ionicons 
                      name={type.icon as any} 
                      size={20} 
                      color={roomType === type.id ? COLORS.primary : "#64748B"} 
                    />
                    <Text style={[styles.typeItemLabel, roomType === type.id && styles.typeItemLabelActive]}>
                      {type.label}
                    </Text>
                    {roomType === type.id && <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />}
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.sheetFooter}>
              <TouchableOpacity style={styles.clearBtn} onPress={resetFilters}>
                <Text style={styles.clearBtnText}>Thiết lập lại</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyBtn} onPress={() => setShowFilters(false)}>
                <Text style={styles.applyBtnText}>Áp dụng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  
  // Header
  headerContainer: { backgroundColor: 'white', paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  searchSection: { flexDirection: 'row', paddingHorizontal: 16, gap: 12, marginTop: 8 },
  searchBar: { 
    flex: 1, flexDirection: 'row', alignItems: 'center', 
    backgroundColor: '#F1F5F9', borderRadius: 12, paddingHorizontal: 12, height: 46 
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 15, color: '#1E293B' },
  filterBtn: { 
    width: 46, height: 46, backgroundColor: '#F1F5F9', 
    borderRadius: 12, justifyContent: 'center', alignItems: 'center' 
  },
  filterBtnActive: { backgroundColor: '#E0F2FE', borderWidth: 1, borderColor: COLORS.primary },

  // Toolbar
  toolBar: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12
  },
  resultText: { fontSize: 14, color: '#64748B' },
  boldText: { fontWeight: '700', color: '#1E293B' },
  sortToggle: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'white', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, elevation: 1 },
  sortLabel: { fontSize: 13, fontWeight: '600', color: COLORS.primary },

  // List
  gridRow: { justifyContent: 'space-between' },
  listContent: { paddingHorizontal: 16, paddingBottom: 120 },
  cardWrapper: { width: '48.5%', marginBottom: 16 },

  // Empty State
  emptyBox: { alignItems: 'center', marginTop: 80, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B', marginTop: 16 },
  emptySub: { textAlign: 'center', color: '#64748B', marginTop: 8, lineHeight: 20 },
  resetLink: { marginTop: 20 },
  resetLinkText: { color: COLORS.primary, fontWeight: '600', textDecorationLine: 'underline' },

  // Floating Button
  floatingCompare: {
    position: 'absolute', bottom: 24, left: 24, right: 24,
    backgroundColor: '#1E293B', height: 56, borderRadius: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8
  },
  badge: { backgroundColor: COLORS.primary, width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  badgeText: { color: 'white', fontSize: 12, fontWeight: '800' },
  floatingText: { color: 'white', fontWeight: '700', fontSize: 16, marginRight: 8 },

  // Modal
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.5)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: 'white', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, maxHeight: '85%' },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  sheetTitle: { fontSize: 20, fontWeight: '800', color: '#1E293B' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginTop: 16, marginBottom: 12 },
  priceValue: { fontSize: 22, fontWeight: '800', color: COLORS.primary, marginBottom: 16 },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#F1F5F9' },
  chipActive: { backgroundColor: '#E0F2FE', borderColor: COLORS.primary },
  chipText: { color: '#64748B', fontWeight: '600' },
  chipTextActive: { color: COLORS.primary },
  typeList: { gap: 8 },
  typeItem: { 
    flexDirection: 'row', alignItems: 'center', padding: 16, 
    backgroundColor: '#F8FAFC', borderRadius: 16, gap: 12 
  },
  typeItemActive: { backgroundColor: '#F0F9FF', borderWidth: 1, borderColor: COLORS.primary },
  typeItemLabel: { flex: 1, fontSize: 15, color: '#475569', fontWeight: '500' },
  typeItemLabelActive: { color: '#1E293B', fontWeight: '700' },
  sheetFooter: { flexDirection: 'row', gap: 12, marginTop: 32 },
  clearBtn: { flex: 1, height: 52, justifyContent: 'center', alignItems: 'center', borderRadius: 12, backgroundColor: '#F1F5F9' },
  clearBtnText: { color: '#64748B', fontWeight: '700' },
  applyBtn: { flex: 2, height: 52, justifyContent: 'center', alignItems: 'center', borderRadius: 12, backgroundColor: COLORS.primary },
  applyBtnText: { color: 'white', fontWeight: '700' },
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#64748B' }
});