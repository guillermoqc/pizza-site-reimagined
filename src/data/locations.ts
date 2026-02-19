export interface StoreLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  zone: string;
  hours: string;
  services: ("delivery" | "pickup")[];
  phone: string;
}

export const locations: StoreLocation[] = [
  {
    id: "loc-1",
    name: "Zona 10 - Zona Viva",
    address: "6a Avenida 12-45, Zona 10",
    city: "Ciudad de Guatemala",
    zone: "Zona 10",
    hours: "10:00 AM - 11:00 PM",
    services: ["delivery", "pickup"],
    phone: "2555-1234",
  },
  {
    id: "loc-2",
    name: "Miraflores",
    address: "Centro Comercial Miraflores, Local 234",
    city: "Ciudad de Guatemala",
    zone: "Zona 11",
    hours: "10:00 AM - 10:00 PM",
    services: ["delivery", "pickup"],
    phone: "2555-5678",
  },
  {
    id: "loc-3",
    name: "Oakland Mall",
    address: "Oakland Mall, Nivel 3, Local 312",
    city: "Ciudad de Guatemala",
    zone: "Zona 10",
    hours: "10:00 AM - 9:00 PM",
    services: ["pickup"],
    phone: "2555-9012",
  },
  {
    id: "loc-4",
    name: "Mixco - San Cristóbal",
    address: "Blvd. San Cristóbal 8-20",
    city: "Mixco",
    zone: "San Cristóbal",
    hours: "10:00 AM - 10:00 PM",
    services: ["delivery", "pickup"],
    phone: "2555-3456",
  },
  {
    id: "loc-5",
    name: "Antigua Guatemala",
    address: "5a Avenida Norte 22",
    city: "Antigua Guatemala",
    zone: "Centro",
    hours: "11:00 AM - 10:00 PM",
    services: ["delivery", "pickup"],
    phone: "7832-1234",
  },
];

export const cities = [...new Set(locations.map(l => l.city))];
