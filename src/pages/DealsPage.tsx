import { deals } from "@/data/deals";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const DealsPage = () => {
  return (
    <div className="container py-8 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="font-display font-bold text-3xl">🔥 Ofertas y Promociones</h1>
        <p className="text-muted-foreground">¡Las mejores ofertas para disfrutar en familia!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {deals.map((deal) => (
          <div key={deal.id} className="bg-card rounded-2xl overflow-hidden shadow-sm border">
            <div className="relative aspect-video">
              <img src={deal.image} alt={deal.title} className="w-full h-full object-cover" />
              {deal.badge && (
                <span className="absolute top-3 left-3 bg-accent text-accent-foreground text-xs font-bold px-3 py-1.5 rounded-full">
                  {deal.badge}
                </span>
              )}
            </div>
            <div className="p-6 space-y-3">
              <h2 className="font-display font-bold text-xl">{deal.title}</h2>
              <p className="text-muted-foreground text-sm">{deal.description}</p>
              <div className="flex items-center gap-3">
                <span className="font-display font-bold text-2xl text-primary">
                  Q{deal.price.toFixed(2)}
                </span>
                {deal.originalPrice && (
                  <span className="text-muted-foreground line-through">
                    Q{deal.originalPrice.toFixed(2)}
                  </span>
                )}
                {deal.originalPrice && (
                  <span className="bg-pizza-green text-primary-foreground text-xs font-bold px-2 py-1 rounded-full">
                    -{Math.round(((deal.originalPrice - deal.price) / deal.originalPrice) * 100)}%
                  </span>
                )}
              </div>
              <Button
                className="w-full"
                onClick={() => toast.success(`"${deal.title}" agregado al carrito`)}
              >
                Agregar al Carrito
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DealsPage;
