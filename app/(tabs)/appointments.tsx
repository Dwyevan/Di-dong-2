import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/Colors';
import { useAuth } from '../context/AuthContext';
import { appointmentService } from '../services/appointmentService';

// Định nghĩa Interface đồng bộ với trang chi tiết
interface Appointment {
  id: string;
  roomId: string;
  roomTitle: string;
  roomImage: string;
  status: 'pending' | 'waiting_deposit' | 'confirmed' | 'contracted' | 'cancelled' | 'completed';
  type: 'DEPOSIT' | 'VIEW';
  startDate?: string;
  endDate?: string;
  depositAmount?: number;
  tenantId: string;
  hostId: string;
  tenantInfo?: {
    fullName: string;
    phoneNumber: string;
    idCard?: string;
  };
}

export default function AppointmentsPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAppointments = () => {
    if (!user?.id) return;
    return appointmentService.getMyAppointments(user.id, (data: any[]) => {
      setAppointments(data);
      setLoading(false);
      setRefreshing(false);
    });
  };

  useEffect(() => {
    const unsubscribe = fetchAppointments();
    return () => unsubscribe && unsubscribe();
  }, [user?.id]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAppointments();
  };

  const handleUpdateStatus = async (id: string, newStatus: Appointment['status'], message: string) => {
    Alert.alert("Xác nhận", message, [
      { text: "Hủy", style: "cancel" },
      { 
        text: "Đồng ý", 
        onPress: async () => {
          try {
            const result = await appointmentService.updateAppointmentStatus(id, newStatus);
            if (!result.success) Alert.alert("Lỗi", result.error);
          } catch (e) {
            console.error(e);
          }
        }
      }
    ]);
  };

  const getStatusUI = (status: Appointment['status'], type: Appointment['type']) => {
    const isView = type === 'VIEW';
    switch (status) {
      case 'pending': 
        return { bg: isView ? '#E0F2FE' : '#FFF3CD', text: isView ? '#0369A1' : '#856404', label: isView ? 'Lịch hẹn mới' : 'Chờ duyệt cọc' };
      case 'waiting_deposit': 
        return { bg: '#DBEAFE', text: '#1E40AF', label: 'Đợi khách cọc' };
      case 'confirmed': 
        return { bg: '#D1FAE5', text: '#065F46', label: isView ? 'Đã xác nhận' : 'Đã nhận cọc' };
      case 'contracted': 
        return { bg: '#F1F5F9', text: '#0F172A', label: 'Đã hoàn tất' };
      case 'cancelled': 
        return { bg: '#FEE2E2', text: '#B91C1C', label: 'Đã hủy' };
      default: 
        return { bg: '#F1F5F9', text: '#475569', label: 'Hoàn tất' };
    }
  };

  const renderItem = ({ item }: { item: Appointment }) => {
    const statusUI = getStatusUI(item.status, item.type);
    const isHost = item.hostId === user?.id;
    const isViewType = item.type === 'VIEW';

    return (
      <TouchableOpacity 
        style={styles.card} 
        activeOpacity={0.7}
        onPress={() => router.push({ pathname: "/appointment-detail/[id]", params: { id: item.id } } as any)}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.typeBadge, { backgroundColor: isViewType ? '#F0F9FF' : '#FFF7ED' }]}>
            <Ionicons 
              name={isViewType ? "calendar" : "wallet"} 
              size={12} 
              color={isViewType ? "#0EA5E9" : "#F97316"} 
            />
            <Text style={[styles.typeText, { color: isViewType ? "#0EA5E9" : "#F97316" }]}>
                {isViewType ? 'HẸN XEM PHÒNG' : 'ĐẶT CỌC GIỮ CHỖ'}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusUI.bg }]}>
            <Text style={[styles.statusLabel, { color: statusUI.text }]}>{statusUI.label}</Text>
          </View>
        </View>

        <View style={styles.mainInfo}>
          <Image 
            source={{ uri: item.roomImage?.replace('localhost', '192.168.1.5') }} 
            style={styles.roomImage} 
          />
          <View style={styles.textContainer}>
            <Text style={styles.roomTitle} numberOfLines={1}>{item.roomTitle}</Text>
            
            <View style={styles.infoRow}>
                <Ionicons name="person-circle-outline" size={14} color="#64748B" />
                <Text style={styles.infoText}>
                    {isHost ? `Khách: ${item.tenantInfo?.fullName}` : `Chủ nhà: Đang xử lý`}
                </Text>
            </View>

            <View style={styles.infoRow}>
                <Ionicons name="time-outline" size={14} color="#64748B" />
                <Text style={styles.infoText}>{item.startDate}</Text>
            </View>
            
            <View style={styles.moneyBox}>
                <Text style={styles.moneyLabel}>
                {isViewType ? 'Phí: ' : 'Tiền cọc: '}
                <Text style={styles.boldAmount}>
                    {isViewType ? 'Miễn phí' : `${(item.depositAmount || 0).toLocaleString()}đ`}
                </Text>
                </Text>
            </View>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <TouchableOpacity 
            style={styles.detailBtn}
            onPress={(e) => {
                e.stopPropagation();
                router.push(`/room-detail/${item.roomId}` as any);
            }}
          >
            <Text style={styles.secondaryBtnText}>Xem phòng</Text>
            <Ionicons name="chevron-forward" size={14} color="#64748B" />
          </TouchableOpacity>

          <View style={styles.actionGroup}>
            {/* LOGIC CHỦ NHÀ */}
            {isHost && item.status === 'pending' && (
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity 
                  style={[styles.btn, styles.btnApprove]} 
                  onPress={(e) => {
                    e.stopPropagation();
                    const nextStatus = isViewType ? 'confirmed' : 'waiting_deposit';
                    const msg = isViewType ? "Xác nhận lịch hẹn xem phòng này?" : "Duyệt hồ sơ và yêu cầu khách đặt cọc?";
                    handleUpdateStatus(item.id, nextStatus, msg);
                  }}>
                  <Text style={styles.btnTextWhite}>{isViewType ? 'Xác nhận' : 'Duyệt cọc'}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.btn, styles.btnCancel]} 
                  onPress={(e) => {
                    e.stopPropagation();
                    handleUpdateStatus(item.id, 'cancelled', "Từ chối yêu cầu này?");
                  }}>
                  <Ionicons name="close" size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
            )}

            {/* LOGIC KHÁCH THUÊ */}
            {!isHost && item.status === 'waiting_deposit' && (
              <TouchableOpacity 
                style={[styles.btn, styles.btnPay]} 
                onPress={(e) => {
                  e.stopPropagation();
                  router.push({ pathname: "/appointment-detail/[id]", params: { id: item.id } } as any);
                }}>
                <Text style={styles.btnTextWhite}>Thanh toán ngay</Text>
              </TouchableOpacity>
            )}

            {/* TRẠNG THÁI HOÀN TẤT */}
            {item.status === 'contracted' && (
                <View style={styles.completedBadge}>
                    <Ionicons name="checkmark-done" size={14} color="#065F46" />
                    <Text style={styles.completedText}>Giao dịch xong</Text>
                </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const filteredData = appointments.filter(item => {
    const isOngoing = ['pending', 'waiting_deposit', 'confirmed'].includes(item.status);
    return activeTab === 'current' ? isOngoing : !isOngoing;
  });

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lịch hẹn & Cọc</Text>
        <Text style={styles.headerSubtitle}>Theo dõi và quản lý yêu cầu thuê phòng</Text>
      </View>
      
      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tab, activeTab === 'current' && styles.activeTab]} onPress={() => setActiveTab('current')}>
          <Text style={[styles.tabText, activeTab === 'current' && styles.activeTabText]}>Cần xử lý</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'history' && styles.activeTab]} onPress={() => setActiveTab('history')}>
          <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>Lịch sử</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
                <View style={styles.emptyCircle}>
                    <Ionicons name="document-text-outline" size={40} color="#CBD5E1" />
                </View>
                <Text style={styles.emptyText}>Bạn chưa có yêu cầu nào trong mục này</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { paddingHorizontal: 20, paddingVertical: 20, backgroundColor: '#FFF' },
  headerTitle: { fontSize: 26, fontWeight: '900', color: '#0F172A', letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 13, color: '#64748B', marginTop: 4, fontWeight: '500' },
  tabContainer: { flexDirection: 'row', padding: 16, backgroundColor: '#FFF', gap: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 14, backgroundColor: '#F1F5F9' },
  activeTab: { backgroundColor: '#0F172A' },
  tabText: { fontWeight: '700', color: '#64748B', fontSize: 14 },
  activeTabText: { color: '#FFF' },
  listContent: { padding: 16, paddingBottom: 100 },
  card: { backgroundColor: '#FFF', borderRadius: 24, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#F1F5F9', elevation: 3, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 15 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, alignItems: 'center' },
  typeBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  typeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.3 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  statusLabel: { fontSize: 11, fontWeight: '800' },
  mainInfo: { flexDirection: 'row', gap: 16 },
  roomImage: { width: 100, height: 100, borderRadius: 18, backgroundColor: '#F1F5F9' },
  textContainer: { flex: 1, justifyContent: 'center' },
  roomTitle: { fontSize: 17, fontWeight: '800', color: '#1E293B', marginBottom: 8 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  infoText: { fontSize: 13, color: '#64748B', fontWeight: '500' },
  moneyBox: { marginTop: 8, backgroundColor: '#F8FAFC', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, alignSelf: 'flex-start', borderWidth: 1, borderColor: '#F1F5F9' },
  moneyLabel: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  boldAmount: { fontWeight: '800', color: '#0F172A' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 16 },
  detailBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  secondaryBtnText: { color: '#64748B', fontWeight: '700', fontSize: 13 },
  actionGroup: { flexDirection: 'row', gap: 8 },
  btn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  btnApprove: { backgroundColor: '#0F172A' },
  btnCancel: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#EF4444' },
  btnPay: { backgroundColor: '#10B981' },
  btnTextWhite: { color: '#FFF', fontWeight: '800', fontSize: 13 },
  completedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#D1FAE5', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  completedText: { color: '#065F46', fontSize: 11, fontWeight: '800' },
  emptyContainer: { alignItems: 'center', marginTop: 100, gap: 16 },
  emptyCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  emptyText: { textAlign: 'center', color: '#94A3B8', fontSize: 14, fontWeight: '600', paddingHorizontal: 60 }
});