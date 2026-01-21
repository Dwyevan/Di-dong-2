import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Linking,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { COLORS } from '../../constants/Colors';
import { appointmentService } from '../services/appointmentService';

// 1. ĐỊNH NGHĨA INTERFACE ĐẦY ĐỦ (Fix lỗi gạch đỏ & thiếu dữ liệu)
interface Appointment {
  id: string;
  roomId: string;
  roomTitle: string;
  roomImage: string;
  status: 'pending' | 'waiting_deposit' | 'confirmed' | 'contracted' | 'cancelled' | 'completed';
  type: 'DEPOSIT' | 'VIEW';
  startDate?: string;
  endDate?: string; // Đã thêm endDate để hiện khoảng ngày
  depositAmount?: number;
  tenantInfo?: {
    fullName: string;
    phoneNumber: string;
    idCard?: string;
    occupants?: number;
  };
  billImage?: string;
  note?: string;
}

export default function AppointmentDetailPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [data, setData] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      appointmentService.getAppointmentById(id as string).then(res => {
        if (res.success) setData(res.data);
        setLoading(false);
      });
    }
  }, [id]);

  // Cấu hình trạng thái chuyên nghiệp dựa trên Type
  const getStatusConfig = (status: Appointment['status'], type: Appointment['type']) => {
    const isView = type === 'VIEW';
    switch (status) {
      case 'pending': 
        return { label: isView ? 'Lịch hẹn mới' : 'Chờ duyệt cọc', color: isView ? '#0369A1' : '#856404', bg: isView ? '#E0F2FE' : '#FFF3CD' };
      case 'waiting_deposit': 
        return { label: 'Đợi khách chuyển cọc', color: '#1E40AF', bg: '#DBEAFE' };
      case 'confirmed': 
        return { label: isView ? 'Đã xác nhận hẹn' : 'Đã nhận tiền cọc', color: '#065F46', bg: '#D1FAE5' };
      case 'cancelled': 
        return { label: 'Đã hủy', color: '#B91C1C', bg: '#FEE2E2' };
      case 'contracted':
        return { label: 'Đã hoàn tất giao dịch', color: '#0F172A', bg: '#E2E8F0' };
      default: 
        return { label: 'Hoàn tất', color: '#475569', bg: '#F1F5F9' };
    }
  };

  const handleCall = () => {
    if (data?.tenantInfo?.phoneNumber) {
      Linking.openURL(`tel:${data.tenantInfo.phoneNumber}`);
    }
  };

  const handleAction = async (newStatus: Appointment['status'], message: string) => {
    if (!data?.id) return;
    Alert.alert("Xác nhận", message, [
      { text: "Hủy", style: "cancel" },
      { 
        text: "Đồng ý", 
        onPress: async () => {
          try {
            const res = await appointmentService.updateAppointmentStatus(data.id, newStatus);
            if (res.success) router.back();
          } catch (error) {
            console.error(error);
          }
        } 
      }
    ]);
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color={COLORS.primary} />;
  if (!data) return <View style={styles.center}><Text>Không tìm thấy dữ liệu</Text></View>;

  const isViewType = data.type === 'VIEW';
  const statusStyle = getStatusConfig(data.status, data.type);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.detailHeader}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.detailHeaderTitle}>
            {isViewType ? "Chi tiết lịch hẹn" : "Chi tiết đặt cọc"}
        </Text>
        <TouchableOpacity onPress={handleCall} style={styles.callCircle}>
          <Ionicons name="call" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Banner trạng thái */}
        <View style={[styles.statusBanner, { backgroundColor: statusStyle.bg }]}>
          <Ionicons name="information-circle" size={18} color={statusStyle.color} style={{marginRight: 8}} />
          <Text style={[styles.statusText, { color: statusStyle.color }]}>
             {statusStyle.label.toUpperCase()}
          </Text>
        </View>

        {/* Thông tin phòng */}
        <View style={styles.detailSection}>
          <View style={styles.sectionHeaderRow}>
             <Text style={styles.detailSectionTitle}>Thông tin bất động sản</Text>
             <View style={[styles.miniTypeBadge, { backgroundColor: isViewType ? '#F0F9FF' : '#FFF7ED' }]}>
                <Text style={{ fontSize: 10, fontWeight: '800', color: isViewType ? "#0EA5E9" : "#F97316" }}>
                    {isViewType ? 'XEM PHÒNG' : 'ĐẶT CỌC GIỮ CHỖ'}
                </Text>
             </View>
          </View>
          
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Image 
                source={{ uri: data.roomImage?.replace('localhost', '192.168.1.5') }} 
                style={styles.detailRoomImg} 
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.detailRoomName} numberOfLines={2}>{data.roomTitle}</Text>
              <Text style={[styles.detailPrice, { color: isViewType ? '#64748B' : COLORS.primary }]}>
                {isViewType ? "Hẹn xem miễn phí" : `Số tiền cọc: ${data.depositAmount?.toLocaleString()}đ`}
              </Text>
              
              {/* HIỂN THỊ NGÀY: Tự động điều chỉnh theo Loại hình */}
              <View style={styles.dateBadge}>
                <Ionicons name={isViewType ? "time-outline" : "calendar-outline"} size={14} color="#64748B" />
                <Text style={styles.dateRangeText}>
                    {isViewType 
                        ? `Ngày hẹn: ${data.startDate}` 
                        : `${data.startDate}${data.endDate ? ` - ${data.endDate}` : ''}`
                    }
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Hồ sơ khách */}
        <View style={styles.detailSection}>
          <Text style={styles.detailSectionTitle}>Hồ sơ khách thuê</Text>
          <InfoRow icon="person-outline" label="Họ tên" value={data.tenantInfo?.fullName} />
          <InfoRow icon="call-outline" label="Điện thoại" value={data.tenantInfo?.phoneNumber} />
          <InfoRow icon="card-outline" label="Số CCCD" value={data.tenantInfo?.idCard || "Đã cung cấp"} />
          <InfoRow icon="people-outline" label="Số người" value={`${data.tenantInfo?.occupants || 1} người`} />
        </View>

        {/* Ghi chú */}
        <View style={styles.detailSection}>
          <Text style={styles.detailSectionTitle}>Yêu cầu thêm</Text>
          <View style={styles.noteBox}>
            <Text style={styles.noteText}>{data.note || "Không có ghi chú thêm."}</Text>
          </View>
        </View>

        {/* Bill chuyển khoản */}
        {!isViewType && data.billImage && (
          <View style={styles.detailSection}>
            <Text style={styles.detailSectionTitle}>Ảnh giao dịch chuyển khoản</Text>
            <Image source={{ uri: data.billImage }} style={styles.billImage} resizeMode="cover" />
          </View>
        )}
      </ScrollView>

      {/* FOOTER ACTIONS */}
      {data.status === 'pending' && (
        <View style={styles.footerActions}>
          <TouchableOpacity 
            style={[styles.actionBtn, styles.cancelBtn]}
            onPress={() => handleAction('cancelled', "Từ chối yêu cầu này?")}
          >
            <Text style={styles.cancelBtnText}>Từ chối</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionBtn, styles.approveBtn]}
            onPress={() => {
                const nextStatus = isViewType ? 'confirmed' : 'waiting_deposit';
                const msg = isViewType ? "Xác nhận lịch hẹn xem phòng?" : "Duyệt hồ sơ và yêu cầu đặt cọc?";
                handleAction(nextStatus, msg);
            }}
          >
            <Text style={styles.approveBtnText}>
                {isViewType ? "Xác nhận hẹn" : "Duyệt hồ sơ cọc"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {data.status === 'confirmed' && !isViewType && (
         <View style={styles.footerActions}>
            <TouchableOpacity 
                style={[styles.actionBtn, styles.approveBtn]}
                onPress={() => handleAction('contracted', "Xác nhận đã nhận đủ tiền?")}
            >
                <Text style={styles.approveBtnText}>Xác nhận đã nhận tiền</Text>
            </TouchableOpacity>
         </View>
      )}
    </SafeAreaView>
  );
}

