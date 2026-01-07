import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/Colors';
import { Room } from '../app/types';

// Lấy chiều rộng màn hình để tính toán kích thước card nếu cần
const { width } = Dimensions.get('window');

interface RoomCardProps {
  room: Room;
  isFavorite: boolean;
  onToggleFavorite: (roomId: string) => void;
  isCompared?: boolean;
  onToggleCompare?: (roomId: string) => void;
  onViewRoom: () => void;
}

export default function RoomCard({ 
  room, 
  isFavorite, 
  onToggleFavorite, 
  isCompared = false,
  onToggleCompare,
  onViewRoom 
}: RoomCardProps) {
  
  // Nghiệp vụ: Chuyển đổi mã loại phòng sang tiếng Việt
  const getRoomTypeText = (type: string) => {
    switch(type) {
      case 'private': return 'Phòng riêng';
      case 'entire': return 'Nguyên căn';
      case 'shared': return 'Ở ghép';
      default: return 'Phòng trọ';
    }
  };

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={onViewRoom}
      activeOpacity={0.9}
    >
      {/* Hình ảnh & Badge loại phòng */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: room.image }} style={styles.image} />
        <View style={styles.typeBadge}>
          <Text style={styles.typeText}>{getRoomTypeText(room.roomType)}</Text>
        </View>
        
        {/* Nút yêu thích */}
        <TouchableOpacity
          style={styles.favorite}
          onPress={() => onToggleFavorite(room.id)}
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={22}
            color={isFavorite ? '#FF5A5F' : 'white'}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.info}>
        {/* Giá tiền nổi bật chuẩn VNĐ */}
        <Text style={styles.price}>
          {room.price.toLocaleString('vi-VN')} đ<Text style={styles.monthText}>/tháng</Text>
        </Text>

        <Text style={styles.title} numberOfLines={1}>{room.title}</Text>
        
        <View style={styles.location}>
          <Ionicons name="location-sharp" size={14} color={COLORS.primary} />
          <Text style={styles.locationText} numberOfLines={1}>{room.location}</Text>
        </View>

        {/* Thông số kỹ thuật phụ (Diện tích & Đánh giá) */}
        <View style={styles.footer}>
          <View style={styles.specs}>
            <Ionicons name="resize-outline" size={14} color="#666" />
            <Text style={styles.specText}>{room.area} m²</Text>
          </View>
          
          <View style={styles.rating}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.ratingText}>{room.rating}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    marginVertical: 8,
    overflow: 'hidden',
    // Đổ bóng cho iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    // Đổ bóng cho Android
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 160,
  },
  typeBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
  favorite: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 20,
    padding: 8,
    backdropFilter: 'blur(10px)', // Chỉ hoạt động trên một số môi trường hỗ trợ
  },
  info: {
    padding: 15,
  },
  price: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 4,
  },
  monthText: {
    fontSize: 13,
    fontWeight: '400',
    color: '#666',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 6,
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  locationText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 4,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  specs: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  specText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 4,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFA800',
    marginLeft: 4,
  },
});