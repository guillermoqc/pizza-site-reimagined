const PrivacyPage = () => (
  <div className="container py-12 max-w-3xl space-y-6">
    <h1 className="font-display font-bold text-3xl">Política de Privacidad</h1>
    <p className="text-muted-foreground text-sm">Última actualización: Febrero 2026</p>
    {[
      { title: "1. Información que Recopilamos", text: "Este sitio de demostración no recopila información personal real. Los datos ingresados en formularios no son almacenados en servidores externos." },
      { title: "2. Almacenamiento Local", text: "Utilizamos localStorage del navegador para guardar preferencias como el carrito de compras y la ubicación seleccionada. Esta información permanece en tu dispositivo." },
      { title: "3. Cookies", text: "Este sitio puede utilizar cookies de sesión para funcionalidad básica. No utilizamos cookies de rastreo ni de terceros." },
      { title: "4. Seguridad", text: "Aunque este es un sitio de demostración, implementamos buenas prácticas de seguridad web para proteger la experiencia del usuario." },
      { title: "5. Contacto", text: "Si tienes preguntas sobre esta política de privacidad, puedes contactarnos a través de nuestras redes sociales." },
    ].map((section) => (
      <div key={section.title}>
        <h2 className="font-display font-bold text-xl mb-2">{section.title}</h2>
        <p className="text-muted-foreground">{section.text}</p>
      </div>
    ))}
  </div>
);

export default PrivacyPage;
