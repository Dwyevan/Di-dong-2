import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: (userData: User) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  // Lưu thông tin người dùng vào máy khi đăng nhập
  const login = async (userData: User) => {
    try {
      setUser(userData);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
    } catch (e) {
      console.error("Lỗi khi lưu thông tin đăng nhập", e);
    }
  };

  // QUAN TRỌNG: Hàm xóa sạch dữ liệu khi đăng xuất
  const logout = async () => {
    try {
      setUser(null);
      await AsyncStorage.removeItem('user'); // Xóa hẳn dữ liệu trong bộ nhớ máy
      console.log("Đã xóa user khỏi AsyncStorage");
    } catch (e) {
      console.error("Lỗi khi xóa dữ liệu đăng xuất", e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};