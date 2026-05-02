import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useFit, Gender } from "@/contexts/FitContext";

export default function OnboardingScreen() {
  const { gender, setGender, genderLoaded } = useFit();
  const [selected, setSelected] = useState<Gender>(null);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (genderLoaded && gender !== null) {
      router.replace("/(tabs)");
    }
  }, [genderLoaded, gender]);

  const handleSelect = (g: Gender) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelected(g);
  };

  const handleContinue = async () => {
    if (!selected) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await setGender(selected);
    router.replace("/(tabs)");
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.header}>
        <Text style={styles.logo}>OUR FIT</Text>
        <Text style={styles.step}>1 de 1</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.emoji}>✦</Text>
        <Text style={styles.title}>Personalize{"\n"}sua experiência</Text>
        <Text style={styles.subtitle}>
          Para criar looks que combinam com você, precisamos saber como prefere se vestir.
        </Text>

        <View style={styles.options}>
          <TouchableOpacity
            style={[
              styles.option,
              selected === "masculino" && styles.optionSelected,
            ]}
            onPress={() => handleSelect("masculino")}
            activeOpacity={0.8}
          >
            <Text style={styles.optionIcon}>♂</Text>
            <View style={styles.optionText}>
              <Text
                style={[
                  styles.optionTitle,
                  selected === "masculino" && styles.optionTitleSelected,
                ]}
              >
                Masculino
              </Text>
              <Text style={styles.optionDesc}>
                Hoodies, cargos, tênis, streetwear masc
              </Text>
            </View>
            <View
              style={[
                styles.radio,
                selected === "masculino" && styles.radioSelected,
              ]}
            >
              {selected === "masculino" && <View style={styles.radioDot} />}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.option,
              selected === "feminino" && styles.optionSelected,
            ]}
            onPress={() => handleSelect("feminino")}
            activeOpacity={0.8}
          >
            <Text style={styles.optionIcon}>♀</Text>
            <View style={styles.optionText}>
              <Text
                style={[
                  styles.optionTitle,
                  selected === "feminino" && styles.optionTitleSelected,
                ]}
              >
                Feminino
              </Text>
              <Text style={styles.optionDesc}>
                Tops, saias, plataformas, streetwear fem
              </Text>
            </View>
            <View
              style={[
                styles.radio,
                selected === "feminino" && styles.radioSelected,
              ]}
            >
              {selected === "feminino" && <View style={styles.radioDot} />}
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.continueBtn, !selected && styles.continueBtnDisabled]}
        onPress={handleContinue}
        disabled={!selected}
        activeOpacity={0.85}
      >
        <Text style={styles.continueText}>Começar →</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0A0A",
    paddingHorizontal: 28,
    paddingTop: 80,
    paddingBottom: 48,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 60,
  },
  logo: {
    color: "#E8FF00",
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    letterSpacing: 7,
  },
  step: {
    color: "#444444",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  content: {
    flex: 1,
    gap: 24,
  },
  emoji: {
    color: "#E8FF00",
    fontSize: 28,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 36,
    fontFamily: "Inter_700Bold",
    lineHeight: 44,
    letterSpacing: -0.5,
  },
  subtitle: {
    color: "#666666",
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 24,
  },
  options: {
    gap: 12,
    marginTop: 8,
  },
  option: {
    backgroundColor: "#111111",
    borderWidth: 1,
    borderColor: "#222222",
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  optionSelected: {
    borderColor: "#E8FF00",
    backgroundColor: "#141400",
  },
  optionIcon: {
    fontSize: 28,
    color: "#FFFFFF",
    width: 36,
    textAlign: "center",
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 3,
  },
  optionTitleSelected: {
    color: "#E8FF00",
  },
  optionDesc: {
    color: "#555555",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#333333",
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: {
    borderColor: "#E8FF00",
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#E8FF00",
  },
  continueBtn: {
    backgroundColor: "#E8FF00",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 24,
  },
  continueBtnDisabled: {
    opacity: 0.3,
  },
  continueText: {
    color: "#0A0A0A",
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
  },
});
