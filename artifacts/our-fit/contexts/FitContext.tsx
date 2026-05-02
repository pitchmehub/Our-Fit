import React, { createContext, useContext, useState } from "react";

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
  selectedOutfit: Outfit | null;
  setSelectedOutfit: (outfit: Outfit | null) => void;
}

const FitContext = createContext<FitContextType | null>(null);

export function FitProvider({ children }: { children: React.ReactNode }) {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [itemDescription, setItemDescription] = useState<string>("");
  const [currentOutfits, setCurrentOutfits] = useState<Outfit[]>([]);
  const [selectedOutfit, setSelectedOutfit] = useState<Outfit | null>(null);

  return (
    <FitContext.Provider
      value={{
        capturedImage,
        setCapturedImage,
        itemDescription,
        setItemDescription,
        currentOutfits,
        setCurrentOutfits,
        selectedOutfit,
        setSelectedOutfit,
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
