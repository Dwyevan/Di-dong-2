// types/index.ts
export interface Room {
  id: string;
  title: string;
  image: string;
  price: number;
  location: string;
  roomType: 'private' | 'shared' | 'entire';
  bedrooms: number;
  bathrooms: number;
  area: number;
  amenities: string[];
  rating: number;
  reviews: number;
  available: boolean;
  description?: string;
  city?: string;
  landlord?: { name: string; verified: boolean };
  maxPeople?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  isLandlord: boolean;
  createdAt: string;
}

export interface Appointment {
  id: string;
  roomId: string;
  userId: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  message?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  roomId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}