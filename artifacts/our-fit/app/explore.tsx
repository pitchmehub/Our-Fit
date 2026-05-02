import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useFit, Outfit } from "@/contexts/FitContext";
import { exploreOutfits } from "@/lib/api";
import OutfitCard from "@/components/OutfitCard";
import LoadingView from "@/components/LoadingView";

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const {
    itemDescription,
    selectedOutfit,
    setSelectedOutfit,
    currentOutfits,
    setCurrentOutfits,
    gender,
  } = useFit();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayedOutfits, setDisplayedOutfits] = useState<Outfit[]>([]);
  const [currentSelected, setCurrentSelected] = useState<Outfit | null>(null);

  useEffect(() => {
    if (!selectedOutfit) {
      router.back();
      return;
    }
    setCurrentSelected(selectedOutfit);
    loadMore(selectedOutfit);
  }, []);

  const loadMore = async (outfit: Outfit) => {
    setLoading(true);
    setError(null);
    try {
      const result = await exploreOutfits(itemDescription, outfit, gender);
      setDisplayedOutfits(result.outfits);
    } catch {
      setError("Não foi possível carregar mais looks. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleOutfitPress = (outfit: Outfit) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentSelected(outfit);
    setSelectedOutfit(outfit);
    loadMore(outfit);
  };

  const topPadding =
    Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const bottomPadding =
    Platform.OS === "web" ? Math.max(insets.bottom, 34) : insets.bottom;

  if (loading) {
    return (
      <LoadingView
        message="Explorando mais looks..."
        subtitle="Buscando referências do Pinterest"
      />
    );
  }

  if (error) {
    return (
      <View style={[styles.errorContainer, { paddingTop: topPadding }]}>
        <Feather name="alert-circle" size={40} color="#FF3B30" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryBtn}
          onPress={() => currentSelected && loadMore(currentSelected)}
        >
          <Text style={styles.retryText}>Tentar novamente</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingBottom: bottomPadding }]}>
      <View style={[styles.header, { paddingTop: topPadding }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerLogo}>OUR FIT</Text>
          {currentSelected && (
            <Text style={styles.selectedTitle} numberOfLines={1}>
              {currentSelected.title}
            </Text>
          )}
        </View>
        <View style={styles.headerRight}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>+6</Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionLabel}>Mais looks como este</Text>

        <View style={styles.row}>
          {displayedOutfits.map((outfit, i) => (
            <OutfitCard
              key={outfit.id + i}
              outfit={outfit}
              onPress={handleOutfitPress}
            />
          ))}
        </View>

        <Text style={styles.tapHint}>
          Toque em qualquer look para explorar ainda mais
        </Text>

        <TouchableOpacity
          style={styles.newSearchBtn}
          onPress={() => router.replace("/")}
          activeOpacity={0.85}
        >
          <Feather name="camera" size={16} color="#0A0A0A" />
          <Text style={styles.newSearchText}>Nova pesquisa</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0A0A",
  },
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1A1A1A",
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    alignItems: "center",
    flex: 1,
    paddingHorizontal: 8,
  },
  headerLogo: {
    color: "#E8FF00",
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    letterSpacing: 5,
  },
  selectedTitle: {
    color: "#888888",
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
    maxWidth: 180,
  },
  headerRight: {
    width: 40,
    alignItems: "flex-end",
  },
  badge: {
    backgroundColor: "#E8FF00",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    color: "#0A0A0A",
    fontSize: 12,
    fontFamily: "Inter_700Bold",
  },
  grid: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  sectionLabel: {
    color: "#888888",
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "space-between",
  },
  tapHint: {
    color: "#444444",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    marginTop: 24,
    letterSpacing: 0.3,
  },
  newSearchBtn: {
    backgroundColor: "#E8FF00",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 24,
  },
  newSearchText: {
    color: "#0A0A0A",
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.3,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: "#0A0A0A",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    padding: 24,
  },
  errorText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  retryBtn: {
    backgroundColor: "#E8FF00",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  retryText: {
    color: "#0A0A0A",
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  backLink: {
    color: "#888888",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textDecorationLine: "underline",
  },
});
