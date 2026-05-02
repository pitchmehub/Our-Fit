import React, { useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Image,
  Dimensions,
  Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useUser } from "@clerk/expo";
import { useFit, Outfit } from "@/contexts/FitContext";

const { width, height } = Dimensions.get("window");
const IMAGE_HEIGHT = height * 0.58;

export default function OutfitDetailScreen() {
  const insets = useSafeAreaInsets();
  const {
    selectedOutfit,
    setSelectedOutfit,
    currentOutfits,
    likedIds,
    toggleLike,
  } = useFit();
  const { user } = useUser();
  const likeScale = React.useRef(new Animated.Value(1)).current;

  const outfit = selectedOutfit;
  if (!outfit) {
    router.back();
    return null;
  }

  const isLiked = likedIds.has(outfit.id);
  const others = currentOutfits.filter((o) => o.id !== outfit.id && o.image);

  const handleLike = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.sequence([
      Animated.timing(likeScale, { toValue: 1.4, duration: 120, useNativeDriver: true }),
      Animated.timing(likeScale, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
    if (user?.id) toggleLike(outfit, user.id);
  };

  const handleExplore = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    router.push("/explore");
  };

  const handleOtherPress = (other: Outfit) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedOutfit(other);
  };

  const topPadding = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const bottomPadding = Platform.OS === "web" ? Math.max(insets.bottom, 34) : insets.bottom;

  return (
    <View style={[styles.container, { paddingBottom: bottomPadding }]}>
      {/* Big image */}
      <View style={[styles.imageContainer, { height: IMAGE_HEIGHT }]}>
        {outfit.image ? (
          <Image
            source={{ uri: `data:image/png;base64,${outfit.image}` }}
            style={styles.fullImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Feather name="image" size={40} color="#333" />
          </View>
        )}
        <LinearGradient
          colors={["rgba(10,10,10,0.5)", "transparent", "rgba(10,10,10,0.9)"]}
          style={StyleSheet.absoluteFill}
        />

        {/* Top bar */}
        <View style={[styles.topBar, { paddingTop: topPadding + 8 }]}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()} activeOpacity={0.8}>
            <Feather name="arrow-left" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={handleLike} activeOpacity={0.8}>
            <Animated.View style={{ transform: [{ scale: likeScale }] }}>
              <Feather name="heart" size={20} color={isLiked ? "#FF4B6E" : "#FFFFFF"} />
            </Animated.View>
          </TouchableOpacity>
        </View>

        {/* Title overlay */}
        <View style={styles.titleOverlay}>
          <Text style={styles.outfitTitle}>{outfit.title}</Text>
          <View style={styles.tagsRow}>
            {outfit.tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        {/* Style description */}
        <View style={styles.section}>
          <Text style={styles.styleText}>{outfit.style}</Text>
        </View>

        {/* Items list */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>PEÇAS DO LOOK</Text>
          {outfit.items.map((item, i) => (
            <View key={i} style={styles.itemRow}>
              <View style={[styles.itemDot, i === 0 && styles.itemDotMain]} />
              <Text style={[styles.itemText, i === 0 && styles.itemTextMain]}>{item}</Text>
              {i === 0 && <View style={styles.mainBadge}><Text style={styles.mainBadgeText}>BASE</Text></View>}
            </View>
          ))}
        </View>

        {/* Explore button */}
        <TouchableOpacity style={styles.exploreBtn} onPress={handleExplore} activeOpacity={0.85}>
          <Text style={styles.exploreBtnText}>Ver mais looks como este</Text>
          <Feather name="arrow-right" size={16} color="#0A0A0A" />
        </TouchableOpacity>

        {/* Other looks */}
        {others.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>OUTROS LOOKS</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.othersScroll}>
              {others.map((other) => (
                <TouchableOpacity
                  key={other.id}
                  style={styles.otherCard}
                  onPress={() => handleOtherPress(other)}
                  activeOpacity={0.8}
                >
                  <Image
                    source={{ uri: `data:image/png;base64,${other.image}` }}
                    style={styles.otherImage}
                    resizeMode="cover"
                  />
                  <LinearGradient
                    colors={["transparent", "rgba(0,0,0,0.85)"]}
                    style={styles.otherGradient}
                  >
                    <Text style={styles.otherTitle} numberOfLines={2}>{other.title}</Text>
                  </LinearGradient>
                  {likedIds.has(other.id) && (
                    <View style={styles.otherHeart}>
                      <Feather name="heart" size={12} color="#FF4B6E" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A0A" },
  imageContainer: { width, position: "relative" },
  fullImage: { width: "100%", height: "100%" },
  imagePlaceholder: {
    width: "100%", height: "100%", backgroundColor: "#111",
    alignItems: "center", justifyContent: "center",
  },
  topBar: {
    position: "absolute", top: 0, left: 0, right: 0,
    flexDirection: "row", justifyContent: "space-between",
    paddingHorizontal: 20, paddingBottom: 12,
  },
  iconBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center",
  },
  titleOverlay: {
    position: "absolute", bottom: 20, left: 20, right: 20, gap: 8,
  },
  outfitTitle: { color: "#FFFFFF", fontSize: 28, fontFamily: "Inter_700Bold", lineHeight: 34 },
  tagsRow: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  tag: { backgroundColor: "rgba(232,255,0,0.2)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  tagText: { color: "#E8FF00", fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 0.5 },
  scroll: { flex: 1 },
  section: { paddingHorizontal: 20, paddingTop: 20, gap: 12 },
  sectionLabel: {
    color: "#555555", fontSize: 11, fontFamily: "Inter_600SemiBold",
    letterSpacing: 2, textTransform: "uppercase", marginBottom: 4,
  },
  styleText: { color: "#BBBBBB", fontSize: 15, fontFamily: "Inter_400Regular", lineHeight: 24 },
  itemRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  itemDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#333333" },
  itemDotMain: { backgroundColor: "#E8FF00", width: 8, height: 8, borderRadius: 4 },
  itemText: { color: "#888888", fontSize: 14, fontFamily: "Inter_400Regular", flex: 1 },
  itemTextMain: { color: "#FFFFFF", fontFamily: "Inter_500Medium" },
  mainBadge: {
    backgroundColor: "rgba(232,255,0,0.15)", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
  },
  mainBadgeText: { color: "#E8FF00", fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 1 },
  exploreBtn: {
    margin: 20, backgroundColor: "#E8FF00", paddingVertical: 16, borderRadius: 16,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
  },
  exploreBtnText: { color: "#0A0A0A", fontSize: 15, fontFamily: "Inter_700Bold", letterSpacing: 0.3 },
  othersScroll: { paddingLeft: 20 },
  otherCard: { width: 120, height: 160, borderRadius: 12, overflow: "hidden", marginRight: 10, backgroundColor: "#111" },
  otherImage: { width: "100%", height: "100%" },
  otherGradient: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 8, paddingTop: 24 },
  otherTitle: { color: "#FFFFFF", fontSize: 11, fontFamily: "Inter_500Medium", lineHeight: 15 },
  otherHeart: {
    position: "absolute", top: 6, right: 6, backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 10, padding: 4,
  },
});
