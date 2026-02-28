import { View, Image, Pressable, StyleSheet } from "react-native";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { Ionicons } from "@expo/vector-icons";

type HeaderProps = {
  showLogout?: boolean;
};

export function Header({ showLogout = false }: HeaderProps) {
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.log("Logout error:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("@/assets/images/openBible.png")}
        style={styles.logo}
        resizeMode="contain"
      />
      {showLogout && (
        <Pressable onPress={handleLogout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={22} color="red" />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 34,
    paddingBottom: 2,
    minHeight: 80,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  logo: {
    width: 48,
    height: 48,
  },
  logoutBtn: {
    padding: 8,
  },
});
