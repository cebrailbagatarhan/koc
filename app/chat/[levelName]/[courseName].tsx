import { startChatSession, type ChatPart, type ChatSession } from '@/api/gemini';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Image, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface Message {
  role: 'user' | 'model';
  text: string;
  imageUri?: string; // Kullanıcının gönderdiği resimler için
}

// Resmi Base64'e çeviren ve MIME tipini belirleyen yardımcı fonksiyon
const imageToGeminiPart = async (uri: string): Promise<ChatPart> => {
  const fileInfo = await FileSystem.getInfoAsync(uri, { md5: false });
  if (!fileInfo.exists) {
    throw new Error("Dosya bulunamadı.");
  }
  const mimeType = uri.endsWith('.png') ? 'image/png' : 'image/jpeg';
  const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
  return { inlineData: { data: base64, mimeType } };
};


export default function ChatScreen() {
  const { levelName, courseName } = useLocalSearchParams<{ levelName: string; courseName: string }>();
  const [chat, setChat] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [pickedImage, setPickedImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (levelName) {
      const newChat = startChatSession(levelName);
      setChat(newChat);
      // Başlangıç mesajını ekle
      setMessages([{ role: 'model', text: `Merhaba! ${levelName} seviyesi ${courseName} dersiyle ilgili ne öğrenmek istersin?` }]);
    }
  }, [levelName, courseName]);

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Galeriye erişim izni gerekiyor!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.6,
    });

    if (!result.canceled) {
      setPickedImage(result.assets[0]);
    }
  };

  const handleSend = async () => {
    if ((!input.trim() && !pickedImage) || !chat || loading) return;

    const userMessage: Message = { role: 'user', text: input, imageUri: pickedImage?.uri };
    setMessages(prev => [...prev, userMessage]);
    
    setLoading(true);
    const inputText = input; // state sıfırlanmadan önce kaydet
    const imageToSend = pickedImage;
    setInput('');
    setPickedImage(null);

    try {
      const parts: ChatPart[] = [{ text: inputText }];
      if (imageToSend) {
        const imagePart = await imageToGeminiPart(imageToSend.uri);
        parts.push(imagePart);
      }
      
      const result = await chat.sendMessage(parts);
      const response = result.response;
      const modelMessage: Message = { role: 'model', text: response.text() };
      setMessages(prev => [...prev, modelMessage]);

    } catch (error) {
      console.error("Mesaj gönderme hatası:", error);
      const errorMessage: Message = { role: 'model', text: 'Üzgünüm, bir hata oluştu. Lütfen tekrar dene.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <Stack.Screen options={{ title: `${courseName} Sohbet` }} />
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={[styles.messageBubble, item.role === 'user' ? styles.userBubble : styles.modelBubble]}>
            {item.imageUri && <Image source={{ uri: item.imageUri }} style={styles.sentImage} />}
            {item.text ? <Text style={item.role === 'user' ? styles.userMessageText : styles.modelMessageText}>{item.text}</Text> : null}
          </View>
        )}
        contentContainerStyle={styles.listContainer}
      />

      {loading && <ActivityIndicator style={styles.loading} size="small" color="#007AFF" />}

      <View style={styles.inputContainer}>
        {pickedImage && (
          <View style={styles.imagePreviewContainer}>
            <Image source={{ uri: pickedImage.uri }} style={styles.imagePreview} />
            <TouchableOpacity onPress={() => setPickedImage(null)} style={styles.removeImageButton}>
              <Text style={styles.removeImageButtonText}>X</Text>
            </TouchableOpacity>
          </View>
        )}
        <TouchableOpacity style={styles.attachButton} onPress={handlePickImage} disabled={loading}>
          <Text style={styles.attachButtonText}>📎</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Sorunu buraya yaz..."
          editable={!loading}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend} disabled={loading}>
          <Text style={styles.sendButtonText}>Gönder</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0F0',
  },
  listContainer: {
    padding: 10,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 20,
    marginBottom: 10,
    maxWidth: '80%',
    alignSelf: 'flex-start',
  },
  userBubble: {
    backgroundColor: '#007AFF',
    alignSelf: 'flex-end',
  },
  modelBubble: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  userMessageText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  modelMessageText: {
    fontSize: 16,
    color: '#000',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 15,
    backgroundColor: '#F0F0F0',
    marginLeft: 10,
  },
  sendButton: {
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  loading: {
    marginVertical: 10,
  },
  attachButton: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
  },
  attachButtonText: {
    fontSize: 24,
  },
  sentImage: {
    width: 200,
    height: 200,
    borderRadius: 15,
    marginBottom: 8,
  },
  imagePreviewContainer: {
    position: 'relative',
    marginRight: 10,
  },
  imagePreview: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
