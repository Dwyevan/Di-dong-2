import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import { auth } from './lib/firebase';
import { roomService } from './services/roomService';

const { width } = Dimensions.get('window');
const PRIMARY_COLOR = '#4F46E5';

export default function PostRoomPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // State quản lý form
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    area: '',
  });

  const [amenities, setAmenities] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState(''); // State cho ô dán link ảnh

  const allAmenities = [
    { id: '1', name: 'WiFi', icon: 'wifi' },
    { id: '2', name: 'Điều hòa', icon: 'snow' },
    { id: '3', name: 'Bếp', icon: 'restaurant' },
    { id: '4', name: 'Gửi xe', icon: 'car' },
    { id: '5', name: 'Giặt là', icon: 'shirt' },
    { id: '6', name: 'Gym', icon: 'barbell' },
    { id: '7', name: 'Ban công', icon: 'leaf' },
    { id: '8', name: 'Tủ lạnh', icon: 'ice-cream' },
  ];

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Thông báo', 'Chúng tôi cần quyền truy cập thư viện ảnh để đăng tin!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 5,
      quality: 0.7,
    });

    if (!result.canceled) {
      const selectedUris = result.assets.map(asset => asset.uri);
      setImages(prev => [...prev, ...selectedUris]);
    }
  };

  // HÀM THÊM LINK ẢNH TRỰC TIẾP
  const addImageLink = () => {
    if (!imageUrlInput.trim()) return;
    if (!imageUrlInput.startsWith('http')) {
      Alert.alert("Lỗi", "Vui lòng nhập link ảnh hợp lệ (bắt đầu bằng http)");
      return;
    }
    setImages(prev => [...prev, imageUrlInput.trim()]);
    setImageUrlInput(''); // Xóa nội dung ô nhập sau khi thêm
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const toggleAmenity = (name: string) => {
    setAmenities(prev =>
      prev.includes(name) ? prev.filter(a => a !== name) : [...prev, name]
    );
  };

  const handleSubmit = async () => {
    if (!form.title || !form.price || !form.location) {
      Alert.alert("Thông báo", "Vui lòng nhập đầy đủ Tiêu đề, Giá và Địa chỉ ở Bước 1");
      setStep(1);
      return;
    }

    if (images.length === 0) {
      Alert.alert("Thông báo", "Vui lòng chọn hoặc dán ít nhất 1 hình ảnh");
      return;
    }

    setLoading(true);
    try {
      const roomData = {
        title: form.title,
        description: form.description,
        price: Number(form.price),
        location: form.location,
        area: Number(form.area),
        amenities: amenities,
        userId: auth.currentUser?.uid || 'guest_user',
        userEmail: auth.currentUser?.email || 'no-email',
        imageUrl: images[0], 
        allImages: images,
        status: 'active',
        createdAt: new Date(),
      };

      const result = await roomService.createRoom(roomData);
      if (result.success) {
        Alert.alert("Thành công 🎉", "Phòng của bạn đã được đăng lên hệ thống!", [
          { text: "Xem danh sách", onPress: () => router.replace('/(tabs)/explore' as any) }
        ]);
      } else {
        throw new Error("Lỗi lưu dữ liệu");
      }
    } catch (error: any) {
      Alert.alert("Lỗi", "Không thể đăng bài: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const ProgressBar = () => (
    <View style={styles.progressContainer}>
      {[1, 2, 3, 4].map((i) => (
        <View
          key={i}
          style={[
            styles.progressStep,
            { backgroundColor: i <= step ? PRIMARY_COLOR : '#E2E8F0' }
          ]}
        />
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="close" size={24} color="#1E293B" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Đăng tin cho thuê</Text>
            <ProgressBar />
          </View>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {step === 1 && (
            <View style={styles.stepView}>
              <Text style={styles.sectionTitle}>Thông tin cơ bản ✨</Text>
              <Text style={styles.sectionSub}>Nhập thông tin chi tiết để người thuê dễ dàng tìm thấy bạn.</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Tiêu đề bài đăng</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ví dụ: Phòng trọ cao cấp trung tâm Quận 1"
                  value={form.title}
                  onChangeText={t => setForm({ ...form, title: t })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Giá cho thuê (VNĐ/tháng)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ví dụ: 5000000"
                  keyboardType="numeric"
                  value={form.price}
                  onChangeText={t => setForm({ ...form, price: t })}
                />
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Diện tích (m²)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="25"
                    keyboardType="numeric"
                    value={form.area}
                    onChangeText={t => setForm({ ...form, area: t })}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Số người ở</Text>
                  <TextInput style={styles.input} placeholder="3" keyboardType="numeric" />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Địa chỉ</Text>
                <View style={styles.inputWithIcon}>
                  <Ionicons name="location-outline" size={20} color={PRIMARY_COLOR} />
                  <TextInput
                    style={styles.innerInput}
                    placeholder="Số nhà, tên đường..."
                    value={form.location}
                    onChangeText={t => setForm({ ...form, location: t })}
                  />
                </View>
              </View>
            </View>
          )}

          {step === 2 && (
            <View style={styles.stepView}>
              <Text style={styles.sectionTitle}>Tiện ích có sẵn 🏡</Text>
              <Text style={styles.sectionSub}>Chọn các tiện ích phòng cung cấp.</Text>
              <View style={styles.amenitiesGrid}>
                {allAmenities.map(item => (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.amenityCard, amenities.includes(item.name) && styles.amenityActive]}
                    onPress={() => toggleAmenity(item.name)}
                  >
                    <Ionicons
                      name={item.icon as any}
                      size={24}
                      color={amenities.includes(item.name) ? 'white' : PRIMARY_COLOR}
                    />
                    <Text style={[styles.amenityLabel, amenities.includes(item.name) && styles.amenityTextActive]}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {step === 3 && (
            <View style={styles.stepView}>
              <Text style={styles.sectionTitle}>Mô tả chi tiết 📝</Text>
              <Text style={styles.sectionSub}>Ghi chú về quy định, giờ giấc...</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Mô tả chi tiết..."
                multiline
                numberOfLines={6}
                value={form.description}
                onChangeText={t => setForm({ ...form, description: t })}
              />
            </View>
          )}

          {step === 4 && (
            <View style={styles.stepView}>
              <Text style={styles.sectionTitle}>Hình ảnh 📸</Text>
              <Text style={styles.sectionSub}>Chọn từ máy hoặc dán link ảnh trực tiếp.</Text>
              
              {/* Ô DÁN LINK ẢNH */}
              <View style={styles.linkInputGroup}>
                <TextInput
                  style={[styles.input, { flex: 1, marginBottom: 0 }]}
                  placeholder="Dán link ảnh http://..."
                  value={imageUrlInput}
                  onChangeText={setImageUrlInput}
                  autoCapitalize="none"
                />
                <TouchableOpacity style={styles.addLinkBtn} onPress={addImageLink}>
                  <Text style={styles.addLinkBtnText}>Thêm</Text>
                </TouchableOpacity>
              </View>

              {/* Danh sách ảnh hiển thị */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 20 }}>
                {images.map((uri, index) => (
                  <View key={index} style={styles.imageWrapper}>
                    <Image source={{ uri }} style={styles.imagePreview} />
                    <TouchableOpacity 
                        style={styles.deleteImageBtn} 
                        onPress={() => removeImage(index)}
                    >
                      <Ionicons name="close-circle" size={24} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>

              <TouchableOpacity 
                style={styles.uploadBox} 
                activeOpacity={0.7}
                onPress={pickImage}
              >
                <Ionicons name="cloud-upload-outline" size={40} color={PRIMARY_COLOR} />
                <Text style={styles.uploadTitle}>Chọn từ thư viện máy</Text>
                <Text style={{ color: '#94A3B8', marginTop: 5 }}>
                    Đã có {images.length} ảnh trong danh sách
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          {step > 1 && (
            <TouchableOpacity
              style={styles.backActionBtn}
              onPress={() => setStep(step - 1)}
              disabled={loading}
            >
              <Text style={styles.backActionText}>Quay lại</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.nextActionBtn, step === 1 && { width: '100%' }]}
            onPress={step === 4 ? handleSubmit : () => setStep(step + 1)}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.nextActionText}>
                {step === 4 ? 'Đăng tin ngay' : 'Tiếp theo'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: { padding: 8, backgroundColor: '#F1F5F9', borderRadius: 12 },
  headerTitleContainer: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B', marginBottom: 8 },
  progressContainer: { flexDirection: 'row', gap: 4 },
  progressStep: { width: 30, height: 4, borderRadius: 2 },
  content: { flex: 1, padding: 24 },
  stepView: { flex: 1 },
  sectionTitle: { fontSize: 24, fontWeight: '800', color: '#1E293B' },
  sectionSub: { fontSize: 14, color: '#64748B', marginTop: 8, marginBottom: 30 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '700', color: '#1E293B', marginBottom: 8 },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1E293B',
  },
  inputRow: { flexDirection: 'row', gap: 15 },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  innerInput: { flex: 1, paddingVertical: 16, marginLeft: 10, fontSize: 16 },
  textArea: { height: 150, textAlignVertical: 'top' },
  amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  amenityCard: {
    width: (width - 72) / 3,
    aspectRatio: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  amenityActive: { backgroundColor: PRIMARY_COLOR, borderColor: PRIMARY_COLOR },
  amenityLabel: { fontSize: 12, fontWeight: '600', color: '#64748B', marginTop: 8 },
  amenityTextActive: { color: 'white' },
  
  // Styles mới cho link ảnh
  linkInputGroup: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  addLinkBtn: { backgroundColor: PRIMARY_COLOR, paddingHorizontal: 15, height: 55, borderRadius: 12, justifyContent: 'center' },
  addLinkBtnText: { color: 'white', fontWeight: 'bold' },

  uploadBox: {
    height: 150,
    backgroundColor: '#F5F7FF',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: PRIMARY_COLOR,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadTitle: { fontSize: 16, fontWeight: '700', color: PRIMARY_COLOR, marginTop: 10 },
  imageWrapper: { marginRight: 12, position: 'relative' },
  imagePreview: { width: 120, height: 120, borderRadius: 12 },
  deleteImageBtn: { position: 'absolute', top: -10, right: -10, backgroundColor: 'white', borderRadius: 12 },
  
  footer: {
    padding: 24,
    flexDirection: 'row',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  backActionBtn: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
  },
  backActionText: { fontWeight: '700', color: '#64748B' },
  nextActionBtn: {
    flex: 2,
    height: 56,
    borderRadius: 16,
    backgroundColor: PRIMARY_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextActionText: { color: 'white', fontWeight: '800', fontSize: 16 },
});