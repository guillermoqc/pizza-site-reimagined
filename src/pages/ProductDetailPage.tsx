import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Minus, Plus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { products } from "@/data/products";
import { useCartStore } from "@/store/cartStore";
import { toast } from "sonner";

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const product = products.find((p) => p.id === id);
  const addItem = useCartStore((s) => s.addItem);

  const [selectedSize, setSelectedSize] = useState(product?.sizes[0]?.name || "");
  const [selectedCrust, setSelectedCrust] = useState(product?.crusts[0]?.name || "");
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!product) return;
    setSelectedSize(product.sizes[0]?.name || "");
    setSelectedCrust(product.crusts[0]?.name || "");
    setSelectedAddons([]);
    setQuantity(1);
  }, [product?.id]);

  if (!product) {
    return (
      <div className="container py-12 text-center">
        <p className="text-lg text-muted-foreground">Producto no encontrado</p>
        <Button onClick={() => navigate("/menu")} className="mt-4">Volver al menú</Button>
      </div>
    );
  }

  const sizeModifier = product.sizes.find((s) => s.name === selectedSize)?.priceModifier || 0;
  const crustModifier = product.crusts.find((c) => c.name === selectedCrust)?.priceModifier || 0;
  const addonsTotal = product.addons
    .filter((a) => selectedAddons.includes(a.id))
    .reduce((s, a) => s + a.price, 0);
  const unitPrice = product.basePrice + sizeModifier + crustModifier + addonsTotal;

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      image: product.image,
      size: selectedSize || undefined,
      crust: selectedCrust || undefined,
      addons: product.addons.filter((a) => selectedAddons.includes(a.id)).map((a) => a.name),
      quantity,
      unitPrice,
    });
    toast.success(`${product.name} agregado al carrito`);
  };

  const toggleAddon = (id: string) => {
    setSelectedAddons((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  return (
    <div className="container py-6 max-w-4xl">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Volver
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image */}
        <div className="rounded-2xl overflow-hidden aspect-square">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div>
            <h1 className="font-display font-bold text-3xl">{product.name}</h1>
            <p className="text-muted-foreground mt-2">{product.description}</p>
          </div>

          {/* Size */}
          {product.sizes.length > 0 && (
            <div>
              <h3 className="font-display font-semibold mb-3">Tamaño</h3>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size.name}
                    onClick={() => setSelectedSize(size.name)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                      selectedSize === size.name
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card text-foreground border-border hover:border-primary"
                    }`}
                  >
                    {size.name}
                    {size.priceModifier > 0 && ` (+Q${size.priceModifier})`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Crust */}
          {product.crusts.length > 0 && (
            <div>
              <h3 className="font-display font-semibold mb-3">Masa</h3>
              <div className="flex flex-wrap gap-2">
                {product.crusts.map((crust) => (
                  <button
                    key={crust.name}
                    onClick={() => setSelectedCrust(crust.name)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                      selectedCrust === crust.name
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card text-foreground border-border hover:border-primary"
                    }`}
                  >
                    {crust.name}
                    {crust.priceModifier > 0 && ` (+Q${crust.priceModifier})`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Addons */}
          {product.addons.length > 0 && (
            <div>
              <h3 className="font-display font-semibold mb-3">Extras</h3>
              <div className="space-y-2">
                {product.addons.map((addon) => (
                  <label
                    key={addon.id}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedAddons.includes(addon.id)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedAddons.includes(addon.id)}
                        onChange={() => toggleAddon(addon.id)}
                        className="accent-primary"
                      />
                      <span className="text-sm font-medium">{addon.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-primary">+Q{addon.price}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & Add */}
          <div className="flex items-center gap-4 pt-4 border-t">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-border transition-colors"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="font-display font-bold text-lg w-8 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-border transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <Button className="flex-1 gap-2" size="lg" onClick={handleAddToCart}>
              <ShoppingCart className="h-5 w-5" />
              Agregar — Q{(unitPrice * quantity).toFixed(2)}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
