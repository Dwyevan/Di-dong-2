import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, 
  Platform, ScrollView, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuth, User } from './context/AuthContext';
import { COLORS } from '../constants/Colors';
import { authService } from './services/authService';

export default function LoginPage() {
  const router = useRouter();
  const { login: updateGlobalAuth } = useAuth();
  
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [loading, setLoading] = useState(false);
  
  // States - Đảm bảo khởi tạo là chuỗi rỗng để không bị lỗi "Uncontrolled input"
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handleAuth = async () => {
    // Để bạn tự nhập sai và nhận thông báo lỗi từ Firebase
    setLoading(true);
    try {
      let result;
      if (isLoginMode) {
        result = await authService.login(email, password); // Không dùng .trim() để bạn test lỗi gõ thừa dấu cách
      } else {
        result = await authService.register(email, password, name);
      }

      if (result.success && result.user) {
        const userData: User = {
          id: result.user.uid, 
          name: result.user.displayName || name || 'Người dùng',
          email: result.user.email || email,
          phone: phone || '', 
        };
        updateGlobalAuth(userData);
        router.replace('/(tabs)'); 
      } else {
        // Firebase sẽ trả về lỗi: "Invalid email", "Wrong password", "Weak password"...
        Alert.alert('Thông báo từ hệ thống', result.error || 'Có lỗi xảy ra');
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể kết nối máy chủ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* ScrollView giúp không bị che khuất khi hiện bàn phím */}
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }} 
        keyboardShouldPersistTaps="always" // Quan trọng để bấm nút không bị mất tiêu điểm
      >
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Ionicons name="home" size={50} color="white" />
          </View>
          <Text style={styles.appName}>RoomRent</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.toggleWrapper}>
            <TouchableOpacity 
              style={[styles.toggleTab, isLoginMode && styles.activeTab]} 
              onPress={() => setIsLoginMode(true)}
            >
              <Text style={[styles.tabText, isLoginMode && styles.activeTabText]}>Đăng nhập</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.toggleTab, !isLoginMode && styles.activeTab]} 
              onPress={() => setIsLoginMode(false)}
            >
              <Text style={[styles.tabText, !isLoginMode && styles.activeTabText]}>Đăng ký</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputsWrapper}>
            {!isLoginMode && (
              <>
                <View style={styles.inputBox}>
                  <Ionicons name="person-outline" size={20} color="#888" style={styles.inputIcon} />
                  <TextInput 
                    style={styles.input} 
                    placeholder="Họ và tên" 
                    value={name} 
                    onChangeText={setName} // Mở khóa để nhập trực tiếp
                  />
                </View>
                <View style={styles.inputBox}>
                  <Ionicons name="phone-portrait-outline" size={20} color="#888" style={styles.inputIcon} />
                  <TextInput 
                    style={styles.input} 
                    placeholder="Số điện thoại" 
                    keyboardType="phone-pad" 
                    value={phone} 
                    onChangeText={setPhone}
                  />
                </View>
              </>
            )}

            <View style={styles.inputBox}>
              <Ionicons name="mail-outline" size={20} color="#888" style={styles.inputIcon} />
              <TextInput 
                style={styles.input} 
                placeholder="Email đăng nhập" 
                keyboardType="email-address" 
                autoCapitalize="none" 
                value={email} 
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.inputBox}>
              <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.inputIcon} />
              <TextInput 
                style={styles.input} 
                placeholder="Mật khẩu" 
                secureTextEntry 
                value={password} 
                onChangeText={setPassword}
              />
            </View>

            <TouchableOpacity style={styles.mainActionBtn} onPress={handleAuth} disabled={loading}>
              {loading ? <ActivityIndicator color="white" /> : <Text style={styles.mainActionText}>{isLoginMode ? 'ĐĂNG NHẬP' : 'TẠO TÀI KHOẢN'}</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primary || '#007AFF' },
  logoContainer: { alignItems: 'center', paddingVertical: 40 },
  logoCircle: { width: 80, height: 80, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  appName: { fontSize: 30, fontWeight: 'bold', color: 'white' },
  formContainer: { backgroundColor: 'white', borderTopLeftRadius: 35, borderTopRightRadius: 35, padding: 25, flex: 1 },
  toggleWrapper: { flexDirection: 'row', backgroundColor: '#F0F2F5', borderRadius: 15, padding: 5, marginBottom: 20 },
  toggleTab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12 },
  activeTab: { backgroundColor: 'white' },
  tabText: { fontSize: 16, color: '#888' },
  activeTabText: { color: COLORS.primary || '#007AFF', fontWeight: 'bold' },
  inputsWrapper: { gap: 15 },
  inputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FA', borderRadius: 12, paddingHorizontal: 15, borderWidth: 1, borderColor: '#EEE' },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 15, fontSize: 16, color: '#333' },
  mainActionBtn: { backgroundColor: COLORS.primary || '#007AFF', paddingVertical: 18, borderRadius: 15, alignItems: 'center', marginTop: 10 },
  mainActionText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});