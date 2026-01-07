import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context'; // Thêm mới
import { AuthProvider } from './context/AuthContext'; // Sửa lại đường dẫn nếu cần

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    // Thêm font của bạn ở đây
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    // SafeAreaProvider phải bọc ngoài cùng để cung cấp thông số màn hình cho toàn app
    <SafeAreaProvider>
      <AuthProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#fff' }, // Tránh bị vệt đen khi chuyển trang
          }}
        >
          <Stack.Screen name="login" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="room-detail/[id]" />
          <Stack.Screen name="reviews/[roomId]" />
          <Stack.Screen name="compare" />
          <Stack.Screen name="calculator" />
          <Stack.Screen name="history" />
          <Stack.Screen name="notifications" />
          <Stack.Screen name="my-rooms" />
          <Stack.Screen name="post-room" />
        </Stack>
      </AuthProvider>
    </SafeAreaProvider>
  );
}