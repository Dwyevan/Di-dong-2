import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
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

export default function AppointmentDetailPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      // Lấy dữ liệu chi tiết từ service
      appointmentService.getAppointmentById(id as string).then(res => {
        if (res.success) setData(res.data);
        setLoading(false);
      });
    }
  }, [id]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending': return { label: 'Chờ duyệt', color: '#856404', bg: '#FFF3CD' };
      case 'waiting_deposit': return { label: 'Chờ đặt cọc', color: '#0369A1', bg: '#E0F2FE' };
      case 'confirmed': return { label: 'Đã thanh toán', color: '#065F46', bg: '#D1FAE5' };
      case 'cancelled': return { label: 'Đã hủy', color: '#B91C1C', bg: '#FEE2E2' };
      default: return { label: status, color: '#475569', bg: '#F1F5F9' };
    }
  };

  const handleCall = () => {
    if (data?.tenantInfo?.phoneNumber) {
      Linking.openURL(`tel:${data.tenantInfo.phoneNumber}`);
    }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color={COLORS.primary} />;

  const statusStyle = getStatusConfig(data?.status);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.detailHeader}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.detailHeaderTitle}>Chi tiết giao dịch</Text>
        <TouchableOpacity onPress={handleCall}>
          <Ionicons name="call-outline" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Trạng thái nổi bật */}
        <View style={[styles.statusBanner, { backgroundColor: statusStyle.bg }]}>
          <Text style={[styles.statusText, { color: statusStyle.color }]}>
            Trạng thái: {statusStyle.label.toUpperCase()}
          </Text>
        </View>

        {/* Thông tin phòng */}
        <View style={styles.detailSection}>
          <Text style={styles.detailSectionTitle}>Thông tin đặt phòng</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Image source={{ uri: data?.roomImage }} style={styles.detailRoomImg} />
            <View style={{ flex: 1 }}>
              <Text style={styles.detailRoomName}>{data?.roomTitle}</Text>
              <Text style={styles.detailPrice}>Tiền cọc: {data?.depositAmount?.toLocaleString()}đ</Text>
              <Text style={styles.dateRange}>
                <Ionicons name="calendar-outline" size={12} /> {data?.startDate} - {data?.endDate}
              </Text>
            </View>
          </View>
        </View>

        {/* Hồ sơ khách thuê */}
        <View style={styles.detailSection}>
          <Text style={styles.detailSectionTitle}>Hồ sơ khách thuê</Text>
          <InfoRow label="Họ và tên" value={data?.tenantInfo?.fullName} />
          <InfoRow label="Số điện thoại" value={data?.tenantInfo?.phoneNumber} />
          <InfoRow label="Số CCCD" value={data?.tenantInfo?.idCard || "Đã cung cấp (Bảo mật)"} />
          <InfoRow label="Số người ở" value={data?.tenantInfo?.occupants || "1 người"} />
        </View>

        {/* Bằng chứng thanh toán (Nếu có) */}
        {data?.billImage && (
          <View style={styles.detailSection}>
            <Text style={styles.detailSectionTitle}>Bằng chứng chuyển khoản</Text>
            <Image source={{ uri: data.billImage }} style={styles.billImage} resizeMode="contain" />
          </View>
        )}

        {/* Ghi chú */}
        <View style={styles.detailSection}>
          <Text style={styles.detailSectionTitle}>Ghi chú từ khách</Text>
          <Text style={styles.noteText}>{data?.note || "Không có ghi chú thêm."}</Text>
        </View>
      </ScrollView>

      {/* Nút hành động cố định ở dưới cùng */}
      {data?.status === 'pending' && (
        <View style={styles.footerActions}>
          <TouchableOpacity style={[styles.actionBtn, styles.cancelBtn]}>
            <Text style={styles.cancelBtnText}>Từ chối</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.approveBtn]}>
            <Text style={styles.approveBtnText}>Duyệt hồ sơ</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const InfoRow = ({ label, value }: any) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value || '---'}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  detailHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, backgroundColor: '#FFF', alignItems: 'center', elevation: 2 },
  detailHeaderTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  statusBanner: { padding: 12, borderRadius: 8, marginBottom: 16, alignItems: 'center' },
  statusText: { fontWeight: 'bold', fontSize: 13 },
  detailSection: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 1 },
  detailSectionTitle: { fontSize: 13, fontWeight: 'bold', color: '#64748B', marginBottom: 12, textTransform: 'uppercase' },
  detailRoomImg: { width: 80, height: 80, borderRadius: 8 },
  detailRoomName: { fontSize: 16, fontWeight: 'bold', color: '#1E293B', marginBottom: 4 },
  detailPrice: { fontSize: 15, color: '#4F46E5', fontWeight: 'bold' },
  dateRange: { fontSize: 12, color: '#64748B', marginTop: 4 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  infoLabel: { color: '#64748B', fontSize: 14 },
  infoValue: { color: '#1E293B', fontSize: 14, fontWeight: '600' },
  billImage: { width: '100%', height: 300, borderRadius: 12, marginTop: 8 },
  noteText: { fontSize: 14, color: '#475569', lineHeight: 20 },
  footerActions: { flexDirection: 'row', padding: 16, backgroundColor: '#FFF', gap: 12, borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  actionBtn: { flex: 1, padding: 14, borderRadius: 10, alignItems: 'center' },
  approveBtn: { backgroundColor: '#4F46E5' },
  approveBtnText: { color: '#FFF', fontWeight: 'bold' },
  cancelBtn: { borderWidth: 1, borderColor: '#EF4444' },
  cancelBtnText: { color: '#EF4444', fontWeight: 'bold' },
});