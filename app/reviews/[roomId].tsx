// app/reviews/[roomId].tsx
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { COLORS } from '../../constants/Colors';

export default function ReviewsPage() {
  const { roomId } = useLocalSearchParams();
  const router = useRouter();
  
  // Nghiệp vụ: State cho đánh giá mới
  const [rating, setRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviews, setReviews] = useState([
    { id: '1', userName: 'Nguyễn Văn A', rating: 5, comment: 'Phòng rất sạch, chủ nhà hỗ trợ nhiệt tình.', createdAt: '15/12/2025' },
    { id: '2', userName: 'Trần Thị B', rating: 4, comment: 'Vị trí thuận tiện nhưng ngõ hơi nhỏ.', createdAt: '10/12/2025' },
  ]);

  const handleAddReview = () => {
    if (!newComment.trim()) {
      Alert.alert('Thông báo', 'Vui lòng viết cảm nghĩ của bạn');
      return;
    }
    
    const nuevo: any = {
      id: Date.now().toString(),
      userName: 'Bạn (Người dùng)',
      rating: rating,
      comment: newComment,
      createdAt: new Date().toLocaleDateString('vi-VN'),
    };

    setReviews([nuevo, ...reviews]);
    setNewComment('');
    setRating(5);
    Alert.alert('Thành công', 'Cảm ơn bạn đã đóng góp ý kiến!');
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Đánh giá & Phản hồi</Text>
      </View>

      <FlatList
        data={reviews}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListHeaderComponent={
          <View style={styles.inputSection}>
            <Text style={styles.sectionLabel}>Viết đánh giá của bạn</Text>
            
            {/* Chọn sao */}
            <View style={styles.starRow}>
              {[1, 2, 3, 4, 5].map((s) => (
                <TouchableOpacity key={s} onPress={() => setRating(s)}>
                  <Ionicons 
                    name={s <= rating ? "star" : "star-outline"} 
                    size={32} 
                    color="#FFD700" 
                  />
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.input}
              placeholder="Chia sẻ trải nghiệm của bạn về căn phòng này..."
              multiline
              value={newComment}
              onChangeText={setNewComment}
            />
            
            <TouchableOpacity style={styles.submitBtn} onPress={handleAddReview}>
              <Text style={styles.submitText}>Gửi đánh giá</Text>
            </TouchableOpacity>

            <View style={styles.divider} />
            <Text style={styles.sectionLabel}>Tất cả đánh giá ({reviews.length})</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.userCircle}>
                <Text style={styles.userInitial}>{item.userName.charAt(0)}</Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{item.userName}</Text>
                <View style={styles.ratingRow}>
                  {[...Array(5)].map((_, i) => (
                    <Ionicons 
                      key={i} 
                      name="star" 
                      size={12} 
                      color={i < item.rating ? "#FFD700" : "#EEE"} 
                    />
                  ))}
                  <Text style={styles.dateText}>{item.createdAt}</Text>
                </View>
              </View>
            </View>
            <Text style={styles.commentText}>{item.comment}</Text>
          </View>
        )}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  topBar: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: 'white', elevation: 2 },
  backBtn: { padding: 4 },
  title: { fontSize: 18, fontWeight: 'bold', marginLeft: 12 },
  
  inputSection: { padding: 20, backgroundColor: 'white' },
  sectionLabel: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  starRow: { flexDirection: 'row', gap: 8, marginBottom: 15 },
  input: { backgroundColor: '#F0F2F5', padding: 15, borderRadius: 12, minHeight: 100, textAlignVertical: 'top' },
  submitBtn: { backgroundColor: COLORS.primary, padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 15 },
  submitText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  
  divider: { height: 1, backgroundColor: '#EEE', marginVertical: 20 },
  card: { backgroundColor: 'white', padding: 16, marginHorizontal: 16, marginBottom: 12, borderRadius: 16 },
  cardHeader: { flexDirection: 'row', marginBottom: 10 },
  userCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E0EFFF', justifyContent: 'center', alignItems: 'center' },
  userInitial: { color: COLORS.primary, fontWeight: 'bold' },
  userInfo: { marginLeft: 12, flex: 1 },
  userName: { fontWeight: 'bold', fontSize: 14 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2, gap: 2 },
  dateText: { fontSize: 12, color: '#999', marginLeft: 8 },
  commentText: { color: '#444', lineHeight: 20 }
});