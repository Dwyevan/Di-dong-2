import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { appointmentService } from '../services/appointmentService';

export default function PaymentScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [billImage, setBillImage] = useState<string | null>(null);

  // Cấu hình Ngân hàng của bạn (Ví dụ MB Bank)
  const BANK_ID = "MB"; 
  const ACCOUNT_NO = "0987654321";
  const ACCOUNT_NAME = "NGUYEN VAN A";

  useEffect(() => {
    appointmentService.getAppointmentById(id as string).then(res => {
      if (res.success) setData(res.data);
      setLoading(false);
    });
  }, [id]);

  // Tạo link VietQR tự động
  const qrUrl = `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-compact2.jpg?amount=${data?.depositAmount}&addInfo=COC PHONG ${data?.id?.slice(-6)}&accountName=${ACCOUNT_NAME}`;

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) setBillImage(result.assets[0].uri);
  };

  const handleConfirm = async () => {
    if (!billImage) return Alert.alert("Lỗi", "Vui lòng chụp ảnh Bill thanh toán");
    // Cập nhật trạng thái sang 'confirmed' để chủ nhà đối soát
    const res = await appointmentService.updateAppointmentStatus(id as string, 'confirmed');
    if (res.success) {
      Alert.alert("Thành công", "Đã gửi bill xác nhận. Vui lòng chờ chủ nhà kiểm tra.", [
        { text: "Về trang chủ", onPress: () => router.replace('/(tabs)/appointments') }
      ]);
    }
  };

  if (loading) return <ActivityIndicator style={{flex: 1}} />;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{padding: 20}}>
        <Text style={styles.title}>Quét mã để đặt cọc</Text>
        
        {/* Mã QR Tự động */}
        <View style={styles.qrContainer}>
          <Image source={{ uri: qrUrl }} style={styles.qrImage} />
          <Text style={styles.qrHint}>Mã QR chứa sẵn số tiền và nội dung</Text>
        </View>

        <View style={styles.bankInfo}>
          <Text style={styles.bankText}>Ngân hàng: <Text style={styles.bold}>{BANK_ID}</Text></Text>
          <Text style={styles.bankText}>STK: <Text style={styles.bold}>{ACCOUNT_NO}</Text></Text>
          <Text style={styles.bankText}>Số tiền: <Text style={styles.price}>{data?.depositAmount?.toLocaleString()}đ</Text></Text>
        </View>

        <Text style={styles.label}>Tải lên ảnh Bill xác nhận:</Text>
        <TouchableOpacity style={styles.uploadBox} onPress={pickImage}>
          {billImage ? (
            <Image source={{ uri: billImage }} style={styles.billPreview} />
          ) : (
            <Ionicons name="cloud-upload-outline" size={40} color="#94A3B8" />
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnSubmit} onPress={handleConfirm}>
          <Text style={styles.btnText}>Xác nhận đã chuyển khoản</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  title: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  qrContainer: { alignItems: 'center', padding: 20, backgroundColor: '#F8FAFC', borderRadius: 20 },
  qrImage: { width: 250, height: 250 },
  qrHint: { marginTop: 10, color: '#64748B', fontSize: 12 },
  bankInfo: { marginVertical: 20, padding: 15, borderLeftWidth: 4, borderLeftColor: '#4F46E5', backgroundColor: '#EEF2FF' },
  bankText: { fontSize: 16, marginBottom: 5 },
  bold: { fontWeight: 'bold' },
  price: { color: '#4F46E5', fontWeight: 'bold', fontSize: 18 },
  label: { fontWeight: 'bold', marginBottom: 10 },
  uploadBox: { height: 150, backgroundColor: '#F1F5F9', borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderStyle: 'dashed', borderWidth: 2, borderColor: '#CBD5E1' },
  billPreview: { width: '100%', height: '100%', borderRadius: 10 },
  btnSubmit: { backgroundColor: '#4F46E5', padding: 18, borderRadius: 12, marginTop: 20, alignItems: 'center' },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});