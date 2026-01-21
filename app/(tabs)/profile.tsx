import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import React from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { auth } from '../lib/firebase';

const PRIMARY_COLOR = '#4F46E5';

export default function ProfileScreen() {
  const router = useRouter();
  const { logout, user } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  // --- LOGIC ĐĂNG XUẤT ---
  const handleLogout = () => {
    Alert.alert(
      "Xác nhận thoát",
      "Bạn có chắc chắn muốn đăng xuất tài khoản này không?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Đăng xuất",
          style: "destructive",
          onPress: async () => {
            try {
              setIsLoggingOut(true);

              // 1. Xóa dữ liệu session trong AuthContext & AsyncStorage ngay lập tức
              await logout();

              // 2. Chuyển hướng ngay sang trang Login
              // Dùng replace để xóa trang Profile khỏi lịch sử điều hướng
              router.replace('/login');

              // 3. Đăng xuất khỏi Firebase ngầm
              await signOut(auth);
              
            } catch (error) {
              console.error("Lỗi đăng xuất:", error);
              router.replace('/login');
            } finally {
              setIsLoggingOut(false);
            }
          }
        }
      ]
    );
  };

  // --- COMPONENT CON CHO MENU ITEM ---
  const MenuTile = ({ icon, title, subtitle, onPress, color = '#1E293B' }: any) => (
    <TouchableOpacity style={styles.menuTile} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.iconContainer, { backgroundColor: color + '10' }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <View style={styles.menuContent}>
        <Text style={styles.menuTitle}>{title}</Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* HEADER SECTION */}
        <View style={styles.header}>
          <View style={styles.avatarWrapper}>
            <Image 
              source={{ uri: user?.avatar || 'https://ui-avatars.com/api/?name=' + (user?.name || 'User') }} 
              style={styles.avatar} 
            />
            {user && (
              <TouchableOpacity style={styles.editAvatarBtn}>
                <Ionicons name="camera" size={16} color="white" />
              </TouchableOpacity>
            )}
          </View>
          
          <Text style={styles.userName}>{user?.name || 'Khách tham quan'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'Đăng nhập để đăng tin & quản lý'}</Text>
          
          <TouchableOpacity 
            style={[styles.editProfileBtn, !user && { backgroundColor: PRIMARY_COLOR }]}
            onPress={() => user ? null : router.push('/login')}
          >
            <Text style={[styles.editProfileText, !user && { color: 'white' }]}>
              {user ? 'Chỉnh sửa hồ sơ' : 'Đăng nhập ngay'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* STATS SECTION (Chỉ hiện khi đã đăng nhập) */}
        {user && (
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>Đã lưu</Text>
            </View>
            <View style={[styles.statItem, styles.statBorder]}>
              <Text style={styles.statNumber}>3</Text>
              <Text style={styles.statLabel}>Tin đăng</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>5</Text>
              <Text style={styles.statLabel}>Lịch hẹn</Text>
            </View>
          </View>
        )}

        {/* MAIN MENU SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>{user ? "Quản lý của tôi" : "Hệ thống"}</Text>
          <View style={styles.card}>
            {user && (
              <>
                <MenuTile 
                  icon="home-outline" 
                  title="Tin đăng của tôi" 
                  subtitle="Quản lý các phòng bạn đang cho thuê"
                  onPress={() => router.push('/my-rooms')}
                  color={PRIMARY_COLOR}
                />
                <MenuTile icon="heart-outline" title="Phòng đã lưu" onPress={() => {}} color="#EC4899" />
                <MenuTile icon="calendar-outline" title="Lịch xem phòng" onPress={() => {}} color="#F59E0B" />
              </>
            )}
            <MenuTile icon="help-circle-outline" title="Trung tâm hỗ trợ" onPress={() => router.push('/modal')} />
            <MenuTile icon="shield-checkmark-outline" title="Bảo mật & Điều khoản" onPress={() => {}} />
          </View>
        </View>

        {/* LOGOUT BUTTON (Chỉ hiện khi đã đăng nhập) */}
        {user && (
          <View style={styles.logoutWrapper}>
            <TouchableOpacity 
              style={styles.logoutBtn} 
              onPress={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <ActivityIndicator color="#EF4444" />
              ) : (
                <>
                  <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                  <Text style={styles.logoutText}>Đăng xuất tài khoản</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.versionText}>RoomRent v1.0.4 - 2026</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { paddingBottom: 100 },
  header: { alignItems: 'center', paddingVertical: 30, backgroundColor: 'white' },
  avatarWrapper: { position: 'relative' },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: '#F1F5F9' },
  editAvatarBtn: { 
    position: 'absolute', bottom: 0, right: 0, 
    backgroundColor: PRIMARY_COLOR, padding: 8, 
    borderRadius: 20, borderWidth: 3, borderColor: 'white' 
  },
  userName: { fontSize: 22, fontWeight: '800', color: '#1E293B', marginTop: 15 },
  userEmail: { fontSize: 14, color: '#64748B', marginTop: 4, textAlign: 'center', paddingHorizontal: 20 },
  editProfileBtn: { 
    marginTop: 15, paddingHorizontal: 20, paddingVertical: 10, 
    borderRadius: 20, backgroundColor: '#EEF2FF' 
  },
  editProfileText: { color: PRIMARY_COLOR, fontWeight: '700', fontSize: 13 },
  statsRow: { 
    flexDirection: 'row', backgroundColor: 'white', 
    paddingVertical: 20, borderTopWidth: 1, borderTopColor: '#F1F5F9' 
  },
  statItem: { flex: 1, alignItems: 'center' },
  statBorder: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#F1F5F9' },
  statNumber: { fontSize: 18, fontWeight: '800', color: '#1E293B' },
  statLabel: { fontSize: 12, color: '#64748B', marginTop: 4 },
  section: { paddingHorizontal: 20, marginTop: 25 },
  sectionHeader: { fontSize: 13, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', marginBottom: 12, marginLeft: 4 },
  card: { 
    backgroundColor: 'white', borderRadius: 20, overflow: 'hidden', paddingHorizontal: 15,
    ...Platform.select({
        ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
        android: { elevation: 3 }
    })
  },
  menuTile: { 
    flexDirection: 'row', alignItems: 'center', 
    paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' 
  },
  iconContainer: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  menuContent: { flex: 1 },
  menuTitle: { fontSize: 15, fontWeight: '600', color: '#1E293B' },
  menuSubtitle: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  logoutWrapper: { marginTop: 10 },
  logoutBtn: { 
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', 
    marginTop: 20, padding: 15, gap: 10
  },
  logoutText: { color: '#EF4444', fontWeight: '700', fontSize: 16 },
  versionText: { textAlign: 'center', color: '#CBD5E1', fontSize: 12, marginTop: 30 }
});