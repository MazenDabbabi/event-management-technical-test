import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { useAuth } from "@/context/AuthContext";
import API from "@/services/api";

type EventDetails = {
  id: number;
  title: string;
  description: string | null;
  date: string;
};

export default function EventDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { token, user } = useAuth();

  const [event, setEvent] = useState<EventDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    const loadEvent = async () => {
      try {
        const response = await API.get<EventDetails>(`/events/${id}`);
        setEvent(response.data);
      } catch {
        setEvent(null);
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [id]);

  const handleRegister = async () => {
    if (!token || !user) {
      router.push("/auth");
      return;
    }

    setRegistering(true);
    try {
      await API.post(`/events/${id}/register`, { userId: user.id });
      Alert.alert("Inscription validee", "Tu es inscrit a cet evenement.", [
        {
          text: "OK",
          onPress: () =>
            router.replace({
              pathname: "/events",
              params: { registeredId: String(id) },
            }),
        },
      ]);
    } catch (error: any) {
      const message = error?.response?.data?.error || "Inscription impossible.";
      Alert.alert("Erreur", message);
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.centered}>
        <Text style={styles.notFound}>Evenement introuvable.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.banner}>
        <Text style={styles.title}>{event.title}</Text>
        <Text style={styles.date}>{new Date(event.date).toLocaleString()}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{event.description || "Aucune description."}</Text>
      </View>

      <Pressable style={styles.cta} onPress={handleRegister} disabled={registering}>
        <Text style={styles.ctaText}>{registering ? "Inscription..." : "S'inscrire a l'evenement"}</Text>
      </Pressable>

      <Text style={styles.meta}>{user ? `Connecte en tant que ${user.email}` : "Connecte-toi pour t'inscrire."}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 18,
    backgroundColor: "#f6fbff",
    flexGrow: 1,
    gap: 14,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f6fbff",
  },
  notFound: {
    fontSize: 16,
    color: "#64748b",
  },
  banner: {
    backgroundColor: "#e0f2fe",
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#bae6fd",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#082f49",
  },
  date: {
    marginTop: 6,
    color: "#075985",
    fontWeight: "600",
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  sectionTitle: {
    fontWeight: "700",
    fontSize: 16,
    color: "#0f172a",
    marginBottom: 8,
  },
  description: {
    color: "#334155",
    lineHeight: 22,
  },
  cta: {
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: "#0ea5e9",
    alignItems: "center",
    justifyContent: "center",
  },
  ctaText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
  meta: {
    textAlign: "center",
    color: "#475569",
  },
});
