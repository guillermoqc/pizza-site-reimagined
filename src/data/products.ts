import pizzaPepperoni from "@/assets/pizza-pepperoni.jpg";
import pizzaSupreme from "@/assets/pizza-supreme.jpg";
import comboFood from "@/assets/combo-food.jpg";
import sidesImg from "@/assets/sides.jpg";
import dessertImg from "@/assets/dessert.jpg";
import drinksImg from "@/assets/drinks.jpg";

export type ProductCategory = "pizzas" | "combos" | "sides" | "drinks" | "desserts";

export interface ProductOption {
  name: string;
  priceModifier: number;
}

export interface ProductAddon {
  id: string;
  name: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
  basePrice: number;
  image: string;
  sizes: ProductOption[];
  crusts: ProductOption[];
  addons: ProductAddon[];
}

export const categoryImages: Record<ProductCategory, string> = {
  pizzas: pizzaPepperoni,
  combos: comboFood,
  sides: sidesImg,
  drinks: drinksImg,
  desserts: dessertImg,
};

export const categoryLabels: Record<ProductCategory, string> = {
  pizzas: "Pizzas",
  combos: "Combos",
  sides: "Complementos",
  drinks: "Bebidas",
  desserts: "Postres",
};

const defaultSizes: ProductOption[] = [
  { name: "Personal", priceModifier: 0 },
  { name: "Mediana", priceModifier: 25 },
  { name: "Grande", priceModifier: 45 },
  { name: "Familiar", priceModifier: 65 },
];

const defaultCrusts: ProductOption[] = [
  { name: "Clásica", priceModifier: 0 },
  { name: "Delgada", priceModifier: 0 },
  { name: "Rellena de Queso", priceModifier: 15 },
];

const defaultAddons: ProductAddon[] = [
  { id: "extra-cheese", name: "Extra Queso", price: 10 },
  { id: "pepperoni", name: "Extra Pepperoni", price: 12 },
  { id: "mushrooms", name: "Champiñones", price: 8 },
  { id: "olives", name: "Aceitunas", price: 8 },
  { id: "jalapenos", name: "Jalapeños", price: 6 },
];

export const products: Product[] = [
  {
    id: "pizza-pepperoni",
    name: "Pizza Pepperoni",
    description: "Clásica pizza con abundante pepperoni y queso mozzarella derretido sobre nuestra salsa de tomate especial.",
    category: "pizzas",
    basePrice: 49,
    image: pizzaPepperoni,
    sizes: defaultSizes,
    crusts: defaultCrusts,
    addons: defaultAddons,
  },
  {
    id: "pizza-suprema",
    name: "Pizza Suprema",
    description: "Cargada con pepperoni, salchicha, pimientos, cebolla, champiñones y aceitunas negras.",
    category: "pizzas",
    basePrice: 59,
    image: pizzaSupreme,
    sizes: defaultSizes,
    crusts: defaultCrusts,
    addons: defaultAddons,
  },
  {
    id: "pizza-hawaiana",
    name: "Pizza Hawaiana",
    description: "Jamón y piña sobre queso mozzarella y salsa de tomate. Un clásico tropical.",
    category: "pizzas",
    basePrice: 52,
    image: pizzaPepperoni,
    sizes: defaultSizes,
    crusts: defaultCrusts,
    addons: defaultAddons,
  },
  {
    id: "pizza-margherita",
    name: "Pizza Margherita",
    description: "Tomate fresco, mozzarella y albahaca. La elegancia de lo simple.",
    category: "pizzas",
    basePrice: 45,
    image: pizzaSupreme,
    sizes: defaultSizes,
    crusts: defaultCrusts,
    addons: defaultAddons,
  },
  {
    id: "pizza-bbq-chicken",
    name: "Pizza BBQ Pollo",
    description: "Pollo a la parrilla con salsa BBQ, cebolla morada y cilantro fresco.",
    category: "pizzas",
    basePrice: 62,
    image: pizzaPepperoni,
    sizes: defaultSizes,
    crusts: defaultCrusts,
    addons: defaultAddons,
  },
  {
    id: "combo-familiar",
    name: "Combo Familiar",
    description: "2 Pizzas Grandes + 1 orden de palitos de pan + 2 litros de refresco.",
    category: "combos",
    basePrice: 159,
    image: comboFood,
    sizes: [],
    crusts: [],
    addons: [],
  },
  {
    id: "combo-pareja",
    name: "Combo Pareja",
    description: "1 Pizza Mediana + 1 orden de alitas + 2 refrescos.",
    category: "combos",
    basePrice: 99,
    image: comboFood,
    sizes: [],
    crusts: [],
    addons: [],
  },
  {
    id: "combo-personal",
    name: "Combo Personal",
    description: "1 Pizza Personal + 1 refresco + 1 postre.",
    category: "combos",
    basePrice: 59,
    image: comboFood,
    sizes: [],
    crusts: [],
    addons: [],
  },
  {
    id: "alitas-bbq",
    name: "Alitas BBQ",
    description: "8 piezas de alitas de pollo crujientes bañadas en salsa BBQ ahumada.",
    category: "sides",
    basePrice: 45,
    image: sidesImg,
    sizes: [],
    crusts: [],
    addons: [],
  },
  {
    id: "palitos-pan",
    name: "Palitos de Pan",
    description: "Palitos de pan con ajo y queso parmesano, acompañados de salsa marinara.",
    category: "sides",
    basePrice: 25,
    image: sidesImg,
    sizes: [],
    crusts: [],
    addons: [],
  },
  {
    id: "papas-fritas",
    name: "Papas Fritas",
    description: "Papas fritas crujientes con sal y especias.",
    category: "sides",
    basePrice: 20,
    image: sidesImg,
    sizes: [],
    crusts: [],
    addons: [],
  },
  {
    id: "refresco-grande",
    name: "Refresco Grande",
    description: "Refresco de tu elección en presentación de 600ml.",
    category: "drinks",
    basePrice: 12,
    image: drinksImg,
    sizes: [],
    crusts: [],
    addons: [],
  },
  {
    id: "limonada",
    name: "Limonada Natural",
    description: "Limonada fresca preparada al momento.",
    category: "drinks",
    basePrice: 15,
    image: drinksImg,
    sizes: [],
    crusts: [],
    addons: [],
  },
  {
    id: "refresco-2l",
    name: "Refresco 2 Litros",
    description: "Refresco familiar de 2 litros.",
    category: "drinks",
    basePrice: 22,
    image: drinksImg,
    sizes: [],
    crusts: [],
    addons: [],
  },
  {
    id: "lava-cake",
    name: "Lava Cake",
    description: "Pastel de chocolate con centro fundido, servido con helado de vainilla.",
    category: "desserts",
    basePrice: 28,
    image: dessertImg,
    sizes: [],
    crusts: [],
    addons: [],
  },
  {
    id: "cinnamon-sticks",
    name: "Canela Sticks",
    description: "Palitos de canela espolvoreados con azúcar y canela, con glaseado.",
    category: "desserts",
    basePrice: 22,
    image: dessertImg,
    sizes: [],
    crusts: [],
    addons: [],
  },
];
