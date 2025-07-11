import { StyleSheet, Text, View } from "react-native";

export default function MypageScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>마이페이지 화면입니다 👤</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: { fontSize: 20, fontWeight: "bold" },
});
