import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS } from '../../constants/Colors';

interface Appointment {
  id: string;
  roomTitle: string;
  roomImage: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
}

export default function AppointmentsPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');

  // Giả lập dữ liệu có đầy đủ trạng thái
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: '1',
      roomTitle: 'Phòng trọ đẹp gần ĐH Bách Khoa',
      roomImage: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267',
      date: '20/12/2025',
      time: '14:00',
      status: 'pending',
    },
    {
      id: '2',
      roomTitle: 'Căn hộ cao cấp Quận 7',
      roomImage: 'https://images.unsplash.com/photo-1513584684374-8bab748fbf90',
      date: '18/12/2025',
      time: '10:00',
      status: 'confirmed',
    },
    {
      id: '3',
      roomTitle: 'Nhà nguyên căn Thủ Đức',
      roomImage: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb',
      date: '10/12/2025',
      time: '09:00',
      status: 'completed',
    },
  ]);

  // Lọc dữ liệu theo Tab
  const filteredData = appointments.filter(item => 
    activeTab === 'current' 
      ? ['pending', 'confirmed'].includes(item.status)
      : ['cancelled', 'completed'].includes(item.status)
  );

  const getStatusStyle = (status: Appointment['status']) => {
    switch (status) {
      case 'pending': return { bg: '#FFF3CD', text: '#856404', label: 'Chờ duyệt' };
      case 'confirmed': return { bg: '#D4EDDA', text: '#155724', label: 'Sắp xem' };
      case 'cancelled': return { bg: '#F8D7DA', text: '#721C24', label: 'Đã hủy' };
      case 'completed': return { bg: '#E2E3E5', text: '#383D41', label: 'Đã xong' };
    }
  };

  const handleCancel = (id: string) => {
    Alert.alert("Hủy lịch hẹn", "Bạn có chắc chắn muốn hủy lịch xem phòng này không?", [
      { text: "Không", style: "cancel" },
      { 
        text: "Hủy lịch", 
        style: "destructive", 
        onPress: () => {
          setAppointments(prev => prev.map(item => 
            item.id === id ? { ...item, status: 'cancelled' } : item
          ));
        }
      }
    ]);
  };

  const renderItem = ({ item }: { item: Appointment }) => {
    const statusStyle = getStatusStyle(item.status);

    return (
      <View style={styles.card}>
        <View style={styles.row}>
          <Image source={{ uri: item.roomImage }} style={styles.roomImage} />
          
          <View style={styles.info}>
            <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
              <Text style={[styles.statusLabel, { color: statusStyle.text }]}>
                {statusStyle.label}
              </Text>
            </View>
            <Text style={styles.roomTitle} numberOfLines={1}>{item.roomTitle}</Text>
            
            <View style={styles.dateTimeContainer}>
              <View style={styles.dateTimeItem}>
                <Ionicons name="calendar-outline" size={14} color="#666" />
                <Text style={styles.dateTimeText}>{item.date}</Text>
              </View>
              <View style={styles.dateTimeItem}>
                <Ionicons name="time-outline" size={14} color="#666" />
                <Text style={styles.dateTimeText}>{item.time}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <TouchableOpacity 
            style={styles.detailBtn}
            onPress={() => router.push(`/room-detail/${item.id}`)}
          >
            <Text style={styles.detailBtnText}>Xem chi tiết phòng</Text>
          </TouchableOpacity>

          {item.status === 'pending' && (
            <TouchableOpacity 
              style={styles.cancelBtn} 
              onPress={() => handleCancel(item.id)}
            >
              <Text style={styles.cancelText}>Hủy lịch</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.headerTitle}>Lịch hẹn của tôi</Text>
      
      {/* TABS PHÂN LOẠI */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'current' && styles.activeTab]} 
          onPress={() => setActiveTab('current')}
        >
          <Text style={[styles.tabText, activeTab === 'current' && styles.activeTabText]}>Sắp tới</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'history' && styles.activeTab]} 
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>Lịch sử</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredData}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="calendar-outline" size={80} color="#EEE" />
            <Text style={styles.emptyTitle}>Trống</Text>
            <Text style={styles.emptySub}>Bạn không có lịch hẹn nào ở mục này</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', paddingHorizontal: 16, paddingVertical: 10 },
  
  // Tab Styles
  tabContainer: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 10, gap: 15 },
  tab: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#EEE' },
  activeTab: { backgroundColor: COLORS.primary },
  tabText: { fontWeight: '600', color: '#666' },
  activeTabText: { color: 'white' },

  // Card Styles
  card: { 
    backgroundColor: 'white', 
    borderRadius: 16, 
    padding: 12, 
    marginBottom: 16, 
    // Shadow cho iOS
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8,
    // Shadow cho Android
    elevation: 3 
  },
  row: { flexDirection: 'row' },
  roomImage: { width: 90, height: 90, borderRadius: 12 },
  info: { flex: 1, marginLeft: 15, justifyContent: 'center' },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginBottom: 6 },
  statusLabel: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  roomTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  dateTimeContainer: { flexDirection: 'row', gap: 12 },
  dateTimeItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dateTimeText: { fontSize: 13, color: '#666' },

  // Footer Actions
  cardFooter: { 
    flexDirection: 'row', 
    marginTop: 15, 
    paddingTop: 12, 
    borderTopWidth: 1, 
    borderTopColor: '#F0F0F0',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  detailBtn: { paddingVertical: 5 },
  detailBtnText: { color: COLORS.primary, fontWeight: '600', fontSize: 14 },
  cancelBtn: { backgroundColor: '#FFF5F5', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  cancelText: { color: '#FF4D4D', fontWeight: 'bold', fontSize: 13 },

  // Empty State
  empty: { flex: 1, marginTop: 100, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 16, color: '#CCC' },
  emptySub: { fontSize: 14, color: '#999', textAlign: 'center', marginTop: 8 },
});