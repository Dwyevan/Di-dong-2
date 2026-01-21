import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
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

interface Appointment {
  id: string;
  roomId: string;
  roomTitle: string;
  roomImage: string;
  status: 'pending' | 'waiting_deposit' | 'confirmed' | 'contracted' | 'cancelled' | 'completed';
  type?: 'DEPOSIT' | 'VIEW';
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

  useEffect(() => {
    if (!user?.id) return;
    
    // Sử dụng onSnapshot để cập nhật UI ngay lập tức khi bấm nút
    const unsubscribe = appointmentService.getMyAppointments(user.id, (data: any[]) => {
      setAppointments(data);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [user?.id]);

  const handleUpdateStatus = async (id: string, newStatus: Appointment['status'], message: string) => {
    Alert.alert("Xác nhận", message, [
      { text: "Hủy", style: "cancel" },
      { 
        text: "Đồng ý", 
        onPress: async () => {
          try {
            const result = await appointmentService.updateAppointmentStatus(id, newStatus);
            if (!result.success) Alert.alert("Lỗi", result.error);
            // Không cần reload data vì onSnapshot sẽ tự lo
          } catch (e) {
            console.error(e);
          }
        }
      }
    ]);
  };

  const getStatusUI = (status: Appointment['status']) => {
    switch (status) {
      case 'pending': return { bg: '#FFF3CD', text: '#856404', label: 'Đang chờ duyệt' };
      case 'waiting_deposit': return { bg: '#E0F2FE', text: '#0369A1', label: 'Chờ đặt cọc' };
      case 'confirmed': return { bg: '#FEF3C7', text: '#92400E', label: 'Chờ xác nhận tiền' };
      case 'contracted': return { bg: '#D1FAE5', text: '#065F46', label: 'Đã ký hợp đồng' };
      case 'cancelled': return { bg: '#FEE2E2', text: '#B91C1C', label: 'Đã hủy' };
      default: return { bg: '#F1F5F9', text: '#475569', label: 'Hoàn tất' };
    }
  };

  const renderItem = ({ item }: { item: Appointment }) => {
    const statusUI = getStatusUI(item.status);
    const isHost = item.hostId === user?.id;

    return (
      <TouchableOpacity 
        style={styles.card} 
        activeOpacity={0.9}
        onPress={() => router.push({ pathname: "/appointment-detail/[id]", params: { id: item.id } } as any)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.typeBadge}>
            <Ionicons name={item.type === 'VIEW' ? "eye" : "bookmark"} size={12} color={COLORS.primary} />
            <Text style={styles.typeText}>{item.type === 'VIEW' ? 'XEM PHÒNG' : 'ĐẶT CỌC'}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusUI.bg }]}>
            <Text style={[styles.statusLabel, { color: statusUI.text }]}>{statusUI.label}</Text>
          </View>
        </View>

        <View style={styles.mainInfo}>
          <Image source={{ uri: item.roomImage }} style={styles.roomImage} />
          <View style={styles.textContainer}>
            <Text style={styles.roomTitle} numberOfLines={1}>{item.roomTitle}</Text>
            <Text style={styles.infoText}>
              <Ionicons name="person-outline" size={12} /> {isHost ? `Khách: ${item.tenantInfo?.fullName}` : "Hồ sơ của bạn"}
            </Text>
            <Text style={styles.infoText}>
              <Ionicons name="calendar-outline" size={12} /> {item.startDate} - {item.endDate}
            </Text>
            <View style={styles.moneyRow}>
               <Text style={styles.moneyLabel}>Tiền cọc: <Text style={styles.boldAmount}>{(item.depositAmount || 0).toLocaleString()}đ</Text></Text>
            </View>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <TouchableOpacity onPress={(e) => {
              e.stopPropagation();
              router.push(`/room-detail/${item.roomId}` as any);
          }}>
            <Text style={styles.secondaryBtnText}>Xem phòng</Text>
          </TouchableOpacity>

          <View style={styles.actionGroup}>
            {/* NHÓM NÚT DÀNH CHO CHỦ NHÀ */}
            {isHost && (
              <>
                {item.status === 'pending' && (
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity 
                      style={[styles.btn, styles.btnApprove]} 
                      onPress={(e) => {
                        e.stopPropagation();
                        handleUpdateStatus(item.id, 'waiting_deposit', "Duyệt hồ sơ và yêu cầu khách đặt cọc?");
                      }}>
                      <Text style={styles.btnTextWhite}>Duyệt</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.btn, styles.btnCancel]} 
                      onPress={(e) => {
                        e.stopPropagation();
                        handleUpdateStatus(item.id, 'cancelled', "Từ chối yêu cầu thuê phòng này?");
                      }}>
                      <Text style={styles.btnTextRed}>Từ chối</Text>
                    </TouchableOpacity>
                  </View>
                )}
                {item.status === 'confirmed' && (
                  <TouchableOpacity 
                    style={[styles.btn, styles.btnApprove]} 
                    onPress={(e) => {
                      e.stopPropagation();
                      handleUpdateStatus(item.id, 'contracted', "Xác nhận đã nhận tiền cọc?");
                    }}>
                    <Text style={styles.btnTextWhite}>Xác nhận tiền</Text>
                  </TouchableOpacity>
                )}
              </>
            )}

