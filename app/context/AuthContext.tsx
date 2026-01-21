import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

// !!! THAY IP NÀY BẰNG IP MÁY TÍNH CỦA BẠN !!!
// Cách lấy: Mở CMD gõ 'ipconfig', tìm dòng 'IPv4 Address'
const DEV_MACHINE_IP = '192.168.1.5'; 

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  fullName?: string;
  idCard?: string;
  avatar?: string;
}

// Hàm xử lý URL lỗi cho điện thoại
export const fixUrlForNative = (url?: string) => {
  if (!url) return 'https://ui-avatars.com/api/?name=User';
  
  // 1. Nếu là link blob (do chọn ảnh từ Web/Browser trên máy tính)
  // Điện thoại không đọc được link này, nên dùng ảnh mặc định thay vì để crash
  if (url.startsWith('blob:')) {
    return 'https://ui-avatars.com/api/?name=User';
  }

  // 2. Chuyển localhost thành IP máy tính để điện thoại xem được
  if (url.includes('localhost')) {
    return url.replace('localhost', DEV_MACHINE_IP);
  }

  return url;
};

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  loading: boolean; 
  login: (userData: User) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Hàm xử lý user object để làm sạch toàn bộ URL ảnh bên trong
  const sanitizeUser = (userData: User): User => {
    return {
      ...userData,
      avatar: fixUrlForNative(userData.avatar)
    };
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser && parsedUser.id) {
            setUser(sanitizeUser(parsedUser));
          }
        }
      } catch (e) {
        console.error("Lỗi Auth Initialization:", e);
      } finally {
        setLoading(false);
      }
    };
    initializeAuth();
  }, []);

  const login = async (userData: User) => {
    try {
      const cleanUser = sanitizeUser(userData);
      setUser(cleanUser);
      await AsyncStorage.setItem('user', JSON.stringify(cleanUser));
    } catch (e) {
      console.error("Lỗi lưu session login:", e);
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      await AsyncStorage.removeItem('user');
    } catch (e) {
      console.error("Lỗi xóa session logout:", e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};