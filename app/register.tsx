import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, 
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { authService } from './services/authService';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // State quản lý việc nhập liệu
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    // Ngăn chặn việc gửi dữ liệu rỗng gây lỗi 400
    if (!email || !password || !name) {
      return Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
    }

    setLoading(true);
    try {
      const result = await authService.register(email.trim(), password, name.trim());
      
      if (result.success) {
        Alert.alert('Thành công', 'Tạo tài khoản thành công!', [
          { text: 'Đăng nhập', onPress: () => router.replace('/login') }
        ]);
      } else {
        // In lỗi chi tiết từ Firebase ra Alert để bạn thấy
        Alert.alert('Thất bại', result.error);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi', 'Kết nối Firebase thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.headerTitle}>Đăng ký mới</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputBox}>
            <Ionicons name="person-outline" size={20} color="#888" />
            <TextInput 
              style={styles.input} 
              placeholder="Họ và tên" 
              value={name} 
              onChangeText={text => setName(text)} // Phải dùng arrow function để cập nhật state
            />
          </View>

          <View style={styles.inputBox}>
            <Ionicons name="call-outline" size={20} color="#888" />
            <TextInput 
              style={styles.input} 
              placeholder="Số điện thoại" 
              keyboardType="phone-pad"
              value={phone} 
              onChangeText={text => setPhone(text)}
            />
          </View>

          <View style={styles.inputBox}>
            <Ionicons name="mail-outline" size={20} color="#888" />
            <TextInput 
              style={styles.input} 
              placeholder="Email" 
              autoCapitalize="none"
              value={email} 
              onChangeText={text => setEmail(text)}
            />
          </View>

          <View style={styles.inputBox}>
            <Ionicons name="lock-closed-outline" size={20} color="#888" />
            <TextInput 
              style={styles.input} 
              placeholder="Mật khẩu" 
              secureTextEntry 
              value={password} 
              onChangeText={text => setPassword(text)}
            />
          </View>

          <TouchableOpacity 
            style={[styles.button, loading && { opacity: 0.7 }]} 
            onPress={() => handleRegister()} // Chỉ gọi hàm khi nhấn nút
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>HOÀN TẤT ĐĂNG KÝ</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#007AFF' },
  backButton: { marginTop: 50, marginLeft: 20 },
  header: { padding: 30, alignItems: 'center' },
  headerTitle: { fontSize: 28, color: 'white', fontWeight: 'bold' },
  formContainer: { flex: 1, backgroundColor: 'white', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25 },
  inputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 12, paddingHorizontal: 15, marginBottom: 15, height: 55 },
  input: { flex: 1, marginLeft: 10, fontSize: 16 },
  button: { backgroundColor: '#007AFF', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});