import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, MapPin, Menu, X, Pizza } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useLocationStore } from "@/store/locationStore";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import CartDrawer from "./CartDrawer";

const navLinks = [
  { to: "/", label: "Inicio" },
  { to: "/menu", label: "Menú" },
  { to: "/deals", label: "Ofertas" },
  { to: "/locations", label: "Sucursales" },
];

const Header = () => {
  const location = useLocation();
  const totalItems = useCartStore((s) => s.totalItems());
  const { selectedCity, serviceType } = useLocationStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <>
      {/* Promo bar */}
      <div className="bg-primary text-primary-foreground text-center text-sm py-2 px-4 font-medium">
        🔥 ¡Envío GRATIS en pedidos mayores a Q100! — Ordena ahora
      </div>

      <header className="sticky top-0 z-50 bg-card shadow-md">
        <div className="container flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <Pizza className="h-8 w-8 text-primary" />
            <span className="font-display font-bold text-lg text-foreground hidden sm:block">
              PizzaClone GT
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`font-display font-semibold text-sm transition-colors hover:text-primary ${
                  location.pathname === link.to ? "text-primary" : "text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Location indicator */}
            <div className="hidden lg:flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 text-primary" />
              <span>{selectedCity}</span>
              <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full font-medium uppercase">
                {serviceType === "delivery" ? "Envío" : "Recoger"}
              </span>
            </div>

            {/* Cart button */}
            <Button
              variant="outline"
              size="sm"
              className="relative"
              onClick={() => setCartOpen(true)}
              aria-label={`Carrito con ${totalItems} artículos`}
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Button>

            {/* Mobile menu */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <nav className="md:hidden border-t bg-card animate-fade-in">
            <div className="flex flex-col py-2">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-6 py-3 font-display font-semibold text-sm transition-colors hover:bg-muted ${
                    location.pathname === link.to ? "text-primary bg-muted" : "text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="px-6 py-3 flex items-center gap-2 text-sm text-muted-foreground border-t">
                <MapPin className="h-4 w-4 text-primary" />
                <span>{selectedCity} — {serviceType === "delivery" ? "Envío" : "Recoger"}</span>
              </div>
            </div>
          </nav>
        )}
      </header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
};

export default Header;
