import dealBanner from "@/assets/deal-banner.jpg";
import comboFood from "@/assets/combo-food.jpg";
import heroPizza from "@/assets/hero-pizza.jpg";

export interface Deal {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  includedProductIds: string[];
  badge?: string;
}

export const deals: Deal[] = [
  {
    id: "deal-1",
    title: "2 Pizzas Grandes por Q159",
    description: "Elige 2 pizzas grandes de cualquier especialidad. Incluye 1 refresco de 2 litros gratis.",
    price: 159,
    originalPrice: 220,
    image: dealBanner,
    includedProductIds: ["pizza-pepperoni", "pizza-suprema", "refresco-2l"],
    badge: "MÁS POPULAR",
  },
  {
    id: "deal-2",
    title: "Combo Mega Fiesta",
    description: "3 Pizzas Familiares + 2 órdenes de alitas + 3 refrescos de 2L. Perfecto para fiestas.",
    price: 299,
    originalPrice: 420,
    image: comboFood,
    includedProductIds: ["pizza-pepperoni", "pizza-suprema", "pizza-hawaiana", "alitas-bbq", "refresco-2l"],
    badge: "AHORRA Q121",
  },
  {
    id: "deal-3",
    title: "Martes 2x1",
    description: "Todos los martes, llévate 2 pizzas medianas por el precio de 1. ¡No te lo pierdas!",
    price: 52,
    originalPrice: 104,
    image: heroPizza,
    includedProductIds: ["pizza-pepperoni", "pizza-margherita"],
    badge: "SOLO MARTES",
  },
  {
    id: "deal-4",
    title: "Lunch Express",
    description: "Pizza Personal + Refresco + Postre. De lunes a viernes, 11am a 3pm.",
    price: 39,
    originalPrice: 65,
    image: comboFood,
    includedProductIds: ["combo-personal"],
    badge: "LUNCH",
  },
];

export const heroBanners = [
  {
    id: "banner-1",
    title: "¡Ordena Ahora!",
    subtitle: "Las mejores pizzas de Guatemala directo a tu puerta",
    image: heroPizza,
    cta: "Ver Menú",
    link: "/menu",
  },
  {
    id: "banner-2",
    title: "Ofertas Increíbles",
    subtitle: "Combos desde Q39 — ¡No te los pierdas!",
    image: dealBanner,
    cta: "Ver Ofertas",
    link: "/deals",
  },
];
