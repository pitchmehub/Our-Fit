import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { Outfit } from "@/contexts/FitContext";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2;
const CARD_HEIGHT = CARD_WIDTH * 1.4;

interface Props {
  outfit: Outfit;
  onPress: (outfit: Outfit) => void;
  onLike?: (outfit: Outfit) => void;
  isLiked?: boolean;
  loading?: boolean;
}

export default function OutfitCard({ outfit, onPress, onLike, isLiked, loading }: Props) {
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const likeScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
          Animated.timing(shimmerAnim, { toValue: 0.3, duration: 900, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [loading]);

  const handleLike = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    Animated.sequence([
      Animated.timing(likeScale, { toValue: 1.4, duration: 120, useNativeDriver: true }),
      Animated.timing(likeScale, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
    onLike?.(outfit);
  };

  if (loading || !outfit.image) {
    return (
      <Animated.View style={[styles.card, styles.skeleton, { opacity: loading ? shimmerAnim : 1 }]}>
        <View style={styles.skeletonInner}>
          <View style={styles.skeletonIcon}>
            {!loading && <Feather name="image" size={24} color="#333" />}
          </View>
          <View style={styles.skeletonTextBlock}>
            <View style={styles.skeletonLine} />
            <View style={[styles.skeletonLine, { width: "60%" }]} />
          </View>
        </View>
        <View style={styles.skeletonBottom}>
          <Text style={styles.skeletonTitle} numberOfLines={2}>{outfit.title}</Text>
          <View style={styles.tagsRow}>
            {outfit.tags.slice(0, 2).map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      </Animated.View>
    );
  }

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(outfit)}
      activeOpacity={0.88}
    >
      <Image
        source={{ uri: `data:image/png;base64,${outfit.image}` }}
        style={styles.image}
        resizeMode="cover"
      />
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.95)"]}
        style={styles.gradient}
      >
        <Text style={styles.title} numberOfLines={2}>{outfit.title}</Text>
        <View style={styles.row}>
          <View style={styles.tagsRow}>
            {outfit.tags.slice(0, 2).map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
          {onLike && (
            <TouchableOpacity onPress={handleLike} activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Animated.View style={{ transform: [{ scale: likeScale }] }}>
                <Feather
                  name="heart"
                  size={18}
                  color={isLiked ? "#FF4B6E" : "#FFFFFF"}
                  style={isLiked ? styles.heartFilled : undefined}
                />
              </Animated.View>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
    backgroundColor: "#111111",
  },
  image: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  gradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingBottom: 12,
    paddingTop: 48,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 6,
    lineHeight: 18,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tagsRow: {
    flexDirection: "row",
    gap: 4,
    flex: 1,
    flexWrap: "wrap",
  },
  tag: {
    backgroundColor: "rgba(232,255,0,0.15)",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    color: "#E8FF00",
    letterSpacing: 0.3,
  },
  heartFilled: {
    color: "#FF4B6E",
  },
  skeleton: {
    justifyContent: "space-between",
    padding: 0,
  },
  skeletonInner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  skeletonIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#1E1E1E",
    alignItems: "center",
    justifyContent: "center",
  },
  skeletonTextBlock: {
    width: "70%",
    gap: 8,
    alignItems: "center",
  },
  skeletonLine: {
    height: 8,
    width: "100%",
    backgroundColor: "#1E1E1E",
    borderRadius: 4,
  },
  skeletonBottom: {
    padding: 12,
    paddingTop: 8,
    backgroundColor: "#0F0F0F",
    gap: 6,
  },
  skeletonTitle: {
    color: "#555555",
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    lineHeight: 17,
  },
});
