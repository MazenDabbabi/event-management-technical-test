import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { useAuth } from "@/context/AuthContext";
import API from "@/services/api";

type EventItem = {
  id: number;
  title: string;
  description: string | null;
  date: string;
};

export default function EventsScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { width } = useWindowDimensions();
  const { registeredId, status } = useLocalSearchParams<{
    registeredId?: string;
    status?: string;
  }>();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cardWidth = width > 900 ? "48%" : "100%";

  const loadEvents = useCallback(async () => {
    try {
      setError(null);
      const res = await API.get<EventItem[]>("/events");
      setEvents(res.data ?? []);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Impossible de charger les evenements.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const onRefresh = () => {
    setRefreshing(true);
    loadEvents();
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Decouvre les evenements</Text>
        <Text style={styles.heroSubtitle}>Reserve en un clic depuis ton mobile.</Text>
      </View>

      <View style={styles.toolbar}>
        <Pressable style={styles.authBtn} onPress={() => router.push("/auth")}>
          <Text style={styles.authBtnText}>{user ? user.email : "Se connecter"}</Text>
        </Pressable>

        {user ? (
          <Pressable style={styles.logoutBtn} onPress={logout}>
            <Text style={styles.logoutBtnText}>Deconnexion</Text>
          </Pressable>
        ) : null}
      </View>

      {registeredId ? (
        <View style={styles.successBanner}>
          <Text style={styles.successBannerText}>
            {status === "already"
              ? "Vous etes deja inscrit a cet evenement."
              : "Inscription validee pour cet evenement."}
          </Text>
        </View>
      ) : null}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <FlatList
        data={events}
        numColumns={width > 900 ? 2 : 1}
        key={width > 900 ? "grid" : "list"}
        keyExtractor={(item) => String(item.id)}
        columnWrapperStyle={width > 900 ? styles.row : undefined}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.card, { width: cardWidth }]}
            onPress={() => router.push({ pathname: "/event/[id]", params: { id: item.id } })}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              {registeredId && String(item.id) === String(registeredId) ? (
                <Text style={styles.registeredBadge}>Inscrit</Text>
              ) : null}
            </View>
            <Text numberOfLines={2} style={styles.cardDescription}>
              {item.description || "Aucune description."}
            </Text>
            <Text style={styles.cardDate}>{new Date(item.date).toLocaleDateString()}</Text>
          </Pressable>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Aucun evenement disponible.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6fbff",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f6fbff",
  },
  hero: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 10,
  },
  heroTitle: {
    color: "#102a43",
    fontSize: 28,
    fontWeight: "800",
  },
  heroSubtitle: {
    color: "#486581",
    marginTop: 4,
    fontSize: 15,
  },
  toolbar: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 18,
    marginBottom: 6,
  },
  authBtn: {
    backgroundColor: "#0ea5e9",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  authBtnText: {
    color: "#fff",
    fontWeight: "700",
  },
  logoutBtn: {
    backgroundColor: "#e2e8f0",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  logoutBtnText: {
    color: "#1e293b",
    fontWeight: "700",
  },
  errorText: {
    color: "#b91c1c",
    paddingHorizontal: 18,
    marginBottom: 8,
  },
  successBanner: {
    marginHorizontal: 18,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#dcfce7",
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  successBannerText: {
    color: "#166534",
    fontWeight: "600",
    fontSize: 13,
  },
  listContent: {
    paddingHorizontal: 18,
    paddingBottom: 18,
    gap: 10,
  },
  row: {
    justifyContent: "space-between",
    gap: 10,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#dbeafe",
    shadowColor: "#075985",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 14,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  registeredBadge: {
    backgroundColor: "#dcfce7",
    color: "#166534",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    fontSize: 12,
    fontWeight: "700",
  },
  cardDescription: {
    color: "#475569",
    marginBottom: 10,
  },
  cardDate: {
    color: "#0369a1",
    fontWeight: "600",
  },
  emptyText: {
    textAlign: "center",
    color: "#64748b",
    marginTop: 18,
  },
});
