document.addEventListener('DOMContentLoaded', () => {
  const submitBtn = document.getElementById('quoteRequestBtn') || document.getElementById('mobileQuoteRequestBtn');

  submitBtn?.addEventListener('click', (e) => {
    e.preventDefault();

    // Recuperar el autoguardado que hace el motor de Three.js
    const designData = localStorage.getItem('starbade-configurator-autosave-v2');
    if (!designData) return;

    // Enviar la información de diseño a la web madre de Next.js
    window.parent.postMessage({
      type: 'BORAC_DESIGN_COMPLETED',
      payload: JSON.parse(designData)
    }, '*');
  });
});
