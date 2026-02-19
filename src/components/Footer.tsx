import { Link } from "react-router-dom";
import { Pizza, Facebook, Instagram, Twitter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Pizza className="h-8 w-8 text-primary" />
              <span className="font-display font-bold text-lg">PizzaClone GT</span>
            </div>
            <p className="text-sm opacity-70">
              Las mejores pizzas de Guatemala, hechas con ingredientes frescos y mucho amor.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-display font-bold mb-4">Menú</h4>
            <ul className="space-y-2 text-sm opacity-70">
              <li><Link to="/menu" className="hover:opacity-100 transition-opacity">Pizzas</Link></li>
              <li><Link to="/menu" className="hover:opacity-100 transition-opacity">Combos</Link></li>
              <li><Link to="/deals" className="hover:opacity-100 transition-opacity">Ofertas</Link></li>
              <li><Link to="/locations" className="hover:opacity-100 transition-opacity">Sucursales</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-display font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm opacity-70">
              <li><Link to="/terms" className="hover:opacity-100 transition-opacity">Términos y Condiciones</Link></li>
              <li><Link to="/privacy" className="hover:opacity-100 transition-opacity">Privacidad</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-display font-bold mb-4">Newsletter</h4>
            <p className="text-sm opacity-70 mb-3">Recibe ofertas exclusivas en tu correo.</p>
            <div className="flex gap-2">
              <Input placeholder="Tu email" className="bg-background/10 border-background/20 text-background placeholder:text-background/50" />
              <Button size="sm">Enviar</Button>
            </div>
            <div className="flex gap-4 mt-4">
              <Facebook className="h-5 w-5 opacity-70 hover:opacity-100 cursor-pointer transition-opacity" />
              <Instagram className="h-5 w-5 opacity-70 hover:opacity-100 cursor-pointer transition-opacity" />
              <Twitter className="h-5 w-5 opacity-70 hover:opacity-100 cursor-pointer transition-opacity" />
            </div>
          </div>
        </div>

        <div className="border-t border-background/10 mt-8 pt-6 text-center text-sm opacity-50">
          © 2026 PizzaClone GT. Todos los derechos reservados. Este es un proyecto de demostración.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
