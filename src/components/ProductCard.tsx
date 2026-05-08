import { Link } from "react-router-dom";
import { Product } from "@/data/products";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <Link
      to={`/product/${product.id}`}
      className="group bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-border/60"
    >
      <div className="aspect-square overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>
      <div className="p-4 space-y-2">
        <h3 className="font-display font-bold text-foreground">{product.name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between pt-1">
          <span className="font-display font-bold text-lg text-primary">
            Q{product.basePrice.toFixed(2)}
          </span>
          <span className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-full font-semibold group-hover:bg-accent group-hover:scale-105 transition-all">
            Ordenar
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
