document.getElementById("formulario").addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const form = e.target;
  const data = new FormData(form);

  try {
    const response = await fetch(
      "https://script.google.com/macros/s/AKfycbwHf108Nusg0_jylpFvKq3rWCe7CGkjIKlUek-SMOKhXbXg9LahIGMC-rytTOys9Vfs/exec",
      {
        method: "POST",
        body: data,
      }
    );

    // Opcional: validar si la respuesta fue correcta
    if (!response.ok) {
      throw new Error("Error en la respuesta del servidor");
    }

    alert("✅ ¡Gracias por registrarte!");
    form.reset();
    window.location.href = "#";

  } catch (error) {
    alert("❌ Ocurrió un error. Inténtalo de nuevo.");
    console.error("Error:", error);
  }
});
