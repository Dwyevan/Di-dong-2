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

// Nghiệp vụ: Danh sách tiện ích phổ biến
const AMENITIES = [
  { id: 'wifi', label: 'Wifi', icon: 'wifi-outline' },
  { id: 'ac', label: 'Điều hòa', icon: 'snow-outline' },
  { id: 'parking', label: 'Gửi xe', icon: 'bicycle-outline' },
  { id: 'security', label: 'An ninh', icon: 'shield-checkmark-outline' },
  { id: 'wc', label: 'WC riêng', icon: 'water-outline' },
];

export default function ListingsPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { favorites, toggleFavorite } = useFavorites();
  const { compareList, toggleCompare } = useCompare();
  
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // --- FILTERS STATE ---
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState('');
  const [priceMax, setPriceMax] = useState(20000000);
  const [roomType, setRoomType] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  // Đếm số lượng bộ lọc đang dùng (để hiện badge trên icon Funnel)
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (priceMax < 20000000) count++;
    if (roomType !== 'all') count++;
    if (selectedAmenities.length > 0) count++;
    return count;
  }, [priceMax, roomType, selectedAmenities]);

  const fetchRooms = useCallback(async (isRefreshing = false) => {
    if (isRefreshing) setRefreshing(true);
    else setLoading(true);
    try {
      const result = await roomService.getAllRooms();
      if (result.success) setRooms(result.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchRooms(); }, [fetchRooms]);

  // --- LOGIC LỌC NÂNG CAO ---
  const filteredRooms = useMemo(() => {
    const searchLower = search.trim().toLowerCase();
    
    let result = rooms.filter(room => {
      const matchesSearch = !searchLower || 
        room.title?.toLowerCase().includes(searchLower) || 
        room.address?.toLowerCase().includes(searchLower);
      
      const matchesPrice = (Number(room.price) || 0) <= priceMax;
      const matchesType = roomType === 'all' || room.roomType === roomType;
      
      // Lọc tiện ích (Chỉ lấy phòng có đủ tất cả tiện ích đã chọn)
      const matchesAmenities = selectedAmenities.every(amn => 
        room.amenities && room.amenities.includes(amn)
      );
      
      return matchesSearch && matchesPrice && matchesType && matchesAmenities;
    });

    return [...result].sort((a, b) => {
      if (sortBy === 'priceAsc') return a.price - b.price;
      if (sortBy === 'priceDesc') return b.price - a.price;
      return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
    });
  }, [rooms, search, priceMax, roomType, sortBy, selectedAmenities]);

  const toggleAmenity = (id: string) => {
    setSelectedAmenities(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const resetFilters = () => {
    setPriceMax(20000000);
    setRoomType('all');
    setSortBy('newest');
    setSelectedAmenities([]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header Search */}
      <View style={styles.headerContainer}>
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={20} color="#64748B" />
            <TextInput
              style={styles.searchInput}
              placeholder="Khu vực, tên đường..."
              placeholderTextColor="#94A3B8"
              value={search}
              onChangeText={setSearch}
            />
          </View>
          <TouchableOpacity 
            style={[styles.filterBtn, activeFilterCount > 0 && styles.filterBtnActive]} 
            onPress={() => setShowFilters(true)}
          >
            <Ionicons name="options-outline" size={22} color={activeFilterCount > 0 ? COLORS.primary : "#1E293B"} />
            {activeFilterCount > 0 && (
              <View style={styles.filterDot} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* List Content */}
      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={filteredRooms}
          keyExtractor={item => item.id}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchRooms(true)} />}
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
              <Text style={styles.emptyTitle}>Không tìm thấy phòng</Text>
              <TouchableOpacity onPress={resetFilters}><Text style={styles.resetLinkText}>Xóa bộ lọc</Text></TouchableOpacity>
            </View>
          }
        />
      )}

      {/* FILTER MODAL CHUYÊN NGHIỆP */}
      <Modal visible={showFilters} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheet, { paddingBottom: insets.bottom + 16 }]}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Bộ lọc nâng cao</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Ionicons name="close" size={28} color="#1E293B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Giá */}
              <Text style={styles.sectionTitle}>Ngân sách tối đa</Text>
              <Text style={styles.priceValue}>{priceMax.toLocaleString()} VNĐ</Text>
              <View style={styles.chipGrid}>
                {[2000000, 5000000, 10000000, 20000000].map(p => (
                  <TouchableOpacity 
                    key={p} 
                    style={[styles.chip, priceMax === p && styles.chipActive]}
                    onPress={() => setPriceMax(p)}
                  >
                    <Text style={[styles.chipText, priceMax === p && styles.chipTextActive]}>
                      {p === 20000000 ? 'Tất cả' : `< ${p/1000000}Tr`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Loại hình */}
              <Text style={styles.sectionTitle}>Loại hình bất động sản</Text>
              <View style={styles.typeList}>
                {['all', 'private', 'shared', 'entire'].map(t => (
                  <TouchableOpacity 
                    key={t} 
                    style={[styles.typeItem, roomType === t && styles.typeItemActive]}
                    onPress={() => setRoomType(t)}
                  >
                    <Text style={[styles.typeItemLabel, roomType === t && styles.typeItemLabelActive]}>
                      {t === 'all' ? 'Tất cả loại hình' : t === 'private' ? 'Phòng trọ' : t === 'shared' ? 'Ở ghép' : 'Nguyên căn'}
                    </Text>
                    {roomType === t && <Ionicons name="checkmark" size={18} color={COLORS.primary} />}
                  </TouchableOpacity>
                ))}
              </View>

              {/* Tiện ích - NGHIỆP VỤ MỚI */}
              <Text style={styles.sectionTitle}>Tiện ích cần có</Text>
              <View style={styles.amenityGrid}>
                {AMENITIES.map(amn => (
                  <TouchableOpacity 
                    key={amn.id} 
                    style={[styles.amnestyChip, selectedAmenities.includes(amn.id) && styles.amnestyChipActive]}
                    onPress={() => toggleAmenity(amn.id)}
                  >
                    <Ionicons name={amn.icon as any} size={16} color={selectedAmenities.includes(amn.id) ? '#FFF' : '#64748B'} />
                    <Text style={[styles.amnestyText, selectedAmenities.includes(amn.id) && styles.amnestyTextActive]}>{amn.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.sheetFooter}>
              <TouchableOpacity style={styles.clearBtn} onPress={resetFilters}>
                <Text style={styles.clearBtnText}>Xóa tất cả ({activeFilterCount})</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyBtn} onPress={() => setShowFilters(false)}>
                <Text style={styles.applyBtnText}>Xem {filteredRooms.length} kết quả</Text>
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
  headerContainer: { backgroundColor: 'white', paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  searchSection: { flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginTop: 8 },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 12, paddingHorizontal: 12, height: 48 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 15 },
  filterBtn: { width: 48, height: 48, backgroundColor: '#F1F5F9', borderRadius: 12, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  filterBtnActive: { backgroundColor: '#E0F2FE', borderColor: COLORS.primary, borderWidth: 1 },
  filterDot: { position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444', borderWidth: 1.5, borderColor: '#FFF' },
  gridRow: { justifyContent: 'space-between' },
  listContent: { paddingHorizontal: 16, paddingBottom: 40 },
  cardWrapper: { width: '48.5%', marginBottom: 16 },
  
  // Modal Styles
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: 'white', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, maxHeight: '90%' },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sheetTitle: { fontSize: 20, fontWeight: '800' },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginTop: 20, marginBottom: 12, color: '#1E293B' },
  priceValue: { fontSize: 20, fontWeight: '800', color: COLORS.primary, marginBottom: 10 },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, backgroundColor: '#F1F5F9' },
  chipActive: { backgroundColor: COLORS.primary },
  chipText: { fontWeight: '600', color: '#64748B' },
  chipTextActive: { color: '#FFF' },
  typeList: { gap: 8 },
  typeItem: { flexDirection: 'row', justifyContent: 'space-between', padding: 14, backgroundColor: '#F8FAFC', borderRadius: 12 },
  typeItemActive: { backgroundColor: '#F0F9FF', borderWidth: 1, borderColor: COLORS.primary },
  typeItemLabel: { color: '#64748B', fontWeight: '500' },
  typeItemLabelActive: { color: COLORS.primary, fontWeight: '700' },
  
  // Amenities Grid
  amenityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  amnestyChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#CBD5E1' },
  amnestyChipActive: { backgroundColor: '#1E293B', borderColor: '#1E293B' },
  amnestyText: { fontSize: 13, color: '#64748B', fontWeight: '500' },
  amnestyTextActive: { color: '#FFF', fontWeight: '600' },
  
  sheetFooter: { flexDirection: 'row', gap: 12, marginTop: 30 },
  clearBtn: { flex: 1, height: 50, justifyContent: 'center', alignItems: 'center' },
  clearBtnText: { color: '#64748B', fontWeight: '700' },
  applyBtn: { flex: 2, height: 50, backgroundColor: COLORS.primary, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  applyBtnText: { color: '#FFF', fontWeight: '700' },
  emptyBox: { alignItems: 'center', marginTop: 100 },
  emptyTitle: { fontSize: 16, fontWeight: '700', marginTop: 10 },
  resetLinkText: { color: COLORS.primary, marginTop: 10, textDecorationLine: 'underline' }
});