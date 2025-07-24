// WriteNote.js
import { Feather } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import axios from "axios";
import * as SecureStore from "expo-secure-store";

const screenHeight = Dimensions.get("window").height;

export default function WriteNote() {
  const router = useRouter();

  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  const lineHeight = 22;
  const paddingHorizontal = 15;
  const paddingVertical = 15;
  const MIN_LINES = 30;

  const [scrollViewHeight, setScrollViewHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);

  const sheetTranslateY = useRef(new Animated.Value(screenHeight)).current;
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { type: "bot", text: "안녕하세요! 학습한 내용에 대해 궁금한 점을 물어보세요." },
  ]);
  const [isBotTyping, setIsBotTyping] = useState(false);

  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedTexts, setSelectedTexts] = useState([]);

  const dotOpacity1 = useRef(new Animated.Value(0)).current;
  const dotOpacity2 = useRef(new Animated.Value(0)).current;
  const dotOpacity3 = useRef(new Animated.Value(0)).current;

  const { noteId } = useLocalSearchParams();

  const [userInfo, setUserInfo] = useState(null);
  const [noteContent, setNoteContent] = useState("");
  const [noteTitle, setNoteTitle] = useState("");
  const [totalLines, setTotalLines] = useState(0);

  useEffect(() => {
    async function checkLogin(){
        try{
            let token;

            if(Platform.OS === 'web'){
                token = localStorage.getItem("accessToken");
            } else{
                token = SecureStore.getItemAsync("accessToken");
            }
            if(!token) throw new Error("token not found");

            const response = await axios.get("http://localhost:8080/api/validation", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setUserInfo(response.data.nickname);
        } catch(err){
            console.log(err);
            router.push("/");
        }
    }

    checkLogin();
  }, [])

  useEffect(() => {
    // title과 content 가져오기
    async function getOneNote(){
        try{
            const response = await axios.post("http://localhost:8080/api/printOneNote", {
                noteId
            });
            const note = response.data;

            setNoteTitle(note.title);
            if(note.content !== null){
                setNoteContent(note.content); // null만 아니면 됨 ?
                setTotalLines(Math.max(noteContent.split("\n"), MIN_LINES));
            }
            else{
                setTotalLines(MIN_LINES);
            }
        } catch(err){
            console.log(err);
        }
    }

    getOneNote();
  }, [userInfo])

  useEffect(() => {
    if (isBotTyping) {
      const animateDots = () => {
        Animated.sequence([
          Animated.timing(dotOpacity1, { toValue: 1, duration: 200, useNativeDriver: true }),
          Animated.timing(dotOpacity2, { toValue: 1, duration: 200, useNativeDriver: true }),
          Animated.timing(dotOpacity3, { toValue: 1, duration: 200, useNativeDriver: true }),
          Animated.delay(400),
          Animated.timing(dotOpacity3, { toValue: 0, duration: 200, useNativeDriver: true }),
          Animated.timing(dotOpacity2, { toValue: 0, duration: 200, useNativeDriver: true }),
          Animated.timing(dotOpacity1, { toValue: 0, duration: 200, useNativeDriver: true }),
        ]).start(() => {
          if (isBotTyping) animateDots();
        });
      };
      animateDots();
    } else {
      dotOpacity1.setValue(0);
      dotOpacity2.setValue(0);
      dotOpacity3.setValue(0);
    }
  }, [isBotTyping]);

  const toggleChatSheet = useCallback(() => {
    Animated.timing(sheetTranslateY, {
      toValue: isSheetOpen ? screenHeight : 30,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setIsSheetOpen(!isSheetOpen));
  }, [isSheetOpen]);

  const handleSendMessage = async () => {
    if (chatInput.trim()) {
      try{
         const newUserChatMessage = {
            type: "user",
            text: chatInput,
         }
         setChatMessages(prev => [...prev, newUserChatMessage]);
         setIsBotTyping(true);

         const response = await axios.post("http://localhost:8080/api/ai/chatInput", {
            content: noteContent,
            chatInput,
         });

         setChatInput("");
         setSelectedTexts([]);

         const newBotChatMessage = {
            type: "bot",
            text: response.data,
         };

         setChatMessages(prev => [...prev, newBotChatMessage]);
      } catch(err){
        console.log(err);
      } finally{
        setIsBotTyping(false);
      }

      /* setChatMessages((prev) => [
        ...prev,
        selectedTexts.length > 0
          ? { type: "user", text: `→ 오늘 내가 공부한 내용은 ${selectedTexts.join(" / ")} ...\n${chatInput}` }
          : { type: "user", text: chatInput },
      ]); */
    }
    else{
        alert("채팅을 입력하세요.");
        return;
    }
  };

  const handleSelectContent = () => {
    if (selection.start !== selection.end) {
      const selected = noteContent.substring(selection.start, selection.end);
      setSelectedTexts((prev) => [...prev, selected]);
      setIsSelecting(false);
      Animated.timing(sheetTranslateY, {
        toValue: 30,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setIsSheetOpen(true));
    }
  };

  const handleNoteSave = async () => {
    if(noteTitle.trim() && noteContent.trim()){
        try{
            const response = await axios.post("http://localhost:8080/api/updateNote", {
                noteId,
                title: noteTitle,
                content: noteContent,
            });

            alert("저장되었습니다.");
        } catch(err){
            console.log(err);
        }
    }
    else{
        return;
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <TouchableWithoutFeedback onPress={() => { if(Platform.OS !== 'web') Keyboard.dismiss(); }}>
        <View style={{ flex: 1 }}>
          {/* 헤더 */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 8 }}>
              <Feather name="chevron-left" size={24} color="#717171" />
            </TouchableOpacity>
            <Feather name="file" size={24} color="#717171" />
            <TextInput
              style={styles.titleInput}
              value={noteTitle}
              onChangeText={setNoteTitle}
              placeholder="노트 제목"
              placeholderTextColor="#888"
              maxLength={50}
            />
          </View>

          {/* 노트 내용 */}
          <ScrollView
            ref={scrollRef}
            style={styles.contentContainer}
            contentContainerStyle={{ paddingBottom: 100 }}
            onContentSizeChange={(w, h) => setContentHeight(h)}
            onLayout={(e) => setScrollViewHeight(e.nativeEvent.layout.height)}
            keyboardShouldPersistTaps="never"
            showsVerticalScrollIndicator={true}
            onScrollBeginDrag={() => setIsScrolling(true)}
            onMomentumScrollEnd={() => setIsScrolling(false)}
            onScrollEndDrag={() => setIsScrolling(false)}
          >
            <TextInput
              ref={inputRef}
              style={[styles.contentInput, { minHeight: totalLines * lineHeight }]}
              multiline
              placeholder="노트 내용을 입력하세요."
              placeholderTextColor="#555555"
              value={noteContent}
              onChangeText={setNoteContent}
              onSelectionChange={({ nativeEvent }) => setSelection(nativeEvent.selection)}
              scrollEnabled={false}
              textAlignVertical="top"
              selection={selection}
              spellCheck={false}
              autoCorrect={false}
              autoFocus={false}
              pointerEvents={isScrolling ? "none" : "auto"}
            />
          </ScrollView>

          {/* 플로팅 버튼 */}
          {!isSheetOpen && <TouchableOpacity
            style={styles.floatingButton}
            onPress={isSelecting ? handleSelectContent : toggleChatSheet}
          >
            {isSelecting ? (
              <MaterialIcons name="done" size={32} color="#BA94CC" />
            ) : (
              <Image source={require("../assets/images/chatsu.png")} style={styles.floatingButtonImage} />
            )}
          </TouchableOpacity>}

          {/* 챗봇 시트 */}
          <Animated.View style={[styles.chatSheet, { transform: [{ translateY: sheetTranslateY }] }]}>
            <View style={styles.chatSheetHeader}>
              <Text style={styles.chatbotTitle}>AI 수룡이 챗봇</Text>
              <TouchableOpacity onPress={toggleChatSheet} style={styles.closeButton}>
                <Feather name="x" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.contentContainerChatbot}>
              <ScrollView style={styles.chatMessagesContainer} contentContainerStyle={{ paddingBottom: 10 }}>
                {chatMessages.map((msg, i) => (
                  <View
                    key={i}
                    style={[styles.chatMessageRow, msg.type === 'user' ? styles.userMessageRow : styles.botMessageRow]}
                  >
                    {msg.type === 'bot' && (
                      <Image source={require("../assets/images/chatsu.png")} style={styles.chatsuAvatar} />
                    )}
                    <View style={[styles.chatBubble, msg.type === 'user' ? styles.userBubble : styles.botBubble]}>
                      <Text style={msg.type === 'user' ? styles.userText : styles.botText}>{msg.text}</Text>
                    </View>
                  </View>
                ))}
                {isBotTyping && (
                  <View style={[styles.chatMessageRow, styles.botMessageRow]}>
                    <Image source={require("../assets/images/chatsu.png")} style={styles.chatsuAvatar} />
                    <View style={[styles.botBubble, { borderRadius: 15 }]}>
                      <Text style={styles.loadingDotsContainer}>
                        <Animated.Text style={[styles.dot, { opacity: dotOpacity1 }]}>.</Animated.Text>
                        <Animated.Text style={[styles.dot, { opacity: dotOpacity2 }]}>.</Animated.Text>
                        <Animated.Text style={[styles.dot, { opacity: dotOpacity3 }]}>.</Animated.Text>
                      </Text>
                    </View>
                  </View>
                )}
              </ScrollView>

              <View style={{ paddingBottom: 5 }}>
                {selectedTexts.length > 0 && (
                  <View style={{ marginBottom: 6 }}>
                    {selectedTexts.map((text, index) => (
                      <Text key={index} style={{ fontSize: 12, color: "#555", marginBottom: 2 }}>
                        {text}
                      </Text>
                    ))}
                  </View>
                )}
                <TouchableOpacity
                  onPress={() => {
                    toggleChatSheet(); // 시트 닫기
                    setIsSelecting(true); // 드래그 모드 진입
                  }}
                  style={{ alignSelf: "flex-end", marginBottom: 4 }}
                >
                  <Text style={{ color: "#BA94CC", fontSize: 12 }}>내용 불러오기</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.chatInputContainer}>
                <TextInput
                  style={styles.chatTextInput}
                  placeholder="질문하고 싶은 내용을 입력해주세요."
                  placeholderTextColor="#717171"
                  value={chatInput}
                  onChangeText={setChatInput}
                  returnKeyType="send"
                  onSubmitEditing={handleSendMessage}
                />
                <TouchableOpacity onPress={handleSendMessage} style={styles.sendButton}>
                  <Feather name="send" size={20} color="#BA94CC" />
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
          {/* 저장 버튼 */}
          {!isSheetOpen && <View style={styles.saveButtonWrapper}>
            <TouchableOpacity style={styles.saveButton} onPress={handleNoteSave}>
              <Text style={styles.saveButtonText}>노트 저장</Text>
            </TouchableOpacity>
          </View>}
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF", paddingTop: 70, paddingHorizontal: 20 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 0.7,
    borderColor: "#B493C3",
    paddingBottom: 10,
    marginBottom: 15,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: "600",
    color: "#3C3C3C",
    padding: 0,
    marginLeft: 10,
    marginRight: 10,
    borderBottomWidth: 1,
    borderColor: "#CCC",
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: "#FAF8FD",
    borderWidth: 0.7,
    borderColor: "#B493C3",
    borderRadius: 7,
    paddingVertical: 15,
    marginBottom: 25,
    position: "relative",
  },
  contentInput: {
    fontSize: 16,
    color: "#2F2F2F",
    lineHeight: 22,
    minHeight: 660,
    zIndex: 1,
    padding: 0,
    margin: 0,
    textAlignVertical: "top",
    paddingLeft: 15,
    paddingRight: 15,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 85,
    right: -5,
    zIndex: 10,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  floatingButtonImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  chatSheet: {
    position: 'absolute',
    left: -19,
    right: -19,
    bottom: 0,
    height: screenHeight - 20,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  chatSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 5,
  },
  chatbotTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    padding: 5,
  },
  contentContainerChatbot: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 50,
  },
  chatMessagesContainer: {
    flex: 1,
    paddingVertical: 10,
  },
  chatMessageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  userMessageRow: { justifyContent: 'flex-end' },
  botMessageRow: { justifyContent: 'flex-start' },
  chatsuAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
    backgroundColor: '#eee',
  },
  chatBubble: {
    padding: 10,
    borderRadius: 15,
    maxWidth: '80%',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  userBubble: { backgroundColor: '#E6E6FA' },
  botBubble: { backgroundColor: '#F5F5F5' },
  userText: { color: '#3C3C3C' },
  botText: { color: '#3C3C3C' },
  loadingDotsContainer: {
    fontSize: 20,
    lineHeight: 15,
    padding: 10,
    fontWeight: 'bold',
    color: '#3C3C3C',
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  dot: {
    fontSize: 25,
    width: 10,
    textAlign: 'center',
  },
  chatInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
  },
  chatTextInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    marginRight: 10,
    backgroundColor: '#f9f9f9',
    fontSize: 16,
  },
  sendButton: {
    padding: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    borderRadius: 15,
    backgroundColor: '#E6D6F3', // 연한 보라색
    paddingVertical: 12,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
    marginBottom: 25,
    width: '100%',
  },
  saveButtonText: {
    color: '#3C3C3C',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
