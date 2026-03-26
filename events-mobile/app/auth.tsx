import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";

import { useAuth } from "@/context/AuthContext";

export default function AuthScreen() {
  const router = useRouter();
  const { login, signup } = useAuth();

  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      Alert.alert("Champs requis", "Email et mot de passe sont obligatoires.");
      return;
    }

    setSubmitting(true);
    try {
      if (isSignup) {
        await signup(normalizedEmail, password);
      } else {
        await login(normalizedEmail, password);
      }
      router.replace("/events");
    } catch (error: any) {
      const message = error?.response?.data?.error || "Action impossible pour le moment.";
      Alert.alert("Erreur", message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <View style={styles.card}>
        <Text style={styles.title}>{isSignup ? "Creer un compte" : "Se connecter"}</Text>
        <Text style={styles.subtitle}>Accede aux evenements et reserve ta place.</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Mot de passe"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <Pressable style={[styles.button, submitting && styles.buttonDisabled]} onPress={onSubmit}>
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>{isSignup ? "S'inscrire" : "Connexion"}</Text>
          )}
        </Pressable>

        <Pressable onPress={() => setIsSignup((prev) => !prev)}>
          <Text style={styles.switchText}>
            {isSignup ? "Deja un compte ? Se connecter" : "Pas de compte ? S'inscrire"}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#eef7ff",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    gap: 12,
    shadowColor: "#023047",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#102a43",
  },
  subtitle: {
    color: "#486581",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    backgroundColor: "#f8fafc",
  },
  button: {
    backgroundColor: "#0ea5e9",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    marginTop: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  switchText: {
    marginTop: 6,
    color: "#0369a1",
    fontWeight: "600",
    textAlign: "center",
  },
});
