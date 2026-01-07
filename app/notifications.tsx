import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS } from '../constants/Colors';

const MOCK_NOTIFS = [
  { id: '1', title: 'Lịch hẹn thành công', desc: 'Chủ nhà đã xác nhận lịch xem phòng của bạn vào lúc 14:00.', time: '5 phút trước', type: 'calendar', read: false },
  { id: '2', title: 'Phòng mới gần bạn', desc: 'Có 5 phòng mới vừa được đăng tại khu vực Quận 7.', time: '1 giờ trước', type: 'home', read: true },
];

export default function NotificationsPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Thông báo</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={MOCK_NOTIFS}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={[styles.card, !item.read && styles.unread]}>
            <View style={styles.iconCircle}>
              <Ionicons name={item.type as any} size={20} color={COLORS.primary} />
            </View>
            <View style={styles.info}>
              <Text style={styles.notifTitle}>{item.title}</Text>
              <Text style={styles.notifDesc}>{item.desc}</Text>
              <Text style={styles.notifTime}>{item.time}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, alignItems: 'center', backgroundColor: 'white' },
  title: { fontSize: 18, fontWeight: 'bold' },
  card: { flexDirection: 'row', padding: 16, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  unread: { backgroundColor: '#F0F7FF' },
  iconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E8F2FF', justifyContent: 'center', alignItems: 'center' },
  info: { flex: 1, marginLeft: 12 },
  notifTitle: { fontWeight: 'bold', fontSize: 15 },
  notifDesc: { color: '#666', fontSize: 13, marginTop: 2 },
  notifTime: { color: '#999', fontSize: 11, marginTop: 5 },
});