// import AsyncStorage from '@react-native-async-storage/async-storage';
// import React, { createContext, useContext, useEffect, useState } from 'react';

// export interface User {
//   id: string;
//   name: string;
//   email: string;
//   phone?: string;
//   fullName?: string;
//   idCard?: string; // Thêm trường này để đồng bộ với trang Booking
// }

// interface AuthContextType {
//   user: User | null;
//   isLoggedIn: boolean;
//   loading: boolean; 
//   login: (userData: User) => Promise<void>;
//   logout: () => Promise<void>;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const loadData = async () => {
//       try {
//         const storedUser = await AsyncStorage.getItem('user');
//         if (storedUser) {
//           setUser(JSON.parse(storedUser));
//         }
//       } catch (e) {
//         console.error("Lỗi khôi phục session:", e);
//       } finally {
//         setLoading(false);
//       }
//     };
//     loadData();
//   }, []);

//   const login = async (userData: User) => {
//     setUser(userData);
//     await AsyncStorage.setItem('user', JSON.stringify(userData));
//   };

//   const logout = async () => {
//     setUser(null);
//     await AsyncStorage.removeItem('user');
//   };

//   return (
//     <AuthContext.Provider value={{ user, isLoggedIn: !!user, loading, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) throw new Error('useAuth must be used within AuthProvider');
//   return context;
// };
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  fullName?: string;
  idCard?: string;
  avatar?: string; // Thêm avatar để hiển thị ở Profile
}

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

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          // parse an toàn
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser && parsedUser.id) {
            setUser(parsedUser);
          }
        }
      } catch (e) {
        console.error("Lỗi Auth Initialization:", e);
      } finally {
        // Luôn tắt loading bất kể thành công hay thất bại
        setLoading(false);
      }
    };
    initializeAuth();
  }, []);

  const login = async (userData: User) => {
    try {
      setUser(userData);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
    } catch (e) {
      console.error("Lỗi lưu session login:", e);
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      await AsyncStorage.removeItem('user');
      // Có thể xóa thêm các token khác nếu có (ví dụ: push notification token)
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