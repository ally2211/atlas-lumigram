import { View, TextInput, Button, Alert } from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase/firebaseConfig";
import { useState, useContext } from "react";
import { Redirect, useRouter } from "expo-router";
import { AuthContext } from "../../context/AuthContext";
import { Header } from "../../components/Header";

export default function Login() {
    const { user } = useContext(AuthContext);
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    if (user) {
        return <Redirect href="/(tabs)" />;
    }

    const login = async () => {
        if (!email.trim() || !email.includes("@")) {
            Alert.alert("Error", "Enter a valid email");
            return;
        }
        if (!password) {
            Alert.alert("Error", "Enter a password");
            return;
        }

        try {
            const userCredential = await signInWithEmailAndPassword(
                auth,
                email.trim(),
                password
            );
            console.log("SUCCESS:", userCredential.user);
        } catch (error: any) {
            Alert.alert("Login failed", error.message);
            console.log(error.code);
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <Header showLogout={false} />
            <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
                <TextInput
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    style={{ borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 8 }}
                />
                <TextInput
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    style={{ borderWidth: 1, padding: 10, marginBottom: 20, borderRadius: 8 }}
                />
                <Button title="Login" onPress={login} />
                <View style={{ marginTop: 16 }}>
                    <Button title="Create Account" onPress={() => router.push("/(auth)/signup")} />
                </View>
            </View>
        </View>
    );
}
