import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { Link } from "react-router-dom";

const MobileCartButton = () => {
  const totalItems = useCartStore((s) => s.totalItems());
  const totalPrice = useCartStore((s) => s.totalPrice());

  if (totalItems === 0) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:hidden z-50">
      <Link
        to="/checkout"
        className="flex items-center justify-between bg-primary text-primary-foreground rounded-2xl px-5 py-4 shadow-lg"
      >
        <div className="flex items-center gap-3">
          <div className="bg-primary-foreground/20 rounded-full p-2">
            <ShoppingCart className="h-5 w-5" />
          </div>
          <span className="font-display font-bold">{totalItems} artículos</span>
        </div>
        <span className="font-display font-bold text-lg">Q{totalPrice.toFixed(2)}</span>
      </Link>
    </div>
  );
};

export default MobileCartButton;
