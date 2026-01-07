import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  Modal, TextInput, ScrollView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import RoomCard from '../../components/RoomCard';
import { mockRooms } from '../data/mockRooms';
import { useFavorites } from '../../hooks/useFavorites';
import { useCompare } from '../../hooks/useCompare';
import { COLORS } from '../../constants/Colors';

export default function ListingsPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { favorites, toggleFavorite } = useFavorites();
  const { compareList, toggleCompare } = useCompare();
  
  // States nghiệp vụ
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState('');
  const [priceMax, setPriceMax] = useState(20000000);
  const [roomType, setRoomType] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Xử lý lọc và sắp xếp
  const filteredRooms = useMemo(() => {
    let result = mockRooms.filter(room => {
      const matchesSearch = room.title.toLowerCase().includes(search.toLowerCase()) || 
                           room.location.toLowerCase().includes(search.toLowerCase());
      const matchesPrice = room.price <= priceMax;
      const matchesType = roomType === 'all' || room.roomType === roomType;
      return matchesSearch && matchesPrice && matchesType;
    });

    if (sortBy === 'priceAsc') result.sort((a, b) => a.price - b.price);
    if (sortBy === 'priceDesc') result.sort((a, b) => b.price - a.price);
    
    return result;
  }, [search, priceMax, roomType, sortBy]);

  const resetFilters = () => {
    setPriceMax(20000000);
    setRoomType('all');
    setSortBy('newest');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Search & Filter Header */}
      <View style={styles.topSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm theo khu vực..."
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <TouchableOpacity style={styles.filterIcon} onPress={() => setShowFilters(true)}>
          <Ionicons name="options-outline" size={24} color={COLORS.primary} />
          {(priceMax < 20000000 || roomType !== 'all') && <View style={styles.filterBadge} />}
        </TouchableOpacity>
      </View>

      {/* Sorting Bar */}
      <View style={styles.sortBar}>
        <Text style={styles.resultCount}>{filteredRooms.length} kết quả</Text>
        <View style={styles.sortOptions}>
          <TouchableOpacity onPress={() => setSortBy(sortBy === 'priceAsc' ? 'priceDesc' : 'priceAsc')}>
            <View style={styles.sortItem}>
              <Text style={styles.sortText}>Sắp xếp giá</Text>
              <Ionicons 
                name={sortBy === 'priceAsc' ? "arrow-up" : "arrow-down"} 
                size={14} color={COLORS.primary} 
              />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={filteredRooms}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.cardContainer}>
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
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Không tìm thấy phòng phù hợp</Text>
          </View>
        }
      />

      {/* Compare Floating Button */}
      {compareList.length >= 1 && (
        <TouchableOpacity
          style={styles.compareFloatingBtn}
          onPress={() => router.push('/compare')}
        >
          <View style={styles.compareCount}>
            <Text style={styles.compareCountText}>{compareList.length}</Text>
          </View>
          <Text style={styles.compareBtnText}>So sánh</Text>
        </TouchableOpacity>
      )}

      {/* Filter Modal */}
      <Modal visible={showFilters} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Ionicons name="close" size={24} color="black" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Bộ lọc</Text>
              <TouchableOpacity onPress={resetFilters}>
                <Text style={styles.resetBtn}>Xóa hết</Text>
              </TouchableOpacity>
            </View>

            <ScrollView>
              <Text style={styles.filterLabel}>Giá tối đa: {priceMax.toLocaleString()}đ</Text>
              <View style={styles.priceGrid}>
                {[5000000, 10000000, 15000000, 20000000].map(p => (
                  <TouchableOpacity 
                    key={p} 
                    style={[styles.priceTag, priceMax === p && styles.activeTag]}
                    onPress={() => setPriceMax(p)}
                  >
                    <Text style={[styles.tagText, priceMax === p && styles.activeTagText]}>
                      {p/1000000}Tr
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.filterLabel}>Loại phòng</Text>
              <View style={styles.typeContainer}>
                {['all', 'private', 'shared', 'entire'].map(t => (
                  <TouchableOpacity 
                    key={t} 
                    style={[styles.typeOption, roomType === t && styles.activeType]}
                    onPress={() => setRoomType(t)}
                  >
                    <Text style={styles.typeLabel}>{t === 'all' ? 'Tất cả' : t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <TouchableOpacity style={styles.applyBtn} onPress={() => setShowFilters(false)}>
              <Text style={styles.applyBtnText}>Áp dụng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  topSection: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  searchBar: { 
    flex: 1, flexDirection: 'row', alignItems: 'center', 
    backgroundColor: 'white', borderRadius: 12, paddingHorizontal: 12, height: 48 
  },
  searchInput: { flex: 1, marginLeft: 8 },
  filterIcon: { position: 'relative' },
  filterBadge: { 
    position: 'absolute', top: -2, right: -2, width: 10, height: 10, 
    backgroundColor: 'red', borderRadius: 5 
  },
  sortBar: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 10 },
  resultCount: { color: '#666' },
  sortOptions: { flexDirection: 'row', alignItems: 'center' },
  sortItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sortText: { color: COLORS.primary, fontWeight: 'bold' },
  gridRow: { justifyContent: 'space-between' },
  listContent: { paddingHorizontal: 16, paddingBottom: 100 },
  cardContainer: { width: '48%', marginBottom: 16 },
  compareFloatingBtn: {
    position: 'absolute', bottom: 30, alignSelf: 'center',
    backgroundColor: 'black', flexDirection: 'row', padding: 15, borderRadius: 30
  },
  compareCount: { backgroundColor: COLORS.primary, borderRadius: 10, paddingHorizontal: 6, marginRight: 8 },
  compareCountText: { color: 'white', fontWeight: 'bold' },
  compareBtnText: { color: 'white', fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, height: '60%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  resetBtn: { color: 'red' },
  filterLabel: { fontWeight: 'bold', marginVertical: 10 },
  priceGrid: { flexDirection: 'row', gap: 10 },
  priceTag: { padding: 10, borderWidth: 1, borderColor: '#DDD', borderRadius: 8 },
  activeTag: { backgroundColor: COLORS.primary },
  tagText: { color: '#333' },
  activeTagText: { color: 'white' },
  typeContainer: { gap: 10 },
  typeOption: { padding: 15, backgroundColor: '#F0F0F0', borderRadius: 10 },
  activeType: { backgroundColor: '#E0EFFF', borderWidth: 1, borderColor: COLORS.primary },
  typeLabel: { fontSize: 16 },
  applyBtn: { backgroundColor: COLORS.primary, padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 20 },
  applyBtnText: { color: 'white', fontWeight: 'bold' },
  emptyContainer: { alignItems: 'center', marginTop: 50 },
  emptyText: { color: '#999' }
});