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
  Platform,
} from "react-native";

import axios from "axios";
import * as SecureStore from "expo-secure-store";

export default function NoteFolder() {
  const {
    folderId,
    openAddNote,
  } = useLocalSearchParams();
  const router = useRouter();

  const [notes, setNotes] = useState([]);
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [noteName, setNoteName] = useState("");

  const [userInfo, setUserInfo] = useState(null);
  const [folderName, setFolderName] = useState(null);

  useEffect(() => {
    async function checkLogin(){
        try{
            let token;

            if(Platform.OS === 'web'){
                token = localStorage.getItem("accessToken");
            } else{
                token = SecureStore.getItemAsync("accessToken");
            }

            if(!token) throw new Error("Token not found");
            const res = await axios.get("http://localhost:8080/api/validation", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setUserInfo(res.data.nickname);
        } catch(err){
            console.log(err);
            router.push("/");
        }
    }

    checkLogin();
  }, [])

  useEffect(() => {
    const getFolderName = async () => {
        try{
            const response = await axios.post("http://localhost:8080/api/folder/getById", {
                id: folderId,
            })
            setFolderName(response.data);
        } catch(err){
            console.log(err);
        }
    }

    const getNotes = async () => {
        try{
            const res = await axios.post("http://localhost:8080/api/note/get", { folderId });

            const mappedNotes = res.data.map(n => ({
                noteId: n.noteId,
                title: n.title
            }));

            setNotes(mappedNotes)
        } catch(err){
            console.log(err);
        }
    }

    if(userInfo !== null){
        getFolderName();
        getNotes();
    }
  }, [userInfo])

  useEffect(() => {
    if (openAddNote === "true") {
      setIsCreatingNote(true);
    }
  }, [openAddNote]);


  // 노트 저장
  const handleAddNote = async () => {
    const newNoteName = noteName.trim();
    if(newNoteName) {
      try{
        const response = await axios.post("http://localhost:8080/api/note/create", {
            folderId,
            title: newNoteName,
        });

        const newNote = {
            noteId: response.data,
            title: newNoteName,
        }

        setNotes(prev => [...prev, newNote]);

        router.push({
            pathname: "/writenote",
            params: {
                folderId: folderId,
                noteId: response.data
            },
        });
      } catch(err){
        console.log("failed to save note in database. For more: ", err);
      } finally{
        setNoteName("");
        setIsCreatingNote(false);
        Keyboard.dismiss();
      }
    };
  }

  return (
    <TouchableWithoutFeedback onPress={() => { if(Platform.OS !== 'web') Keyboard.dismiss() }}>
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
          keyExtractor={(item) => item.noteId}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/writenote",
                  params: {
                    noteId: item.noteId
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
                  value={noteName}
                  onChangeText={setNoteName}
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
