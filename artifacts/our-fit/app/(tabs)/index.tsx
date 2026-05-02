import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
  Image,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useAuth, useUser } from "@clerk/expo";
import { useFit } from "@/contexts/FitContext";

export default function CameraScreen() {
  const insets = useSafeAreaInsets();
  const { setCapturedImage, gender, setGender } = useFit();
  const { signOut } = useAuth();
  const { user } = useUser();
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePickImage = async (source: "camera" | "gallery") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (source === "camera") {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permissão necessária",
          "Precisamos acessar sua câmera para fotografar sua peça."
        );
        return;
      }
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permissão necessária",
          "Precisamos acessar sua galeria para selecionar uma foto."
        );
        return;
      }
    }

    const result =
      source === "camera"
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ["images"],
            quality: 0.5,
            base64: true,
            allowsEditing: true,
            aspect: [1, 1],
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            quality: 0.5,
            base64: true,
            allowsEditing: true,
            aspect: [1, 1],
          });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const base64 = asset.base64;
      if (!base64) return;

      setPreviewUri(asset.uri);
      setCapturedImage(base64);

      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      router.push("/results");
    }
  };

  const handleProfilePress = () => {
    Alert.alert(
      user?.firstName ? `Olá, ${user.firstName}!` : "Perfil",
      `Gênero: ${gender === "masculino" ? "Masculino" : "Feminino"}`,
      [
        {
          text: "Trocar gênero",
          onPress: async () => {
            await setGender(null);
            router.replace("/onboarding");
          },
        },
        {
          text: "Sair",
          style: "destructive",
          onPress: () => signOut(),
        },
        { text: "Cancelar", style: "cancel" },
      ]
    );
  };

  const topPadding =
    Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const bottomPadding =
    Platform.OS === "web" ? Math.max(insets.bottom, 34) : insets.bottom;

  return (
    <View style={[styles.container, { paddingTop: topPadding, paddingBottom: bottomPadding }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.logo}>OUR FIT</Text>
          <Text style={styles.tagline}>streetwear powered by AI</Text>
        </View>
        <TouchableOpacity style={styles.profileBtn} onPress={handleProfilePress} activeOpacity={0.7}>
          {user?.imageUrl ? (
            <Image source={{ uri: user.imageUrl }} style={styles.profileImg} />
          ) : (
            <Feather name="user" size={18} color="#888888" />
          )}
          <View style={[styles.genderDot, gender === "feminino" && styles.genderDotFem]} />
        </TouchableOpacity>
      </View>

      <View style={styles.center}>
        {previewUri ? (
          <Animated.View style={[styles.previewContainer, { transform: [{ scale: scaleAnim }] }]}>
            <Image source={{ uri: previewUri }} style={styles.preview} />
            <View style={styles.previewOverlay}>
              <Feather name="check-circle" size={40} color="#E8FF00" />
            </View>
          </Animated.View>
        ) : (
          <View style={styles.placeholder}>
            <Feather name="camera" size={48} color="#2A2A2A" />
            <Text style={styles.placeholderText}>
              Fotografe ou selecione{"\n"}uma peça do seu closet
            </Text>
          </View>
        )}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.galleryBtn}
          onPress={() => handlePickImage("gallery")}
          activeOpacity={0.7}
        >
          <Feather name="image" size={22} color="#888888" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.captureBtn}
          onPress={() => handlePickImage("camera")}
          activeOpacity={0.85}
        >
          <View style={styles.captureBtnInner} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.galleryBtn}
          onPress={() => handlePickImage("gallery")}
          activeOpacity={0.7}
        >
          <Feather name="grid" size={22} color="#888888" />
        </TouchableOpacity>
      </View>

      <Text style={styles.hint}>Toque para fotografar sua peça</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0A0A",
    alignItems: "center",
    justifyContent: "space-between",
  },
  header: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  headerLeft: {
    alignItems: "flex-start",
  },
  logo: {
    color: "#E8FF00",
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    letterSpacing: 8,
  },
  tagline: {
    color: "#444444",
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    letterSpacing: 2,
    marginTop: 2,
    textTransform: "lowercase",
  },
  profileBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#1A1A1A",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  profileImg: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  genderDot: {
    position: "absolute",
    bottom: 1,
    right: 1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#4A90E2",
    borderWidth: 1.5,
    borderColor: "#0A0A0A",
  },
  genderDotFem: {
    backgroundColor: "#E87EAA",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingHorizontal: 24,
  },
  placeholder: {
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  placeholderText: {
    color: "#555555",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 22,
  },
  previewContainer: {
    width: 260,
    height: 260,
    borderRadius: 130,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#E8FF00",
  },
  preview: {
    width: "100%",
    height: "100%",
  },
  previewOverlay: {
    position: "absolute",
    bottom: 16,
    right: 16,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 24,
    padding: 4,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 32,
    marginBottom: 16,
  },
  galleryBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#1A1A1A",
    alignItems: "center",
    justifyContent: "center",
  },
  captureBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E8FF00",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#E8FF00",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  captureBtnInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#0A0A0A",
    borderWidth: 3,
    borderColor: "#E8FF00",
  },
  hint: {
    color: "#444444",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
});
