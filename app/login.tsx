import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
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
import { useAuth, User } from './context/AuthContext';
import { authService } from './services/authService';

export default function LoginPage() {
  const router = useRouter();
  const { login: updateGlobalAuth, logout } = useAuth();
  
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [loading, setLoading] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  // NGHIỆP VỤ: Vào xem với tư cách khách
  const handleGuestAccess = async () => {
    try {
      // Đảm bảo xóa mọi session cũ trước khi vào xem
      await logout();
      // Điều hướng thẳng vào ứng dụng
      router.replace('/(tabs)');
    } catch (error) {
      router.replace('/(tabs)');
    }
  };

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ Email và Mật khẩu');
      return;
    }

    setLoading(true);
    try {
      let result;
      if (isLoginMode) {
        result = await authService.login(email, password);
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
        Alert.alert('Thông báo', result.error || 'Có lỗi xảy ra');
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể kết nối máy chủ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }} 
        keyboardShouldPersistTaps="always"
      >
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Ionicons name="home" size={50} color="white" />
          </View>
          <Text style={styles.appName}>RoomRent</Text>
          <Text style={styles.appTagline}>Tìm phòng trọ ưng ý ngay hôm nay</Text>
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
                    onChangeText={setName}
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

            {/* PHẦN CHỨC NĂNG KHÁCH (GUEST MODE) */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Hoặc</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity style={styles.guestBtn} onPress={handleGuestAccess}>
              <Text style={styles.guestBtnText}>Vào xem với tư cách Khách</Text>
              <Ionicons name="arrow-forward" size={18} color="#666" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primary || '#4F46E5' },
  logoContainer: { alignItems: 'center', paddingVertical: 40 },
  logoCircle: { width: 80, height: 80, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  appName: { fontSize: 32, fontWeight: 'bold', color: 'white' },
  appTagline: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 5 },
  formContainer: { backgroundColor: 'white', borderTopLeftRadius: 35, borderTopRightRadius: 35, padding: 25, flex: 1 },
  toggleWrapper: { flexDirection: 'row', backgroundColor: '#F0F2F5', borderRadius: 15, padding: 5, marginBottom: 20 },
  toggleTab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12 },
  activeTab: { backgroundColor: 'white', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
  tabText: { fontSize: 16, color: '#888', fontWeight: '500' },
  activeTabText: { color: COLORS.primary || '#4F46E5', fontWeight: 'bold' },
  inputsWrapper: { gap: 15 },
  inputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FA', borderRadius: 12, paddingHorizontal: 15, borderWidth: 1, borderColor: '#EEE' },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 15, fontSize: 16, color: '#333' },
  mainActionBtn: { backgroundColor: COLORS.primary || '#4F46E5', paddingVertical: 18, borderRadius: 15, alignItems: 'center', marginTop: 10, elevation: 3, shadowColor: '#4F46E5', shadowOpacity: 0.3, shadowRadius: 8 },
  mainActionText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  // Styles mới cho Guest Mode
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 10 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#EEE' },
  dividerText: { marginHorizontal: 10, color: '#999', fontSize: 14 },
  guestBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 15, 
    borderRadius: 15, 
    borderWidth: 1, 
    borderColor: '#DDD',
    gap: 8
  },
  guestBtnText: { color: '#666', fontSize: 15, fontWeight: '600' },
});