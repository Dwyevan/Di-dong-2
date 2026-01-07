// hooks/useFavorites.ts
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_KEY = '@favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const stored = await AsyncStorage.getItem(FAVORITES_KEY);
      if (stored) setFavorites(JSON.parse(stored));
    } catch (error) {
      console.error('Load favorites error:', error);
    }
  };

  const toggleFavorite = async (roomId: string) => {
    const newFavorites = favorites.includes(roomId)
      ? favorites.filter(id => id !== roomId)
      : [...favorites, roomId];

    setFavorites(newFavorites);
    try {
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
    } catch (error) {
      console.error('Save favorites error:', error);
    }
  };

  // --- THÊM HÀM NÀY ĐỂ XỬ LÝ LỖI TRÊN GIAO DIỆN ---
  const clearAllFavorites = async () => {
    try {
      setFavorites([]); // Xóa trên giao diện ngay lập tức
      await AsyncStorage.removeItem(FAVORITES_KEY); // Xóa trong bộ nhớ máy
    } catch (error) {
      console.error('Clear favorites error:', error);
    }
  };

  // QUAN TRỌNG: Phải liệt kê clearAllFavorites ở đây để file khác dùng được
  return { 
    favorites, 
    toggleFavorite, 
    clearAllFavorites 
  };
}