const InfoRow = ({ icon, label, value }: any) => (
  <View style={styles.infoRow}>
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Ionicons name={icon} size={18} color="#94A3B8" style={{marginRight: 10}} />
        <Text style={styles.infoLabel}>{label}</Text>
    </View>
    <Text style={styles.infoValue}>{value || '---'}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  detailHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#FFF', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  detailHeaderTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  callCircle: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center' },
  statusBanner: { flexDirection: 'row', padding: 14, borderRadius: 12, marginBottom: 20, alignItems: 'center', justifyContent: 'center', marginHorizontal: 16, marginTop: 10 },
  statusText: { fontWeight: '800', fontSize: 13, letterSpacing: 0.5 },
  detailSection: { backgroundColor: '#FFF', borderRadius: 24, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#F1F5F9', elevation: 2, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, marginHorizontal: 16 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  detailSectionTitle: { fontSize: 11, fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' },
  miniTypeBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  detailRoomImg: { width: 85, height: 85, borderRadius: 16 },
  detailRoomName: { fontSize: 17, fontWeight: '700', color: '#1E293B', marginBottom: 6 },
  detailPrice: { fontSize: 15, fontWeight: '800' },
  dateBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, backgroundColor: '#F8FAFC', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  dateRangeText: { fontSize: 13, color: '#475569', fontWeight: '700' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  infoLabel: { color: '#64748B', fontSize: 14 },
  infoValue: { color: '#1E293B', fontSize: 14, fontWeight: '700' },
  billImage: { width: '100%', height: 350, borderRadius: 20, marginTop: 10 },
  noteBox: { backgroundColor: '#F8FAFC', padding: 15, borderRadius: 15, marginTop: 5 },
  noteText: { fontSize: 14, color: '#475569', lineHeight: 22 },
  footerActions: { flexDirection: 'row', padding: 20, backgroundColor: '#FFF', gap: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingBottom: 30 },
  actionBtn: { flex: 1, paddingVertical: 15, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  approveBtn: { backgroundColor: '#0F172A' },
  approveBtnText: { color: '#FFF', fontWeight: '800', fontSize: 15 },
  cancelBtn: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#EF4444' },
  cancelBtnText: { color: '#EF4444', fontWeight: '800', fontSize: 15 },
});