// WriteNote.js
import { Feather } from "@expo/vector-icons";
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

const screenHeight = Dimensions.get('window').height;

export default function WriteNote() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [noteTitle, setNoteTitle] = useState(params.initialNoteTitle || "노트 제목");
  const [noteContent, setNoteContent] = useState(params.initialNoteContent || "");
  const noteId = useRef(params.noteId);

  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  const lineHeight = 22;
  const paddingHorizontal = 15;
  const paddingVertical = 15;
  const MIN_LINES = 30;

  const lines = noteContent.split("\n");
  const totalLines = Math.max(lines.length, MIN_LINES);

  const [scrollViewHeight, setScrollViewHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);

  // 챗봇 시트 관련 상태
  const initialSheetOffset = 100; // 시트가 화면 아래에서 60px 정도 보이도록
  const sheetTranslateY = useRef(new Animated.Value(screenHeight - initialSheetOffset)).current;
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  // 챗봇 메시지 관련 상태
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { type: 'bot', text: '안녕하세요! 학습한 내용에 대해 궁금한 점을 물어보세요.' },
  ]);
  const [isBotTyping, setIsBotTyping] = useState(false); // 봇 타이핑 상태 추가

  // 💡 로딩 인디케이터 점 애니메이션을 위한 Animated.Value
  const dotOpacity1 = useRef(new Animated.Value(0)).current;
  const dotOpacity2 = useRef(new Animated.Value(0)).current;
  const dotOpacity3 = useRef(new Animated.Value(0)).current;

  // 키보드 가시성 감지 useEffect
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  // 💡 로딩 인디케이터 점 애니메이션 useEffect
  useEffect(() => {
    if (isBotTyping) {
      const animateDots = () => {
        Animated.sequence([
          Animated.timing(dotOpacity1, { toValue: 1, duration: 200, useNativeDriver: true }),
          Animated.timing(dotOpacity2, { toValue: 1, duration: 200, useNativeDriver: true }),
          Animated.timing(dotOpacity3, { toValue: 1, duration: 200, useNativeDriver: true }),
          Animated.delay(400), // 잠시 대기
          Animated.timing(dotOpacity3, { toValue: 0, duration: 200, useNativeDriver: true }),
          Animated.timing(dotOpacity2, { toValue: 0, duration: 200, useNativeDriver: true }),
          Animated.timing(dotOpacity1, { toValue: 0, duration: 200, useNativeDriver: true }),
        ]).start(() => {
          if (isBotTyping) { // 애니메이션이 끝난 후에도 타이핑 중이면 다시 시작
            animateDots();
          } else { // 타이핑이 끝났으면 opacity 초기화
            dotOpacity1.setValue(0);
            dotOpacity2.setValue(0);
            dotOpacity3.setValue(0);
          }
        });
      };
      animateDots();
    } else {
        // 봇 타이핑이 끝나면 모든 점의 투명도를 초기화
        dotOpacity1.setValue(0);
        dotOpacity2.setValue(0);
        dotOpacity3.setValue(0);
    }
  }, [isBotTyping]); // isBotTyping 상태가 변경될 때마다 실행

  // selection 변경 처리 최적화 및 자동 스크롤
  const onSelectionChange = (event) => {
    const { start, end } = event.nativeEvent.selection;
    if (selection.start === start && selection.end === end) return;
    setSelection({ start, end });

    const cursorLine = noteContent.slice(0, start).split("\n").length;
    const cursorY = (cursorLine - 1) * lineHeight + paddingVertical;

    if (
      scrollViewHeight > 0 &&
      contentHeight > scrollViewHeight &&
      cursorY > scrollViewHeight - lineHeight * 2
    ) {
      scrollRef.current?.scrollTo({
        y: cursorY - scrollViewHeight + lineHeight * 2,
        animated: true,
      });
    }
  };

  // 노트 작성 화면 벗어날 때 현재 상태를 router로 넘김
  useEffect(() => {
    return () => {
      if (noteId.current) {
        router.setParams({
          updatedNoteTitle: noteTitle,
          updatedNoteContent: noteContent,
          originalNoteId: noteId.current,
        });
      }
    };
  }, [noteTitle, noteContent]);

  // 스크롤 시작 시 호출되는 함수
  const handleScrollBeginDrag = () => {
    setIsScrolling(true);
    Keyboard.dismiss(); // 스크롤 시작 시 키보드 닫기
  };

  // 스크롤 종료 시 호출되는 함수
  const handleScrollEnd = () => {
    setIsScrolling(false);
  };

  // 챗봇 시트 토글 핸들러
  const toggleChatSheet = useCallback(() => {
    Keyboard.dismiss();

    if (isSheetOpen) {
      // 시트 닫기: 처음에 살짝 보이는 위치로 돌아갑니다.
      Animated.timing(sheetTranslateY, {
        toValue: screenHeight - initialSheetOffset,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setIsSheetOpen(false));
    } else {
      // 시트 열기: 화면 상단에서 30px 아래로 시트가 나타나도록 합니다.
      Animated.timing(sheetTranslateY, {
        toValue: 30,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setIsSheetOpen(true));
    }
  }, [isSheetOpen, sheetTranslateY]);

  // 챗봇 메시지 전송 핸들러
  const handleSendMessage = () => {
    if (chatInput.trim()) {
      setChatMessages((prevMessages) => [...prevMessages, { type: 'user', text: chatInput.trim() }]);
      setChatInput('');

      // 봇 타이핑 시작
      setIsBotTyping(true);

      // 챗봇 응답 시뮬레이션 (실제로는 여기에 API 호출 등 챗봇 로직 구현)
      setTimeout(() => {
        setIsBotTyping(false); // 봇 타이핑 종료
        setChatMessages((prevMessages) => [
          ...prevMessages,
          { type: 'bot', text: ` 질문하신 내용에 대해 알려드릴게요!\n(gpt 답변 내용).` },
        ]);
      }, 2000); // 2초 후 챗봇 응답
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          {/* 제목 입력 영역 */}
          <View style={styles.header}>
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

          {/* 본문 입력 영역 (스크롤 가능) */}
          <ScrollView
            ref={scrollRef}
            style={styles.contentContainer}
            onContentSizeChange={(w, h) => setContentHeight(h)}
            onLayout={(e) => setScrollViewHeight(e.nativeEvent.layout.height)}
            keyboardShouldPersistTaps="never"
            showsVerticalScrollIndicator={true}
            onScrollBeginDrag={handleScrollBeginDrag}
            onMomentumScrollEnd={handleScrollEnd}
            onScrollEndDrag={handleScrollEnd}
          >
            <TextInput
              ref={inputRef}
              style={[
                styles.contentInput,
                { minHeight: totalLines * lineHeight },
              ]}
              multiline
              placeholder="노트 내용을 입력하세요."
              placeholderTextColor="#555555"
              value={noteContent}
              onChangeText={setNoteContent}
              onSelectionChange={onSelectionChange}
              scrollEnabled={false}
              textAlignVertical="top"
              selection={selection}
              spellCheck={false}
              autoCorrect={false}
              autoFocus={false}
              pointerEvents={isScrolling ? "none" : "auto"}
            />
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>

      {/* 💡 챗봇 Animated.View (시트) */}
      <Animated.View style={[
        styles.chatSheet,
        {
          transform: [{ translateY: sheetTranslateY }], // translateY로 위치 제어
          height: screenHeight - 20, // 화면 상단 20px 여유, 하단 꽉 채움
        }
      ]}>
        {/* 시트 상단 영역: 핸들바, 제목, 닫기 버튼 */}
        <View style={styles.chatSheetHeader}>
          {/* 시트를 탭해서 올리고 내릴 수 있도록 TouchableOpacity로 감쌉니다. */}
          <TouchableOpacity onPress={toggleChatSheet} style={styles.handleBarTouchArea}>
              <View style={styles.handleBar} />
          </TouchableOpacity>
          <Text style={styles.chatbotTitle}>AI 수룡이 챗봇</Text>
          <TouchableOpacity onPress={toggleChatSheet} style={styles.closeButton}>
            <Feather name="x" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* 💡 툴팁 (시트 닫힘 상태일 때만 보이는 아이콘) */}
        {!isSheetOpen && (
            <TouchableOpacity
                onPress={toggleChatSheet}
                style={styles.minimizedChatIcon}
            >
                <Feather name="message-square" size={24} color="#fff" />
            </TouchableOpacity>
        )}

        <View style={styles.contentContainerChatbot}>
          {/* 챗봇 메시지 표시 영역 */}
          <ScrollView style={styles.chatMessagesContainer} contentContainerStyle={{paddingBottom: 10}}>
            {chatMessages.map((msg, index) => (
              <View key={index} style={[
                styles.chatMessageRow,
                msg.type === 'user' ? styles.userMessageRow : styles.botMessageRow
              ]}>
                {msg.type === 'bot' && (
                  <Image source={require("../assets/images/chatsu.png")} style={styles.chatsuAvatar} />
                )}
                <View style={[
                  styles.chatBubble,
                  msg.type === 'user' ? styles.userBubble : styles.botBubble
                ]}>
                  <Text style={msg.type === 'user' ? styles.userText : styles.botText}>
                    {msg.text}
                  </Text>
                </View>
              </View>
            ))}
            {/* 로딩 인디케이터 */}
            {isBotTyping && (
                <View style={[styles.chatMessageRow, styles.botMessageRow]}>
                    <Image source={require("../assets/images/chatsu.png")} style={styles.chatsuAvatar} />
                    <View style={styles.botBubble}>
                        <Text style={styles.loadingDotsContainer}>
                            <Animated.Text style={[styles.dot, { opacity: dotOpacity1 }]}>.</Animated.Text>
                            <Animated.Text style={[styles.dot, { opacity: dotOpacity2 }]}>.</Animated.Text>
                            <Animated.Text style={[styles.dot, { opacity: dotOpacity3 }]}>.</Animated.Text>
                        </Text>
                    </View>
                </View>
            )}
          </ScrollView>

          {/* 챗봇 입력 필드 및 전송 버튼 */}
          <View style={styles.chatInputContainer}>
            <TextInput
              style={styles.chatTextInput}
              placeholder="질문하고 싶은 내용을 입력해주세요."
              value={chatInput}
              onChangeText={setChatInput}
              onSubmitEditing={handleSendMessage}
              returnKeyType="send"
              multiline={false}
            />
            <TouchableOpacity onPress={handleSendMessage} style={styles.sendButton}>
              <Feather name="send" size={20} color="#BA94CC" />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const lineHeight = 22;
const paddingHorizontal = 15;
const paddingVertical = 15;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: 70,
    paddingHorizontal: 20,
  },
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
    paddingVertical: paddingVertical,
    marginBottom: 25,
    position: "relative",
  },
  contentInput: {
    fontSize: 16,
    color: "#2F2F2F",
    lineHeight: lineHeight,
    minHeight: lineHeight * 30,
    zIndex: 1,
    padding: 0,
    margin: 0,
    textAlignVertical: "top",
    paddingLeft: paddingHorizontal,
    paddingRight: paddingHorizontal,
  },
  // 💡 챗봇 Animated.View (시트) 스타일
  chatSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0, // 하단에 꽉 채우도록 bottom 설정
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  chatSheetHeader: { // 핸들바, 제목, 닫기 버튼을 포함하는 상단 영역
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 5,
    position: 'relative', // 아래에 있는 '절대 위치' 요소들의 기준이 될 거야
  },
  handleBarTouchArea: { // 핸들바 영역을 터치할 수 있도록 확장
    position: 'absolute', // "여기에 딱 박아줘!" 라고 말하는 것과 같아요.
    left: '50%', // 왼쪽 끝에서부터 전체 너비의 절반만큼 와!
    marginLeft: -40, // 그리고 자기 크기의 절반만큼 다시 왼쪽으로 가서, 정확히 가운데에 와! (핸들바 너비 80의 절반)
    top: 0, // 위쪽 끝에 붙여줘
    width: 80, // 이 터치 영역의 너비는 80px
    height: 40, // 이 터치 영역의 높이는 40px
    justifyContent: 'center', // 이 영역 안에 있는 것(핸들바)을 가로로 가운데 놓아줘
    alignItems: 'center', // 이 영역 안에 있는 것(핸들바)을 세로로 가운데 놓아줘
    zIndex: 1, // 다른 것들보다 조금 더 위로 올라오게 해서 잘 보이게 해줘
  },
  handleBar: {
    width: 40,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D0D4DB',
  },
  chatbotTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
    marginTop: 15,
  },
  closeButton: {
    padding: 5,
    position: 'absolute',
    right: 15,
    top: 15,
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
  userMessageRow: {
    justifyContent: 'flex-end',
  },
  botMessageRow: {
    justifyContent: 'flex-start',
  },
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
  userBubble: {
    backgroundColor: '#E6E6FA',
  },
  botBubble: {
    backgroundColor: '#F5F5F5',
  },
  userText: {
    color: '#3C3C3C',
  },
  botText: {
    color: '#3C3C3C',
  },
  // 💡 로딩 인디케이터 스타일 (점 3개 애니메이션)
  loadingDotsContainer: { // 점 텍스트를 감싸는 컨테이너
    fontSize: 20,
    lineHeight: 20,
    fontWeight: 'bold',
    color: '#3C3C3C',
    flexDirection: 'row',
    justifyContent: 'flex-start', // 점들이 왼쪽 정렬되도록
  },
  dot: { // 각 점에 적용될 스타일
    fontSize: 20, // 점 크기 유지
    width: 10, // 각 점이 차지하는 너비
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
  // 💡 시트가 닫혀있을 때 보이는 툴팁 아이콘
  minimizedChatIcon: {
    position: 'absolute',
    top: 15, // 시트 상단으로부터의 거리 (이전 핸들바 높이 고려)
    left: 20, // 시트 왼쪽으로부터의 거리
    backgroundColor: '#A18CD1',
    borderRadius: 25,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 11, // 시트 본문 위에 보이도록
  },
});