import { create } from "zustand";
import { persist } from "zustand/middleware";

type ServiceType = "delivery" | "pickup";

interface LocationState {
  selectedCity: string;
  selectedZone: string;
  serviceType: ServiceType;
  setCity: (city: string) => void;
  setZone: (zone: string) => void;
  setServiceType: (type: ServiceType) => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      selectedCity: "Ciudad de Guatemala",
      selectedZone: "Zona 10",
      serviceType: "delivery",
      setCity: (selectedCity) => set({ selectedCity }),
      setZone: (selectedZone) => set({ selectedZone }),
      setServiceType: (serviceType) => set({ serviceType }),
    }),
    { name: "pizza-location" }
  )
);
