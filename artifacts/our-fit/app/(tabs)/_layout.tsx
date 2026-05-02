import { Slot, Redirect } from "expo-router";
import { useAuth } from "@clerk/expo";
import { useFit } from "@/contexts/FitContext";
import { View, ActivityIndicator } from "react-native";

export default function TabLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const { gender, genderLoaded } = useFit();

  if (!isLoaded || !genderLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: "#0A0A0A", alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color="#E8FF00" />
      </View>
    );
  }

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  if (gender === null) {
    return <Redirect href="/onboarding" />;
  }

  return <Slot />;
}
