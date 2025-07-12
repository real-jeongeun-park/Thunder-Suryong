// NoteFolder.js
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  FlatList,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

export default function NoteFolder() {
  const { folderName, openAddNote, // 새로 전달받을 파라미터들을 여기서 가져옵니다.
    updatedNoteTitle,
    updatedNoteContent,
    originalNoteId // 노트를 식별할 고유 ID (제목 대신 사용 권장)
  } = useLocalSearchParams();
  const router = useRouter();

  // notes 상태를 객체 배열로 변경하여 제목과 내용을 함께 저장
  // 각 노트에 고유한 id를 추가하여 식별합니다 (매우 중요!).
  const [notes, setNotes] = useState([]);
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [newNoteName, setNewNoteName] = useState("");

  useEffect(() => {
    if (openAddNote === "true") {
      setIsCreatingNote(true);
    }
  }, [openAddNote]);

  useEffect(() => {
    // console.log("NoteFolder params changed:", { updatedNoteTitle, updatedNoteContent, originalNoteId });
    if (originalNoteId && updatedNoteTitle !== undefined && updatedNoteContent !== undefined) {
      setNotes((prevNotes) =>
        prevNotes.map((note) =>
          note.id === originalNoteId // 고유 ID로 노트를 찾습니다.
            ? { ...note, title: updatedNoteTitle, content: updatedNoteContent }
            : note
        )
      );
    }
  }, [updatedNoteTitle, updatedNoteContent, originalNoteId]); 

  // 노트 추가 핸들러
  const handleAddNote = () => {
    if (newNoteName.trim()) {
      const newId = Date.now().toString(); // 고유 ID 생성
      const newNote = { id: newId, title: newNoteName.trim(), content: "" }; // 초기 내용은 비어있음
      setNotes((prevNotes) => [...prevNotes, newNote]); // 기존 노트 유지하면서 새 노트 추가

      router.push({
        pathname: "/writenote",
        params: {
          initialNoteTitle: newNote.title,
          initialNoteContent: newNote.content,
          noteId: newNote.id, // 새로 생성된 노트의 ID 전달
        },
      });
    }
    setNewNoteName("");
    setIsCreatingNote(false);
    Keyboard.dismiss();
  };


  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Text style={styles.title}>{folderName}</Text>

        <View style={styles.folderCard}>
          <Feather name="folder" size={20} color="#A18CD1" />
          <Text style={styles.folderTitle}>{folderName}</Text>
          <Text style={styles.noteCount}>{`( ${notes.length} )`}</Text>
        </View>

        <FlatList
          data={notes}
          keyExtractor={(item) => item.id} // keyExtractor를 item.id로 변경
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/writenote",
                  params: {
                    initialNoteTitle: item.title,
                    initialNoteContent: item.content,
                    noteId: item.id, // 노트 ID 전달
                  },
                })
              }
            >
              <View style={styles.noteCard}>
                <Feather name="file" size={20} color="#A18CD1" />
                <Text style={styles.noteText}>{item.title}</Text>
              </View>
            </TouchableOpacity>
          )}
          ListFooterComponent={
            isCreatingNote && (
              <View style={styles.noteCard}>
                <Feather name="file" size={20} color="#A18CD1" />
                <TextInput
                  style={styles.noteText}
                  placeholder="노트명 입력"
                  value={newNoteName}
                  onChangeText={setNewNoteName}
                  autoFocus
                  onSubmitEditing={handleAddNote}
                  returnKeyType="done"
                />
              </View>
            )
          }
        />

        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() => setIsCreatingNote(true)}
        >
          <Feather name="file-plus" size={24} color="#A18CD1" />
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 60,
    paddingHorizontal: 20,
    flex: 1,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 40,
    marginTop: 15,
  },
  folderCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderColor: "#EEE6FA",
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 10,
  },
  folderTitle: {
    fontSize: 16,
    marginLeft: 8,
  },
  noteCount: {
    marginLeft: "auto",
    fontSize: 14,
    color: "#999",
  },
  noteCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F6F0FF",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    marginLeft: 15,
  },
  noteText: {
    marginLeft: 10,
    fontSize: 16,
    flex: 1,
  },
  floatingButton: {
    position: "absolute",
    bottom: 30,
    right: 20,
    width: 50,
    height: 50,
    backgroundColor: "#EFE3FF",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
});