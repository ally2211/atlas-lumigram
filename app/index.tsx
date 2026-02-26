import { Redirect } from "expo-router";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { Header } from "../components/Header";

export default function Index() {
  const { user, loading } = useContext(AuthContext);
  console.log("[Index] auth state:", { loading, user: user ? { uid: user.uid, email: user.email } : null });

  if (loading) {
    return (
      <View style={styles.loading}>
        <Header showLogout={false} />
        <View style={styles.spinner}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Redirect href="/(tabs)" />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: "#fff",
  },
  spinner: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
