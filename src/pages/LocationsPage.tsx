import { useState } from "react";
import { MapPin, Clock, Phone, Truck, Store } from "lucide-react";
import { locations, cities } from "@/data/locations";
import { useLocationStore } from "@/store/locationStore";

const LocationsPage = () => {
  const { selectedCity, setCity, serviceType, setServiceType } = useLocationStore();
  const [filterCity, setFilterCity] = useState(selectedCity);

  const filtered = locations.filter((l) => !filterCity || l.city === filterCity);

  return (
    <div className="container py-8 space-y-6">
      <h1 className="font-display font-bold text-3xl">Sucursales</h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <select
          value={filterCity}
          onChange={(e) => {
            setFilterCity(e.target.value);
            setCity(e.target.value);
          }}
          className="border rounded-lg px-4 py-2 bg-card text-foreground"
        >
          <option value="">Todas las ciudades</option>
          {cities.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <div className="flex rounded-lg border overflow-hidden">
          <button
            onClick={() => setServiceType("delivery")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
              serviceType === "delivery"
                ? "bg-primary text-primary-foreground"
                : "bg-card text-foreground hover:bg-muted"
            }`}
          >
            <Truck className="h-4 w-4" /> Delivery
          </button>
          <button
            onClick={() => setServiceType("pickup")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
              serviceType === "pickup"
                ? "bg-primary text-primary-foreground"
                : "bg-card text-foreground hover:bg-muted"
            }`}
          >
            <Store className="h-4 w-4" /> Recoger
          </button>
        </div>
      </div>

      {/* Map placeholder */}
      <div className="bg-muted rounded-2xl h-48 flex items-center justify-center text-muted-foreground border-2 border-dashed border-border">
        <div className="text-center">
          <MapPin className="h-8 w-8 mx-auto mb-2" />
          <p className="font-display font-semibold">Mapa de ubicaciones</p>
          <p className="text-sm">Próximamente integración con mapa interactivo</p>
        </div>
      </div>

      {/* Location cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered
          .filter((l) => l.services.includes(serviceType))
          .map((loc) => (
            <div key={loc.id} className="bg-card rounded-xl p-5 border shadow-sm space-y-3">
              <h3 className="font-display font-bold text-lg">{loc.name}</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                  <span>{loc.address}, {loc.city}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 shrink-0 text-primary" />
                  <span>{loc.hours}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 shrink-0 text-primary" />
                  <span>{loc.phone}</span>
                </div>
              </div>
              <div className="flex gap-2">
                {loc.services.map((s) => (
                  <span
                    key={s}
                    className="text-xs font-semibold px-2 py-1 rounded-full bg-muted text-muted-foreground"
                  >
                    {s === "delivery" ? "🛵 Delivery" : "🏪 Pickup"}
                  </span>
                ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default LocationsPage;
