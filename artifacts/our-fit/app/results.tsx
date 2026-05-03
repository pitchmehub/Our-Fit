import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Image,
  Animated,
  Easing,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import { useUser } from "@clerk/expo";
import { useFit, Outfit } from "@/contexts/FitContext";
import { analyzeOutfitConcepts, generateOutfitImage } from "@/lib/api";
import OutfitCard from "@/components/OutfitCard";

export default function ResultsScreen() {
  const insets = useSafeAreaInsets();
  const {
    capturedImage,
    setItemDescription,
    currentOutfits,
    setCurrentOutfits,
    updateOutfit,
    setSelectedOutfit,
    gender,
    likedIds,
    toggleLike,
  } = useFit();
  const { user } = useUser();

  const [conceptsLoaded, setConceptsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set());
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const spin = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 900,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    spin.start();
    return () => spin.stop();
  }, [spinAnim]);

  useEffect(() => {
    if (!capturedImage) {
      router.replace("/");
      return;
    }
    loadConcepts();
  }, []);

  const KEEP_AWAKE_TAG = "results-generation";

  const loadConcepts = async () => {
    if (!capturedImage) return;
    setError(null);
    setConceptsLoaded(false);
    setCurrentOutfits([]);

    await activateKeepAwakeAsync(KEEP_AWAKE_TAG);
    try {
      const { concepts, itemDescription } = await analyzeOutfitConcepts(capturedImage, gender);
      setItemDescription(itemDescription);

      const skeletons: Outfit[] = concepts.map((c) => ({
        id: c.id,
        title: c.title,
        style: c.style,
        items: c.items,
        tags: c.tags,
        image: "",
      }));
      setCurrentOutfits(skeletons);
      setConceptsLoaded(true);
      setLoadingImages(new Set(concepts.map((c) => c.id)));

      await Promise.all(
        concepts.map(async (concept) => {
          try {
            const outfit = await generateOutfitImage(concept);
            updateOutfit(outfit);
          } catch {
            // keep skeleton if image fails
          } finally {
            setLoadingImages((prev) => {
              const next = new Set(prev);
              next.delete(concept.id);
              return next;
            });
          }
        })
      );
    } catch {
      setError("Não foi possível gerar looks. Tente novamente.");
    } finally {
      deactivateKeepAwake(KEEP_AWAKE_TAG);
    }
  };

  const handleOutfitPress = (outfit: Outfit) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedOutfit(outfit);
    router.push("/outfit-detail");
  };

  const handleLike = useCallback(
    (outfit: Outfit) => {
      if (user?.id) toggleLike(outfit, user.id);
    },
    [user, toggleLike]
  );

  const topPadding = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const bottomPadding = Platform.OS === "web" ? Math.max(insets.bottom, 34) : insets.bottom;

  if (error) {
    return (
      <View style={[styles.errorContainer, { paddingTop: topPadding }]}>
        <Feather name="alert-circle" size={40} color="#FF3B30" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={loadConcepts}>
          <Text style={styles.retryText}>Tentar novamente</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const imagesLoading = loadingImages.size > 0;
  const readyCount = currentOutfits.filter((o) => o.image !== "").length;

  return (
    <View style={[styles.container, { paddingBottom: bottomPadding }]}>
      <View style={[styles.header, { paddingTop: topPadding }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Feather name="arrow-left" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerLogo}>OUR FIT</Text>
          <Text style={styles.headerSub}>
            {!conceptsLoaded
              ? "Analisando sua peça..."
              : imagesLoading
              ? `${readyCount} de 6 looks prontos`
              : "6 looks para você"}
          </Text>
        </View>
        {capturedImage ? (
          <Image
            source={{ uri: `data:image/jpeg;base64,${capturedImage}` }}
            style={styles.thumbImage}
          />
        ) : (
          <View style={styles.thumbPlaceholder} />
        )}
      </View>

      {!conceptsLoaded ? (
        <View style={styles.loadingCenter}>
          <Animated.View
            style={[
              styles.loadingRing,
              {
                transform: [
                  {
                    rotate: spinAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["0deg", "360deg"],
                    }),
                  },
                ],
              },
            ]}
          />
          <Text style={styles.loadingText}>Criando seus looks...</Text>
          <Text style={styles.loadingSub}>Isso leva alguns segundos</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.row}>
            {currentOutfits.map((outfit, i) => (
              <OutfitCard
                key={outfit.id + i}
                outfit={outfit}
                onPress={handleOutfitPress}
                onLike={handleLike}
                isLiked={likedIds.has(outfit.id)}
                loading={loadingImages.has(outfit.id)}
              />
            ))}
          </View>
          {!imagesLoading && (
            <Text style={styles.tapHint}>
              Toque em um look para ver em detalhes
            </Text>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A0A" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1E1E1E",
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "#1A1A1A", alignItems: "center", justifyContent: "center",
  },
  headerCenter: { alignItems: "center" },
  headerLogo: { color: "#E8FF00", fontSize: 18, fontFamily: "Inter_700Bold", letterSpacing: 5 },
  headerSub: { color: "#888888", fontSize: 11, fontFamily: "Inter_400Regular", letterSpacing: 0.5, marginTop: 2 },
  thumbImage: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: "#2A2A2A" },
  thumbPlaceholder: { width: 40, height: 40 },
  loadingCenter: {
    flex: 1, alignItems: "center", justifyContent: "center", gap: 16,
  },
  loadingRing: {
    width: 60, height: 60, borderRadius: 30,
    borderWidth: 2, borderColor: "#E8FF00", borderTopColor: "transparent",
  },
  loadingText: { color: "#FFFFFF", fontSize: 16, fontFamily: "Inter_500Medium" },
  loadingSub: { color: "#555555", fontSize: 13, fontFamily: "Inter_400Regular" },
  grid: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "space-between" },
  tapHint: {
    color: "#444444", fontSize: 12, fontFamily: "Inter_400Regular",
    textAlign: "center", marginTop: 24, letterSpacing: 0.3,
  },
  errorContainer: {
    flex: 1, backgroundColor: "#0A0A0A", alignItems: "center",
    justifyContent: "center", gap: 16, padding: 24,
  },
  errorText: { color: "#FFFFFF", fontSize: 16, fontFamily: "Inter_400Regular", textAlign: "center" },
  retryBtn: { backgroundColor: "#E8FF00", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, marginTop: 8 },
  retryText: { color: "#0A0A0A", fontSize: 15, fontFamily: "Inter_600SemiBold" },
  backLink: { color: "#888888", fontSize: 14, fontFamily: "Inter_400Regular", textDecorationLine: "underline" },
});
