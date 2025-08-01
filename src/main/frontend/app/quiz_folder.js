import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function QuizFolder() {
  const router = useRouter();

  const folderName = "폴더1";

  const items = [
    { type: "quiz", id: "quiz1", title: "문제지1" },
    { type: "quiz", id: "quiz2", title: "문제지2" },
    { type: "folder", id: "folder2", name: "폴더2" },
  ];

  const renderItem = ({ item }) => {
    if (item.type === "quiz") {
      return (
        <TouchableOpacity
          onPress={() => router.push({ pathname: "/createdquiz", params: { quizId: item.id } })}
        >
          <View style={styles.noteCard}>
            <Feather name="file" size={20} color="#A18CD1" />
            <Text style={styles.noteText}>{item.title}</Text>
          </View>
        </TouchableOpacity>
      );
    } else if (item.type === "folder") {
      return (
        <TouchableOpacity
          onPress={() => router.push({ pathname: "/quiz_folder", params: { folderId: item.id } })}
        >
          <View style={styles.subFolderCard}>
            <Feather name="folder" size={20} color="#A18CD1" />
            <Text style={styles.noteText}>{item.name}</Text>
          </View>
        </TouchableOpacity>
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 40, marginTop: 15 }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="black" />
        </TouchableOpacity>
        <Text style={[styles.title, { marginLeft: 10 }]}>{folderName}</Text>
      </View>

      <View style={styles.folderCard}>
        <Feather name="folder" size={20} color="#A18CD1" />
        <Text style={styles.folderTitle}>{folderName}</Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
    </View>
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
  subFolderCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderColor: "#EEE6FA",
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 10,
    marginLeft: 15,
  },
  folderTitle: {
    fontSize: 16,
    marginLeft: 8,
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
});