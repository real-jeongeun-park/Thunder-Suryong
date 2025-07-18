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
  const {
    folderName,
    openAddNote,
    updatedNoteTitle,
    updatedNoteContent,
    originalNoteId,
  } = useLocalSearchParams();
  const router = useRouter();

  const [notes, setNotes] = useState([]);
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [newNoteName, setNewNoteName] = useState("");

  useEffect(() => {
    if (openAddNote === "true") {
      setIsCreatingNote(true);
    }
  }, [openAddNote]);

  useEffect(() => {
    if (
      originalNoteId &&
      updatedNoteTitle !== undefined &&
      updatedNoteContent !== undefined
    ) {
      setNotes((prevNotes) =>
        prevNotes.map((note) =>
          note.id === originalNoteId
            ? { ...note, title: updatedNoteTitle, content: updatedNoteContent }
            : note
        )
      );
    }
  }, [updatedNoteTitle, updatedNoteContent, originalNoteId]);

  const handleAddNote = () => {
    if (newNoteName.trim()) {
      const newId = Date.now().toString();
      const newNote = {
        id: newId,
        title: newNoteName.trim(),
        content: "",
      };
      setNotes((prevNotes) => [...prevNotes, newNote]);

      router.push({
        pathname: "/writenote",
        params: {
          initialNoteTitle: newNote.title,
          initialNoteContent: newNote.content,
          noteId: newNote.id,
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
        {/* 뒤로가기 버튼 + 폴더명 */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 40,
            marginTop: 15,
          }}
        >
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="arrow-left" size={24} color="black" />
          </TouchableOpacity>
          <Text style={[styles.title, { marginLeft: 10 }]}>{folderName}</Text>
        </View>

        <View style={styles.folderCard}>
          <Feather name="folder" size={20} color="#A18CD1" />
          <Text style={styles.folderTitle}>{folderName}</Text>
          <Text style={styles.noteCount}>{`( ${notes.length} )`}</Text>
        </View>

        <FlatList
          data={notes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/writenote",
                  params: {
                    initialNoteTitle: item.title,
                    initialNoteContent: item.content,
                    noteId: item.id,
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
                  placeholder="노트명을 입력해주세요."
                  placeholderTextColor="#717171"
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
