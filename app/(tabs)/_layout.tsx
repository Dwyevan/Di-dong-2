// app/(tabs)/_layout.tsx
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#007AFF', // Màu xanh chủ đạo
        tabBarInactiveTintColor: '#8E8E93',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginBottom: Platform.OS === 'ios' ? 0 : 5, // Cân đối cho iPhone 12
        },
        tabBarStyle: {
          backgroundColor: 'white',
          height: Platform.OS === 'ios' ? 88 : 60, // Chiều cao chuẩn cho iPhone có tai thỏ
          paddingBottom: Platform.OS === 'ios' ? 30 : 10,
          borderTopWidth: 1,
          borderTopColor: '#F2F2F2',
          elevation: 0, // Xóa bóng đổ trên Android
          shadowOpacity: 0, // Xóa bóng đổ trên iOS
        },
      }}
    >
      {/* 1. Trang chủ */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Trang chủ',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={size} color={color} />
          ),
        }}
      />

      {/* 2. Tìm kiếm (Listings) */}
      <Tabs.Screen
        name="listings"
        options={{
          title: 'Tìm kiếm',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "search" : "search-outline"} size={size} color={color} />
          ),
        }}
      />

      {/* 3. Yêu thích */}
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Yêu thích',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "heart" : "heart-outline"} size={size} color={color} />
          ),
        }}
      />

      {/* 4. Lịch hẹn */}
      <Tabs.Screen
        name="appointments"
        options={{
          title: 'Lịch hẹn',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "calendar" : "calendar-outline"} size={size} color={color} />
          ),
        }}
      />

      {/* 5. Cá nhân */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Cá nhân',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "person" : "person-outline"} size={size} color={color} />
          ),
        }}
      />

      {/* 6. ẨN CÁC TAB KHÔNG MUỐN HIỆN Ở ĐÂY */}
      {/* Nếu bạn có file notifications.tsx bên trong thư mục (tabs) 
          nhưng không muốn nó hiện ở thanh menu dưới cùng: */}
      <Tabs.Screen
        name="notifications"
        options={{
          href: null, // Ẩn hoàn toàn khỏi Bottom Tab
        }}
      />

    </Tabs>
  );
}