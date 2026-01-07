// hooks/useHistory.ts
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HISTORY_KEY = '@history';

export function useHistory() {
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const stored = await AsyncStorage.getItem(HISTORY_KEY);
      if (stored) setHistory(JSON.parse(stored));
    } catch (error) {
      console.error('Load history error:', error);
    }
  };

  const addToHistory = async (roomId: string) => {
    if (history.includes(roomId)) return;
    const newHistory = [roomId, ...history].slice(0, 20); // Giới hạn 20 mục
    setHistory(newHistory);
    try {
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
    } catch (error) {
      console.error('Save history error:', error);
    }
  };

  const clearHistory = async () => {
    setHistory([]);
    await AsyncStorage.removeItem(HISTORY_KEY);
  };

  return { history, addToHistory, clearHistory };
}