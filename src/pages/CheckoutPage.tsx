import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCartStore } from "@/store/cartStore";
import { useLocationStore } from "@/store/locationStore";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle, Loader2 } from "lucide-react";

const STORE_ID = import.meta.env.VITE_STORE_ID as string;

const checkoutSchema = z.object({
  name: z.string().min(2, "Nombre requerido").max(100),
  phone: z.string().min(8, "Teléfono inválido").max(20),
  email: z.string().email("Email inválido").max(255),
  address: z.string().min(5, "Dirección requerida").max(500),
  instructions: z.string().max(500).optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCartStore();
  const { serviceType } = useLocationStore();
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>({ resolver: zodResolver(checkoutSchema) });

  const onSubmit = async (data: CheckoutFormData) => {
    setSubmitting(true);
    try {
      const orderItems = items.map((item) => {
        const modifiers: { modifier_name: string; modifier_price: number }[] = [];
        if (item.size) modifiers.push({ modifier_name: `Tamaño: ${item.size}`, modifier_price: 0 });
        if (item.crust) modifiers.push({ modifier_name: `Masa: ${item.crust}`, modifier_price: 0 });
        item.addons.forEach((addon) => modifiers.push({ modifier_name: addon, modifier_price: 0 }));

        return {
          item_name: item.name,
          base_price: item.unitPrice,
          quantity: item.quantity,
          item_total: item.unitPrice * item.quantity,
          modifiers,
        };
      });

      const { data: result, error } = await supabase.functions.invoke("create-order", {
        body: {
          store_id: STORE_ID,
          customer_name: data.name,
          customer_phone: data.phone,
          items: orderItems,
        },
      });

      if (error) throw error;
      if (result?.error) throw new Error(result.error);

      setOrderId(result.order_id);
      setOrderPlaced(true);
      clearCart();
      toast.success("¡Orden realizada con éxito!");
    } catch {
      toast.error("Error al procesar tu orden. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="container py-16 text-center space-y-6 max-w-md mx-auto">
        <CheckCircle className="h-20 w-20 text-pizza-green mx-auto" />
        <h1 className="font-display font-bold text-3xl">¡Gracias por tu orden!</h1>
        {orderId && (
          <p className="text-sm font-mono bg-muted rounded-lg px-4 py-2 inline-block">
            Orden #{orderId.slice(0, 8).toUpperCase()}
          </p>
        )}
        <p className="text-muted-foreground">
          Tu pedido ha sido recibido y está siendo preparado. Recibirás una confirmación pronto.
        </p>
        <Button onClick={() => navigate("/")} size="lg">Volver al Inicio</Button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container py-16 text-center space-y-4">
        <p className="text-lg text-muted-foreground">Tu carrito está vacío</p>
        <Button onClick={() => navigate("/menu")}>Ver Menú</Button>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-4xl">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Volver
      </button>

      <h1 className="font-display font-bold text-3xl mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-3 space-y-5">
          <div className="bg-card rounded-xl p-6 border space-y-4">
            <h2 className="font-display font-bold text-lg">
              {serviceType === "delivery" ? "Datos de entrega" : "Datos para recoger"}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Nombre</label>
                <Input {...register("name")} placeholder="Tu nombre completo" />
                {errors.name && <p className="text-destructive text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Teléfono</label>
                <Input {...register("phone")} placeholder="5555-1234" />
                {errors.phone && <p className="text-destructive text-xs mt-1">{errors.phone.message}</p>}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Email</label>
              <Input {...register("email")} placeholder="tu@email.com" type="email" />
              {errors.email && <p className="text-destructive text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Dirección</label>
              <Input {...register("address")} placeholder="Tu dirección completa" />
              {errors.address && <p className="text-destructive text-xs mt-1">{errors.address.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Instrucciones (opcional)</label>
              <Textarea {...register("instructions")} placeholder="Ej: Tocar timbre, dejar en portería..." />
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full text-lg" disabled={submitting}>
            {submitting ? (
              <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Procesando...</>
            ) : (
              <>Realizar Pedido — Q{totalPrice().toFixed(2)}</>
            )}
          </Button>
        </form>

        {/* Summary */}
        <div className="lg:col-span-2">
          <div className="bg-card rounded-xl p-6 border sticky top-24 space-y-4">
            <h2 className="font-display font-bold text-lg">Resumen</h2>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <div>
                    <span className="font-medium">{item.quantity}x</span> {item.name}
                    {item.size && <span className="text-muted-foreground"> ({item.size})</span>}
                  </div>
                  <span className="font-semibold">Q{(item.unitPrice * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-3 flex justify-between">
              <span className="font-display font-bold">Total</span>
              <span className="font-display font-bold text-xl text-primary">
                Q{totalPrice().toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
