const TermsPage = () => (
  <div className="container py-12 max-w-3xl space-y-6">
    <h1 className="font-display font-bold text-3xl">Términos y Condiciones</h1>
    <p className="text-muted-foreground text-sm">Última actualización: Febrero 2026</p>
    {[
      { title: "1. Aceptación", text: "Al acceder y utilizar este sitio web, aceptas estar sujeto a estos términos y condiciones de uso. Si no estás de acuerdo con alguno de estos términos, no utilices este sitio." },
      { title: "2. Uso del Sitio", text: "Este sitio es un proyecto de demostración. No se procesan pagos reales ni se realizan entregas de alimentos. Todo el contenido es ficticio y con fines educativos." },
      { title: "3. Propiedad Intelectual", text: "Todo el contenido original de este sitio, incluyendo diseño, código y textos, es propiedad de PizzaClone GT. Las imágenes son generadas por IA y no representan productos reales." },
      { title: "4. Limitación de Responsabilidad", text: "PizzaClone GT no será responsable de ningún daño directo, indirecto, incidental o consecuente que surja del uso de este sitio web." },
      { title: "5. Modificaciones", text: "Nos reservamos el derecho de modificar estos términos en cualquier momento. Las modificaciones entrarán en vigor inmediatamente después de su publicación." },
    ].map((section) => (
      <div key={section.title}>
        <h2 className="font-display font-bold text-xl mb-2">{section.title}</h2>
        <p className="text-muted-foreground">{section.text}</p>
      </div>
    ))}
  </div>
);

export default TermsPage;