            {/* NHÓM NÚT DÀNH CHO KHÁCH THUÊ */}
            {!isHost && (
              <>
                {item.status === 'waiting_deposit' && (
                  <TouchableOpacity 
                    style={[styles.btn, styles.btnPay]} 
                    onPress={(e) => {
                      e.stopPropagation();
                      router.push({ pathname: "/contract-detail/[id]", params: { id: item.id } } as any);
                    }}>
                    <Text style={styles.btnTextWhite}>Thanh toán ngay</Text>
                  </TouchableOpacity>
                )}
                {item.status === 'pending' && (
                  <Text style={styles.waitingText}>Chờ chủ nhà phản hồi...</Text>
                )}
              </>
            )}

            {/* NÚT XEM HỢP ĐỒNG KHI ĐÃ XONG */}
            {item.status === 'contracted' && (
              <TouchableOpacity 
                style={[styles.btn, styles.btnContract]} 
                onPress={(e) => {
                  e.stopPropagation();
                  router.push({ pathname: "/contract-view/[id]", params: { id: item.id } } as any);
                }}>
                <Text style={styles.btnTextWhite}>Xem hợp đồng</Text>
              </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Quản lý thuê phòng</Text>
      </View>
      
      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tab, activeTab === 'current' && styles.activeTab]} onPress={() => setActiveTab('current')}>
          <Text style={[styles.tabText, activeTab === 'current' && styles.activeTabText]}>Đang xử lý</Text>
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
          ListEmptyComponent={<Text style={styles.emptyText}>Không có dữ liệu</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { padding: 20, backgroundColor: '#FFF' },
  headerTitle: { fontSize: 22, fontWeight: 'bold' },
  tabContainer: { flexDirection: 'row', padding: 10, backgroundColor: '#FFF', gap: 10 },
  tab: { flex: 1, padding: 12, alignItems: 'center', borderRadius: 10, backgroundColor: '#F1F5F9' },
  activeTab: { backgroundColor: COLORS.primary },
  tabText: { fontWeight: '600', color: '#64748B' },
  activeTabText: { color: '#FFF' },
  listContent: { padding: 15 },
  card: { backgroundColor: '#FFF', borderRadius: 15, padding: 15, marginBottom: 15, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  typeBadge: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  typeText: { fontSize: 10, fontWeight: 'bold', color: COLORS.primary },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 5 },
  statusLabel: { fontSize: 11, fontWeight: 'bold' },
  mainInfo: { flexDirection: 'row', gap: 12 },
  roomImage: { width: 85, height: 85, borderRadius: 10 },
  textContainer: { flex: 1 },
  roomTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  infoText: { fontSize: 12, color: '#64748B', marginBottom: 2 },
  moneyRow: { marginTop: 5 },
  moneyLabel: { fontSize: 13, color: '#333' },
  boldAmount: { fontWeight: 'bold', color: COLORS.primary },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15, borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 10 },
  secondaryBtnText: { color: '#64748B', fontWeight: '500' },
  actionGroup: { flexDirection: 'row', gap: 8 },
  btn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8 },
  btnApprove: { backgroundColor: '#10B981' },
  btnCancel: { borderWidth: 1, borderColor: '#EF4444' },
  btnPay: { backgroundColor: COLORS.primary },
  btnContract: { backgroundColor: '#059669' },
  btnTextWhite: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  btnTextRed: { color: '#EF4444', fontWeight: 'bold', fontSize: 12 },
  waitingText: { fontSize: 12, color: '#94A3B8', fontStyle: 'italic' },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#94A3B8' }
});