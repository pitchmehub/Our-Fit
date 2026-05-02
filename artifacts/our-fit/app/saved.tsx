import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useUser } from "@clerk/expo";
import { useFit, Outfit } from "@/contexts/FitContext";
import { getLikedOutfits } from "@/lib/api";
import OutfitCard from "@/components/OutfitCard";

export default function SavedScreen() {
  const insets = useSafeAreaInsets();
  const { setSelectedOutfit, likedIds, toggleLike } = useFit();
  const { user } = useUser();
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadSaved = useCallback(async () => {
    if (!user?.id) return;
    try {
      const saved = await getLikedOutfits(user.id);
      setOutfits(saved);
    } catch {
      setOutfits([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => { loadSaved(); }, [loadSaved]);

  const handleOutfitPress = (outfit: Outfit) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedOutfit(outfit);
    router.push("/outfit-detail");
  };

  const handleLike = useCallback(
    (outfit: Outfit) => {
      if (user?.id) {
        toggleLike(outfit, user.id);
        setOutfits((prev) => prev.filter((o) => o.id !== outfit.id));
      }
    },
    [user, toggleLike]
  );

  const topPadding = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const bottomPadding = Platform.OS === "web" ? Math.max(insets.bottom, 34) : insets.bottom;

  return (
    <View style={[styles.container, { paddingBottom: bottomPadding }]}>
      <View style={[styles.header, { paddingTop: topPadding }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Feather name="arrow-left" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerLogo}>OUR FIT</Text>
          <Text style={styles.headerSub}>looks salvos</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.emptyContainer}>
          <View style={styles.loadingRing} />
          <Text style={styles.emptyText}>Carregando salvos...</Text>
        </View>
      ) : outfits.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="heart" size={48} color="#222222" />
          <Text style={styles.emptyTitle}>Nenhum look salvo</Text>
          <Text style={styles.emptyText}>
            Toque no coração em qualquer look para salvar aqui.
          </Text>
          <TouchableOpacity style={styles.cameraBtn} onPress={() => router.replace("/")} activeOpacity={0.85}>
            <Feather name="camera" size={16} color="#0A0A0A" />
            <Text style={styles.cameraBtnText}>Descobrir looks</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); loadSaved(); }}
              tintColor="#E8FF00"
            />
          }
        >
          <Text style={styles.count}>{outfits.length} {outfits.length === 1 ? "look salvo" : "looks salvos"}</Text>
          <View style={styles.row}>
            {outfits.map((outfit, i) => (
              <OutfitCard
                key={outfit.id + i}
                outfit={outfit}
                onPress={handleOutfitPress}
                onLike={handleLike}
                isLiked={likedIds.has(outfit.id)}
              />
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A0A" },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: "#1E1E1E",
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "#1A1A1A", alignItems: "center", justifyContent: "center",
  },
  headerCenter: { alignItems: "center" },
  headerLogo: { color: "#E8FF00", fontSize: 18, fontFamily: "Inter_700Bold", letterSpacing: 5 },
  headerSub: { color: "#888888", fontSize: 11, fontFamily: "Inter_400Regular", letterSpacing: 0.5, marginTop: 2 },
  emptyContainer: {
    flex: 1, alignItems: "center", justifyContent: "center", gap: 16, padding: 32,
  },
  loadingRing: {
    width: 48, height: 48, borderRadius: 24,
    borderWidth: 2, borderColor: "#E8FF00", borderTopColor: "transparent",
  },
  emptyTitle: { color: "#FFFFFF", fontSize: 20, fontFamily: "Inter_600SemiBold" },
  emptyText: {
    color: "#555555", fontSize: 14, fontFamily: "Inter_400Regular",
    textAlign: "center", lineHeight: 22,
  },
  cameraBtn: {
    backgroundColor: "#E8FF00", flexDirection: "row", alignItems: "center",
    gap: 8, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14, marginTop: 8,
  },
  cameraBtnText: { color: "#0A0A0A", fontSize: 15, fontFamily: "Inter_600SemiBold" },
  grid: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  count: {
    color: "#555555", fontSize: 12, fontFamily: "Inter_400Regular",
    marginBottom: 16, letterSpacing: 0.5,
  },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "space-between" },
});
