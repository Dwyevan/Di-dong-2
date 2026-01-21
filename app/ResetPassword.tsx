import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
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
} from 'react-native';
import { COLORS } from '../constants/Colors';
import { auth } from './lib/firebase'; // Đường dẫn tới file config firebase của bạn

export default function ResetPasswordPage() {
  const router = useRouter();
  const { oobCode } = useLocalSearchParams(); // Lấy mã từ URL link email

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);

  // Kiểm tra tính hợp lệ của mã link khi vừa vào trang
  useEffect(() => {
    if (!oobCode) {
      Alert.alert("Lỗi", "Liên kết không hợp lệ hoặc đã hết hạn.");
      router.replace('/login');
      return;
    }
    
    verifyPasswordResetCode(auth, oobCode as string)
      .then(() => setIsValidating(false))
      .catch(() => {
        Alert.alert("Lỗi", "Liên kết đặt lại mật khẩu đã quá hạn hoặc đã được sử dụng.");
        router.replace('/login');
      });
  }, [oobCode]);

  const handleUpdatePassword = async () => {
    if (newPassword.length < 6) {
      Alert.alert("Lỗi", "Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp.");
      return;
    }

    setLoading(true);
    try {
      await confirmPasswordReset(auth, oobCode as string, newPassword);
      Alert.alert(
        "Thành công", 
        "Mật khẩu của bạn đã được cập nhật thành công!",
        [{ text: "Đăng nhập ngay", onPress: () => router.replace('/login') }]
      );
    } catch (error: any) {
      Alert.alert("Lỗi", "Không thể cập nhật mật khẩu. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  if (isValidating) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{marginTop: 10}}>Đang xác thực liên kết...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.replace('/login')} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Mật khẩu mới</Text>
          <Text style={styles.subtitle}>Thiết lập mật khẩu mới cho tài khoản của bạn</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputBox}>
            <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Mật khẩu mới"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />
          </View>

          <View style={styles.inputBox}>
            <Ionicons name="checkmark-circle-outline" size={20} color="#666" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Xác nhận mật khẩu mới"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>

          <TouchableOpacity 
            style={styles.mainBtn} 
            onPress={handleUpdatePassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.btnText}>CẬP NHẬT MẬT KHẨU</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  scrollContent: { padding: 25 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { marginTop: 40, marginBottom: 30 },
  backBtn: { marginBottom: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1A1A1A' },
  subtitle: { fontSize: 16, color: '#666', marginTop: 10 },
  form: { gap: 20 },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#EEE'
  },
  icon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 15, fontSize: 16 },
  mainBtn: {
    backgroundColor: COLORS.primary || '#4F46E5',
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 10,
    elevation: 2
  },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});