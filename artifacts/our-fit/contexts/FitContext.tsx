import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { likeOutfit, unlikeOutfit } from "@/lib/api";

export type Gender = "masculino" | "feminino" | null;

export interface Outfit {
  id: string;
  title: string;
  style: string;
  items: string[];
  tags: string[];
  image: string;
}

interface FitContextType {
  capturedImage: string | null;
  setCapturedImage: (img: string | null) => void;
  itemDescription: string;
  setItemDescription: (desc: string) => void;
  currentOutfits: Outfit[];
  setCurrentOutfits: (outfits: Outfit[]) => void;
  updateOutfit: (outfit: Outfit) => void;
  selectedOutfit: Outfit | null;
  setSelectedOutfit: (outfit: Outfit | null) => void;
  gender: Gender;
  setGender: (g: Gender) => void;
  genderLoaded: boolean;
  likedIds: Set<string>;
  toggleLike: (outfit: Outfit, userId: string) => void;
}

const FitContext = createContext<FitContextType | null>(null);

export function FitProvider({ children }: { children: React.ReactNode }) {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [itemDescription, setItemDescription] = useState<string>("");
  const [currentOutfits, setCurrentOutfits] = useState<Outfit[]>([]);
  const [selectedOutfit, setSelectedOutfit] = useState<Outfit | null>(null);
  const [gender, setGenderState] = useState<Gender>(null);
  const [genderLoaded, setGenderLoaded] = useState(false);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    AsyncStorage.getItem("our_fit_gender").then((val) => {
      if (val === "masculino" || val === "feminino") setGenderState(val);
      setGenderLoaded(true);
    });
    AsyncStorage.getItem("our_fit_liked_ids").then((val) => {
      if (val) {
        try {
          setLikedIds(new Set(JSON.parse(val) as string[]));
        } catch {}
      }
    });
  }, []);

  const setGender = async (g: Gender) => {
    setGenderState(g);
    if (g) await AsyncStorage.setItem("our_fit_gender", g);
    else await AsyncStorage.removeItem("our_fit_gender");
  };

  const updateOutfit = (outfit: Outfit) => {
    setCurrentOutfits((prev) =>
      prev.map((o) => (o.id === outfit.id ? outfit : o))
    );
  };

  const toggleLike = async (outfit: Outfit, userId: string) => {
    const isLiked = likedIds.has(outfit.id);
    const newSet = new Set(likedIds);
    if (isLiked) {
      newSet.delete(outfit.id);
      unlikeOutfit(userId, outfit.id);
    } else {
      newSet.add(outfit.id);
      likeOutfit(userId, outfit);
    }
    setLikedIds(newSet);
    await AsyncStorage.setItem("our_fit_liked_ids", JSON.stringify([...newSet]));
  };

  return (
    <FitContext.Provider
      value={{
        capturedImage,
        setCapturedImage,
        itemDescription,
        setItemDescription,
        currentOutfits,
        setCurrentOutfits,
        updateOutfit,
        selectedOutfit,
        setSelectedOutfit,
        gender,
        setGender,
        genderLoaded,
        likedIds,
        toggleLike,
      }}
    >
      {children}
    </FitContext.Provider>
  );
}

export function useFit() {
  const ctx = useContext(FitContext);
  if (!ctx) throw new Error("useFit must be used inside FitProvider");
  return ctx;
}
