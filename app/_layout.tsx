// import { useFonts } from 'expo-font';
// import { Stack } from 'expo-router';
// import * as SplashScreen from 'expo-splash-screen';
// import { useEffect } from 'react';
// import { SafeAreaProvider } from 'react-native-safe-area-context';
// import { AuthProvider } from './context/AuthContext';

// SplashScreen.preventAutoHideAsync();

// export default function RootLayout() {
//   const [loaded, error] = useFonts({
//     // Thêm font của bạn ở đây nếu có, ví dụ:
//     // 'SpaceMono': require('../assets/fonts/SpaceMono-Regular.ttf'),
//   });

//   useEffect(() => {
//     if (loaded || error) {
//       SplashScreen.hideAsync();
//     }
//   }, [loaded, error]);

//   if (!loaded && !error) {
//     return null;
//   }

//   return (
//     <SafeAreaProvider>
//       <AuthProvider>
//         <Stack
//           screenOptions={{
//             headerShown: false,
//             contentStyle: { backgroundColor: '#fff' },
//           }}
//         >
//           {/* Các màn hình chính */}
//           <Stack.Screen name="login" />
//           <Stack.Screen name="(tabs)" />
          
//           {/* Chi tiết phòng và đánh giá */}
//           <Stack.Screen name="room-detail/[id]" />
//           <Stack.Screen name="reviews/[roomId]" />
          
//           {/* --- THÊM DÒNG NÀY ĐỂ CHẠY HỢP ĐỒNG --- */}
//           <Stack.Screen 
//             name="contract-detail/[id]" 
//             options={{ 
//               headerShown: false, // Ẩn header mặc định để dùng header tự chế của bạn
//               presentation: 'modal' // Tạo hiệu ứng trượt lên như một tờ đơn
//             }} 
//           />
//           {/* -------------------------------------- */}

//           {/* Các màn hình chức năng khác */}
//           <Stack.Screen name="compare" />
//           <Stack.Screen name="calculator" />
//           <Stack.Screen name="history" />
//           <Stack.Screen name="notifications" />
//           <Stack.Screen name="my-rooms" />
//           <Stack.Screen name="post-room" />
//         </Stack>
//       </AuthProvider>
//     </SafeAreaProvider>
//   );
// }
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './context/AuthContext';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({});

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#fff' },
          }}
        >
          <Stack.Screen name="login" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="room-detail/[id]" />
          
          {/* SỬA TẠI ĐÂY: Khai báo đúng đường dẫn thư mục booking/[id] */}
          <Stack.Screen 
            name="booking/[id]" 
            options={{ 
              animation: 'slide_from_right',
              headerShown: false 
            }} 
          />
          
          <Stack.Screen name="reviews/[roomId]" />
          <Stack.Screen 
            name="contract-detail/[id]" 
            options={{ presentation: 'modal' }} 
          />
          <Stack.Screen name="chat-detail" />
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