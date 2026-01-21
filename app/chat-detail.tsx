import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/Colors';
import { auth, db } from './lib/firebase'; // Đảm bảo đã import auth từ cấu hình firebase của bạn

interface Message {
  id: string;
  text: string;
  senderId: string;
  createdAt: any; 
}

export default function ChatDetail() {
  const { chatId, roomTitle } = useLocalSearchParams<{ chatId: string; roomTitle: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // LẤY ID NGƯỜI DÙNG ĐANG ĐĂNG NHẬP THẬT
  const currentUserId = auth.currentUser?.uid; 

  useEffect(() => {
    // Nếu chưa có chatId hoặc chưa đăng nhập thì không tải tin nhắn
    if (!chatId || !currentUserId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    // Trỏ đến sub-collection 'messages' bên trong document của cuộc chat
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    // Sắp xếp tin nhắn theo thời gian tăng dần
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: Message[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      
      setMessages(msgs);
      setLoading(false);
      
      // Tự động cuộn xuống cuối khi có tin nhắn mới
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 200);
    }, (error) => {
      console.error("Lỗi khi lấy tin nhắn:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [chatId, currentUserId]);

  const handleSendMessage = async () => {
    if (inputText.trim() === '' || !chatId || !currentUserId) {
        if(!currentUserId) Alert.alert("Thông báo", "Vui lòng đăng nhập để gửi tin nhắn");
        return;
    }
    
    const messageContent = inputText.trim();
    setInputText(''); // Xóa ô nhập ngay lập tức để tạo cảm giác mượt mà
    setSending(true);

    try {
      // 1. Thêm tin nhắn vào sub-collection 'messages'
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      await addDoc(messagesRef, {
        text: messageContent,
        senderId: currentUserId,
        createdAt: serverTimestamp(),
      });

      // 2. Cập nhật tin nhắn cuối cùng vào document 'chats' để hiện ở danh sách chat bên ngoài
      const chatDocRef = doc(db, 'chats', chatId);
      await updateDoc(chatDocRef, {
        lastMessage: messageContent,
        updatedAt: serverTimestamp(),
      });

    } catch (error: any) {
      console.error("Lỗi khi gửi tin nhắn:", error);
      Alert.alert("Lỗi", "Không thể gửi tin nhắn. Vui lòng thử lại.");
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMyMessage = item.senderId === currentUserId;
    
    // Ép kiểu thời gian từ Firebase Timestamp
    let messageTime = "";
    if (item.createdAt) {
        const date = item.createdAt.toDate ? item.createdAt.toDate() : new Date(item.createdAt);
        messageTime = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    }

    return (
      <View style={[
        styles.messageContainer,
        isMyMessage ? { alignItems: 'flex-end' } : { alignItems: 'flex-start' }
      ]}>
        <View style={[
          styles.messageBubble,
          isMyMessage ? styles.myMessage : styles.otherMessage
        ]}>
          <Text style={isMyMessage ? styles.myMessageText : styles.otherMessageText}>
            {item.text}
          </Text>
        </View>
        <Text style={styles.messageTimeText}>
          {messageTime}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{marginTop: 10, color: '#666'}}>Đang tải tin nhắn...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
            <Text style={styles.headerTitle} numberOfLines={1}>
            {roomTitle || 'Phòng cho thuê'}
            </Text>
            <Text style={styles.headerStatus}>Trực tuyến</Text>
        </View>
        <TouchableOpacity style={styles.iconBtn}>
          <Ionicons name="call-outline" size={22} color="#1E293B" />
        </TouchableOpacity>
      </View>

      {/* Danh sách tin nhắn */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messageList}
        showsVerticalScrollIndicator={false}
      />

      {/* Ô nhập liệu */}
      <View style={[styles.inputWrapper, { paddingBottom: Math.max(insets.bottom, 15) }]}>
        <View style={styles.inputContainer}>
            <TouchableOpacity style={styles.attachBtn}>
                <Ionicons name="add-circle-outline" size={26} color="#64748B" />
            </TouchableOpacity>
            <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Nhập tin nhắn..."
            multiline
            placeholderTextColor="#94A3B8"
            />
            <TouchableOpacity 
            style={[styles.sendButton, { backgroundColor: inputText.trim() ? COLORS.primary : '#E2E8F0' }]} 
            onPress={handleSendMessage} 
            disabled={sending || !inputText.trim()}
            >
            {sending ? (
                <ActivityIndicator size="small" color="white" />
            ) : (
                <Ionicons name="send" size={18} color="white" />
            )}
            </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    height: 65,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
  },
  headerInfo: { flex: 1, marginLeft: 10 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  headerStatus: { fontSize: 12, color: '#10B981', fontWeight: '500' },
  iconBtn: { padding: 8 },
  messageList: { padding: 15, paddingBottom: 20 },
  messageContainer: { marginBottom: 15 },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    maxWidth: '85%',
  },
  myMessage: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    backgroundColor: '#FFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  myMessageText: { color: 'white', fontSize: 15, lineHeight: 20 },
  otherMessageText: { color: '#334155', fontSize: 15, lineHeight: 20 },
  messageTimeText: { fontSize: 10, color: '#94A3B8', marginTop: 4, marginHorizontal: 5 },
  inputWrapper: {
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 25,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  attachBtn: { padding: 5 },
  textInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
    color: '#1E293B',
    maxHeight: 100,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
  },
});