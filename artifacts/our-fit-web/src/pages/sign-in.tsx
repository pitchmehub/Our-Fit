import { useEffect } from "react";
import { useLocation } from "wouter";
import { useFit } from "@/contexts/FitContext";

export default function SignInPage() {
  const [, setLocation] = useLocation();
  const { gender, genderLoaded } = useFit();

  useEffect(() => {
    if (genderLoaded) {
      setLocation(gender ? "/home" : "/onboarding");
    }
  }, [genderLoaded, gender, setLocation]);

  return null;
}
