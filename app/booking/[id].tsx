import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Image } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { mockRooms } from "../data/mockRooms";
import { COLORS } from "../../constants/Colors";

export default function BookingPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const room = mockRooms.find((r) => r.id === id);

  // State nghiệp vụ bổ sung
  const [paymentMethod, setPaymentMethod] = useState<'transfer' | 'cash'>('transfer');
  const [agreed, setAgreed] = useState(false);

  if (!room) {
    return (
      <View style={styles.center}>
        <Text>Không tìm thấy thông tin phòng</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: COLORS.primary, marginTop: 10 }}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const deposit = room.price; // Tiền cọc mặc định 1 tháng
  const total = room.price + deposit;

  const handleConfirm = () => {
    if (!agreed) {
      return Alert.alert("Thông báo", "Vui lòng đồng ý với điều khoản giữ phòng.");
    }

    Alert.alert(
      "Xác nhận thanh toán",
      `Số tiền cần thanh toán là ${total.toLocaleString()}đ. Bạn chắc chắn chứ?`,
      [
        { text: "Hủy", style: "cancel" },
        { 
          text: "Xác nhận", 
          onPress: () => {
            // Ở đây sẽ gọi API xử lý thanh toán thực tế
            Alert.alert("Thành công", "Yêu cầu giữ phòng của bạn đã được gửi tới chủ nhà!");
            router.replace('/(tabs)/appointments'); // Chuyển sang quản lý lịch hẹn/giữ chỗ
          } 
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* 1. Thông tin tóm tắt phòng */}
      <View style={styles.roomSummary}>
        <Image source={{ uri: room.image }} style={styles.roomImage} />
        <View style={styles.roomInfo}>
          <Text style={styles.roomTitle} numberOfLines={1}>{room.title}</Text>
          <Text style={styles.roomAddress} numberOfLines={1}>📍 {room.location}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Chi tiết chi phí</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Giá thuê tháng đầu</Text>
          <Text style={styles.value}>{room.price.toLocaleString()} đ</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Tiền cọc giữ phòng (1 tháng)</Text>
          <Text style={styles.value}>{deposit.toLocaleString()} đ</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.totalLabel}>Tổng cộng ban đầu</Text>
          <Text style={styles.totalValue}>{total.toLocaleString()} đ</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Phương thức thanh toán cọc</Text>
      <View style={styles.paymentContainer}>
        <TouchableOpacity 
          style={[styles.paymentOption, paymentMethod === 'transfer' && styles.activeOption]}
          onPress={() => setPaymentMethod('transfer')}
        >
          <Ionicons name="card-outline" size={24} color={paymentMethod === 'transfer' ? COLORS.primary : "#666"} />
          <Text style={[styles.paymentText, paymentMethod === 'transfer' && styles.activePaymentText]}>Chuyển khoản / Ví điện tử</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.paymentOption, paymentMethod === 'cash' && styles.activeOption]}
          onPress={() => setPaymentMethod('cash')}
        >
          <Ionicons name="cash-outline" size={24} color={paymentMethod === 'cash' ? COLORS.primary : "#666"} />
          <Text style={[styles.paymentText, paymentMethod === 'cash' && styles.activePaymentText]}>Thanh toán trực tiếp</Text>
        </TouchableOpacity>
      </View>

      {/* Điều khoản */}
      <TouchableOpacity style={styles.checkboxRow} onPress={() => setAgreed(!agreed)}>
        <Ionicons 
          name={agreed ? "checkbox" : "square-outline"} 
          size={24} 
          color={agreed ? COLORS.primary : "#CCC"} 
        />
        <Text style={styles.agreementText}>
          Tôi đồng ý với <Text style={styles.link}>Chính sách giữ phòng</Text> và cam kết chuyển đến đúng thời hạn.
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.btn, !agreed && styles.btnDisabled]} 
        onPress={handleConfirm}
        disabled={!agreed}
      >
        <Text style={styles.btnText}>Xác nhận thanh toán giữ phòng</Text>
      </TouchableOpacity>
      
      <Text style={styles.note}>* Tiền cọc sẽ được hoàn trả theo thỏa thuận hợp đồng.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA", padding: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  roomSummary: { flexDirection: 'row', backgroundColor: 'white', padding: 12, borderRadius: 16, marginBottom: 20, alignItems: 'center' },
  roomImage: { width: 60, height: 60, borderRadius: 12 },
  roomInfo: { marginLeft: 12, flex: 1 },
  roomTitle: { fontWeight: 'bold', fontSize: 16 },
  roomAddress: { color: '#666', fontSize: 13, marginTop: 4 },
  
  sectionTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 12, color: '#333' },
  card: { backgroundColor: "white", padding: 20, borderRadius: 16, marginBottom: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  label: { color: '#666' },
  value: { fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#EEE', marginVertical: 10 },
  totalLabel: { fontSize: 16, fontWeight: 'bold' },
  totalValue: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary },

  paymentContainer: { gap: 10, marginBottom: 20 },
  paymentOption: { 
    flexDirection: 'row', alignItems: 'center', padding: 15, 
    backgroundColor: 'white', borderRadius: 12, borderWidth: 1, borderColor: '#EEE' 
  },
  activeOption: { borderColor: COLORS.primary, backgroundColor: '#F0F7FF' },
  paymentText: { marginLeft: 12, fontWeight: '500', color: '#666' },
  activePaymentText: { color: COLORS.primary },

  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 25, paddingRight: 20 },
  agreementText: { marginLeft: 8, fontSize: 13, color: '#666', lineHeight: 18 },
  link: { color: COLORS.primary, fontWeight: 'bold' },

  btn: { backgroundColor: COLORS.primary, padding: 18, borderRadius: 16, shadowColor: COLORS.primary, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  btnDisabled: { backgroundColor: '#CCC', shadowOpacity: 0 },
  btnText: { color: "white", textAlign: "center", fontWeight: "bold", fontSize: 16 },
  note: { textAlign: 'center', marginTop: 15, fontSize: 12, color: '#999', fontStyle: 'italic' }
});