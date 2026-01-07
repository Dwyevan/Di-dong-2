import { StyleSheet, ScrollView, TouchableOpacity, View, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Sử dụng component gốc của React Native để tránh lỗi đỏ đường dẫn @/
import { Text, View as RNView } from 'react-native';

export default function ModalScreen() {
  const router = useRouter();

  // Component phụ để hiển thị từng mục chính sách
  const PolicyItem = ({ title, content, icon }: { title: string, content: string, icon: any }) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.iconCircle}>
          <Ionicons name={icon} size={20} color="#4F46E5" />
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <Text style={styles.content}>{content}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header - Thanh kéo xuống cho Modal trên iOS */}
      {Platform.OS === 'ios' && <View style={styles.dragHandle} />}

      <View style={styles.header}>
        <Text style={styles.headerText}>Thông tin & Chính sách</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="close" size={24} color="#64748B" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.infoBox}>
          <Text style={styles.infoBoxText}>
            Chào mừng bạn đến với RoomRent. Để bảo vệ quyền lợi của mình, vui lòng đọc kỹ các quy định dưới đây.
          </Text>
        </View>

        <PolicyItem 
          icon="shield-checkmark-outline"
          title="Bảo mật thông tin"
          content="Chúng tôi cam kết bảo mật số điện thoại và email của bạn. Chỉ những chủ nhà được bạn gửi yêu cầu đặt lịch mới có thể liên lạc."
        />

        <PolicyItem 
          icon="alert-circle-outline"
          title="Quy định đăng tin"
          content="Mọi tin đăng phải kèm hình ảnh thật. Hành vi treo giá ảo hoặc thông tin sai lệch sẽ bị khóa tài khoản vĩnh viễn."
        />

        <PolicyItem 
          icon="document-text-outline"
          title="Hợp đồng & Đặt cọc"
          content="RoomRent khuyến nghị người dùng luôn lập hợp đồng văn bản và chỉ chuyển khoản đặt cọc sau khi đã xem phòng trực tiếp."
        />

        <TouchableOpacity 
          style={styles.acceptBtn} 
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Text style={styles.acceptBtnText}>Tôi đã hiểu và đồng ý</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Phiên bản ứng dụng 1.0.4 (2025)</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#E2E8F0',
    borderRadius: 10,
    alignSelf: 'center',
    marginTop: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  closeBtn: {
    backgroundColor: '#F1F5F9',
    padding: 8,
    borderRadius: 20,
  },
  scrollContent: {
    padding: 20,
  },
  infoBox: {
    backgroundColor: '#EEF2FF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 25,
    borderLeftWidth: 4,
    borderLeftColor: '#4F46E5',
  },
  infoBoxText: {
    color: '#4338CA',
    fontSize: 14,
    lineHeight: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F3FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  content: {
    fontSize: 15,
    color: '#64748B',
    lineHeight: 24,
    paddingLeft: 48, // Căn lề thẳng với tiêu đề sau icon
  },
  acceptBtn: {
    backgroundColor: '#4F46E5',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  acceptBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  versionText: {
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 30,
    marginBottom: 10,
  },
});