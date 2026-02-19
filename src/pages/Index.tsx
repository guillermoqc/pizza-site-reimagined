import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { heroBanners, deals } from "@/data/deals";
import { categoryImages, categoryLabels, type ProductCategory } from "@/data/products";

const categories: ProductCategory[] = ["pizzas", "combos", "sides", "drinks", "desserts"];

const Index = () => {
  const [bannerIndex, setBannerIndex] = useState(0);
  const banner = heroBanners[bannerIndex];

  return (
    <div>
      {/* Hero Banner */}
      <section className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        <img
          src={banner.image}
          alt={banner.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 to-foreground/30" />
        <div className="relative container h-full flex items-center">
          <div className="max-w-lg space-y-4 text-primary-foreground">
            <h1 className="font-display font-black text-4xl md:text-6xl leading-tight">
              {banner.title}
            </h1>
            <p className="text-lg md:text-xl opacity-90">{banner.subtitle}</p>
            <Button size="lg" asChild className="text-lg px-8">
              <Link to={banner.link}>{banner.cta}</Link>
            </Button>
          </div>
        </div>
        {/* Banner nav */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {heroBanners.map((_, i) => (
            <button
              key={i}
              onClick={() => setBannerIndex(i)}
              className={`w-3 h-3 rounded-full transition-colors ${
                i === bannerIndex ? "bg-primary" : "bg-primary-foreground/50"
              }`}
              aria-label={`Banner ${i + 1}`}
            />
          ))}
        </div>
        <button
          onClick={() => setBannerIndex((i) => (i === 0 ? heroBanners.length - 1 : i - 1))}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-card/50 backdrop-blur-sm rounded-full p-2 hover:bg-card/80 transition-colors"
          aria-label="Anterior"
        >
          <ChevronLeft className="h-6 w-6 text-foreground" />
        </button>
        <button
          onClick={() => setBannerIndex((i) => (i === heroBanners.length - 1 ? 0 : i + 1))}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-card/50 backdrop-blur-sm rounded-full p-2 hover:bg-card/80 transition-colors"
          aria-label="Siguiente"
        >
          <ChevronRight className="h-6 w-6 text-foreground" />
        </button>
      </section>

      {/* Categories */}
      <section className="container py-12">
        <h2 className="font-display font-bold text-2xl md:text-3xl text-center mb-8">
          Nuestro Menú
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat}
              to={`/menu?category=${cat}`}
              className="group relative aspect-square rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all"
            >
              <img
                src={categoryImages[cat]}
                alt={categoryLabels[cat]}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <span className="font-display font-bold text-primary-foreground text-lg">
                  {categoryLabels[cat]}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Deals */}
      <section className="bg-muted py-12">
        <div className="container">
          <h2 className="font-display font-bold text-2xl md:text-3xl text-center mb-8">
            🔥 Ofertas del Día
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {deals.slice(0, 4).map((deal) => (
              <Link
                key={deal.id}
                to="/deals"
                className="group bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all border flex flex-col sm:flex-row"
              >
                <div className="sm:w-2/5 aspect-video sm:aspect-auto overflow-hidden relative">
                  <img
                    src={deal.image}
                    alt={deal.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  {deal.badge && (
                    <span className="absolute top-2 left-2 bg-accent text-accent-foreground text-xs font-bold px-2 py-1 rounded-full">
                      {deal.badge}
                    </span>
                  )}
                </div>
                <div className="p-5 flex-1 flex flex-col justify-center">
                  <h3 className="font-display font-bold text-lg mb-1">{deal.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{deal.description}</p>
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-xl text-primary">
                      Q{deal.price.toFixed(2)}
                    </span>
                    {deal.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        Q{deal.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container text-center space-y-4">
          <h2 className="font-display font-black text-3xl md:text-4xl">
            ¿Listo para ordenar?
          </h2>
          <p className="text-lg opacity-90">Delivery rápido a toda la ciudad de Guatemala</p>
          <Button size="lg" variant="secondary" asChild className="text-lg px-8">
            <Link to="/menu">Ver Menú Completo</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
