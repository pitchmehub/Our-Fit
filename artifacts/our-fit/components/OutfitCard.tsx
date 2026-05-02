import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Outfit } from "@/contexts/FitContext";
import { useColors } from "@/hooks/useColors";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2;
const CARD_HEIGHT = CARD_WIDTH * 1.4;

interface Props {
  outfit: Outfit;
  onPress: (outfit: Outfit) => void;
}

export default function OutfitCard({ outfit, onPress }: Props) {
  const colors = useColors();

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card }]}
      onPress={() => onPress(outfit)}
      activeOpacity={0.85}
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
        <Text style={styles.title} numberOfLines={2}>
          {outfit.title}
        </Text>
        <View style={styles.tagsRow}>
          {outfit.tags.slice(0, 2).map((tag) => (
            <View
              key={tag}
              style={[styles.tag, { backgroundColor: "rgba(232,255,0,0.15)" }]}
            >
              <Text style={[styles.tagText, { color: "#E8FF00" }]}>
                {tag}
              </Text>
            </View>
          ))}
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
    paddingBottom: 14,
    paddingTop: 48,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 6,
    lineHeight: 19,
  },
  tagsRow: {
    flexDirection: "row",
    gap: 4,
    flexWrap: "wrap",
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.3,
  },
});
