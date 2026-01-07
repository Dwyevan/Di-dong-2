// context/RoomContext.tsx
import React, { createContext, useContext, useState } from 'react';

export const RoomContext = createContext<any>(null);

export const RoomProvider = ({ children }: { children: React.ReactNode }) => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [compareList, setCompareList] = useState<string[]>([]);

  // Quản lý Yêu thích
  const toggleFavorite = (id: string) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  // Quản lý Lịch sử (Xem phòng nào thì thêm vào đây)
  const addToHistory = (id: string) => {
    setHistory(prev => [id, ...prev.filter(i => i !== id)].slice(0, 20)); // Lưu tối đa 20 phòng gần nhất
  };

  // Quản lý So sánh (Tối đa 3 phòng)
  const toggleCompare = (id: string) => {
    setCompareList(prev => {
      if (prev.includes(id)) return prev.filter(i => i !== id);
      if (prev.length >= 3) {
        alert("Chỉ có thể so sánh tối đa 3 phòng");
        return prev;
      }
      return [...prev, id];
    });
  };

  return (
    <RoomContext.Provider value={{ 
      favorites, toggleFavorite, 
      history, addToHistory, 
      compareList, toggleCompare 
    }}>
      {children}
    </RoomContext.Provider>
  );
};

export const useRoom = () => useContext(RoomContext);