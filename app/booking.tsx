import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { COLORS } from "../constants/Colors"; // Chỉnh lại đường dẫn nếu cần (thường là ../constants/Colors)
import { useAuth } from "./context/AuthContext";
import { appointmentService } from "./services/appointmentService";
import { roomService } from "./services/roomService";

export default function BookingPage() {
  // Lấy params từ router.push
  const { id, startDate, endDate } = useLocalSearchParams<{ id: string; startDate: string; endDate: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [room, setRoom] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [fullName, setFullName] = useState(user?.fullName || user?.name || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || "");
  const [idCard, setIdCard] = useState(""); 
  const [occupants, setOccupants] = useState("1");
  const [depositAmount, setDepositAmount] = useState("");

  useEffect(() => {
    const fetchRoom = async () => {
      if (!id) return;
      try {
        const result = await roomService.getRoomById(id);
        if (result.success) {
          setRoom(result.data);
          // Giả sử tiền cọc bằng 1 tháng tiền phòng
          setDepositAmount(result.data.price?.toString() || "");
        }
      } catch (error) {
        console.error("Fetch room error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRoom();
  }, [id]);

  const handleConfirmBooking = async () => {
    if (!user) return Alert.alert("Lỗi", "Bạn cần đăng nhập");
    if (!fullName || !phoneNumber || !idCard) {
      return Alert.alert("Thiếu thông tin", "Vui lòng nhập đầy đủ Họ tên, SĐT và CCCD.");
    }

    setIsSubmitting(true);
    try {
      const bookingData = {
        roomId: id,
        roomTitle: room?.title,
        roomImage: room?.picture || room?.image || '',
        tenantId: user.id,
        tenantInfo: { fullName, phoneNumber, idCard, occupants },
        hostId: room?.userId,
        type: 'DEPOSIT',
        startDate, 
        endDate,     
        depositAmount: parseInt(depositAmount) || 0,
        status: 'pending',
        createdAt: new Date(),
      };

      const result = await appointmentService.createBooking(bookingData);
      if (result.success) {
        Alert.alert("Thành công", "Yêu cầu đặt cọc đã gửi!", [
          { text: "OK", onPress: () => router.replace('/(tabs)/appointments' as any) }
        ]);
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể gửi yêu cầu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết đặt cọc</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Thông tin người thuê */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Thông tin người thuê</Text>
            <Text style={styles.label}>Họ tên</Text>
            <TextInput style={styles.input} value={fullName} onChangeText={setFullName} />

            <Text style={styles.label}>Số điện thoại</Text>
            <TextInput style={styles.input} value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="phone-pad" />

            <Text style={styles.label}>Số CCCD (Bắt buộc)</Text>
            <TextInput style={styles.input} value={idCard} onChangeText={setIdCard} placeholder="Nhập 12 số CCCD" keyboardType="number-pad" />
            
            <Text style={styles.label}>Số người ở</Text>
            <TextInput style={styles.input} value={occupants} onChangeText={setOccupants} keyboardType="number-pad" />
          </View>

          {/* Thông tin thanh toán */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Thông tin phòng & Tiền cọc</Text>
            <Text style={styles.roomName}>{room?.title}</Text>
            <Text style={styles.label}>Tiền cọc giữ chỗ (VNĐ)</Text>
            <TextInput 
                style={[styles.input, {color: COLORS.primary, fontWeight: 'bold'}]} 
                value={depositAmount} 
                onChangeText={setDepositAmount} 
                keyboardType="number-pad" 
            />
            <View style={styles.dateBox}>
                <Ionicons name="calendar-outline" size={16} color={COLORS.primary} />
                <Text style={styles.note}> Thời gian: {startDate} đến {endDate}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.mainBtn} onPress={handleConfirmBooking} disabled={isSubmitting}>
            {isSubmitting ? <ActivityIndicator color="white" /> : <Text style={styles.mainBtnText}>Xác nhận đặt cọc</Text>}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FA" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, paddingTop: 50, backgroundColor: 'white', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  scrollContent: { padding: 20 },
  card: { backgroundColor: 'white', padding: 20, borderRadius: 15, marginBottom: 20, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  roomName: { fontSize: 15, color: '#555', marginBottom: 10 },
  label: { fontSize: 13, color: '#888', marginBottom: 5 },
  input: { borderBottomWidth: 1, borderBottomColor: '#EEE', paddingVertical: 8, marginBottom: 15, fontSize: 16 },
  dateBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F7FF', padding: 10, borderRadius: 10 },
  note: { fontSize: 14, color: COLORS.primary, fontWeight: '500' },
  mainBtn: { backgroundColor: COLORS.primary, padding: 18, borderRadius: 15, alignItems: 'center', marginBottom: 30 },
  mainBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});