import { View, TextInput, Button, Alert } from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import { useState, useContext } from "react";
import { Redirect, useRouter } from "expo-router";
import { AuthContext } from "../../context/AuthContext";
import { Header } from "../../components/Header";

export default function Signup() {
    const { user } = useContext(AuthContext);
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    if (user) {
        return <Redirect href="/(tabs)" />;
    }

    const signup = async () => {
        if (!email.trim() || !email.includes("@")) {
            Alert.alert("Error", "Enter a valid email");
            return;
        }
        if (!password) {
            Alert.alert("Error", "Enter a password");
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match");
            return;
        }
        if (password.length < 6) {
            Alert.alert("Error", "Password must be at least 6 characters");
            return;
        }

        try {
            await createUserWithEmailAndPassword(auth, email.trim(), password);
        } catch (error: any) {
            Alert.alert("Signup failed", error.message);
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
                style={{ borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 8 }}
            />
            <TextInput
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                style={{ borderWidth: 1, padding: 10, marginBottom: 20, borderRadius: 8 }}
            />
            <Button title="Create Account" onPress={signup} />
            <View style={{ marginTop: 16 }}>
                <Button title="Already have an account? Log in" onPress={() => router.push("/(auth)/login")} />
            </View>
            </View>
        </View>
    );
}
