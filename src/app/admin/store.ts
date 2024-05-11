"use client";
import { create } from "zustand";

type StoreProps = {
  selectedDatumId: string | null;
  selectedTagId: string | null;
};

type StoreMethods = {
  setSelectedDatumId: (id: string) => void;
  setSelectedTagId: (id: string) => void;
};
const useStore = create<StoreProps & StoreMethods>((set) => ({
  selectedDatumId: null,
  selectedTagId: null,
  setSelectedDatumId: (id) => set({ selectedDatumId: id }),
  setSelectedTagId: (id) => set({ selectedTagId: id }),
}));

export { useStore };
