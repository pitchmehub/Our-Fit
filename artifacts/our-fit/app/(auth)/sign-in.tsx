import React, { useCallback, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import { useSSO, useAuth } from "@clerk/expo";
import { router } from "expo-router";

WebBrowser.maybeCompleteAuthSession();

export default function SignInScreen() {
  const { startSSOFlow } = useSSO();
  const { isSignedIn } = useAuth();
  const [loading, setLoading] = React.useState(false);

  useEffect(() => {
    if (Platform.OS !== "android") return;
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);

  useEffect(() => {
    if (isSignedIn) {
      router.replace("/onboarding");
    }
  }, [isSignedIn]);

  const handleGoogleSignIn = useCallback(async () => {
    setLoading(true);
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: "oauth_google",
        redirectUrl: AuthSession.makeRedirectUri(),
      });

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        router.replace("/onboarding");
      }
    } catch (err) {
      console.error("Sign in error:", JSON.stringify(err, null, 2));
    } finally {
      setLoading(false);
    }
  }, [startSSOFlow]);

  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <Text style={styles.logo}>OUR FIT</Text>
        <Text style={styles.tagline}>SEU ESTILO. SUA IDENTIDADE.</Text>
      </View>

      <View style={styles.middle}>
        <View style={styles.pill}>
          <Text style={styles.pillText}>STREETWEAR IA</Text>
        </View>
        <Text style={styles.headline}>Monte looks únicos{"\n"}com a sua peça.</Text>
        <Text style={styles.sub}>
          Fotografe qualquer peça e receba 6 looks completos gerados por IA, personalizados para o seu estilo.
        </Text>
      </View>

      <View style={styles.bottom}>
        <TouchableOpacity
          style={[styles.googleBtn, loading && styles.btnDisabled]}
          onPress={handleGoogleSignIn}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#0A0A0A" />
          ) : (
            <>
              <Text style={styles.googleIcon}>G</Text>
              <Text style={styles.googleText}>Continuar com Google</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.terms}>
          Ao continuar, você concorda com nossos Termos de Uso e Política de Privacidade.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0A0A",
    paddingHorizontal: 28,
    paddingTop: 80,
    paddingBottom: 48,
    justifyContent: "space-between",
  },
  top: {
    alignItems: "flex-start",
  },
  logo: {
    color: "#E8FF00",
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    letterSpacing: 10,
  },
  tagline: {
    color: "#444444",
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    letterSpacing: 3,
    marginTop: 4,
  },
  middle: {
    gap: 20,
  },
  pill: {
    backgroundColor: "#1A1A1A",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 100,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  pillText: {
    color: "#E8FF00",
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 2,
  },
  headline: {
    color: "#FFFFFF",
    fontSize: 38,
    fontFamily: "Inter_700Bold",
    lineHeight: 46,
    letterSpacing: -0.5,
  },
  sub: {
    color: "#666666",
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 24,
  },
  bottom: {
    gap: 16,
  },
  googleBtn: {
    backgroundColor: "#E8FF00",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 18,
    borderRadius: 16,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  googleIcon: {
    color: "#0A0A0A",
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  googleText: {
    color: "#0A0A0A",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.3,
  },
  terms: {
    color: "#444444",
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 17,
  },
});
