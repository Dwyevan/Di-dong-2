// hooks/useCompare.ts
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const COMPARE_KEY = '@compare';

export function useCompare() {
  const [compareList, setCompareList] = useState<string[]>([]);

  useEffect(() => {
    loadCompare();
  }, []);

  const loadCompare = async () => {
    try {
      const stored = await AsyncStorage.getItem(COMPARE_KEY);
      if (stored) setCompareList(JSON.parse(stored));
    } catch (error) {
      console.error('Load compare error:', error);
    }
  };

  const toggleCompare = async (roomId: string) => {
    const newList = compareList.includes(roomId)
      ? compareList.filter(id => id !== roomId)
      : [...compareList, roomId].slice(0, 4); // Giới hạn tối đa 4 phòng

    setCompareList(newList);
    try {
      await AsyncStorage.setItem(COMPARE_KEY, JSON.stringify(newList));
    } catch (error) {
      console.error('Save compare error:', error);
    }
  };

  const clearCompare = async () => {
    setCompareList([]);
    await AsyncStorage.removeItem(COMPARE_KEY);
  };

  return { compareList, toggleCompare, clearCompare };
}