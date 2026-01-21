import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../../constants/Colors';

export default function BookingPage() {
  const { id, startDate, endDate } = useLocalSearchParams();
  const router = useRouter();
  
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [idCard, setIdCard] = useState('');

  const handleCompleteDeposit = () => {
    if (!fullName || !phone || !idCard) {
      return Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin để làm hợp đồng đặt cọc");
    }
    
    // Tại đây bạn sẽ gọi API lưu vào Firebase/Database
    Alert.alert("Thành công", "Thông tin đặt cọc đã được ghi nhận. Vui lòng thanh toán để giữ chỗ.", [
      { text: "Về trang chủ", onPress: () => router.replace('/') }
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Thông tin Đặt cọc</Text>
      
      <View style={styles.infoSummary}>
        <Text>Mã phòng: {id}</Text>
        <Text>Từ ngày: {startDate} - Đến ngày: {endDate}</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Họ và tên người thuê</Text>
        <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholder="Nguyễn Văn A" />

        <Text style={styles.label}>Số điện thoại</Text>
        <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="090..." />

        <Text style={styles.label}>Số CCCD/Passport</Text>
        <TextInput style={styles.input} value={idCard} onChangeText={setIdCard} placeholder="Nhập số CCCD" />

        <TouchableOpacity style={styles.btn} onPress={handleCompleteDeposit}>
          <Text style={styles.btnText}>Hoàn tất & Thanh toán</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: 'white' },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, marginTop: 40 },
  infoSummary: { backgroundColor: '#F0F4F8', padding: 15, borderRadius: 10, marginBottom: 20 },
  form: { gap: 15 },
  label: { fontWeight: '600', color: '#444' },
  input: { borderBottomWidth: 1, borderColor: '#DDD', paddingVertical: 10, fontSize: 16 },
  btn: { backgroundColor: COLORS.primary || '#007AFF', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});