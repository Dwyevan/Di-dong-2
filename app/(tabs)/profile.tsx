import React from 'react';
import { 
  View, Text, StyleSheet, Image, TouchableOpacity, 
  ScrollView, SafeAreaView, Alert, ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext'; 
import { auth } from '../lib/firebase'; 
import { signOut } from 'firebase/auth'; 

const PRIMARY_COLOR = '#4F46E5';

export default function ProfileScreen() {
  const router = useRouter();
  const { logout, user } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const handleLogout = () => {
    // Log để kiểm tra nút bấm đã hoạt động trong console
    console.log("Đã nhấn nút Đăng xuất");

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
              
              // BƯỚC 1: Xóa dữ liệu cục bộ trước (Set user = null)
              // Việc này cực kỳ quan trọng để AuthGuard ở Layout nhận biết và cho phép nhảy trang
              await logout(); 
              console.log("Đã xóa session cục bộ");

              // BƯỚC 2: Điều hướng ngay lập tức sang trang login
              // Dùng replace để xóa lịch sử các trang, ngăn quay lại bằng nút back
              router.replace('/login');
              
              // BƯỚC 3: Gọi Firebase signOut sau cùng (chạy ngầm)
              // Nếu gặp lỗi 400 như trong ảnh của bạn, app cũng đã nhảy sang login rồi
              signOut(auth).catch(err => console.log("Lỗi Firebase (đã bỏ qua):", err));
              
            } catch (error) {
              console.error("Logout Error:", error);
              // Nếu có lỗi bất ngờ, vẫn ép chuyển về login
              router.replace('/login');
            } finally {
              setIsLoggingOut(false);
            }
          } 
        }
      ]
    );
  };

  // Thành phần Menu item con (Giữ nguyên của bạn)
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
      {/* Thêm contentContainerStyle để nút không bị TabBar đè */}
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View style={styles.header}>
          <View style={styles.avatarWrapper}>
            <Image 
              source={{ uri: 'https://i.pravatar.cc/300' }} 
              style={styles.avatar} 
            />
            <TouchableOpacity style={styles.editAvatarBtn}>
              <Ionicons name="camera" size={16} color="white" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.userName}>{user?.name || 'Người dùng'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'Chưa cập nhật email'}</Text>
          
          <TouchableOpacity style={styles.editProfileBtn}>
            <Text style={styles.editProfileText}>Chỉnh sửa hồ sơ</Text>
          </TouchableOpacity>
        </View>

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

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Quản lý của tôi</Text>
          <div style={styles.card}>
            <MenuTile 
              icon="home-outline" 
              title="Tin đăng của tôi" 
              subtitle="Quản lý các phòng bạn đang cho thuê"
              onPress={() => router.push('/my-rooms' as any)}
              color={PRIMARY_COLOR}
            />
            <MenuTile icon="heart-outline" title="Phòng đã lưu" onPress={() => {}} color="#EC4899" />
            <MenuTile icon="calendar-outline" title="Lịch xem phòng" onPress={() => {}} color="#F59E0B" />
          </div>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Cài đặt hệ thống</Text>
          <div style={styles.card}>
            <MenuTile icon="notifications-outline" title="Thông báo" onPress={() => {}} />
            <MenuTile icon="shield-checkmark-outline" title="Bảo mật" onPress={() => {}} />
            <MenuTile icon="help-circle-outline" title="Trung tâm hỗ trợ" onPress={() => router.push('/modal' as any)} />
          </div>
        </View>

        {/* Nút Đăng Xuất - Bọc trong View có zIndex để ưu tiên vùng bấm */}
        <View style={{ zIndex: 100, marginTop: 20 }}>
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

        <Text style={styles.versionText}>RoomRent v1.0.4 - 2025</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { alignItems: 'center', paddingVertical: 30, backgroundColor: 'white' },
  avatarWrapper: { position: 'relative' },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: '#F1F5F9' },
  editAvatarBtn: { 
    position: 'absolute', bottom: 0, right: 0, 
    backgroundColor: PRIMARY_COLOR, padding: 8, 
    borderRadius: 20, borderWidth: 3, borderColor: 'white' 
  },
  userName: { fontSize: 22, fontWeight: '800', color: '#1E293B', marginTop: 15 },
  userEmail: { fontSize: 14, color: '#64748B', marginTop: 4 },
  editProfileBtn: { 
    marginTop: 15, paddingHorizontal: 20, paddingVertical: 8, 
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
  sectionHeader: { fontSize: 14, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', marginBottom: 12, marginLeft: 4 },
  card: { backgroundColor: 'white', borderRadius: 20, overflow: 'hidden', paddingHorizontal: 15 },
  menuTile: { 
    flexDirection: 'row', alignItems: 'center', 
    paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' 
  },
  iconContainer: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  menuContent: { flex: 1 },
  menuTitle: { fontSize: 15, fontWeight: '600', color: '#1E293B' },
  menuSubtitle: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  logoutBtn: { 
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', 
    marginTop: 10, padding: 15, gap: 10, marginBottom: 10
  },
  logoutText: { color: '#EF4444', fontWeight: '700', fontSize: 16 },
  versionText: { textAlign: 'center', color: '#CBD5E1', fontSize: 12, marginBottom: 30 }
});